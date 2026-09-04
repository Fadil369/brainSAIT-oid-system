/**
 * BrainSAIT OID Order Fulfillment Worker
 *
 * Receives Shopify orders/paid webhooks, generates license keys,
 * calls the brainsait-store-delivery admin API, and logs to Airtable.
 */

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

const SKU_ASSETS = {
  "OID-STARTER-001": {
    name: "OID Namespace Starter Kit",
    maxDownloads: 5,
    expiresInDays: 365,
    assets: [
      { id: "oid-starter-guide", r2_key: "products/oid-starter/oid-namespace-starter-guide.html", filename: "OID_Namespace_Starter_Guide.html", kind: "html", size: 0 },
      { id: "oid-starter-templates", r2_key: "products/oid-starter/oid-templates.zip", filename: "OID_Templates.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-DEV-001": {
    name: "OID Developer Suite",
    maxDownloads: 10,
    expiresInDays: 365,
    assets: [
      { id: "oid-dev-sdk", r2_key: "products/oid-developer/oid-sdk.zip", filename: "OID_Developer_SDK.zip", kind: "zip", size: 0 },
      { id: "oid-dev-docs", r2_key: "products/oid-developer/oid-developer-docs.html", filename: "OID_Developer_Docs.html", kind: "html", size: 0 },
      { id: "oid-dev-examples", r2_key: "products/oid-developer/oid-code-examples.zip", filename: "OID_Code_Examples.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-HLTH-001": {
    name: "OID Healthcare Bundle",
    maxDownloads: 10,
    expiresInDays: 365,
    assets: [
      { id: "oid-fhir-bundle", r2_key: "products/oid-healthcare/fhir-namespace-bundle.zip", filename: "FHIR_Namespace_Bundle.zip", kind: "zip", size: 0 },
      { id: "oid-dicom-guide", r2_key: "products/oid-healthcare/dicom-uid-guide.html", filename: "DICOM_UID_Guide.html", kind: "html", size: 0 },
      { id: "oid-hl7-templates", r2_key: "products/oid-healthcare/hl7-templates.zip", filename: "HL7_Templates.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-ENT-001": {
    name: "OID Enterprise Platform",
    maxDownloads: 20,
    expiresInDays: 365,
    assets: [
      { id: "oid-ent-platform", r2_key: "products/oid-enterprise/enterprise-platform.zip", filename: "OID_Enterprise_Platform.zip", kind: "zip", size: 0 },
      { id: "oid-ent-docs", r2_key: "products/oid-enterprise/enterprise-docs.html", filename: "Enterprise_Documentation.html", kind: "html", size: 0 },
      { id: "oid-ent-config", r2_key: "products/oid-enterprise/enterprise-config-templates.zip", filename: "Enterprise_Config_Templates.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-BADGE-001": {
    name: "OID Badge System License",
    maxDownloads: 10,
    expiresInDays: 730,
    assets: [
      { id: "oid-badge-source", r2_key: "products/oid-badge/badge-system-source.zip", filename: "OID_Badge_System_Source.zip", kind: "zip", size: 0 },
      { id: "oid-badge-docs", r2_key: "products/oid-badge/badge-system-docs.html", filename: "Badge_System_Docs.html", kind: "html", size: 0 },
    ],
  },
  "OID-ENT-ARCH-001": {
    name: "OID Enterprise Namespace Architect",
    maxDownloads: 25,
    expiresInDays: 365,
    assets: [
      { id: "oid-arch-namespace-kit", r2_key: "products/oid-ent-arch/namespace-architect-kit.zip", filename: "OID_Enterprise_Namespace_Architect.zip", kind: "zip", size: 0 },
      { id: "oid-arch-fhir-bundle", r2_key: "products/oid-ent-arch/fhir-namespace-bundle-r4-r5.zip", filename: "FHIR_Namespace_Bundle_R4_R5.zip", kind: "zip", size: 0 },
      { id: "oid-arch-mcp-schemas", r2_key: "products/oid-ent-arch/mcp-urn-schemas.zip", filename: "MCP_URN_Schemas.zip", kind: "zip", size: 0 },
      { id: "oid-arch-x509-policy", r2_key: "products/oid-ent-arch/x509-policy-oids.conf", filename: "X509_Policy_OIDs.conf", kind: "config", size: 0 },
      { id: "oid-arch-docs", r2_key: "products/oid-ent-arch/enterprise-architect-docs.html", filename: "Enterprise_Architect_Docs.html", kind: "html", size: 0 },
      { id: "oid-arch-portal-access", r2_key: "products/oid-ent-arch/portal-access-guide.html", filename: "Portal_Access_Guide.html", kind: "html", size: 0 },
    ],
  },
  "OID-HLTH-SUITE-001": {
    name: "Healthcare AI Identity Infrastructure Suite",
    maxDownloads: 30,
    expiresInDays: 365,
    assets: [
      { id: "hlth-full-kit", r2_key: "products/oid-hlth-suite/healthcare-ai-identity-suite.zip", filename: "Healthcare_AI_Identity_Suite.zip", kind: "zip", size: 0 },
      { id: "hlth-dicom-uid-block", r2_key: "products/oid-hlth-suite/dicom-uid-allocation-block.html", filename: "DICOM_UID_Allocation_Block.html", kind: "html", size: 0 },
      { id: "hlth-fhir-ext-registry", r2_key: "products/oid-hlth-suite/fhir-extension-registry.zip", filename: "FHIR_Extension_Registry.zip", kind: "zip", size: 0 },
      { id: "hlth-snomed-mapping", r2_key: "products/oid-hlth-suite/snomed-ct-oid-mapping.json", filename: "SNOMED_CT_OID_Mapping.json", kind: "json", size: 0 },
      { id: "hlth-hipaa-docs", r2_key: "products/oid-hlth-suite/hipaa-namespace-documentation.html", filename: "HIPAA_Namespace_Documentation.html", kind: "html", size: 0 },
      { id: "hlth-audit-schema", r2_key: "products/oid-hlth-suite/audit-trail-oid-schema.zip", filename: "Audit_Trail_OID_Schema.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-WL-ENT-001": {
    name: "BrainSAIT OID White-Label Enterprise License",
    maxDownloads: 50,
    expiresInDays: 730,
    assets: [
      { id: "wl-full-platform", r2_key: "products/oid-white-label/white-label-enterprise-package.zip", filename: "WhiteLabel_Enterprise_Package.zip", kind: "zip", size: 0 },
      { id: "wl-portal-source", r2_key: "products/oid-white-label/oid-portal-react-source.zip", filename: "OID_Portal_React_Source.zip", kind: "zip", size: 0 },
      { id: "wl-reseller-guide", r2_key: "products/oid-white-label/reseller-setup-guide.html", filename: "Reseller_Setup_Guide.html", kind: "html", size: 0 },
      { id: "wl-multitenant-docs", r2_key: "products/oid-white-label/multitenant-architecture-docs.html", filename: "Multitenant_Architecture_Docs.html", kind: "html", size: 0 },
      { id: "wl-brand-kit", r2_key: "products/oid-white-label/white-label-brand-kit.zip", filename: "WhiteLabel_Brand_Kit.zip", kind: "zip", size: 0 },
    ],
  },
  "OID-FHIR-PLAT-001": {
    name: "OID FHIR Integration Platform",
    maxDownloads: 20,
    expiresInDays: 365,
    assets: [
      { id: "fhir-plat-toolkit", r2_key: "products/oid-fhir-platform/fhir-integration-toolkit.zip", filename: "FHIR_Integration_Toolkit.zip", kind: "zip", size: 0 },
      { id: "fhir-plat-ig-template", r2_key: "products/oid-fhir-platform/ig-template-with-oid.zip", filename: "IG_Template_with_OID.zip", kind: "zip", size: 0 },
      { id: "fhir-plat-fsh-library", r2_key: "products/oid-fhir-platform/fsh-template-library.zip", filename: "FSH_Template_Library.zip", kind: "zip", size: 0 },
      { id: "fhir-plat-migration", r2_key: "products/oid-fhir-platform/structuredefinition-oid-migration.zip", filename: "StructureDefinition_OID_Migration.zip", kind: "zip", size: 0 },
      { id: "fhir-plat-docs", r2_key: "products/oid-fhir-platform/fhir-platform-docs.html", filename: "FHIR_Platform_Docs.html", kind: "html", size: 0 },
    ],
  },
};

// Storefront SKUs are one purchasable line per bundle, but several bundles reuse the same
// underlying asset manifest (e.g. the live Shopify catalog sells "BSP-OID-*" SKUs while this
// manifest was originally keyed by the internal "OID-*-001" naming). Alias them here instead of
// duplicating manifests, so a rename on either side only needs one line changed.
SKU_ASSETS["BSP-OID-INTEGRATION-BLUEPRINT"] = { ...SKU_ASSETS["OID-STARTER-001"], assets: [...SKU_ASSETS["OID-STARTER-001"].assets] };
SKU_ASSETS["BSP-OID-REGISTRY-PLATFORM"] = { ...SKU_ASSETS["OID-DEV-001"], assets: [...SKU_ASSETS["OID-DEV-001"].assets] };
SKU_ASSETS["BSP-OID-NPHIES-BUNDLE"] = { ...SKU_ASSETS["OID-HLTH-001"], assets: [...SKU_ASSETS["OID-HLTH-001"].assets] };
SKU_ASSETS["BSP-OID-ENTERPRISE-BADGE"] = { ...SKU_ASSETS["OID-BADGE-001"], assets: [...SKU_ASSETS["OID-BADGE-001"].assets] };

// Live brainsait-oid catalog (id.brainsait.org, OID LINE) reuses the same asset
// manifests. Variants (e.g. OID-BADGE-M / OID-BADGE-A) share one manifest each.
SKU_ASSETS["OID-BADGE-M"] = SKU_ASSETS["OID-BADGE-001"];
SKU_ASSETS["OID-BADGE-A"] = SKU_ASSETS["OID-BADGE-001"];
SKU_ASSETS["OID-EXPLORER"] = SKU_ASSETS["OID-DEV-001"];
SKU_ASSETS["OID-FHIR"] = SKU_ASSETS["OID-FHIR-PLAT-001"];
SKU_ASSETS["OID-NPHIES"] = SKU_ASSETS["OID-HLTH-001"];
SKU_ASSETS["OID-NPHIES-SUP"] = SKU_ASSETS["OID-HLTH-001"];
SKU_ASSETS["OID-NAMESPACE"] = SKU_ASSETS["OID-ENT-ARCH-001"];
SKU_ASSETS["OID-NAMESPACE-SETUP"] = SKU_ASSETS["OID-STARTER-001"];
SKU_ASSETS["OID-WHITELABEL"] = SKU_ASSETS["OID-WL-ENT-001"];

async function generateLicenseKey(secret, orderId, lineItemId, unit, sku) {
  const prefix = sku.replace(/[^A-Z0-9]/g, "").slice(0, 8);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${orderId}:${lineItemId}:${unit}:${sku}`)
  );
  const digest = Array.from(new Uint8Array(signature).slice(0, 12), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("").toUpperCase();
  return `BSOID-${prefix}-${digest}`;
}

async function verifyShopifyHmac(request, secret) {
  const hmacHeader = request.headers.get("X-Shopify-Hmac-SHA256");
  if (!hmacHeader) return false;

  const body = await request.clone().arrayBuffer();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  let supplied;
  try {
    supplied = Uint8Array.from(atob(hmacHeader), (char) => char.charCodeAt(0));
  } catch {
    return false;
  }
  return crypto.subtle.verify("HMAC", key, supplied, body);
}

async function grantLicense(env, licenseKey, orderId, productIds, assets, customerEmail, customerId, maxDownloads, expiresAt) {
  const resp = await fetchWithTimeout(`${env.DELIVERY_BASE_URL}/admin/licenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hub-key": env.DELIVERY_ADMIN_TOKEN,
    },
    body: JSON.stringify({
      license_key: licenseKey,
      order_id: orderId,
      product_ids: productIds,
      assets,
      customer_email: customerEmail,
      customer_id: customerId,
      max_downloads_per_asset: maxDownloads,
      expires_at: expiresAt,
    }),
  });
  if (!resp.ok && resp.status !== 409) {
    throw new Error(`delivery:${resp.status}`);
  }
  return resp.status === 409 ? { ok: true, replay: true } : resp.json();
}

const HUB_BASE_URL = "https://hub.brainsait.de";
const NOTIFY_BASE_URL = "https://notify.brainsait.de";

// BRAINSAIT Identity Cloud — MailOTP SaaS plans sold on store.brainsait.org.
// These are NOT license-based products: on orders/paid we forward the order to the
// notify service, which provisions a tenant + emails the customer their API key.
const MAIL_OTP_SKUS = new Set([
  "BSP-IDC-DEVELOPER",
  "BSP-IDC-FOUNDER",
  "BSP-IDC-BUSINESS",
  "BSP-IDC-ENTERPRISE",
]);

function renderDeliveryEmailHtml({ customerName, language, orderId, items }) {
  const isAr = language === "AR";
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eceaf2;font-size:14px;color:#211E1F">${escapeHtml(item.productName)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eceaf2;text-align:right">
          <a href="${escapeHtml(item.deliveryUrl)}" style="background:#545EA9;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:8px 14px;border-radius:8px">
            ${isAr ? "تنزيل" : "Download"}
          </a>
        </td>
      </tr>`
    )
    .join("");
  const heading = isAr ? "طلبك جاهز" : "Your order is ready";
  const greeting = isAr
    ? `مرحباً ${escapeHtml(customerName)}، شكراً لشرائك من BrainSAIT.`
    : `Hi ${escapeHtml(customerName || "there")}, thanks for your purchase from BrainSAIT.`;
  const note = isAr
    ? "كل رابط يوصلك لصفحة التنزيلات الخاصة بترخيصك — احتفظ به، فهو نقطة الوصول الدائمة لهذا الطلب."
    : "Each link takes you to your license's download page — keep it, it's your permanent access point for this order.";
  return `<!doctype html><html lang="${isAr ? "ar" : "en"}" dir="${isAr ? "rtl" : "ltr"}"><body style="margin:0;background:#f7f7fb;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px">
      <div style="background:#fff;border-radius:12px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <h1 style="font-size:20px;margin:0 0 6px;color:#211E1F">${heading}</h1>
        <p style="color:#6b6b76;font-size:14px;margin:0 0 20px">${greeting}</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p style="color:#8a8a93;font-size:12px;margin-top:20px">${note}</p>
        <p style="color:#9a9aa3;font-size:12px;text-align:center;margin-top:24px">
          Order ${escapeHtml(orderId)} · <a href="mailto:support@brainsait.com" style="color:#545EA9">support@brainsait.com</a>
        </p>
      </div>
    </div>
  </body></html>`;
}

async function sendDeliveryEmail(env, { customerEmail, customerName, language, orderId, items }) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !customerEmail || items.length === 0) {
    return { ok: false, skipped: true };
  }
  const subject =
    language === "AR" ? `طلبك جاهز — ${orderId}` : `Your BrainSAIT order is ready — ${orderId}`;
  const resp = await fetchWithTimeout("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [customerEmail],
      subject,
      html: renderDeliveryEmailHtml({ customerName, language, orderId, items }),
    }),
  });
  if (!resp.ok) {
    throw new Error(`resend:${resp.status}`);
  }
  return { ok: true };
}

async function notifyTelegramSale(env, { orderId, customerEmail, items, currency = "SAR" }) {
  if (!env.DELIVERY_ADMIN_TOKEN) return { ok: false, skipped: true };
  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const lines = items.map((item) => `• ${item.productName} — ${item.amount} ${currency}`).join("\n");
  const text = [
    "🛒 New OID order fulfilled",
    `Order: ${orderId}`,
    `Customer: ${customerEmail || "unknown"}`,
    lines,
    `Total: ${total} ${currency}`,
  ].join("\n");
  const resp = await fetchWithTimeout(`${HUB_BASE_URL}/telegram/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hub-key": env.DELIVERY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) {
    throw new Error(`telegram:${resp.status}`);
  }
  return { ok: true };
}

// Feeds the same purchase.fulfilled event stream the Hetzner-side hub already exposes at
// GET /events -- n8n's "New Order Fanout" workflow and other Hermes-cron automation poll that
// stream, but only ever saw PayPal/legacy-Shopify sales because this Worker fulfills entirely on
// Cloudflare's edge and never touched the hub. One event per line item, not per order, to match
// what that consumer already expects (product_id keyed).
async function notifyHubEvents(env, { customerEmail, items, currency = "SAR" }) {
  if (!env.DELIVERY_ADMIN_TOKEN) return { ok: false, skipped: true };
  const results = await Promise.all(
    items.map((item) =>
      fetchWithTimeout(`${HUB_BASE_URL}/event/purchase-fulfilled`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hub-key": env.DELIVERY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          product_id: item.sku,
          customer_email: customerEmail,
          source: "oid-shopify",
          amount: item.amount,
          currency,
        }),
      })
    )
  );
  const failed = results.filter((resp) => !resp.ok);
  if (failed.length > 0) {
    throw new Error(`hub-event:${failed.map((resp) => resp.status).join(",")}`);
  }
  return { ok: true };
}

// Forwards an order containing a Mail & OTP plan to the notify service, which
// provisions a tenant + emails the API key. Idempotent: notify keys on order id.
async function provisionMailOtp(env, order) {
  const hasMailOtp = (order.line_items || []).some((li) => MAIL_OTP_SKUS.has(li.sku));
  if (!hasMailOtp) {
    return { ok: true, skipped: true };
  }
  if (!env.NOTIFY_PROVISION_KEY) {
    return { ok: false, error: "NOTIFY_PROVISION_KEY not configured" };
  }
  const resp = await fetchWithTimeout(`${NOTIFY_BASE_URL}/webhooks/shopify/orders-paid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Provision-Key": env.NOTIFY_PROVISION_KEY,
    },
    body: JSON.stringify(order),
  });
  if (!resp.ok) {
    throw new Error(`notify:${resp.status}`);
  }
  return resp.json();
}

// Shared auth check for the new topic handlers below (products/create,
// order_transactions/create, orders/fulfilled, fulfillments/create).
// handleOrderPaid keeps its own inline copy untouched — this worker fulfills
// real paid orders, so that path is deliberately not refactored here.
// Per-shop webhook secrets: SHOPIFY_HOOK_SECRETS is a JSON map
// {"shop.myshopify.com": "shpss_..."}. Falls back to the legacy single
// SHOPIFY_WEBHOOK_SECRET (flagship store). Lets staging + production coexist.
function secretForShop(env, shopDomain) {
  try {
    const map = JSON.parse(env.SHOPIFY_HOOK_SECRETS || "{}");
    if (shopDomain && map[shopDomain]) return map[shopDomain];
  } catch {
    // fall through to legacy secret
  }
  return env.SHOPIFY_WEBHOOK_SECRET || null;
}

async function verifyShopifyAuth(request, env) {
  const internalKey = request.headers.get("x-hub-key") || "";
  const hmacHeader = request.headers.get("X-Shopify-Hmac-SHA256") || "";
  if (internalKey && env.DELIVERY_ADMIN_TOKEN && internalKey === env.DELIVERY_ADMIN_TOKEN) {
    return true;
  }
  if (hmacHeader) {
    const shopDomain = request.headers.get("X-Shopify-Shop-Domain") || "";
    const secret = secretForShop(env, shopDomain);
    if (secret) return verifyShopifyHmac(request, secret);
  }
  return false;
}

async function notifyTelegramOps(env, text) {
  if (!env.DELIVERY_ADMIN_TOKEN) return { ok: false, skipped: true };
  const resp = await fetchWithTimeout(`${HUB_BASE_URL}/telegram/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hub-key": env.DELIVERY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) {
    throw new Error(`telegram:${resp.status}`);
  }
  return { ok: true };
}

async function listAirtableByOrderId(env, orderId) {
  const formula = encodeURIComponent(`{Shopify Order ID}='${orderId}'`);
  const resp = await fetchWithTimeout(
    `${AIRTABLE_API_URL}/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}?filterByFormula=${formula}`,
    { headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` } }
  );
  if (!resp.ok) {
    throw new Error(`airtable-lookup:${resp.status}`);
  }
  const data = await resp.json();
  return data.records || [];
}

async function revokeLicense(env, licenseKey) {
  const resp = await fetchWithTimeout(
    `${env.DELIVERY_BASE_URL}/admin/licenses/${encodeURIComponent(licenseKey)}/revoke`,
    {
      method: "POST",
      headers: { "x-hub-key": env.DELIVERY_ADMIN_TOKEN },
    }
  );
  if (!resp.ok && resp.status !== 404) {
    throw new Error(`revoke:${resp.status}`);
  }
  return resp.status === 404 ? { ok: true, alreadyGone: true } : resp.json();
}

async function logToAirtable(env, record) {
  // PATCH + performUpsert (NOT POST): PATCH upsert is accepted by this
  // workspace's PAT while plain POST with performUpsert returns
  // INVALID_REQUEST_UNKNOWN. Shopify webhooks retry on non-2xx and
  // re-issue the same deterministic License Key, so upsert-by-License-Key
  // keeps this idempotent across retries.
  const resp = await fetchWithTimeout(
    `${AIRTABLE_API_URL}/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        performUpsert: { fieldsToMergeOn: ["License Key"] },
        records: [{ fields: record }],
      }),
    }
  );
  if (!resp.ok) {
    throw new Error(`airtable:${resp.status}`);
  }
  return resp.json();
}

async function handleOrderPaid(request, env) {
  if (
    (!env.SHOPIFY_WEBHOOK_SECRET && !env.SHOPIFY_HOOK_SECRETS)
    || !env.LICENSE_SIGNING_SECRET
    || !env.DELIVERY_ADMIN_TOKEN
    || !env.AIRTABLE_API_KEY
  ) {
    return new Response("Service configuration error", { status: 503 });
  }

  // Accept either a genuine Shopify HMAC signature OR an internal x-hub-key
  // forwarded by the Shopify app (app.brainsait.de). The internal path is
  // necessary because the app re-serializes the payload, which invalidates the
  // original Shopify HMAC but is still trustworthy inside our own network.
  const internalKey = request.headers.get("x-hub-key") || "";
  const hmacHeader = request.headers.get("X-Shopify-Hmac-SHA256") || "";
  let valid = false;
  if (internalKey && env.DELIVERY_ADMIN_TOKEN && internalKey === env.DELIVERY_ADMIN_TOKEN) {
    valid = true;
  } else if (hmacHeader && env.SHOPIFY_WEBHOOK_SECRET) {
    valid = await verifyShopifyHmac(request, env.SHOPIFY_WEBHOOK_SECRET);
  }
  if (!valid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const topic = request.headers.get("X-Shopify-Topic") || "";
  if (topic && topic !== "orders/paid") {
    return new Response("Ignoring non-orders/paid topic", { status: 200 });
  }
  const shopDomain = request.headers.get("X-Shopify-Shop-Domain") || "";
  if (env.SHOPIFY_SHOP_DOMAIN && shopDomain) {
    const allowed = String(env.SHOPIFY_SHOP_DOMAIN)
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    if (allowed.length > 0 && !allowed.includes(shopDomain.toLowerCase()) && !allowed.includes(shopDomain.toLowerCase().replace(/^www\./, ""))) {
      return new Response("Unknown shop domain", { status: 403 });
    }
  }

  let order;
  try {
    order = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  if (!order || typeof order !== "object" || !order.id) {
    return new Response("Order id is required", { status: 400 });
  }
  const orderId = String(order.id);
  const customerEmail = order.email || order.customer?.email || "";
  const customerId = String(order.customer?.id || orderId);
  const customerName = [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ") || customerEmail;

  const locale = (order.customer_locale || order.locale || "en").toLowerCase();
  const language = locale.startsWith("ar") ? "AR" : "EN";

  const errors = [];
  const fulfilled = [];
  const unsupported = [];
  let ignored = 0;
  const issuedAtDate = new Date(order.processed_at || order.created_at || Date.now());
  const issuedAt = Number.isNaN(issuedAtDate.getTime())
    ? new Date().toISOString()
    : issuedAtDate.toISOString();

  for (const [lineIndex, lineItem] of (order.line_items || []).entries()) {
    const sku = lineItem.sku;
    if (!sku || !(sku.startsWith("OID-") || sku.startsWith("BSP-OID-"))) {
      ignored += 1;
      continue;
    }
    if (!SKU_ASSETS[sku]) {
      unsupported.push({ lineItemId: String(lineItem.id || lineIndex), sku: sku || null });
      continue;
    }

    const manifest = SKU_ASSETS[sku];
    const quantity = Math.max(1, Number.parseInt(lineItem.quantity, 10) || 1);
    const lineItemId = String(lineItem.id || `${sku}-${lineIndex}`);

    for (let unit = 1; unit <= quantity; unit += 1) {
      const licenseKey = await generateLicenseKey(
        env.LICENSE_SIGNING_SECRET,
        orderId,
        lineItemId,
        unit,
        sku
      );
      const expiresAt = new Date(
        new Date(issuedAt).getTime() + manifest.expiresInDays * 86400 * 1000
      ).toISOString();
      const deliveryUrl = `${env.DELIVERY_BASE_URL}/deliver/${licenseKey}`;

      try {
        await grantLicense(
          env,
          licenseKey,
          orderId,
          [sku],
          manifest.assets,
          customerEmail,
          customerId,
          manifest.maxDownloads,
          expiresAt
        );

        await logToAirtable(env, {
          "License Key": licenseKey,
          "Shopify Order ID": orderId,
          "Customer Email": customerEmail,
          "Customer Name": customerName,
          "Product SKU": sku,
          "Product Name": manifest.name,
          "Amount SAR": Number(lineItem.price),
          "Status": "Active",
          "Language": language,
          "Asset Bundle": manifest.assets.map((asset) => asset.id).join(", "),
          "Download URL": deliveryUrl,
          "Issued At": issuedAt,
          "Expires At": expiresAt.slice(0, 10),
          "Download Count": 0,
          "Notes": `Order ${orderId} - unit ${unit} of ${quantity} - ${lineItem.name}`,
        });
        fulfilled.push({
          sku,
          unit,
          licenseKey,
          productName: manifest.name,
          deliveryUrl,
          amount: Number(lineItem.price) || 0,
        });
      } catch (error) {
        errors.push({ sku, unit, code: error.message });
      }
    }
  }

  // Unknown SKUs no longer fail the whole order: supported line items are
  // fulfilled and notifications still fire. The unknown SKUs are reported in
  // the response and surfaced in the observability stream so the manifest can
  // be extended without ever blocking a paid customer's delivery again.
  if (errors.length > 0) {
    console.error("fulfillment errors", JSON.stringify({ orderId, errors }));
    return new Response(JSON.stringify({ ok: false, retryable: true }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Mail & OTP plans are provisioned (tenant + API key) by the notify service.
  let mailOtp = { ok: true, skipped: true };
  try {
    mailOtp = await provisionMailOtp(env, order);
  } catch (error) {
    console.error("mail-otp provisioning failed", JSON.stringify({ orderId, error: error.message }));
    mailOtp = { ok: false, error: error.message };
  }
  if (mailOtp.ok === false) {
    return new Response(JSON.stringify({ ok: false, retryable: true, mailOtp }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const notifications = { email: null, telegram: null, hubEvents: null };
  if (fulfilled.length > 0) {
    try {
      notifications.email = await sendDeliveryEmail(env, {
        customerEmail,
        customerName,
        language,
        orderId,
        items: fulfilled,
      });
    } catch (error) {
      console.error("delivery email failed", JSON.stringify({ orderId, error: error.message }));
      notifications.email = { ok: false, error: error.message };
    }
    try {
      notifications.telegram = await notifyTelegramSale(env, {
        orderId,
        customerEmail,
        items: fulfilled,
      });
    } catch (error) {
      console.error("telegram notify failed", JSON.stringify({ orderId, error: error.message }));
      notifications.telegram = { ok: false, error: error.message };
    }
    try {
      notifications.hubEvents = await notifyHubEvents(env, { customerEmail, items: fulfilled });
    } catch (error) {
      console.error("hub event feed failed", JSON.stringify({ orderId, error: error.message }));
      notifications.hubEvents = { ok: false, error: error.message };
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    fulfilled: fulfilled.length,
    unsupported: unsupported.map((entry) => entry.sku),
    notifications,
    ignored,
    mailOtp,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// New product created in Shopify. This worker owns no product catalog table —
// the actionable gap (documented repeatedly in launch audits) is products
// going live with no delivery asset behind them, so this is a Telegram nudge
// to ops, not a database write.
async function handleProductCreate(request, env) {
  if (!(await verifyShopifyAuth(request, env))) {
    return new Response("Unauthorized", { status: 401 });
  }
  let product;
  try {
    product = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  const skus = (product?.variants || []).map((v) => v.sku).filter(Boolean);
  const isOid = skus.some((sku) => sku.startsWith("OID-") || sku.startsWith("BSP-OID-"));
  const text = [
    "🆕 New Shopify product created",
    `Title: ${product?.title || "unknown"}`,
    skus.length > 0 ? `SKU(s): ${skus.join(", ")}` : "SKU(s): none set",
    isOid
      ? "⚠️ OID/BSP-OID SKU — confirm it has a SKU_ASSETS manifest entry in oid-order-fulfillment before it goes live."
      : "⚠️ Confirm a `source:` tag is set so the storefront catalog can resolve a delivery asset.",
  ].join("\n");
  try {
    await notifyTelegramOps(env, text);
  } catch (error) {
    console.error("product-create alert failed", JSON.stringify({ error: error.message }));
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// A Shopify transaction (sale/capture/refund/void) posted against an order.
// The only gap this worker had was refunds: a refunded OID/BSP-OID order kept
// its license active forever. Every other transaction kind is acknowledged
// and skipped — orders/paid already handles the successful-sale path.
async function handleTransactionCreate(request, env) {
  if (!(await verifyShopifyAuth(request, env))) {
    return new Response("Unauthorized", { status: 401 });
  }
  let txn;
  try {
    txn = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  const orderId = String(txn?.order_id || "");
  const kind = String(txn?.kind || "").toLowerCase();
  const status = String(txn?.status || "").toLowerCase();
  if (!orderId || kind !== "refund" || status !== "success") {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!env.AIRTABLE_API_KEY) {
    return new Response("Service configuration error", { status: 503 });
  }

  let records;
  try {
    records = await listAirtableByOrderId(env, orderId);
  } catch (error) {
    console.error("refund lookup failed", JSON.stringify({ orderId, error: error.message }));
    return new Response(JSON.stringify({ ok: false, retryable: true }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  // No license record for this order id = not an OID/BSP-OID order. Nothing
  // for this worker to revoke; some other system owns that refund.
  if (records.length === 0) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const revoked = [];
  const errors = [];
  for (const record of records) {
    const licenseKey = record.fields?.["License Key"];
    if (!licenseKey || record.fields?.Status === "Revoked") continue;
    try {
      await revokeLicense(env, licenseKey);
      await logToAirtable(env, {
        "License Key": licenseKey,
        Status: "Revoked",
        Notes: `Refunded ${new Date().toISOString()} — access revoked via order_transactions/create`,
      });
      revoked.push(licenseKey);
    } catch (error) {
      errors.push({ licenseKey, error: error.message });
    }
  }
  try {
    if (revoked.length > 0) {
      await notifyTelegramOps(
        env,
        `↩️ Refund processed for order ${orderId} — revoked license(s): ${revoked.join(", ")}`
      );
    }
  } catch (error) {
    console.error("refund telegram alert failed", JSON.stringify({ orderId, error: error.message }));
  }

  if (errors.length > 0) {
    console.error("refund revocation errors", JSON.stringify({ orderId, errors }));
    return new Response(JSON.stringify({ ok: false, retryable: true, revoked, errors }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ ok: true, revoked }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Order reached Shopify's "fulfilled" state. Since OID/BSP-OID delivery
// already happens synchronously on orders/paid, this is a reconciliation
// safety net: alert ops if an order was marked fulfilled but this worker
// never actually issued a license for one of its OID SKUs (e.g. an earlier
// failed/exhausted webhook retry, or a manual admin fulfillment).
async function handleOrderFulfilled(request, env) {
  if (!(await verifyShopifyAuth(request, env))) {
    return new Response("Unauthorized", { status: 401 });
  }
  let order;
  try {
    order = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  const orderId = String(order?.id || "");
  const oidSkus = (order?.line_items || [])
    .map((li) => li.sku)
    .filter((sku) => sku && (sku.startsWith("OID-") || sku.startsWith("BSP-OID-")));
  if (!orderId || oidSkus.length === 0 || !env.AIRTABLE_API_KEY) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  let records;
  try {
    records = await listAirtableByOrderId(env, orderId);
  } catch (error) {
    console.error(
      "fulfilled reconciliation lookup failed",
      JSON.stringify({ orderId, error: error.message })
    );
    return new Response(JSON.stringify({ ok: true, reconciled: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const issuedSkus = new Set(records.map((r) => r.fields?.["Product SKU"]).filter(Boolean));
  const missing = oidSkus.filter((sku) => !issuedSkus.has(sku));
  if (missing.length > 0) {
    try {
      await notifyTelegramOps(
        env,
        `⚠️ Order ${orderId} marked fulfilled but no license record exists for: ${missing.join(", ")} — check manually.`
      );
    } catch (error) {
      console.error(
        "fulfilled reconciliation alert failed",
        JSON.stringify({ orderId, error: error.message })
      );
    }
  }
  return new Response(JSON.stringify({ ok: true, missing }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// A Fulfillment object was created. This catalog is 100% digital delivery —
// there is genuinely nothing actionable here (no shipment, no tracking to
// relay). Logged to the observability stream only, honestly, rather than
// inventing busywork for an event this store has no physical use for.
async function handleFulfillmentCreate(request, env) {
  if (!(await verifyShopifyAuth(request, env))) {
    return new Response("Unauthorized", { status: 401 });
  }
  let fulfillment;
  try {
    fulfillment = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  console.log(
    "fulfillment.create",
    JSON.stringify({
      orderId: fulfillment?.order_id,
      trackingCompany: fulfillment?.tracking_company || null,
      trackingNumber: fulfillment?.tracking_number || null,
      lineItemSkus: (fulfillment?.line_items || []).map((li) => li.sku).filter(Boolean),
    })
  );
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function handleHealth(env) {
  return new Response(
    JSON.stringify({
      worker: "oid-order-fulfillment",
      status: "ok",
      configured: Boolean(
        env.SHOPIFY_WEBHOOK_SECRET
        && env.LICENSE_SIGNING_SECRET
        && env.DELIVERY_ADMIN_TOKEN
        && env.AIRTABLE_API_KEY
      ),
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/webhooks/shopify/orders-paid") {
      const topic = request.headers.get("X-Shopify-Topic") || "";
      if (topic === "products/create") return handleProductCreate(request, env);
      if (topic === "order_transactions/create") return handleTransactionCreate(request, env);
      if (topic === "orders/fulfilled") return handleOrderFulfilled(request, env);
      if (topic === "fulfillments/create") return handleFulfillmentCreate(request, env);
      return handleOrderPaid(request, env);
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return handleHealth(env);
    }

    return new Response("Not Found", { status: 404 });
  },
};
