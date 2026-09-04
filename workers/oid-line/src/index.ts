// oid-line backend — luxury storefront + SKUs, verify proxy, checkout webhook. No secrets in code.
import SKUS from "./skus.json";
import STORE_HTML from "./store.html";
interface Env {
  OID_REGISTRY: KVNamespace;
  IDENTITY_CACHE: KVNamespace;
  WEBHOOK_SECRET?: string;
  SHOPIFY_HOOK_SECRETS?: string; // JSON map: {"shop.myshopify.com": "shpss_..."}
  SHOPIFY_OID_TOKEN?: string;
  RATE_LIMIT_KV?: KVNamespace;
}

function secretForShop(env: Env, shop: string): string | null {
  try {
    const m = JSON.parse(env.SHOPIFY_HOOK_SECRETS || "{}");
    if (m[shop]) return m[shop] as string;
  } catch {}
  return env.WEBHOOK_SECRET || null;
}

// SKU → Shopify variant id (brainsait-oid, refreshed 2026-09-04)
const SKU_VARIANT: Record<string, number> = {
  "OID-BADGE-M": 41349024481352, "OID-BADGE-A": 41349024514120,
  "OID-EXPLORER": 41349024546888, "OID-FHIR": 41349024579656,
  "OID-NPHIES": 41349024612424, "OID-NPHIES-SUP": 41349024415816,
  "OID-NAMESPACE": 41349024645192, "OID-NAMESPACE-SETUP": 41349024448584,
  "OID-WHITELABEL": 41349024677960,
};
const SHOPIFY_ADMIN = "https://brainsait-oid.myshopify.com/admin/api/2025-10";
const REG = "https://registry.brainsait.org";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Signature",
  "Content-Type": "application/json",
};

function json(data: any, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, ...extra } });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

async function hmacVerify(secret: string, body: string, sig: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, "0")).join("");
  return expected === sig;
}

async function rateLimit(kv: KVNamespace | undefined, key: string, limit = 60, window = 60): Promise<boolean> {
  if (!kv) return true;
  const now = Math.floor(Date.now() / 1000);
  const bucket = `rl:${key}:${Math.floor(now / window)}`;
  const current = parseInt((await kv.get(bucket)) || "0");
  if (current >= limit) return false;
  await kv.put(bucket, String(current + 1), { expirationTtl: window * 2 });
  return true;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    // Luxury storefront (same-origin: zero CORS, instant API)
    if ((url.pathname === "/" || url.pathname === "/store") && req.method === "GET") {
      return new Response(STORE_HTML, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" },
      });
    }

    // Rate limit all requests
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    if (!(await rateLimit(env.RATE_LIMIT_KV, ip, 120, 60))) {
      return err("rate limited", 429);
    }

    // Health check
    if (url.pathname === "/health") {
      return json({ ok: true, service: "oid-line", ts: new Date().toISOString(), version: "2.0.0" });
    }

    // Products catalog
    if (url.pathname === "/v1/oid-line/products" && req.method === "GET") {
      return json({ line: "OID LINE", currency: "SAR", skus: SKUS });
    }

    // Verify endpoint (registry proxy + 5-min KV cache + BIAL trust)
    const mV = url.pathname.match(/^\/v1\/verify\/(.+)$/);
    if (mV && req.method === "GET") {
      const spid = decodeURIComponent(mV[1]);
      if (!spid || spid.length < 3) return err("invalid spid");

      // Cache check
      const cached = await env.IDENTITY_CACHE.get(`verify:${spid}`, "json").catch(() => null);
      if (cached) return json({ cached: true, ...(cached as object) });

      // Registry proxy
      try {
        const r = await fetch(`${REG}/api/verify/${encodeURIComponent(spid)}`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!r.ok) return json({ verified: false, spid, trust: "BIAL-H0" }, 404);
        const j = await r.json() as any;
        const out = {
          verified: j.verification_status === "verified",
          spid,
          oid: j.oid,
          status: j.verification_status,
          qr: `https://verify.brainsait.org/${spid}`,
          trust: j.verification_status === "verified" ? "BIAL-H2" : "BIAL-H1",
          ts: new Date().toISOString(),
        };
        await env.IDENTITY_CACHE.put(`verify:${spid}`, JSON.stringify(out), { expirationTtl: 300 }).catch(() => {});
        return json(out);
      } catch (e) {
        return json({ verified: false, spid, trust: "BIAL-H0", error: "registry_unreachable" }, 502);
      }
    }

    // Checkout webhook — accepts Shopify orders/paid AND flat {spid, sku, order_id}
    if (url.pathname === "/v1/checkout/webhook" && req.method === "POST") {
      const rawBody = await req.text();

      // HMAC: Shopify sends base64 (X-Shopify-Hmac-Sha256); concierge form sends hex (X-Webhook-Signature)
      const shopSig = req.headers.get("X-Shopify-Hmac-Sha256") || "";
      const hexSig = req.headers.get("X-Webhook-Signature") || "";
      const shop = req.headers.get("X-Shopify-Shop-Domain") || "";
      console.log(JSON.stringify({ hook: "hit", topic: req.headers.get("X-Shopify-Topic"),
        shop, hasShopSig: !!shopSig, hasHexSig: !!hexSig }));
      const hymn = secretForShop(env, shop);
      if (shopSig) {
        if (!hymn) { console.log(JSON.stringify({ hook: "hmac", ok: false, why: "no-secret-for-shop" })); return err("unknown shop", 403); }
        const key = await crypto.subtle.importKey(
          "raw", new TextEncoder().encode(hymn),
          { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
        const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
        let bin = "";
        new Uint8Array(mac).forEach(b => (bin += String.fromCharCode(b)));
        if (btoa(bin) !== shopSig) {
          console.log(JSON.stringify({ hook: "hmac", ok: false, shop }));
          return err("invalid shopify signature", 401);
        }
        console.log(JSON.stringify({ hook: "hmac", ok: true, shop }));
      } else if (hexSig) {
        if (!hymn) return err("unknown shop", 403);
        const ok = await hmacVerify(hymn, rawBody, hexSig).catch(() => false);
        if (!ok) return err("invalid signature", 401);
      }

      let body: any;
      try {
        body = JSON.parse(rawBody);
      } catch {
        return err("invalid json body");
      }

      // Normalize: Shopify orders/paid → items; flat form → single item
      type Item = { spid: string; sku: string };
      let items: Item[] = [];
      let orderId = body.order_id as string | undefined;
      let buyer = "";
      if (Array.isArray(body.line_items)) {
        orderId = String(body.id || body.name || orderId || `auto-${Date.now()}`);
        const notes: Array<{ name: string; value: string }> = body.note_attributes || [];
        const noteSpid = (notes.find(n => /spid|provider/i.test(n.name || "")) || {} as any).value || "";
        buyer = [body?.customer?.first_name, body?.customer?.last_name].filter(Boolean).join(" ") ||
                body?.customer?.email || "";
        for (const li of body.line_items) {
          if (li.sku && String(li.sku).startsWith("OID-")) {
            items.push({ spid: noteSpid || `pending-${orderId}`, sku: String(li.sku) });
          }
        }
        if (!items.length) {
          console.log(JSON.stringify({ hook: "items", count: 0, orderId }));
          return json({ ok: true, ignored: "no OID SKUs" });
        }
      } else {
        if (!body.sku) return err("missing spid or sku");
        items = [{ spid: body.spid || `pending-${body.order_id || Date.now()}`, sku: body.sku }];
        orderId = body.order_id || `auto-${Date.now()}`;
        buyer = [body.name, body.org].filter(Boolean).join(" / ");
      }

      const fulfilled = [];
      for (const it of items) {
        const key = `order:${orderId}:${it.sku}`;
        await env.OID_REGISTRY.put(
          key,
          JSON.stringify({ spid: it.spid, sku: it.sku, buyer, at: new Date().toISOString(), verified: false }),
          { expirationTtl: 86400 * 30 }
        ).catch(() => {});
        fulfilled.push({ sku: it.sku, next: `/v1/verify/${it.spid}` });
      }
      console.log(JSON.stringify({ hook: "fulfilled", orderId, count: fulfilled.length }));
      return json({ ok: true, order_id: orderId, fulfilled, lark: "flip Providers Status on verified" });
    }

    // Instant invoice — gate-independent checkout via Shopify Draft Order.
    // Buyer pays at invoice_url (MyFatoorah native) → orders/paid → fulfillment.
    if (url.pathname === "/v1/order/draft" && req.method === "POST") {
      if (!env.SHOPIFY_OID_TOKEN) return err("checkout not configured", 503);
      let b: any;
      try { b = await req.json(); } catch { return err("invalid json body"); }
      const sku = String(b.sku || "");
      const variantId = SKU_VARIANT[sku];
      if (!variantId) return err("unknown sku");
      const spid = String(b.spid || "").trim();
      const buyer = [b.name, b.org].filter(Boolean).join(" / ");
      const dr = await fetch(`${SHOPIFY_ADMIN}/draft_orders.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": env.SHOPIFY_OID_TOKEN },
        body: JSON.stringify({ draft_order: {
          line_items: [{ variant_id: variantId, quantity: 1 }],
          note_attributes: [
            { name: "spid", value: spid || "pending" },
            { name: "source", value: "oid-line-luxe" },
            ...(buyer ? [{ name: "buyer", value: buyer }] : []),
          ],
          ...(b.email ? { email: String(b.email) } : {}),
          tags: "OID-LINE",
          tax_exempt: true,
        }}),
        signal: AbortSignal.timeout(15000),
      });
      if (!dr.ok) return err("draft failed", 502);
      const dj = await dr.json() as any;
      const d = dj.draft_order;
      await env.OID_REGISTRY.put(`draft:${d.id}`,
        JSON.stringify({ sku, spid: spid || `pending-${d.id}`, buyer, at: new Date().toISOString() }),
        { expirationTtl: 86400 * 7 }).catch(() => {});
      return json({ ok: true, draft_id: d.id, sku, invoice_url: d.invoice_url,
        pay: "Complete payment (MyFatoorah: Mada / STC Pay / KNET / cards)",
        next: spid ? `/v1/verify/${spid}` : null });
    }

    // Order status — read fulfillment record (buyer tracking + ops verification)
    if (url.pathname === "/v1/order/status" && req.method === "GET") {
      const orderId = url.searchParams.get("order_id") || "";
      const sku = url.searchParams.get("sku") || "";
      if (!orderId) return err("missing order_id");
      if (sku) {
        const rec = await env.OID_REGISTRY.get(`order:${orderId}:${sku}`, "json").catch(() => null);
        if (!rec) return json({ found: false, order_id: orderId, sku }, 404);
        return json({ found: true, order_id: orderId, ...(rec as object) });
      }
      const out: any[] = [];
      const prefix = `order:${orderId}:`;
      const list = await (env.OID_REGISTRY as any).list?.({ prefix }).catch(() => null);
      for (const k of list?.keys || []) {
        const rec = await env.OID_REGISTRY.get(k.name, "json").catch(() => null);
        if (rec) out.push(rec);
      }
      return json({ found: out.length > 0, order_id: orderId, fulfilled: out });
    }

    // QR link generator
    if (url.pathname === "/v1/qr" && req.method === "GET") {
      const spid = url.searchParams.get("spid") || "";
      if (!spid) return err("missing spid param");
      return json({
        spid,
        verify_url: `https://verify.brainsait.org/${spid}`,
        badge_url: `https://verify.brainsait.org/${spid}/badge`,
      });
    }

    // Default: show available routes
    return json({
      service: "oid-line",
      version: "2.0.0",
      routes: [
        "GET  /health",
        "GET  /v1/oid-line/products",
        "GET  /v1/verify/{SPID}",
        "POST /v1/checkout/webhook",
        "GET  /v1/qr?spid=",
      ],
    });
  },
};
