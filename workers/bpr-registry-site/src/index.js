var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Secret, X-Admin-Token"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if ((url.pathname === "/" || url.pathname === "") && (request.method === "GET" || request.method === "HEAD")) {
      return new Response(null, { status: 302, headers: { Location: "/oid", ...corsHeaders } });
    }
    if (url.pathname === "/health") {
      return jsonResponse({ status: "healthy", service: "bpr-registry" }, 200, corsHeaders);
    }
    if (url.pathname.startsWith("/verify/") && request.method === "GET") {
      const spid = url.pathname.split("/")[2];
      const result = await verifyProvider(spid, env);
      return jsonResponse(result, 200, corsHeaders);
    }
    if (url.pathname === "/members" && request.method === "GET") {
      const result = await listMembers(env);
      return jsonResponse(result, 200, corsHeaders);
    }
    if (url.pathname.startsWith("/members/") && url.pathname !== "/members" && request.method === "GET") {
      const spid = url.pathname.split("/")[2];
      const result = await getMember(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }
    if (url.pathname.startsWith("/members/") && url.pathname.endsWith("/offboard") && request.method === "POST") {
      if (!isAdmin(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      }
      const spid = url.pathname.split("/")[2];
      const result = await offboardMember(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }
    if (url.pathname === "/register" && request.method === "POST") {
      if (!isAdmin(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      }
      const body = await request.json();
      const result = await registerMember(body, env);
      return jsonResponse(result, 201, corsHeaders);
    }
    if (url.pathname === "/register/quick" && request.method === "POST") {
      const body = await request.json();
      const result = await registerQuick(body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }
    if (url.pathname === "/slots" && request.method === "GET") {
      const result = await listSlots(url, env);
      return jsonResponse(result, 200, corsHeaders);
    }
    if (url.pathname === "/slots" && request.method === "POST") {
      if (!isAdmin(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      }
      const body = await request.json();
      const result = await createSlot(body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }
    if (url.pathname.startsWith("/slots/") && url.pathname.endsWith("/chain") && request.method === "GET") {
      const id = url.pathname.split("/")[2];
      const result = await getSlotChain(id, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }
    if (url.pathname.startsWith("/slots/") && url.pathname.endsWith("/delegations") && request.method === "GET") {
      const id = url.pathname.split("/")[2];
      const delegations = await env.PLATFORM_DB.prepare(
        `SELECT d.id, d.from_spid, d.to_spid, d.slot_id, d.scope_json, d.state, d.created_at,
                d.consent_sig IS NOT NULL AS signed
         FROM bpr_delegations d WHERE d.slot_id = ? ORDER BY d.created_at DESC`
      ).bind(id).all();
      const results = delegations.results.map((d) => ({
        ...d,
        scope: JSON.parse(String(d.scope_json))
      }));
      return jsonResponse({ slot_id: id, delegations: results }, 200, corsHeaders);
    }
    if (url.pathname.startsWith("/slots/") && request.method === "GET") {
      const id = url.pathname.split("/")[2];
      const result = await getSlot(id, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }
    if (url.pathname.startsWith("/slots/") && url.pathname.endsWith("/request") && request.method === "POST") {
      const id = url.pathname.split("/")[2];
      const body = await request.json();
      const result = await createSlotRequest(id, body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }
    if (url.pathname.startsWith("/slots/") && url.pathname.endsWith("/delegate") && request.method === "POST") {
      if (!isAdmin(request, env)) return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      const id = url.pathname.split("/")[2];
      const body = await request.json();
      const result = await delegateSlot(id, body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }
    if (url.pathname.startsWith("/slots/") && url.pathname.endsWith("/subslots") && request.method === "POST") {
      if (!isAdmin(request, env)) return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      const id = url.pathname.split("/")[2];
      const body = await request.json();
      const result = await createSubslots(id, body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }
    if (url.pathname === "/requests" && request.method === "GET") {
      const filterSpid = url.searchParams.get("spid");
      if (filterSpid) {
        const result2 = await listRequestsBySpid(filterSpid, url, env);
        return jsonResponse(result2, 200, corsHeaders);
      }
      if (!isAdmin(request, env)) return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      const result = await listRequests(url, env);
      return jsonResponse(result, 200, corsHeaders);
    }
    if (url.pathname.startsWith("/requests/") && url.pathname.endsWith("/approve") && request.method === "POST") {
      if (!isAdmin(request, env)) return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      const id = url.pathname.split("/")[2];
      const result = await approveRequest(id, env);
      return jsonResponse(result, result.error ? 400 : 200, corsHeaders);
    }
    if (url.pathname.startsWith("/requests/") && url.pathname.endsWith("/reject") && request.method === "POST") {
      if (!isAdmin(request, env)) return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      const id = url.pathname.split("/")[2];
      const result = await rejectRequest(id, env);
      return jsonResponse(result, result.error ? 400 : 200, corsHeaders);
    }
    if (url.pathname.startsWith("/p/") && (request.method === "GET" || request.method === "HEAD")) {
      const spid = url.pathname.split("/")[2];
      return await renderProfilePage(spid, env, corsHeaders);
    }
    if (url.pathname.startsWith("/api/profiles/") && request.method === "GET") {
      const spid = url.pathname.split("/")[3];
      const result = await getProfile(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }
    if (url.pathname === "/profiles" && request.method === "POST") {
      if (!isAdmin(request, env)) return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      const body = await request.json();
      const result = await upsertProfile(body, env);
      return jsonResponse(result, result.error ? 400 : 200, corsHeaders);
    }
    if (url.pathname.startsWith("/provision/") && request.method === "POST") {
      if (!isAdmin(request, env)) return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      const spid = url.pathname.split("/")[2];
      const body = await request.json().catch(() => ({}));
      const result = await provisionDoctor(spid, body, env);
      return jsonResponse(result, result.error ? 400 : 200, corsHeaders);
    }
    if (url.pathname.startsWith("/provision/") && request.method === "GET") {
      const spid = url.pathname.split("/")[2];
      const result = await provisioningStatus(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }
    if (url.pathname.startsWith("/ledger/") && request.method === "GET") {
      const spid = url.pathname.split("/")[2];
      const result = await getLedger(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }
    if (url.pathname === "/ledger" && request.method === "POST") {
      if (!isAdmin(request, env)) return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      const body = await request.json();
      const result = await appendLedger(body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }
    if (url.pathname.startsWith("/partner/") && request.method === "GET") {
      const spid = url.pathname.split("/")[2];
      const result = await partnerAggregate(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }
    if (url.pathname === "/network" && request.method === "GET") {
      const rows = await env.PLATFORM_DB.prepare(
        `SELECT n.spid, n.ix_name, n.ix_asn, n.peering_type, n.facility, n.uptime_sla,
                n.verified, n.peer_count, n.bandwidth_gbps, n.ipv6_enabled, n.verified_at,
                m.business_name, m.trust_level, m.status
         FROM bpr_network_trust n LEFT JOIN bpr_memberships m ON m.spid = n.spid
         ORDER BY n.verified DESC, n.uptime_sla ASC`
      ).all();
      return jsonResponse({ total: rows.results.length, providers: rows.results }, 200, corsHeaders);
    }
    if (url.pathname.startsWith("/network/") && request.method === "GET") {
      const spid = url.pathname.split("/")[2];
      const row = await env.PLATFORM_DB.prepare(
        "SELECT * FROM bpr_network_trust WHERE spid = ?"
      ).bind(spid).first();
      if (!row) return jsonResponse({ error: "network record not found" }, 404, corsHeaders);
      return jsonResponse({ provider: row }, 200, corsHeaders);
    }
    if (url.pathname === "/network" && request.method === "POST") {
      if (!isAdmin(request, env)) return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      const body = await request.json();
      const { spid, ix_name, ix_asn, peering_type, facility, uptime_sla, peer_count, bandwidth_gbps, ipv6_enabled } = body || {};
      if (!spid || !ix_name || !ix_asn) return jsonResponse({ error: "missing spid, ix_name, ix_asn" }, 400, corsHeaders);
      const member = await env.PLATFORM_DB.prepare("SELECT spid FROM bpr_memberships WHERE spid = ?").bind(spid).first();
      if (!member) return jsonResponse({ error: `member ${spid} not found` }, 404, corsHeaders);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const verified = verified ? 1 : 0;
      await env.PLATFORM_DB.prepare(
        `INSERT INTO bpr_network_trust (spid, ix_name, ix_asn, peering_type, facility, uptime_sla, verified, verified_at, peer_count, bandwidth_gbps, ipv6_enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(spid) DO UPDATE SET ix_name=excluded.ix_name, ix_asn=excluded.ix_asn, peering_type=excluded.peering_type,
         facility=excluded.facility, uptime_sla=excluded.uptime_sla, verified=excluded.verified, verified_at=excluded.verified_at,
         peer_count=excluded.peer_count, bandwidth_gbps=excluded.bandwidth_gbps, ipv6_enabled=excluded.ipv6_enabled`
      ).bind(
        spid,
        ix_name,
        ix_asn,
        peering_type || null,
        facility || null,
        uptime_sla || null,
        verified,
        verified ? now : null,
        peer_count || 0,
        bandwidth_gbps || 0,
        ipv6_enabled || 0
      ).run();
      return jsonResponse({ spid, network: "registered", verified }, 200, corsHeaders);
    }
    if (url.pathname === "/network/verify" && request.method === "POST") {
      if (!isAdmin(request, env)) return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
      const body = await request.json();
      const { spid, verified } = body || {};
      if (!spid) return jsonResponse({ error: "missing spid" }, 400, corsHeaders);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await env.PLATFORM_DB.prepare(
        "UPDATE bpr_network_trust SET verified = ?, verified_at = ?, updated_at = ? WHERE spid = ?"
      ).bind(verified ? 1 : 0, now, now, spid).run();
      return jsonResponse({ spid, verified }, 200, corsHeaders);
    }
    if (url.pathname === "/oid" && (request.method === "GET" || request.method === "HEAD")) {
      return renderOidLanding(corsHeaders);
    }
    if (url.pathname.startsWith("/oid/verify/") && request.method === "GET") {
      const spid = url.pathname.split("/oid/verify/")[1];
      if (!spid) return jsonResponse({ error: "SPID required" }, 400, corsHeaders);
      const member = await env.PLATFORM_DB.prepare("SELECT spid, business_name, created_at FROM bpr_memberships WHERE spid = ?").bind(spid).first();
      if (!member) return jsonResponse({ error: "SPID not found" }, 404, corsHeaders);
      const oid = oidForMember(spid, OID_ARCS.provider_registry);
      const oidValid = await verifyOidArc(OID_ARCS.provider_registry);
      return jsonResponse({
        spid,
        business_name: member.business_name,
        oid,
        arc: OID_ARCS.provider_registry,
        valid: oidValid,
        registered_at: member.created_at
      }, 200, corsHeaders);
    }
    if (url.pathname === "/oid/leaves" && request.method === "GET") {
      const leaves = Object.entries(OID_ARCS).map(([key, arc]) => ({
        name: key,
        arc,
        oid: `${OID_ROOT}.${arc}`
      }));
      return jsonResponse({ leaves }, 200, corsHeaders);
    }
    if (url.pathname === "/webhook/order/paid" && request.method === "POST") {
      const bodyText = await request.text();
      const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
      if (!await verifyShopifyHmac(bodyText, hmac, env.WEBHOOK_SECRET)) {
        return jsonResponse({ error: "Invalid Shopify HMAC" }, 401, corsHeaders);
      }
      const body = JSON.parse(bodyText);
      const result = await handleBPROrderPaid(body, env);
      return jsonResponse(result, 200, corsHeaders);
    }
    if (url.pathname === "/mcp" && request.method === "POST") {
      return await handleMCP(request, env);
    }
    return jsonResponse({ error: "Not found" }, 404, corsHeaders);
  }
};
async function verifyShopifyHmac(body, hmac, secret) {
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    return btoa(String.fromCharCode(...new Uint8Array(sig))) === hmac;
  } catch {
    return false;
  }
}
__name(verifyShopifyHmac, "verifyShopifyHmac");
function isAdmin(request, env) {
  const key = request.headers.get("X-Admin-Token") || "";
  return !!env.ADMIN_TOKEN && key === env.ADMIN_TOKEN;
}
__name(isAdmin, "isAdmin");
async function mintId(kind, prefix, env) {
  const row = await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_counters (kind, next) VALUES (?, 2)
     ON CONFLICT(kind) DO UPDATE SET next = next + 1
     RETURNING next`
  ).bind(kind).first();
  const n = (row?.next ?? 2) - 1;
  return `${prefix}-${String(n).padStart(6, "0")}`;
}
__name(mintId, "mintId");
var SLOT_TYPES = ["doctor", "nurse", "ai_agent"];
var SLOT_FEE_VARIANT_ID = "46374789742675";
async function listSlots(url, env) {
  const clauses = [];
  const binds = [];
  const filters = {
    state: "s.state",
    type: "s.slot_type",
    specialty: "s.specialty",
    org: "s.org_spid"
  };
  for (const [param, col] of Object.entries(filters)) {
    const v = url.searchParams.get(param);
    if (v) {
      clauses.push(`${col} = ?`);
      binds.push(v);
    }
  }
  const city = url.searchParams.get("city");
  if (city) {
    clauses.push(`s.manifest_json LIKE ?`);
    binds.push(`%"city":"${city}"%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await env.PLATFORM_DB.prepare(
    `SELECT s.id, s.org_spid, s.parent_slot, s.slot_type, s.specialty, s.title,
            s.price_integration_sar, s.price_monthly_sar, s.state, s.holder_spid, s.created_at,
            m.business_name AS org_name, m.trust_level AS org_trust_level
     FROM bpr_slots s LEFT JOIN bpr_memberships m ON m.spid = s.org_spid
     ${where} ORDER BY s.created_at DESC LIMIT 200`
  ).bind(...binds).all();
  return { total: rows.results.length, slots: rows.results };
}
__name(listSlots, "listSlots");
async function getSlot(id, env) {
  const slot = await env.PLATFORM_DB.prepare(
    `SELECT s.*, m.business_name AS org_name, m.trust_level AS org_trust_level
     FROM bpr_slots s LEFT JOIN bpr_memberships m ON m.spid = s.org_spid
     WHERE s.id = ?`
  ).bind(id).first();
  if (!slot) return { error: "Slot not found" };
  return {
    slot: {
      ...slot,
      manifest: JSON.parse(String(slot.manifest_json)),
      requirements: slot.requirements_json ? JSON.parse(String(slot.requirements_json)) : null,
      manifest_json: void 0,
      requirements_json: void 0
    }
  };
}
__name(getSlot, "getSlot");
async function createSlot(data, env) {
  const { org_spid, parent_slot, slot_type, specialty, title, manifest, requirements, price_integration_sar, price_monthly_sar } = data || {};
  if (!org_spid || !slot_type || !specialty || !title || !manifest) {
    return { error: "missing required fields: org_spid, slot_type, specialty, title, manifest" };
  }
  if (!SLOT_TYPES.includes(slot_type)) {
    return { error: `slot_type must be one of: ${SLOT_TYPES.join(", ")}` };
  }
  const pi = Number(price_integration_sar ?? 0);
  const pm = Number(price_monthly_sar ?? 0);
  if (!Number.isInteger(pi) || pi < 0 || !Number.isInteger(pm) || pm < 0) {
    return { error: "prices must be non-negative integers (SAR)" };
  }
  const org = await env.PLATFORM_DB.prepare(
    "SELECT spid FROM bpr_memberships WHERE spid = ? AND status = ?"
  ).bind(org_spid, "active").first();
  if (!org) return { error: `org ${org_spid} not found or not active` };
  const id = await mintId("slot", "SA-SLT", env);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_slots (id, org_spid, parent_slot, slot_type, specialty, title, manifest_json, requirements_json, price_integration_sar, price_monthly_sar, state, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'empty', ?, ?)`
  ).bind(
    id,
    org_spid,
    parent_slot || null,
    slot_type,
    specialty,
    title,
    JSON.stringify(manifest),
    requirements ? JSON.stringify(requirements) : null,
    pi,
    pm,
    now,
    now
  ).run();
  return { id, state: "empty", created_at: now };
}
__name(createSlot, "createSlot");
async function createSubslots(parentId, data, env) {
  const parent = await env.PLATFORM_DB.prepare("SELECT * FROM bpr_slots WHERE id = ?").bind(parentId).first();
  if (!parent) return { error: "parent slot not found" };
  if (parent.state !== "live") return { error: `parent must be 'live' (is ${parent.state})` };
  if (parent.holder_spid !== data?.holder_spid && parent.org_spid !== data?.holder_spid) {
    return { error: `only holder/org of ${parentId} may spawn sub-slots (holder is ${parent.holder_spid ?? "none"})` };
  }
  const count = Number(data?.count ?? 1);
  if (!Number.isInteger(count) || count < 1 || count > 24) return { error: "count must be 1..24" };
  const pi = Number(data?.price_integration_sar ?? parent.price_integration_sar);
  const pm = Number(data?.price_monthly_sar ?? parent.price_monthly_sar);
  if (!Number.isInteger(pi) || pi < 0 || !Number.isInteger(pm) || pm < 0) return { error: "prices must be non-negative integers (SAR)" };
  const manifest = parent.manifest_json ? JSON.parse(String(parent.manifest_json)) : { department: "nursing", city: "unknown" };
  const requirements = parent.requirements_json ? JSON.parse(String(parent.requirements_json)) : null;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const created = [];
  for (let i = 0; i < count; i++) {
    const id = await mintId("slot", "SA-SLT", env);
    const title = data?.title_prefix ? `${data.title_prefix} #${i + 1}` : `Nursing ${parent.specialty.replace(/_/g, " ")} #${i + 1} (under ${parentId})`;
    await env.PLATFORM_DB.prepare(
      `INSERT INTO bpr_slots (id, org_spid, parent_slot, slot_type, specialty, title, manifest_json, requirements_json, price_integration_sar, price_monthly_sar, state, created_at, updated_at)
       VALUES (?, ?, ?, 'nurse', ?, ?, ?, ?, ?, ?, 'empty', ?, ?)`
    ).bind(
      id,
      String(parent.org_spid),
      parentId,
      String(parent.specialty),
      title,
      JSON.stringify({ ...manifest, parent: parentId, role: "nurse", department: data?.manifest?.department ?? manifest.department }),
      requirements ? JSON.stringify(requirements) : null,
      pi,
      pm,
      now,
      now
    ).run();
    created.push(id);
  }
  return { parent_slot: parentId, created, state: "empty", count: created.length };
}
__name(createSubslots, "createSubslots");
async function createSlotRequest(slotId, data, env) {
  const spid = String(data?.spid || "");
  const message = String(data?.message || "").slice(0, 1e3);
  if (!spid) return { error: "missing spid" };
  const rlKey = `rl:req:${spid}`;
  const count = parseInt(await env.SESSION_KV.get(rlKey) || "0", 10);
  if (count >= 10) return { error: "rate limit: max 10 requests per hour" };
  const requester = await env.PLATFORM_DB.prepare(
    "SELECT spid, status FROM bpr_memberships WHERE spid = ?"
  ).bind(spid).first();
  if (!requester) return { error: "requester not found \u2014 register as a partner first" };
  if (requester.status !== "active") return { error: `requester status is ${requester.status}` };
  const slot = await env.PLATFORM_DB.prepare("SELECT id, state FROM bpr_slots WHERE id = ?").bind(slotId).first();
  if (!slot) return { error: "slot not found" };
  if (slot.state !== "empty") return { error: `slot is ${slot.state}` };
  const dup = await env.PLATFORM_DB.prepare(
    `SELECT id FROM bpr_slot_requests WHERE slot_id = ? AND requester_spid = ? AND state IN ('requested','invoiced','verifying')`
  ).bind(slotId, spid).first();
  if (dup) return { error: `open request already exists: ${dup.id}` };
  const id = await mintId("request", "SA-REQ", env);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_slot_requests (id, slot_id, requester_spid, message, state, created_at) VALUES (?, ?, ?, ?, 'requested', ?)`
  ).bind(id, slotId, spid, message, now).run();
  await env.PLATFORM_DB.prepare(
    `UPDATE bpr_slots SET state = 'requested', updated_at = ? WHERE id = ? AND state = 'empty'`
  ).bind(now, slotId).run();
  await env.SESSION_KV.put(rlKey, String(count + 1), { expirationTtl: 3600 });
  return { id, slot_id: slotId, state: "requested" };
}
__name(createSlotRequest, "createSlotRequest");
async function listRequestsBySpid(spid, url, env) {
  const clauses = ["r.requester_spid = ?"];
  const binds = [spid];
  const state = url.searchParams.get("state");
  if (state) {
    clauses.push("r.state = ?");
    binds.push(state);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await env.PLATFORM_DB.prepare(
    `SELECT r.*, s.title AS slot_title, m.business_name AS requester_name, m.email AS requester_email
     FROM bpr_slot_requests r
     LEFT JOIN bpr_slots s ON s.id = r.slot_id
     LEFT JOIN bpr_memberships m ON m.spid = r.requester_spid
     ${where} ORDER BY r.created_at DESC LIMIT 200`
  ).bind(...binds).all();
  return { total: rows.results.length, requests: rows.results };
}
__name(listRequestsBySpid, "listRequestsBySpid");
async function listRequests(url, env) {
  const clauses = [];
  const binds = [];
  const slotId = url.searchParams.get("slot_id");
  const state = url.searchParams.get("state");
  if (slotId) {
    clauses.push("r.slot_id = ?");
    binds.push(slotId);
  }
  if (state) {
    clauses.push("r.state = ?");
    binds.push(state);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await env.PLATFORM_DB.prepare(
    `SELECT r.*, s.title AS slot_title, m.business_name AS requester_name, m.email AS requester_email
     FROM bpr_slot_requests r
     LEFT JOIN bpr_slots s ON s.id = r.slot_id
     LEFT JOIN bpr_memberships m ON m.spid = r.requester_spid
     ${where} ORDER BY r.created_at DESC LIMIT 200`
  ).bind(...binds).all();
  return { total: rows.results.length, requests: rows.results };
}
__name(listRequests, "listRequests");
async function approveRequest(id, env) {
  const req = await env.PLATFORM_DB.prepare("SELECT * FROM bpr_slot_requests WHERE id = ?").bind(id).first();
  if (!req) return { error: "request not found" };
  if (req.state !== "requested") return { error: `request is ${req.state}` };
  const slot = await env.PLATFORM_DB.prepare("SELECT * FROM bpr_slots WHERE id = ?").bind(String(req.slot_id)).first();
  if (!slot) return { error: "slot not found" };
  const requester = await env.PLATFORM_DB.prepare("SELECT * FROM bpr_memberships WHERE spid = ?").bind(String(req.requester_spid)).first();
  if (!requester?.email) return { error: "requester has no email on file" };
  const qty = Number(slot.price_integration_sar);
  if (!Number.isInteger(qty) || qty <= 0) return { error: "slot has no positive integration price" };
  const paymentUrl = `https://store.brainsait.de/cart/${SLOT_FEE_VARIANT_ID}:${qty}?attributes[request_id]=${encodeURIComponent(String(req.id))}&attributes[slot_id]=${encodeURIComponent(String(slot.id))}&attributes[spid]=${encodeURIComponent(String(req.requester_spid))}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.PLATFORM_DB.prepare(
    `UPDATE bpr_slot_requests SET state = 'invoiced', order_id = NULL, resolved_at = NULL WHERE id = ?`
  ).bind(id).run();
  await env.PLATFORM_DB.prepare(`UPDATE bpr_slots SET state = 'invoiced', updated_at = ? WHERE id = ?`).bind(now, String(slot.id)).run();
  try {
    if (env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "BrainSAIT <registry@brainsait.org>",
          to: [String(requester.email)],
          subject: `Slot approved \u2014 complete integration payment | \u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u2014 \u0623\u0643\u0645\u0644 \u0627\u0644\u062F\u0641\u0639`,
          html: `<div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 2rem;">
            <h2 style="color:#10b981;">Your slot request was approved</h2>
            <p><b>${slot.title}</b> (${slot.id})</p>
            <p>Integration fee: <b>${slot.price_integration_sar} SAR</b></p>
            <a href="${paymentUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:0.75rem 1.5rem;border-radius:6px;text-decoration:none;">Pay to activate your slot</a>
          </div>`
        })
      });
    }
  } catch {
  }
  return { id, state: "invoiced", payment_url: paymentUrl, amount_sar: qty };
}
__name(approveRequest, "approveRequest");
async function rejectRequest(id, env) {
  const req = await env.PLATFORM_DB.prepare("SELECT * FROM bpr_slot_requests WHERE id = ?").bind(id).first();
  if (!req) return { error: "request not found" };
  if (req.state !== "requested") return { error: `request is ${req.state}` };
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.PLATFORM_DB.prepare(`UPDATE bpr_slot_requests SET state = 'rejected', resolved_at = ? WHERE id = ?`).bind(now, id).run();
  await env.PLATFORM_DB.prepare(`UPDATE bpr_slots SET state = 'empty', updated_at = ? WHERE id = ? AND state = 'requested'`).bind(now, String(req.slot_id)).run();
  return { id, state: "rejected", slot_back_to: "empty" };
}
__name(rejectRequest, "rejectRequest");
async function delegateSlot(slotId, data, env) {
  const { from_spid, to_spid, scope, consent_sig } = data || {};
  if (!from_spid || !to_spid || !scope?.tasks?.length) return { error: "missing required fields: from_spid, to_spid, scope.tasks" };
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const slot = await env.PLATFORM_DB.prepare("SELECT * FROM bpr_slots WHERE id = ?").bind(slotId).first();
  if (!slot) return { error: "slot not found" };
  const holderOk = slot.holder_spid === from_spid || slot.org_spid === from_spid;
  if (!holderOk) return { error: `only holder/org of ${slotId} may delegate (holder is ${slot.holder_spid ?? "none"})` };
  if (slot.state !== "live") return { error: `only 'live' slots can be delegated (is ${slot.state})` };
  const from = await env.PLATFORM_DB.prepare("SELECT spid, status FROM bpr_memberships WHERE spid = ?").bind(from_spid).first();
  if (!from || from.status !== "active") return { error: `from_spid ${from_spid} not active` };
  const to = await env.PLATFORM_DB.prepare("SELECT spid, status FROM bpr_memberships WHERE spid = ?").bind(to_spid).first();
  if (!to || to.status !== "active") return { error: `to_spid ${to_spid} not active` };
  if (from_spid === to_spid) return { error: "cannot delegate to self" };
  const id = await mintId("delegation", "SA-DLG", env);
  const payload = JSON.stringify({
    schema: "https://brainsait.org/schemas/delegation/v1",
    id,
    from_spid,
    to_spid,
    slot_id: slotId,
    scope: { tasks: scope.tasks, internal: scope.internal ?? false, expires: scope.expires ?? null },
    state: "active",
    created_at: now
  });
  let sig = consent_sig || null;
  let sigError = null;
  try {
    if (!sig) {
      const r = await env.PASSPORT.fetch("https://passport.brainsait.org/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload })
      });
      if (r.ok) {
        const j = await r.json();
        sig = j.signature ?? null;
      }
    }
  } catch (e) {
    sigError = String(e);
  }
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_delegations (id, from_spid, to_spid, slot_id, scope_json, consent_sig, state, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`
  ).bind(id, from_spid, to_spid, slotId, JSON.stringify(scope), sig, now).run();
  return { id, from_spid, to_spid, slot_id: slotId, scope, consent_sig: sig, sig_error: sigError };
}
__name(delegateSlot, "delegateSlot");
async function getSlotChain(slotId, env) {
  const slot = await env.PLATFORM_DB.prepare(
    `SELECT s.id, s.org_spid, s.parent_slot, s.slot_type, s.specialty, s.title, s.state, s.holder_spid, s.created_at,
            m.business_name AS org_name, m.trust_level AS org_trust_level
     FROM bpr_slots s LEFT JOIN bpr_memberships m ON m.spid = s.org_spid
     WHERE s.id = ?`
  ).bind(slotId).first();
  if (!slot) return { error: "slot not found" };
  const delegations = (await env.PLATFORM_DB.prepare(
    `SELECT d.id, d.from_spid, d.to_spid, d.scope_json, d.state, d.created_at, d.consent_sig IS NOT NULL AS signed
     FROM bpr_delegations d WHERE d.slot_id = ? ORDER BY d.created_at DESC`
  ).bind(slotId).all()).results.map((d) => ({ ...d, scope: JSON.parse(String(d.scope_json)) }));
  const memberOf = /* @__PURE__ */ __name(async (spid) => {
    const m = await env.PLATFORM_DB.prepare(
      "SELECT spid, business_name, email, trust_level, status FROM bpr_memberships WHERE spid = ?"
    ).bind(spid).first();
    return m ? { spid: m.spid, name: m.business_name, trust_level: m.trust_level, status: m.status } : { spid };
  }, "memberOf");
  return {
    slot: { id: slot.id, title: slot.title, slot_type: slot.slot_type, specialty: slot.specialty, state: slot.state },
    org: await memberOf(String(slot.org_spid)),
    holder: slot.holder_spid ? await memberOf(String(slot.holder_spid)) : null,
    parent: slot.parent_slot ? await env.PLATFORM_DB.prepare("SELECT id, title, state FROM bpr_slots WHERE id = ?").bind(slot.parent_slot).first() : null,
    delegations,
    verify_qr: `https://verify.brainsait.org/chain/${slotId}`
  };
}
__name(getSlotChain, "getSlotChain");
async function handleSlotPaid(requestId, order, env) {
  const req = await env.PLATFORM_DB.prepare("SELECT * FROM bpr_slot_requests WHERE id = ?").bind(requestId).first();
  if (!req) return { error: "request not found", request_id: requestId };
  if (req.state === "provisioned") return { skipped: true, reason: "already provisioned" };
  if (req.state !== "invoiced") return { error: `request is ${req.state}, expected invoiced` };
  const slot = await env.PLATFORM_DB.prepare("SELECT * FROM bpr_slots WHERE id = ?").bind(String(req.slot_id)).first();
  if (!slot) return { error: "slot not found" };
  const requester = await env.PLATFORM_DB.prepare("SELECT spid, status, trust_level FROM bpr_memberships WHERE spid = ?").bind(String(req.requester_spid)).first();
  const lvl = /* @__PURE__ */ __name((t) => parseInt(String(t || "").split("-H")[1] || "0", 10), "lvl");
  const reqs = slot.requirements_json ? JSON.parse(String(slot.requirements_json)) : {};
  const checks = {
    requester_active: requester?.status === "active",
    trust_ok: !reqs.min_trust_level || lvl(requester?.trust_level) >= lvl(reqs.min_trust_level)
  };
  const passed = Object.values(checks).every(Boolean);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (!passed) {
    await env.PLATFORM_DB.prepare(`UPDATE bpr_slot_requests SET state = 'verifying', order_id = ? WHERE id = ?`).bind(String(order.id), requestId).run();
    await env.PLATFORM_DB.prepare(`UPDATE bpr_slots SET state = 'verifying', updated_at = ? WHERE id = ?`).bind(now, String(slot.id)).run();
    return { request_id: requestId, state: "verifying", failed_checks: checks };
  }
  await env.PLATFORM_DB.prepare(
    `UPDATE bpr_slot_requests SET state = 'provisioned', order_id = ?, resolved_at = ? WHERE id = ?`
  ).bind(String(order.id), now, requestId).run();
  await env.PLATFORM_DB.prepare(
    `UPDATE bpr_slots SET state = 'live', holder_spid = ?, updated_at = ? WHERE id = ?`
  ).bind(String(req.requester_spid), now, String(slot.id)).run();
  return { request_id: requestId, state: "provisioned", slot: slot.id, slot_state: "live", holder: req.requester_spid };
}
__name(handleSlotPaid, "handleSlotPaid");
var PROVISION_STEPS = ["identity", "profile", "storefront", "commerce", "erp"];
async function provisionStepDone(spid, step, env) {
  const row = await env.PLATFORM_DB.prepare(
    "SELECT status FROM bpr_provisioning_log WHERE spid = ? AND step = ?"
  ).bind(spid, step).first();
  return row?.status === "done";
}
__name(provisionStepDone, "provisionStepDone");
async function markProvisionStep(spid, step, status, detail, env) {
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_provisioning_log (spid, step, status, detail_json, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(spid, step) DO UPDATE SET status = excluded.status, detail_json = excluded.detail_json, created_at = excluded.created_at`
  ).bind(spid, step, status, detail ? JSON.stringify(detail) : null, (/* @__PURE__ */ new Date()).toISOString()).run();
}
__name(markProvisionStep, "markProvisionStep");
async function provisionIdentity(spid, env) {
  await markProvisionStep(spid, "identity", "done", {
    spid,
    passport: `https://registry.brainsait.org/verify/${spid}`,
    canonical: `https://id.brainsait.org/${spid}`,
    did: `did:web:id.brainsait.org:providers:${spid}`
  }, env);
}
__name(provisionIdentity, "provisionIdentity");
async function provisionProfile(spid, env) {
  await markProvisionStep(spid, "profile", "done", {
    profile: `https://registry.brainsait.org/p/${spid}`
  }, env);
}
__name(provisionProfile, "provisionProfile");
async function provisionStorefront(spid, env) {
  await markProvisionStep(spid, "storefront", "done", {
    page: `https://fadil369.github.io/doctors/${spid}`
  }, env);
}
__name(provisionStorefront, "provisionStorefront");
async function provisionCommerce(spid, env) {
  if (!env.SHOPIFY_ADMIN_TOKEN) throw new Error("SHOPIFY_ADMIN_TOKEN not set");
  const member = await env.PLATFORM_DB.prepare("SELECT spid, business_name FROM bpr_memberships WHERE spid = ?").bind(spid).first();
  if (!member) throw new Error(`member ${spid} not found`);
  const handle = `consult-${spid.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const query = `
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product { id handle status }
        userErrors { field message }
      }
    }`;
  const body = {
    query,
    variables: {
      input: {
        title: `${member.business_name} \u2014 Consultation (SPID ${spid})`,
        handle,
        productType: "CONSULT",
        status: "DRAFT",
        descriptionHtml: `Doctor-owned consultation product for SPID ${spid}. Bookings attributed via note_attributes[spid].`
      }
    }
  };
  const resp = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN || "f3rbxp-n1.myshopify.com"}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_TOKEN
    },
    body: JSON.stringify(body)
  });
  const json = await resp.json();
  const errs = json?.data?.productCreate?.userErrors || json?.errors || [];
  if (!resp.ok || errs.length) {
    throw new Error(`Shopify productCreate failed: ${JSON.stringify(errs)}`);
  }
  const product = json.data.productCreate.product;
  if (!product?.id) throw new Error("Shopify productCreate returned no product");
  const varQuery = `
    mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkCreate(productId: $productId, variants: $variants) {
        product { handle }
        productVariants { id sku title price }
        userErrors { field message }
      }
    }`;
  const varBody = {
    query: varQuery,
    variables: {
      productId: product.id,
      variants: [{
        compareAtPrice: "149.00",
        price: "99.00",
        optionValues: [{ optionName: "Title", name: "Per consultation" }],
        inventoryItem: { sku: `CONSULT-${spid}-1` }
      }]
    }
  };
  const varResp = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN || "f3rbxp-n1.myshopify.com"}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_TOKEN
    },
    body: JSON.stringify(varBody)
  });
  const varJson = await varResp.json();
  const varErrs = varJson?.data?.productVariantsBulkCreate?.userErrors || varJson?.errors || [];
  if (!varResp.ok || varErrs.length) {
    throw new Error(`Shopify productVariantsBulkCreate failed: ${JSON.stringify(varErrs)}`);
  }
  const variant = varJson.data.productVariantsBulkCreate.productVariants?.[0];
  await markProvisionStep(spid, "commerce", "done", {
    product_id: product.id,
    handle: product.handle,
    url: `https://store.brainsait.de/products/${product.handle}`,
    variant_id: variant?.id || null,
    sku: variant?.sku || null,
    price_sar: 99
  }, env);
}
__name(provisionCommerce, "provisionCommerce");
async function provisionERP(spid, env) {
  if (!env.DAFTRA_API_KEY) throw new Error("DAFTRA_API_KEY not set");
  const base = env.DAFTRA_BASE_URL || "https://brainsait.daftra.com";
  const member = await env.PLATFORM_DB.prepare(
    "SELECT spid, business_name, email, first_name, last_name, phone FROM bpr_memberships WHERE spid = ?"
  ).bind(spid).first();
  if (!member) throw new Error(`member ${spid} not found`);
  const name = member.business_name || `${member.first_name || ""} ${member.last_name || ""}`.trim() || spid;
  const supResp = await fetch(`${base}/api2/suppliers.json`, {
    method: "POST",
    headers: { "apikey": env.DAFTRA_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ Supplier: { business_name: name, email: member.email || "", code: spid } })
  });
  const supJson = await supResp.json();
  const cliResp = await fetch(`${base}/api2/clients.json`, {
    method: "POST",
    headers: { "apikey": env.DAFTRA_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ Client: { business_name: name, email: member.email || "", phone_number: member.phone || "", client_number: spid } })
  });
  const cliJson = await cliResp.json();
  const ok = /* @__PURE__ */ __name((j) => j?.result === "successful", "ok");
  if (!ok(supJson) && !ok(cliJson)) {
    throw new Error(`Daftra provisioning failed: supplier=${supJson?.result || supJson?.message} client=${cliJson?.result || cliJson?.message}`);
  }
  await markProvisionStep(spid, "erp", "done", {
    supplier: ok(supJson) ? { id: supJson.id ?? supJson.data?.id, result: supJson.result } : null,
    client: ok(cliJson) ? { id: cliJson.id ?? cliJson.data?.id, result: cliJson.result } : null
  }, env);
}
__name(provisionERP, "provisionERP");
async function runProvisionStep(spid, step, env) {
  if (await provisionStepDone(spid, step, env)) return { step, status: "done", reused: true };
  try {
    switch (step) {
      case "identity":
        await provisionIdentity(spid, env);
        break;
      case "profile":
        await provisionProfile(spid, env);
        break;
      case "storefront":
        await provisionStorefront(spid, env);
        break;
      case "commerce":
        await provisionCommerce(spid, env);
        break;
      case "erp":
        await provisionERP(spid, env);
        break;
    }
    return { step, status: "done" };
  } catch (e) {
    await markProvisionStep(spid, step, "failed", { error: String(e?.message || e) }, env);
    throw e;
  }
}
__name(runProvisionStep, "runProvisionStep");
async function provisionDoctor(spid, data, env) {
  const member = await env.PLATFORM_DB.prepare("SELECT spid FROM bpr_memberships WHERE spid = ?").bind(spid).first();
  if (!member) return { error: `member ${spid} not found` };
  const steps = Array.isArray(data?.steps) && data.steps.length ? data.steps.filter((s) => PROVISION_STEPS.includes(s)) : PROVISION_STEPS;
  const out = [];
  for (const step of steps) {
    try {
      out.push(await runProvisionStep(spid, step, env));
    } catch (e) {
      out.push({ step, status: "failed", error: String(e?.message || e) });
    }
  }
  return { spid, steps: out };
}
__name(provisionDoctor, "provisionDoctor");
async function provisioningStatus(spid, env) {
  const rows = await env.PLATFORM_DB.prepare(
    "SELECT step, status, detail_json, created_at FROM bpr_provisioning_log WHERE spid = ? ORDER BY created_at"
  ).bind(spid).all();
  if (!rows.results.length) return { error: "no provisioning record for this spid" };
  const parse = /* @__PURE__ */ __name((v) => {
    try {
      return JSON.parse(String(v));
    } catch {
      return null;
    }
  }, "parse");
  return {
    spid,
    steps: rows.results.map((r) => ({ step: r.step, status: r.status, detail: parse(r.detail_json), at: r.created_at })),
    complete: rows.results.every((r) => r.status === "done")
  };
}
__name(provisioningStatus, "provisioningStatus");
function ledgerId() {
  return `L-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
__name(ledgerId, "ledgerId");
async function getLedger(spid, env) {
  const member = await env.PLATFORM_DB.prepare("SELECT spid FROM bpr_memberships WHERE spid = ?").bind(spid).first();
  if (!member) return { error: "member not found" };
  const rows = await env.PLATFORM_DB.prepare(
    "SELECT * FROM bpr_ledger WHERE spid = ? ORDER BY created_at DESC LIMIT 200"
  ).bind(spid).all();
  const balance = rows.results.reduce(
    (acc, r) => acc + (r.direction === "credit" ? r.amount_sar : -r.amount_sar),
    0
  );
  return { spid, balance_sar: balance, entries: rows.results };
}
__name(getLedger, "getLedger");
async function appendLedger(data, env) {
  const { spid, direction, amount_sar, ref } = data || {};
  if (!spid || !direction || typeof amount_sar !== "number") return { error: "need spid, direction (credit|debit|payout), amount_sar" };
  if (!["credit", "debit", "payout"].includes(direction)) return { error: "direction must be credit|debit|payout" };
  if (!Number.isInteger(amount_sar) || amount_sar < 0) return { error: "amount_sar must be a non-negative integer" };
  const member = await env.PLATFORM_DB.prepare("SELECT spid FROM bpr_memberships WHERE spid = ?").bind(spid).first();
  if (!member) return { error: "member not found" };
  const id = ledgerId();
  await env.PLATFORM_DB.prepare(
    "INSERT INTO bpr_ledger (id, spid, direction, amount_sar, ref, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, spid, direction, amount_sar, ref || null, (/* @__PURE__ */ new Date()).toISOString()).run();
  const { balance_sar } = await getLedger(spid, env);
  return { id, spid, direction, amount_sar, balance_sar };
}
__name(appendLedger, "appendLedger");
async function partnerAggregate(spid, env) {
  const member = await env.PLATFORM_DB.prepare(
    `SELECT spid, email, business_name, first_name, last_name, phone, country_code, order_id,
            plan_type, status, trust_level, created_at, expires_at
     FROM bpr_memberships WHERE spid = ?`
  ).bind(spid).first();
  if (!member) return { error: "member not found" };
  const slotsHeld = (await env.PLATFORM_DB.prepare(
    "SELECT id, slot_type, specialty, title, state, created_at FROM bpr_slots WHERE holder_spid = ?"
  ).bind(spid).all()).results;
  const slotsPublished = (await env.PLATFORM_DB.prepare(
    "SELECT id, slot_type, specialty, title, state, created_at FROM bpr_slots WHERE org_spid = ?"
  ).bind(spid).all()).results;
  const delegations = (await env.PLATFORM_DB.prepare(
    `SELECT d.id, d.from_spid, d.to_spid, d.slot_id, d.state, d.created_at
     FROM bpr_delegations d WHERE d.from_spid = ? OR d.to_spid = ? ORDER BY d.created_at DESC LIMIT 100`
  ).bind(spid, spid).all()).results;
  const ledger = await getLedger(spid, env);
  const provisioning = await provisioningStatus(spid, env);
  const network = await env.PLATFORM_DB.prepare(
    "SELECT * FROM bpr_network_trust WHERE spid = ?"
  ).bind(spid).first();
  return {
    spid,
    member,
    canonical: `https://id.brainsait.org/${spid}`,
    profile: `https://registry.brainsait.org/p/${spid}`,
    storefront: `https://fadil369.github.io/doctors/${spid}`,
    slots_held: slotsHeld,
    slots_published: slotsPublished,
    delegations,
    ledger: { balance_sar: ledger.balance_sar },
    provisioning: provisioning.error ? [] : provisioning.steps,
    network: network ? {
      ix_name: network.ix_name,
      ix_asn: network.ix_asn,
      peering_type: network.peering_type,
      facility: network.facility,
      uptime_sla: network.uptime_sla,
      verified: !!network.verified,
      peer_count: network.peer_count || 0,
      bandwidth_gbps: network.bandwidth_gbps || 0,
      ipv6_enabled: !!network.ipv6_enabled
    } : null
  };
}
__name(partnerAggregate, "partnerAggregate");
async function verifyProvider(spid, env) {
  const member = await env.PLATFORM_DB.prepare(
    "SELECT * FROM bpr_memberships WHERE spid = ? AND status = ?"
  ).bind(spid, "active").first();
  if (member) {
    return {
      verified: true,
      spid: member.spid,
      name: member.business_name,
      status: member.status,
      trust_level: member.trust_level || "BIAL-H2",
      verified_at: member.created_at
    };
  }
  try {
    const resp = await fetch(`https://oid-line.brainsait-fadil.workers.dev/v1/verify/${spid}`);
    return await resp.json();
  } catch {
    return { verified: false, error: "Provider not found" };
  }
}
__name(verifyProvider, "verifyProvider");
async function listMembers(env) {
  const members = await env.PLATFORM_DB.prepare(
    `SELECT spid, business_name, email, status, trust_level, created_at FROM bpr_memberships
     WHERE status != 'archived' ORDER BY created_at DESC LIMIT 100`
  ).all();
  return {
    total: members.results.length,
    members: members.results
  };
}
__name(listMembers, "listMembers");
async function getMember(spid, env) {
  const member = await env.PLATFORM_DB.prepare(
    "SELECT * FROM bpr_memberships WHERE spid = ?"
  ).bind(spid).first();
  if (!member) {
    return { error: "Member not found" };
  }
  return { member };
}
__name(getMember, "getMember");
async function offboardMember(spid, env) {
  const member = await env.PLATFORM_DB.prepare(
    "SELECT spid, status FROM bpr_memberships WHERE spid = ?"
  ).bind(spid).first();
  if (!member) {
    return { error: "Member not found" };
  }
  await env.PLATFORM_DB.prepare(
    `UPDATE bpr_memberships SET status = 'archived' WHERE spid = ?`
  ).bind(spid).run();
  return { spid, status: "archived", note: "Archived per spec \xA78.4 (never deleted)" };
}
__name(offboardMember, "offboardMember");
var OID_ROOT = "1.3.6.1.4.1.61026";
var OID_ARCS = {
  provider_registry: 20,
  // Healthcare provider registry and verification
  verification_badge: 21,
  // Provider verification badge and trust credential
  network_trust: 22,
  // Provider network trust and Internet exchange peering
  slot_marketplace: 23
  // Medical provider slot marketplace and scheduling
};
function oidForMember(spid, arc) {
  const leaf = spid.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${OID_ROOT}.${arc}.${leaf}`;
}
__name(oidForMember, "oidForMember");
async function registerQuick(data, env) {
  const email = String(data.email || "").trim();
  const name = String(data.name || "").trim();
  if (!email || !name) return { error: "email and name required" };
  const nameParts = name.split(/\s+/).filter(Boolean);
  const spid = await mintId("provider", "SA-PHY", env);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_memberships (spid, email, business_name, first_name, last_name, status, trust_level, created_at)
     VALUES (?, ?, ?, ?, ?, 'active', 'BIAL-H2', ?)`
  ).bind(
    spid,
    email,
    name,
    nameParts[0] || "",
    nameParts.slice(1).join(" ") || "",
    now
  ).run();
  const oid = oidForMember(spid, OID_ARCS.provider_registry);
  return { spid, status: "active", registered_at: now, oid };
}
__name(registerQuick, "registerQuick");
async function registerMember(data, env) {
  const { email, business_name, first_name, last_name, phone, country_code } = data;
  const nameParts = first_name || last_name ? [] : String(data.name || "").trim().split(/\s+/).filter(Boolean);
  const effFirst = first_name || nameParts[0] || "";
  const effLast = last_name || nameParts.slice(1).join(" ") || "";
  const spid = await mintId("provider", "SA-PHY", env);
  await env.PLATFORM_DB.prepare(`
    INSERT INTO bpr_memberships (spid, email, business_name, first_name, last_name, phone, country_code, status, trust_level, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    spid,
    email,
    business_name || `${effFirst} ${effLast}`.trim(),
    effFirst,
    effLast,
    phone || "",
    country_code || "SA",
    "active",
    "BIAL-H2",
    (/* @__PURE__ */ new Date()).toISOString()
  ).run();
  if (env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "BrainSAIT <registry@brainsait.org>",
        to: [email],
        subject: `\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A BPR \u2014 ${spid} | Welcome to BPR`,
        html: `
          <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 2rem;">
            <h1 style="color: #10b981;">\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A BrainSAIT Provider Registry</h1>
            <p>\u062A\u0645 \u062A\u0633\u062C\u064A\u0644\u0643 \u0628\u0646\u062C\u0627\u062D. \u0645\u0639\u0631\u0641\u0643:</p>
            <p style="font-size: 1.5rem; color: #10b981; font-family: monospace;">${spid}</p>
            <a href="https://registry.brainsait.org/verify/${spid}" style="display: inline-block; background: #10b981; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; margin-top: 1rem;">\u0639\u0631\u0636 \u0645\u0644\u0641\u0643</a>
          </div>
        `
      })
    });
  }
  return { spid, status: "active", message: "Registration successful" };
}
__name(registerMember, "registerMember");
async function handleBPROrderPaid(order, env) {
  const customer = order.customer || {};
  const lineItems = order.line_items || [];
  const skus = lineItems.map((li) => li.sku || "");
  const noteRef = (order.note_attributes || []).find((a) => a.name === "request_id");
  const propRef = lineItems.flatMap((li) => li.properties || []).find((p) => p.name === "request_id");
  const requestId = noteRef?.value || propRef?.value;
  if (requestId) {
    return await handleSlotPaid(String(requestId), order, env);
  }
  const isBPR = skus.some((s) => s.includes("BPR"));
  if (!isBPR) {
    return { skipped: true, reason: "Not a BPR product" };
  }
  const isAnnual = skus.some((s) => s.includes("ANNUAL"));
  const isMonthly = skus.some((s) => s.includes("MONTHLY"));
  const spid = await mintId("provider", "SA-PHY", env);
  await env.PLATFORM_DB.prepare(`
    INSERT INTO bpr_memberships (spid, email, business_name, first_name, last_name, order_id, plan_type, status, trust_level, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    spid,
    customer.email,
    `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
    customer.first_name,
    customer.last_name,
    order.id,
    isAnnual ? "annual" : "monthly",
    "active",
    "BIAL-H2",
    (/* @__PURE__ */ new Date()).toISOString(),
    new Date(Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1e3).toISOString()
  ).run();
  return { spid, status: "active", plan: isAnnual ? "annual" : "monthly" };
}
__name(handleBPROrderPaid, "handleBPROrderPaid");
async function handleMCP(request, env) {
  const body = await request.json();
  if (body.method === "tools/list") {
    return jsonResponse({
      jsonrpc: "2.0",
      id: body.id,
      result: {
        tools: [
          {
            name: "verify_provider",
            description: "Verify a healthcare provider by SPID in the BrainSAIT Provider Registry",
            inputSchema: {
              type: "object",
              properties: { spid: { type: "string", description: "Provider SPID (e.g., SA-PHY-000001)" } },
              required: ["spid"]
            }
          },
          {
            name: "list_providers",
            description: "List registered healthcare providers",
            inputSchema: {
              type: "object",
              properties: { limit: { type: "number", default: 10 } }
            }
          },
          {
            name: "register_provider",
            description: "Register a new healthcare provider (admin-gated: requires X-Admin-Token)",
            inputSchema: {
              type: "object",
              properties: {
                email: { type: "string" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                business_name: { type: "string" }
              },
              required: ["email", "first_name", "last_name"]
            }
          },
          {
            name: "search_slots",
            description: "Search live vacancy slots in the marketplace (state/specialty/city/type filters)",
            inputSchema: {
              type: "object",
              properties: {
                state: { type: "string", description: "empty | live | requested | invoiced | verifying" },
                specialty: { type: "string" },
                city: { type: "string" },
                type: { type: "string", description: "doctor | nurse | ai_agent" }
              }
            }
          },
          {
            name: "get_slot",
            description: "Get a single slot by ID with parsed manifest/requirements",
            inputSchema: {
              type: "object",
              properties: { slot_id: { type: "string", description: "slot ID (SA-SLT-000001)" } },
              required: ["slot_id"]
            }
          },
          {
            name: "get_slot_chain",
            description: "Full trust chain for a slot: org \u2192 slot \u2192 holder \u2192 delegations (feeds the QR verify page)",
            inputSchema: {
              type: "object",
              properties: { slot_id: { type: "string", description: "slot ID (SA-SLT-000001)" } },
              required: ["slot_id"]
            }
          },
          {
            name: "request_slot",
            description: "Request a vacancy slot with your SPID (rate-limited)",
            inputSchema: {
              type: "object",
              properties: {
                slot_id: { type: "string" },
                requester_spid: { type: "string" },
                message: { type: "string" }
              },
              required: ["slot_id", "requester_spid"]
            }
          }
        ]
      }
    }, 200);
  }
  if (body.method === "tools/call") {
    const tool = body.params?.name;
    const args = body.params?.arguments || {};
    let result;
    switch (tool) {
      case "verify_provider":
        result = await verifyProvider(args.spid, env);
        break;
      case "list_providers":
        result = await listMembers(env);
        break;
      case "register_provider":
        if (!isAdmin(request, env)) {
          return jsonResponse({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32001, message: "register_provider requires X-Admin-Token" }
          }, 401);
        }
        result = await registerMember(args, env);
        break;
      case "search_slots": {
        const u = new URL("https://registry.brainsait.org/slots");
        for (const k of ["state", "specialty", "city", "type"]) if (args[k]) u.searchParams.set(k, String(args[k]));
        result = await listSlots(u, env);
        break;
      }
      case "get_slot": {
        result = (await getSlot(String(args.slot_id), env)).slot ?? { error: "slot not found" };
        break;
      }
      case "get_slot_chain": {
        result = await getSlotChain(String(args.slot_id), env);
        break;
      }
      case "request_slot": {
        result = await createSlotRequest(String(args.slot_id), { spid: args.requester_spid, message: args.message }, env);
        break;
      }
      default:
        return jsonResponse({
          jsonrpc: "2.0",
          id: body.id,
          error: { code: -32601, message: `Unknown tool: ${tool}` }
        }, 200);
    }
    return jsonResponse({
      jsonrpc: "2.0",
      id: body.id,
      result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }
    }, 200);
  }
  return jsonResponse({ error: "Invalid MCP request" }, 400);
}
__name(handleMCP, "handleMCP");
async function getProfile(spid, env) {
  const member = await env.PLATFORM_DB.prepare(
    "SELECT spid, business_name, email, status, trust_level, created_at FROM bpr_memberships WHERE spid = ?"
  ).bind(spid).first();
  if (!member) return { error: "Provider not found" };
  const p = await env.PLATFORM_DB.prepare("SELECT * FROM bpr_profiles WHERE spid = ?").bind(spid).first();
  const parse = /* @__PURE__ */ __name((v) => {
    try {
      return v ? JSON.parse(String(v)) : null;
    } catch {
      return null;
    }
  }, "parse");
  return {
    spid: member.spid,
    name: member.business_name,
    status: member.status,
    trust_level: member.trust_level,
    headline: p?.headline || null,
    bio: p?.bio || null,
    services: parse(p?.services_json),
    modes: parse(p?.modes_json),
    locations: parse(p?.locations_json),
    availability: parse(p?.availability_json),
    team: parse(p?.team_json),
    pricing: parse(p?.pricing_json),
    slots_held: (await env.PLATFORM_DB.prepare(
      `SELECT id, title, state FROM bpr_slots WHERE holder_spid = ?`
    ).bind(spid).all()).results
  };
}
__name(getProfile, "getProfile");
async function upsertProfile(data, env) {
  const spid = String(data?.spid || "");
  if (!spid) return { error: "missing spid" };
  const member = await env.PLATFORM_DB.prepare("SELECT spid FROM bpr_memberships WHERE spid = ?").bind(spid).first();
  if (!member) return { error: `member ${spid} not found \u2014 register first` };
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const j = /* @__PURE__ */ __name((v) => v == null ? null : JSON.stringify(v), "j");
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_profiles (spid, headline, bio, services_json, modes_json, locations_json, availability_json, team_json, pricing_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(spid) DO UPDATE SET headline=excluded.headline, bio=excluded.bio,
       services_json=excluded.services_json, modes_json=excluded.modes_json,
       locations_json=excluded.locations_json, availability_json=excluded.availability_json,
       team_json=excluded.team_json, pricing_json=excluded.pricing_json, updated_at=excluded.updated_at`
  ).bind(spid, data.headline || null, data.bio || null, j(data.services), j(data.modes), j(data.locations), j(data.availability), j(data.team), j(data.pricing), now).run();
  return { spid, profile: "saved", url: `https://registry.brainsait.org/p/${spid}` };
}
__name(upsertProfile, "upsertProfile");
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
__name(esc, "esc");
function renderOidLanding(corsHeaders) {
  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BrainSAIT OID Registry \u2014 1.3.6.1.4.1.61026</title>
<style>
  :root { --g: #10b981; --bg: #0b1220; --card: #111a2e; --txt: #e5e7eb; --dim: #8b98b8; }
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--bg); color: var(--txt); font-family: system-ui, 'IBM Plex Sans Arabic', sans-serif; line-height: 1.6; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 2rem 1rem 4rem; }
  header { text-align: center; padding: 2.5rem 0 2rem; }
  .badge { display: inline-block; background: var(--g); color: #04220f; font-weight: 700; font-size: .75rem; padding: .25rem .8rem; border-radius: 999px; letter-spacing: .05em; }
  h1 { font-size: 1.9rem; margin: .8rem 0 .2rem; }
  .headline { color: var(--g); font-size: 1.05rem; }
  .oid { font-family: ui-monospace, monospace; color: var(--dim); font-size: .9rem; margin-top: .5rem; }
  .card { background: var(--card); border: 1px solid #1f2b47; border-radius: 14px; padding: 1.3rem 1.5rem; margin-top: 1.1rem; }
  h2 { font-size: .95rem; text-transform: uppercase; letter-spacing: .08em; margin-bottom: .7rem; }
  a { color: var(--g); }
  ul { padding-left: 1.2rem; } li { margin: .25rem 0; }
  .dim { color: var(--dim); }
</style></head><body><div class="wrap">
  <header>
    <span class="badge">BRAINSAIT REGISTRY</span>
    <h1>BrainSAIT OID Registry</h1>
    <div class="headline">Saudi healthcare provider &amp; object identifier registry</div>
    <div class="oid">Root OID: 1.3.6.1.4.1.61026</div>
  </header>
  <section class="card">
    <h2>Registry endpoints</h2>
    <ul>
      <li><a href="/oid/leaves">/oid/leaves</a> <span class="dim">\u2014 allocated OID arcs (JSON)</span></li>
      <li>/oid/verify/{spid} <span class="dim">\u2014 verify an OID assignment (JSON)</span></li>
      <li>/p/{spid} <span class="dim">\u2014 provider profile page (HTML)</span></li>
      <li><a href="/members">/members</a> <span class="dim">\u2014 registry members (JSON)</span></li>
      <li><a href="/health">/health</a> <span class="dim">\u2014 service health</span></li>
    </ul>
  </section>
  <p class="dim" style="text-align:center;margin-top:1.5rem;font-size:.85rem">BrainSAIT \u00B7 registry.brainsait.org</p>
</div></body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } });
}
__name(renderOidLanding, "renderOidLanding");
async function renderProfilePage(spid, env, corsHeaders) {
  const d = await getProfile(spid, env);
  if (d.error) return new Response("Not found", { status: 404, headers: corsHeaders });
  const section = /* @__PURE__ */ __name((icon, en, ar, inner) => `
    <section class="card">
      <h2><span class="ic">${icon}</span> ${en} <span class="ar">${ar}</span></h2>
      ${inner}
    </section>`, "section");
  const li = /* @__PURE__ */ __name((arr, render) => arr?.length ? `<ul>${arr.map((x) => `<li>${render(x)}</li>`).join("")}</ul>` : '<p class="dim">\u2014</p>', "li");
  const what = li(d.services || [], (s) => esc(s));
  const how = li(d.modes || [], (m) => esc(String(m).replace(/_/g, " ")));
  const where = li(d.locations || [], (l) => esc(`${l.org || ""}${l.branch ? " \u2014 " + l.branch : ""}${l.city ? " \xB7 " + l.city : ""}`));
  const when = d.availability ? `<ul>${Object.entries(d.availability).map(([k, v]) => `<li><b>${esc(k)}:</b> ${esc(Array.isArray(v) ? v.join(", ") : v)}</li>`).join("")}</ul>` : '<p class="dim">\u2014</p>';
  const who = li(d.team || [], (t) => {
    if (typeof t === "string") return esc(t);
    return esc(`${t.count ? t.count + "\xD7 " : ""}${t.role ?? ""}${t.source ? " (" + t.source + ")" : ""}`);
  });
  const pricing = d.pricing ? `<table class="price">${Object.entries(d.pricing).map(([k, v]) => `<tr><td>${esc(k.replace(/_/g, " "))}</td><td class="num">${typeof v === "number" ? esc(v.toLocaleString()) + " SAR" : esc(v)}</td></tr>`).join("")}</table>` : '<p class="dim">\u2014</p>';
  const slots = li(d.slots_held || [], (s) => `${esc(s.title)} <span class="pill">${esc(s.state)}</span>`);
  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.name)} \u2014 BrainSAIT Provider</title>
<style>
  :root { --g: #10b981; --bg: #0b1220; --card: #111a2e; --txt: #e5e7eb; --dim: #8b98b8; }
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--bg); color: var(--txt); font-family: system-ui, 'IBM Plex Sans Arabic', sans-serif; line-height: 1.6; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 2rem 1rem 4rem; }
  header { text-align: center; padding: 2.5rem 0 2rem; }
  .badge { display: inline-block; background: var(--g); color: #04220f; font-weight: 700; font-size: .75rem; padding: .25rem .8rem; border-radius: 999px; letter-spacing: .05em; }
  h1 { font-size: 1.9rem; margin: .8rem 0 .2rem; }
  .headline { color: var(--g); font-size: 1.05rem; }
  .spid { font-family: ui-monospace, monospace; color: var(--dim); font-size: .85rem; margin-top: .5rem; }
  .bio { color: var(--dim); max-width: 560px; margin: 1rem auto 0; }
  .card { background: var(--card); border: 1px solid #1f2b47; border-radius: 14px; padding: 1.3rem 1.5rem; margin-top: 1.1rem; }
  h2 { font-size: .95rem; text-transform: uppercase; letter-spacing: .08em; color: var(--txt); margin-bottom: .7rem; }
  h2 .ic { margin-right: .4rem; } h2 .ar { float: right; color: var(--dim); font-weight: 400; }
  ul { padding-left: 1.2rem; } li { margin: .25rem 0; }
  .dim { color: var(--dim); }
  .pill { background: #1f2b47; border-radius: 999px; font-size: .7rem; padding: .1rem .6rem; color: var(--g); }
  .price { width: 100%; border-collapse: collapse; } .price td { padding: .35rem 0; border-bottom: 1px solid #1f2b47; }
  .price .num { text-align: right; font-weight: 700; color: var(--g); }
  .cta { display: block; text-align: center; background: var(--g); color: #04220f; font-weight: 700; padding: .9rem; border-radius: 12px; text-decoration: none; margin-top: 1.5rem; }
  .verify { display: block; text-align: center; color: var(--dim); font-size: .8rem; margin-top: 1rem; }
</style></head><body><div class="wrap">
  <header>
    <span class="badge">\u2713 VERIFIED \xB7 ${esc(d.trust_level)}</span>
    <h1>${esc(d.name)}</h1>
    <div class="headline">${esc(d.headline || "Healthcare Provider")}</div>
    <div class="spid">${esc(d.spid)}</div>
    ${d.bio ? `<p class="bio">${esc(d.bio)}</p>` : ""}
  </header>
  ${section("\u{1FA7A}", "What I provide", "\u0645\u0627\u0630\u0627 \u0623\u0642\u062F\u0645", what)}
  ${section("\u2699\uFE0F", "How I provide it", "\u0643\u064A\u0641", how)}
  ${section("\u{1F4CD}", "Where", "\u0623\u064A\u0646", where)}
  ${section("\u{1F550}", "When", "\u0645\u062A\u0649", when)}
  ${section("\u{1F91D}", "Who assists", "\u0641\u0631\u064A\u0642 \u0627\u0644\u0639\u0645\u0644", who)}
  ${section("\u{1F4B0}", "Engagement pricing for hospital admins", "\u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0644\u0644\u0645\u0633\u062A\u0634\u0641\u064A\u0627\u062A", pricing)}
  ${d.slots_held?.length ? section("\u{1F5C2}", "Active slots", "\u0627\u0644\u0639\u0642\u0648\u062F \u0627\u0644\u0646\u0634\u0637\u0629", slots) : ""}
  <a class="cta" href="mailto:${esc(d.spid)}@providers.brainsait.org?subject=Slot%20request%20for%20${encodeURIComponent(spid)}">Request this operator \xB7 \u0627\u0637\u0644\u0628 \u0647\u0630\u0627 \u0627\u0644\u0645\u0632\u0648\u062F</a>
  <a class="verify" href="/verify/${esc(spid)}">Verify this profile (JSON) \xB7 \u0627\u0644\u062A\u062D\u0642\u0642</a>
</div></body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } });
}
__name(renderProfilePage, "renderProfilePage");
function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}
__name(jsonResponse, "jsonResponse");
async function verifyOidArc(arc) {
  try {
    const res = await fetch(`https://oid-base.com/get-md/${OID_ROOT}.${arc}`, {
      headers: { "User-Agent": "brainsait-bpr-registry/1.0 (+https://registry.brainsait.org)" }
    });
    if (!res.ok) return false;
    const text = await res.text();
    const re = new RegExp(`^\\s*oid:\\s*"1\\.3\\.6\\.1\\.4\\.1\\.61026\\.${arc}"\\s*$`, "m");
    return re.test(text);
  } catch (e) {
    return false;
  }
}
__name(verifyOidArc, "verifyOidArc");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
