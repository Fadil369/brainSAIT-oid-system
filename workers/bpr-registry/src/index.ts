// BPR Registry — Shopify ↔ BrainSAIT Provider Registry integration

export interface Env {
  PLATFORM_DB: D1Database;
  HIS_DB: D1Database;
  SESSION_KV: KVNamespace;
  SHOPIFY_ADMIN_TOKEN: string;
  SHOPIFY_STORE_DOMAIN: string;
  RESEND_API_KEY: string;
  WEBHOOK_SECRET: string;
  ADMIN_TOKEN: string;
  DAFTRA_API_KEY: string;
  DAFTRA_BASE_URL: string;
  PASSPORT: Fetcher;
}

// ─── Main Handler ───────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Secret, X-Admin-Token',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health
    if (url.pathname === '/health') {
      return jsonResponse({ status: 'healthy', service: 'bpr-registry' }, 200, corsHeaders);
    }

    // Root → OID registry front door (flagship landing)
    if (url.pathname === '/') {
      return new Response(null, { status: 302, headers: { Location: '/oid', ...corsHeaders } });
    }

    // OID Registry browser (HTML) — validated namespace tree
    if (url.pathname === '/oid' && (request.method === 'GET' || request.method === 'HEAD')) {
      return new Response(renderOidLanding(), {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60', ...corsHeaders },
      });
    }

    // Verify provider
    if (url.pathname.startsWith('/verify/') && request.method === 'GET') {
      const spid = url.pathname.split('/')[2];
      const result = await verifyProvider(spid, env);
      return jsonResponse(result, 200, corsHeaders);
    }

    // List members
    if (url.pathname === '/members' && request.method === 'GET') {
      const result = await listMembers(env);
      return jsonResponse(result, 200, corsHeaders);
    }

    // Get member by SPID
    if (url.pathname.startsWith('/members/') && url.pathname !== '/members' && request.method === 'GET') {
      const spid = url.pathname.split('/')[2];
      const result = await getMember(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }

    // Offboard member (admin-gated): archive, never delete (spec §8.4)
    if (url.pathname.startsWith('/members/') && url.pathname.endsWith('/offboard') && request.method === 'POST') {
      if (!isAdmin(request, env)) {
        return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      }
      const spid = url.pathname.split('/')[2];
      const result = await offboardMember(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }

    // Register new member (admin-gated: open minting was defect #1)
    if (url.pathname === '/register' && request.method === 'POST') {
      if (!isAdmin(request, env)) {
        return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      }
      const body = await request.json();
      const result = await registerMember(body, env);
      return jsonResponse(result, 201, corsHeaders);
    }

    // Quick register — creates a SPID with minimal data (for marketplace flow)
    if (url.pathname === '/register/quick' && request.method === 'POST') {
      const body = await request.json();
      const result = await registerQuick(body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }

    // Slots: public vacancy search (spec §3)
    if (url.pathname === '/slots' && request.method === 'GET') {
      const result = await listSlots(url, env);
      return jsonResponse(result, 200, corsHeaders);
    }

    // Slots: publish (admin-gated)
    if (url.pathname === '/slots' && request.method === 'POST') {
      if (!isAdmin(request, env)) {
        return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      }
      const body = await request.json();
      const result = await createSlot(body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }

    // Slots: full trust chain (org → slot → holder → delegations) — feeds verify QR page
    if (url.pathname.startsWith('/slots/') && url.pathname.endsWith('/chain') && request.method === 'GET') {
      const id = url.pathname.split('/')[2];
      const result = await getSlotChain(id, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }

    // Slots: list delegations on a slot (public read)
    if (url.pathname.startsWith('/slots/') && url.pathname.endsWith('/delegations') && request.method === 'GET') {
      const id = url.pathname.split('/')[2];
      const delegations = await env.PLATFORM_DB.prepare(
        `SELECT d.id, d.from_spid, d.to_spid, d.slot_id, d.scope_json, d.state, d.created_at,
                d.consent_sig IS NOT NULL AS signed
         FROM bpr_delegations d WHERE d.slot_id = ? ORDER BY d.created_at DESC`
      ).bind(id).all();
      const results = (delegations.results as any[]).map((d: any) => ({
        ...d, scope: JSON.parse(String(d.scope_json))
      }));
      return jsonResponse({ slot_id: id, delegations: results }, 200, corsHeaders);
    }

    // Slots: public detail
    if (url.pathname.startsWith('/slots/') && request.method === 'GET') {
      const id = url.pathname.split('/')[2];
      const result = await getSlot(id, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }

    // Slots: doctor requests a vacancy (public, DB + KV rate limited)
    if (url.pathname.startsWith('/slots/') && url.pathname.endsWith('/request') && request.method === 'POST') {
      const id = url.pathname.split('/')[2];
      const body = await request.json();
      const result = await createSlotRequest(id, body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }

    // Slots: holder delegates operation of a live slot (doctor → nurse / agent)
    if (url.pathname.startsWith('/slots/') && url.pathname.endsWith('/delegate') && request.method === 'POST') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      const id = url.pathname.split('/')[2];
      const body = await request.json();
      const result = await delegateSlot(id, body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }

    // Slots: holder of a live doctor slot spawns nurse sub-slots (inherits manifest)
    if (url.pathname.startsWith('/slots/') && url.pathname.endsWith('/subslots') && request.method === 'POST') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      const id = url.pathname.split('/')[2];
      const body = await request.json();
      const result = await createSubslots(id, body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }

    // Requests: org/admin views queue
    if (url.pathname === '/requests' && request.method === 'GET') {
      const filterSpid = url.searchParams.get('spid');
      if (filterSpid) {
        // Public: filter requests by requester_spid (user can check their own requests)
        const result = await listRequestsBySpid(filterSpid, url, env);
        return jsonResponse(result, 200, corsHeaders);
      }
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      const result = await listRequests(url, env);
      return jsonResponse(result, 200, corsHeaders);
    }

    // Requests: approve → Shopify draft order + invoice link
    if (url.pathname.startsWith('/requests/') && url.pathname.endsWith('/approve') && request.method === 'POST') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      const id = url.pathname.split('/')[2];
      const result = await approveRequest(id, env);
      return jsonResponse(result, result.error ? 400 : 200, corsHeaders);
    }

    // Requests: reject → slot returns to inventory
    if (url.pathname.startsWith('/requests/') && url.pathname.endsWith('/reject') && request.method === 'POST') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      const id = url.pathname.split('/')[2];
      const result = await rejectRequest(id, env);
      return jsonResponse(result, result.error ? 400 : 200, corsHeaders);
    }

    // Profiles: public HTML page (the 6 W's)
    if (url.pathname.startsWith('/p/') && request.method === 'GET') {
      const spid = url.pathname.split('/')[2];
      return await renderProfilePage(spid, env, corsHeaders);
    }

    // Profiles: public JSON
    if (url.pathname.startsWith('/api/profiles/') && request.method === 'GET') {
      const spid = url.pathname.split('/')[3];
      const result = await getProfile(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }

    // Profiles: admin upsert
    if (url.pathname === '/profiles' && request.method === 'POST') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      const body = await request.json();
      const result = await upsertProfile(body, env);
      return jsonResponse(result, result.error ? 400 : 200, corsHeaders);
    }

    // Provisioning: run §8 Doctor Business Stack pipeline (idempotent)
    if (url.pathname.startsWith('/provision/') && request.method === 'POST') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      const spid = url.pathname.split('/')[2];
      const body = await request.json().catch(() => ({}));
      const result = await provisionDoctor(spid, body, env);
      return jsonResponse(result, result.error ? 400 : 200, corsHeaders);
    }

    // Provisioning: status per doctor
    if (url.pathname.startsWith('/provision/') && request.method === 'GET') {
      const spid = url.pathname.split('/')[2];
      const result = await provisioningStatus(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }

    // Ledger: list entries + balance (public read for the doctor's portal)
    if (url.pathname.startsWith('/ledger/') && request.method === 'GET') {
      const spid = url.pathname.split('/')[2];
      const result = await getLedger(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }

    // Ledger: append an entry (admin-gated; used by webhook + payout runs)
    if (url.pathname === '/ledger' && request.method === 'POST') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      const body = await request.json();
      const result = await appendLedger(body, env);
      return jsonResponse(result, result.error ? 400 : 201, corsHeaders);
    }

    // Partner aggregate: everything a doctor dashboard needs (§9.3)
    if (url.pathname.startsWith('/partner/') && request.method === 'GET') {
      const spid = url.pathname.split('/')[2];
      const result = await partnerAggregate(spid, env);
      return jsonResponse(result, result.error ? 404 : 200, corsHeaders);
    }

    // ─── Network Trust Registry (§10 — IX peering infrastructure verification ───
    // Healthcare providers must prove network reliability for NPHIES/telemedicine.
    // Verified peering at Saudi IX (center3, SAIX, STC) → trust tier upgrade.
    if (url.pathname === '/network' && request.method === 'GET') {
      const rows = await env.PLATFORM_DB.prepare(
        `SELECT n.spid, n.ix_name, n.ix_asn, n.peering_type, n.facility, n.uptime_sla,
                n.verified, n.peer_count, n.bandwidth_gbps, n.ipv6_enabled, n.verified_at,
                m.business_name, m.trust_level, m.status
         FROM bpr_network_trust n LEFT JOIN bpr_memberships m ON m.spid = n.spid
         ORDER BY n.verified DESC, n.uptime_sla ASC`
      ).all();
      return jsonResponse({ total: (rows.results as any[]).length, providers: rows.results }, 200, corsHeaders);
    }
    if (url.pathname.startsWith('/network/') && request.method === 'GET') {
      const spid = url.pathname.split('/')[2];
      const row = await env.PLATFORM_DB.prepare(
        'SELECT * FROM bpr_network_trust WHERE spid = ?'
      ).bind(spid).first();
      if (!row) return jsonResponse({ error: 'network record not found' }, 404, corsHeaders);
      return jsonResponse({ provider: row }, 200, corsHeaders);
    }
    if (url.pathname === '/network' && request.method === 'POST') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      const body = await request.json();
      const { spid, ix_name, ix_asn, peering_type, facility, uptime_sla, peer_count, bandwidth_gbps, ipv6_enabled } = body || {};
      if (!spid || !ix_name || !ix_asn) return jsonResponse({ error: 'missing spid, ix_name, ix_asn' }, 400, corsHeaders);
      const member = await env.PLATFORM_DB.prepare('SELECT spid FROM bpr_memberships WHERE spid = ?').bind(spid).first();
      if (!member) return jsonResponse({ error: `member ${spid} not found` }, 404, corsHeaders);
      const now = new Date().toISOString();
      const verified = verified ? 1 : 0;
      await env.PLATFORM_DB.prepare(
        `INSERT INTO bpr_network_trust (spid, ix_name, ix_asn, peering_type, facility, uptime_sla, verified, verified_at, peer_count, bandwidth_gbps, ipv6_enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(spid) DO UPDATE SET ix_name=excluded.ix_name, ix_asn=excluded.ix_asn, peering_type=excluded.peering_type,
         facility=excluded.facility, uptime_sla=excluded.uptime_sla, verified=excluded.verified, verified_at=excluded.verified_at,
         peer_count=excluded.peer_count, bandwidth_gbps=excluded.bandwidth_gbps, ipv6_enabled=excluded.ipv6_enabled`
      ).bind(spid, ix_name, ix_asn, peering_type || null, facility || null, uptime_sla || null,
             verified, verified ? now : null, peer_count || 0, bandwidth_gbps || 0, ipv6_enabled || 0).run();
      return jsonResponse({ spid, network: 'registered', verified }, 200, corsHeaders);
    }
    if (url.pathname === '/network/verify' && request.method === 'POST') {
      if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      const body = await request.json();
      const { spid, verified } = body || {};
      if (!spid) return jsonResponse({ error: 'missing spid' }, 400, corsHeaders);
      const now = new Date().toISOString();
      await env.PLATFORM_DB.prepare(
        'UPDATE bpr_network_trust SET verified = ?, verified_at = ?, updated_at = ? WHERE spid = ?'
      ).bind(verified ? 1 : 0, now, now, spid).run();
      return jsonResponse({ spid, verified }, 200, corsHeaders);
    }

    // OID verification: resolve a member's spec-allocated OID and verify its
    // jurisdiction arc against oid-base.com (validated registry of record).
    if (url.pathname.startsWith('/oid/verify/') && request.method === 'GET') {
      const spid = url.pathname.split('/oid/verify/')[1];
      if (!spid) return jsonResponse({ error: 'SPID required' }, 400, corsHeaders);
      const member = await env.PLATFORM_DB.prepare(
        'SELECT spid, business_name, oid, created_at FROM bpr_memberships WHERE spid = ?'
      ).bind(spid).first();
      if (!member) return jsonResponse({ error: 'SPID not found' }, 404, corsHeaders);

      // Self-heal: if the row predates spec allocation, mint and store its OID now.
      let oid: string | null = member.oid || null;
      if (!oid) {
        oid = await allocateOid(spid, env);
        if (oid) {
          await env.PLATFORM_DB.prepare('UPDATE bpr_memberships SET oid = ? WHERE spid = ?').bind(oid, spid).run();
        }
      }
      const p = parseSpid(spid);
      const jurArc = p ? (JUR_ARCS[p.jurisdiction] ?? 3) : null;
      const clsArc = p ? CLASS_ARCS[p.cls] : null;
      const oidValid = jurArc ? await verifyOidArc(jurArc) : false;
      return jsonResponse({
        spid,
        business_name: member.business_name,
        oid,
        oidUrn: oid ? `urn:oid:${oid}` : null,
        buid: buidForSpid(spid),
        canonical: `https://id.brainsait.org/${spid}`,
        jurisdiction: p?.jurisdiction ?? null,
        class: p?.cls ?? null,
        arc: clsArc,
        root: OID_ROOT,
        valid: oidValid,
        registered_at: member.created_at,
      }, 200, corsHeaders);
    }

    // OID leaves registry — the validated 20-arc namespace tree (oid-base of record),
    // plus the BPR allocation map for provider classes.
    if (url.pathname === '/oid/leaves' && request.method === 'GET') {
      return jsonResponse({
        root: OID_ROOT,
        pen: OID_PEN,
        organization: OID_ORGANIZATION,
        ra: OID_RA,
        validated: OID_VALIDATED_DATE,
        source: `https://oid-base.com/get/${OID_ROOT}`,
        leaves: VALIDATED_OID_LEAVES.map((l) => ({
          arc: l.arc,
          oid: `${OID_ROOT}.${l.arc}`,
          identifier: l.identifier,
          description: l.description,
          namespace_spid: l.spid,
          status: l.status,
          registry_url: `https://oid-base.com/get/${OID_ROOT}.${l.arc}`,
        })),
        bpr_allocation: {
          note: 'Provider identities allocate <root>.<jurisdiction arc>.<class arc>.<branch seq>. Branch sequence is per (jurisdiction, class branch).',
          jurisdictions: Object.fromEntries(Object.entries(JUR_ARCS).map(([k, v]) => [k, `${OID_ROOT}.${v}`])),
          classes: Object.fromEntries(Object.entries(CLASS_ARCS).map(([k, v]) => [k, `<jurisdiction>.${v}`])),
        },
      }, 200, corsHeaders);
    }

    // Webhook: Shopify order paid (BPR subscription)
    if (url.pathname === '/webhook/order/paid' && request.method === 'POST') {
      const bodyText = await request.text();
      const hmac = request.headers.get('X-Shopify-Hmac-Sha256') || '';
      if (!(await verifyShopifyHmac(bodyText, hmac, env.WEBHOOK_SECRET))) {
        return jsonResponse({ error: 'Invalid Shopify HMAC' }, 401, corsHeaders);
      }
      const body = JSON.parse(bodyText);
      const result = await handleBPROrderPaid(body, env);
      return jsonResponse(result, 200, corsHeaders);
    }

    // MCP endpoint
    if (url.pathname === '/mcp' && request.method === 'POST') {
      return await handleMCP(request, env);
    }

    return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
  },
};

// ─── HMAC Verification ──────────────────────────────────

async function verifyShopifyHmac(body: string, hmac: string, secret: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
    return btoa(String.fromCharCode(...new Uint8Array(sig))) === hmac;
  } catch { return false; }
}

// ─── Admin gate (registry is now economically meaningful — no open minting) ─
// Separate from WEBHOOK_SECRET: Shopify HMAC and admin auth are different concerns.

function isAdmin(request: Request, env: Env): boolean {
  const key = request.headers.get('X-Admin-Token') || '';
  return !!env.ADMIN_TOKEN && key === env.ADMIN_TOKEN;
}

// ─── ID minting: per-type zero-padded counters (atomic on D1) ──
// Replaces Date.now()-based SPIDs (collision-prone, guessable).

async function mintId(kind: string, prefix: string, env: Env): Promise<string> {
  const row = await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_counters (kind, next) VALUES (?, 2)
     ON CONFLICT(kind) DO UPDATE SET next = next + 1
     RETURNING next`
  ).bind(kind).first<{ next: number }>();
  const n = (row?.next ?? 2) - 1;
  return `${prefix}-${String(n).padStart(6, '0')}`;
}

// ─── Vacancy Slots (spec §3) ────────────────────────────

const SLOT_TYPES = ['doctor', 'nurse', 'ai_agent'];
// Unit-priced (1 SAR) fee product on store.brainsait.de — quantity = fee amount.
// Product gid://shopify/Product/8214360064083 (published_scope=global).
// NOTE: the original product 8208227139667 / variant 46364747563091 was ACTIVE but
// never published to the Online Store channel → cart permalinks returned 410
// (journey-sim 2026-09-18). Token lacks write_publications, so a REST-created
// replacement is used instead. Do not point this back at 46364747563091.
const SLOT_FEE_VARIANT_ID = '46374789742675';

async function listSlots(url: URL, env: Env): Promise<any> {
  const clauses: string[] = [];
  const binds: string[] = [];
  const filters: Record<string, string> = {
    state: 's.state',
    type: 's.slot_type',
    specialty: 's.specialty',
    org: 's.org_spid',
  };
  for (const [param, col] of Object.entries(filters)) {
    const v = url.searchParams.get(param);
    if (v) { clauses.push(`${col} = ?`); binds.push(v); }
  }
  const city = url.searchParams.get('city');
  if (city) { clauses.push(`s.manifest_json LIKE ?`); binds.push(`%"city":"${city}"%`); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await env.PLATFORM_DB.prepare(
    `SELECT s.id, s.org_spid, s.parent_slot, s.slot_type, s.specialty, s.title,
            s.price_integration_sar, s.price_monthly_sar, s.state, s.holder_spid, s.created_at,
            m.business_name AS org_name, m.trust_level AS org_trust_level
     FROM bpr_slots s LEFT JOIN bpr_memberships m ON m.spid = s.org_spid
     ${where} ORDER BY s.created_at DESC LIMIT 200`
  ).bind(...binds).all();
  return { total: rows.results.length, slots: rows.results };
}

async function getSlot(id: string, env: Env): Promise<any> {
  const slot = await env.PLATFORM_DB.prepare(
    `SELECT s.*, m.business_name AS org_name, m.trust_level AS org_trust_level
     FROM bpr_slots s LEFT JOIN bpr_memberships m ON m.spid = s.org_spid
     WHERE s.id = ?`
  ).bind(id).first();
  if (!slot) return { error: 'Slot not found' };
  return {
    slot: {
      ...slot,
      manifest: JSON.parse(String(slot.manifest_json)),
      requirements: slot.requirements_json ? JSON.parse(String(slot.requirements_json)) : null,
      manifest_json: undefined,
      requirements_json: undefined,
    },
  };
}

async function createSlot(data: any, env: Env): Promise<any> {
  const { org_spid, parent_slot, slot_type, specialty, title, manifest, requirements, price_integration_sar, price_monthly_sar } = data || {};
  if (!org_spid || !slot_type || !specialty || !title || !manifest) {
    return { error: 'missing required fields: org_spid, slot_type, specialty, title, manifest' };
  }
  if (!SLOT_TYPES.includes(slot_type)) {
    return { error: `slot_type must be one of: ${SLOT_TYPES.join(', ')}` };
  }
  const pi = Number(price_integration_sar ?? 0);
  const pm = Number(price_monthly_sar ?? 0);
  if (!Number.isInteger(pi) || pi < 0 || !Number.isInteger(pm) || pm < 0) {
    return { error: 'prices must be non-negative integers (SAR)' };
  }
  const org = await env.PLATFORM_DB.prepare(
    'SELECT spid FROM bpr_memberships WHERE spid = ? AND status = ?'
  ).bind(org_spid, 'active').first();
  if (!org) return { error: `org ${org_spid} not found or not active` };
  const id = await mintId('slot', 'SA-SLT', env);
  const now = new Date().toISOString();
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_slots (id, org_spid, parent_slot, slot_type, specialty, title, manifest_json, requirements_json, price_integration_sar, price_monthly_sar, state, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'empty', ?, ?)`
  ).bind(
    id, org_spid, parent_slot || null, slot_type, specialty, title,
    JSON.stringify(manifest), requirements ? JSON.stringify(requirements) : null,
    pi, pm, now, now
  ).run();
  return { id, state: 'empty', created_at: now };
}

// ─── Sub-slots: holder of a live doctor slot spawns nurse slots (§3 step 4) ─

async function createSubslots(parentId: string, data: any, env: Env): Promise<any> {
  const parent = await env.PLATFORM_DB.prepare('SELECT * FROM bpr_slots WHERE id = ?').bind(parentId).first();
  if (!parent) return { error: 'parent slot not found' };
  if (parent.state !== 'live') return { error: `parent must be 'live' (is ${parent.state})` };
  if (parent.holder_spid !== data?.holder_spid && parent.org_spid !== data?.holder_spid) {
    return { error: `only holder/org of ${parentId} may spawn sub-slots (holder is ${parent.holder_spid ?? 'none'})` };
  }
  const count = Number(data?.count ?? 1);
  if (!Number.isInteger(count) || count < 1 || count > 24) return { error: 'count must be 1..24' };
  const pi = Number(data?.price_integration_sar ?? parent.price_integration_sar);
  const pm = Number(data?.price_monthly_sar ?? parent.price_monthly_sar);
  if (!Number.isInteger(pi) || pi < 0 || !Number.isInteger(pm) || pm < 0) return { error: 'prices must be non-negative integers (SAR)' };

  const manifest = parent.manifest_json ? JSON.parse(String(parent.manifest_json)) : { department: 'nursing', city: 'unknown' };
  const requirements = parent.requirements_json ? JSON.parse(String(parent.requirements_json)) : null;
  const now = new Date().toISOString();
  const created: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = await mintId('slot', 'SA-SLT', env);
    const title = data?.title_prefix
      ? `${data.title_prefix} #${i + 1}`
      : `Nursing ${parent.specialty.replace(/_/g, ' ')} #${i + 1} (under ${parentId})`;
    await env.PLATFORM_DB.prepare(
      `INSERT INTO bpr_slots (id, org_spid, parent_slot, slot_type, specialty, title, manifest_json, requirements_json, price_integration_sar, price_monthly_sar, state, created_at, updated_at)
       VALUES (?, ?, ?, 'nurse', ?, ?, ?, ?, ?, ?, 'empty', ?, ?)`
    ).bind(
      id, String(parent.org_spid), parentId, String(parent.specialty), title,
      JSON.stringify({ ...manifest, parent: parentId, role: 'nurse', department: data?.manifest?.department ?? manifest.department }),
      requirements ? JSON.stringify(requirements) : null, pi, pm, now, now
    ).run();
    created.push(id);
  }

  return { parent_slot: parentId, created, state: 'empty', count: created.length };
}

// ─── Slot requests: the marketplace loop (spec §2/§3) ───

async function createSlotRequest(slotId: string, data: any, env: Env): Promise<any> {
  const spid = String(data?.spid || '');
  const message = String(data?.message || '').slice(0, 1000);
  if (!spid) return { error: 'missing spid' };

  // 10 requests / hour / spid
  const rlKey = `rl:req:${spid}`;
  const count = parseInt((await env.SESSION_KV.get(rlKey)) || '0', 10);
  if (count >= 10) return { error: 'rate limit: max 10 requests per hour' };

  const requester = await env.PLATFORM_DB.prepare(
    'SELECT spid, status FROM bpr_memberships WHERE spid = ?'
  ).bind(spid).first();
  if (!requester) return { error: 'requester not found — register as a partner first' };
  if (requester.status !== 'active') return { error: `requester status is ${requester.status}` };

  const slot = await env.PLATFORM_DB.prepare('SELECT id, state FROM bpr_slots WHERE id = ?').bind(slotId).first();
  if (!slot) return { error: 'slot not found' };
  if (slot.state !== 'empty') return { error: `slot is ${slot.state}` };

  const dup = await env.PLATFORM_DB.prepare(
    `SELECT id FROM bpr_slot_requests WHERE slot_id = ? AND requester_spid = ? AND state IN ('requested','invoiced','verifying')`
  ).bind(slotId, spid).first();
  if (dup) return { error: `open request already exists: ${dup.id}` };

  const id = await mintId('request', 'SA-REQ', env);
  const now = new Date().toISOString();
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_slot_requests (id, slot_id, requester_spid, message, state, created_at) VALUES (?, ?, ?, ?, 'requested', ?)`
  ).bind(id, slotId, spid, message, now).run();
  await env.PLATFORM_DB.prepare(
    `UPDATE bpr_slots SET state = 'requested', updated_at = ? WHERE id = ? AND state = 'empty'`
  ).bind(now, slotId).run();
  await env.SESSION_KV.put(rlKey, String(count + 1), { expirationTtl: 3600 });
  return { id, slot_id: slotId, state: 'requested' };
}

async function listRequestsBySpid(spid: string, url: URL, env: Env): Promise<any> {
  const clauses: string[] = ['r.requester_spid = ?'];
  const binds: string[] = [spid];
  const state = url.searchParams.get('state');
  if (state) { clauses.push('r.state = ?'); binds.push(state); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await env.PLATFORM_DB.prepare(
    `SELECT r.*, s.title AS slot_title, m.business_name AS requester_name, m.email AS requester_email
     FROM bpr_slot_requests r
     LEFT JOIN bpr_slots s ON s.id = r.slot_id
     LEFT JOIN bpr_memberships m ON m.spid = r.requester_spid
     ${where} ORDER BY r.created_at DESC LIMIT 200`
  ).bind(...binds).all();
  return { total: rows.results.length, requests: rows.results };
}

async function listRequests(url: URL, env: Env): Promise<any> {
  const clauses: string[] = [];
  const binds: string[] = [];
  const slotId = url.searchParams.get('slot_id');
  const state = url.searchParams.get('state');
  if (slotId) { clauses.push('r.slot_id = ?'); binds.push(slotId); }
  if (state) { clauses.push('r.state = ?'); binds.push(state); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await env.PLATFORM_DB.prepare(
    `SELECT r.*, s.title AS slot_title, m.business_name AS requester_name, m.email AS requester_email
     FROM bpr_slot_requests r
     LEFT JOIN bpr_slots s ON s.id = r.slot_id
     LEFT JOIN bpr_memberships m ON m.spid = r.requester_spid
     ${where} ORDER BY r.created_at DESC LIMIT 200`
  ).bind(...binds).all();
  return { total: rows.results.length, requests: rows.results };
}

async function approveRequest(id: string, env: Env): Promise<any> {
  const req = await env.PLATFORM_DB.prepare('SELECT * FROM bpr_slot_requests WHERE id = ?').bind(id).first();
  if (!req) return { error: 'request not found' };
  if (req.state !== 'requested') return { error: `request is ${req.state}` };
  const slot = await env.PLATFORM_DB.prepare('SELECT * FROM bpr_slots WHERE id = ?').bind(String(req.slot_id)).first();
  if (!slot) return { error: 'slot not found' };
  const requester = await env.PLATFORM_DB.prepare('SELECT * FROM bpr_memberships WHERE spid = ?').bind(String(req.requester_spid)).first();
  if (!requester?.email) return { error: 'requester has no email on file' };

  // Payment link: cart permalink against the unit-priced (1 SAR) fee product —
  // quantity = fee amount. (Draft orders are out: the token lacks write_draft_orders.)
  // Attributes flow through checkout into order.note_attributes, which the
  // orders/paid webhook reads to find the request. Same pattern as solutions checkout.
  const qty = Number(slot.price_integration_sar);
  if (!Number.isInteger(qty) || qty <= 0) return { error: 'slot has no positive integration price' };
  const paymentUrl = `https://store.brainsait.de/cart/${SLOT_FEE_VARIANT_ID}:${qty}`
    + `?attributes[request_id]=${encodeURIComponent(String(req.id))}`
    + `&attributes[slot_id]=${encodeURIComponent(String(slot.id))}`
    + `&attributes[spid]=${encodeURIComponent(String(req.requester_spid))}`;

  const now = new Date().toISOString();
  await env.PLATFORM_DB.prepare(
    `UPDATE bpr_slot_requests SET state = 'invoiced', order_id = NULL, resolved_at = NULL WHERE id = ?`
  ).bind(id).run();
  await env.PLATFORM_DB.prepare(`UPDATE bpr_slots SET state = 'invoiced', updated_at = ? WHERE id = ?`).bind(now, String(slot.id)).run();

  // Email the payment link (non-fatal)
  try {
    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'BrainSAIT <registry@brainsait.org>',
          to: [String(requester.email)],
          subject: `Slot approved — complete integration payment | تمت الموافقة — أكمل الدفع`,
          html: `<div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 2rem;">
            <h2 style="color:#10b981;">Your slot request was approved</h2>
            <p><b>${slot.title}</b> (${slot.id})</p>
            <p>Integration fee: <b>${slot.price_integration_sar} SAR</b></p>
            <a href="${paymentUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:0.75rem 1.5rem;border-radius:6px;text-decoration:none;">Pay to activate your slot</a>
          </div>`,
        }),
      });
    }
  } catch { /* email is best-effort */ }

  return { id, state: 'invoiced', payment_url: paymentUrl, amount_sar: qty };
}

async function rejectRequest(id: string, env: Env): Promise<any> {
  const req = await env.PLATFORM_DB.prepare('SELECT * FROM bpr_slot_requests WHERE id = ?').bind(id).first();
  if (!req) return { error: 'request not found' };
  if (req.state !== 'requested') return { error: `request is ${req.state}` };
  const now = new Date().toISOString();
  await env.PLATFORM_DB.prepare(`UPDATE bpr_slot_requests SET state = 'rejected', resolved_at = ? WHERE id = ?`).bind(now, id).run();
  await env.PLATFORM_DB.prepare(`UPDATE bpr_slots SET state = 'empty', updated_at = ? WHERE id = ? AND state = 'requested'`).bind(now, String(req.slot_id)).run();
  return { id, state: 'rejected', slot_back_to: 'empty' };
}

// ─── Delegations + trust chain (spec §3/§5, step 4) ────
// holder (doctor/org) grants a nurse/agent operational scope on a live slot.
// consent_sig = Ed25519 over the deterministic delegation payload via agent-passport /sign.

async function delegateSlot(slotId: string, data: any, env: Env): Promise<any> {
  const { from_spid, to_spid, scope, consent_sig } = data || {};
  if (!from_spid || !to_spid || !scope?.tasks?.length) return { error: 'missing required fields: from_spid, to_spid, scope.tasks' };

  const now = new Date().toISOString();
  const slot = await env.PLATFORM_DB.prepare('SELECT * FROM bpr_slots WHERE id = ?').bind(slotId).first();
  if (!slot) return { error: 'slot not found' };

  // Only the holder (or the slot-owning org) may delegate.
  const holderOk = slot.holder_spid === from_spid || slot.org_spid === from_spid;
  if (!holderOk) return { error: `only holder/org of ${slotId} may delegate (holder is ${slot.holder_spid ?? 'none'})` };
  if (slot.state !== 'live') return { error: `only 'live' slots can be delegated (is ${slot.state})` };

  const from = await env.PLATFORM_DB.prepare('SELECT spid, status FROM bpr_memberships WHERE spid = ?').bind(from_spid).first();
  if (!from || from.status !== 'active') return { error: `from_spid ${from_spid} not active` };
  const to = await env.PLATFORM_DB.prepare('SELECT spid, status FROM bpr_memberships WHERE spid = ?').bind(to_spid).first();
  if (!to || to.status !== 'active') return { error: `to_spid ${to_spid} not active` };
  if (from_spid === to_spid) return { error: 'cannot delegate to self' };

  const id = await mintId('delegation', 'SA-DLG', env);

  // Deterministic payload → request Ed25519 signature from agent-passport.
  const payload = JSON.stringify({
    schema: 'https://brainsait.org/schemas/delegation/v1',
    id,
    from_spid,
    to_spid,
    slot_id: slotId,
    scope: { tasks: scope.tasks, internal: scope.internal ?? false, expires: scope.expires ?? null },
    state: 'active',
    created_at: now,
  });

  let sig = consent_sig || null;
  let sigError: string | null = null;
  try {
    if (!sig) {
      // Use the service binding (custom-domain fetch is blocked by CF loop protection).
      const r = await env.PASSPORT.fetch('https://passport.brainsait.org/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      if (r.ok) { const j: any = await r.json(); sig = j.signature ?? null; }
    }
  } catch (e) { sigError = String(e); }

  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_delegations (id, from_spid, to_spid, slot_id, scope_json, consent_sig, state, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`
  ).bind(id, from_spid, to_spid, slotId, JSON.stringify(scope), sig, now).run();

  return { id, from_spid, to_spid, slot_id: slotId, scope, consent_sig: sig, sig_error: sigError };
}

async function getSlotChain(slotId: string, env: Env): Promise<any> {
  const slot = await env.PLATFORM_DB.prepare(
    `SELECT s.id, s.org_spid, s.parent_slot, s.slot_type, s.specialty, s.title, s.state, s.holder_spid, s.created_at,
            m.business_name AS org_name, m.trust_level AS org_trust_level
     FROM bpr_slots s LEFT JOIN bpr_memberships m ON m.spid = s.org_spid
     WHERE s.id = ?`
  ).bind(slotId).first();
  if (!slot) return { error: 'slot not found' };

  const delegations = (await env.PLATFORM_DB.prepare(
    `SELECT d.id, d.from_spid, d.to_spid, d.scope_json, d.state, d.created_at, d.consent_sig IS NOT NULL AS signed
     FROM bpr_delegations d WHERE d.slot_id = ? ORDER BY d.created_at DESC`
  ).bind(slotId).all()).results.map((d) => ({ ...d, scope: JSON.parse(String(d.scope_json)) }));

  const memberOf = async (spid: string) => {
    const m = await env.PLATFORM_DB.prepare(
      'SELECT spid, business_name, email, trust_level, status FROM bpr_memberships WHERE spid = ?'
    ).bind(spid).first();
    return m ? { spid: m.spid, name: m.business_name, trust_level: m.trust_level, status: m.status } : { spid };
  };

  return {
    slot: { id: slot.id, title: slot.title, slot_type: slot.slot_type, specialty: slot.specialty, state: slot.state },
    org: await memberOf(String(slot.org_spid)),
    holder: slot.holder_spid ? await memberOf(String(slot.holder_spid)) : null,
    parent: slot.parent_slot ? await env.PLATFORM_DB.prepare('SELECT id, title, state FROM bpr_slots WHERE id = ?').bind(slot.parent_slot).first() : null,
    delegations,
    verify_qr: `https://verify.brainsait.org/chain/${slotId}`,
  };
}

// Payment for a slot integration (from Shopify orders/paid webhook, via line-item property request_id).
// Verification v1 is structural (active member + trust level meets slot requirements);
// SCFHS/licensing verification becomes an interactive Lark step in phase 4.
async function handleSlotPaid(requestId: string, order: any, env: Env): Promise<any> {
  const req = await env.PLATFORM_DB.prepare('SELECT * FROM bpr_slot_requests WHERE id = ?').bind(requestId).first();
  if (!req) return { error: 'request not found', request_id: requestId };
  if (req.state === 'provisioned') return { skipped: true, reason: 'already provisioned' };
  if (req.state !== 'invoiced') return { error: `request is ${req.state}, expected invoiced` };

  const slot = await env.PLATFORM_DB.prepare('SELECT * FROM bpr_slots WHERE id = ?').bind(String(req.slot_id)).first();
  if (!slot) return { error: 'slot not found' };

  const requester = await env.PLATFORM_DB.prepare('SELECT spid, status, trust_level FROM bpr_memberships WHERE spid = ?').bind(String(req.requester_spid)).first();
  const lvl = (t: unknown) => parseInt(String(t || '').split('-H')[1] || '0', 10);
  const reqs = slot.requirements_json ? JSON.parse(String(slot.requirements_json)) : {};
  const checks = {
    requester_active: requester?.status === 'active',
    trust_ok: !reqs.min_trust_level || lvl(requester?.trust_level) >= lvl(reqs.min_trust_level),
  };
  const passed = Object.values(checks).every(Boolean);
  const now = new Date().toISOString();

  if (!passed) {
    await env.PLATFORM_DB.prepare(`UPDATE bpr_slot_requests SET state = 'verifying', order_id = ? WHERE id = ?`).bind(String(order.id), requestId).run();
    await env.PLATFORM_DB.prepare(`UPDATE bpr_slots SET state = 'verifying', updated_at = ? WHERE id = ?`).bind(now, String(slot.id)).run();
    return { request_id: requestId, state: 'verifying', failed_checks: checks };
  }

  await env.PLATFORM_DB.prepare(
    `UPDATE bpr_slot_requests SET state = 'provisioned', order_id = ?, resolved_at = ? WHERE id = ?`
  ).bind(String(order.id), now, requestId).run();
  await env.PLATFORM_DB.prepare(
    `UPDATE bpr_slots SET state = 'live', holder_spid = ?, updated_at = ? WHERE id = ?`
  ).bind(String(req.requester_spid), now, String(slot.id)).run();
  return { request_id: requestId, state: 'provisioned', slot: slot.id, slot_state: 'live', holder: req.requester_spid };
}

// ─── Doctor Business Stack provisioning (§8) ────────────
// Idempotent per-SPID pipeline: identity → profile → storefront → commerce → erp.
// Each step checks bpr_provisioning_log (PK spid+step) before acting; re-runnable
// after any failure. Offboarding = archive, never delete (spec §8.4).

const PROVISION_STEPS = ['identity', 'profile', 'storefront', 'commerce', 'erp'];

async function provisionStepDone(spid: string, step: string, env: Env): Promise<boolean> {
  const row = await env.PLATFORM_DB.prepare(
    'SELECT status FROM bpr_provisioning_log WHERE spid = ? AND step = ?'
  ).bind(spid, step).first<{ status: string }>();
  return row?.status === 'done';
}

async function markProvisionStep(spid: string, step: string, status: string, detail: any, env: Env): Promise<void> {
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_provisioning_log (spid, step, status, detail_json, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(spid, step) DO UPDATE SET status = excluded.status, detail_json = excluded.detail_json, created_at = excluded.created_at`
  ).bind(spid, step, status, detail ? JSON.stringify(detail) : null, new Date().toISOString()).run();
}

// Step 1+2 — identity + public profile are native to the registry.
async function provisionIdentity(spid: string, env: Env): Promise<void> {
  await markProvisionStep(spid, 'identity', 'done', {
    spid,
    passport: `https://registry.brainsait.org/verify/${spid}`,
    canonical: `https://id.brainsait.org/${spid}`,
    did: `did:web:id.brainsait.org:providers:${spid}`,
  }, env);
}

async function provisionProfile(spid: string, env: Env): Promise<void> {
  await markProvisionStep(spid, 'profile', 'done', {
    profile: `https://registry.brainsait.org/p/${spid}`,
  }, env);
}

// Step 3 — storefront page lives on gh.io (`/doctors/:spid`, fed by catalog.json).
// The registry records the canonical URL; the gh.io build publishes the page.
async function provisionStorefront(spid: string, env: Env): Promise<void> {
  await markProvisionStep(spid, 'storefront', 'done', {
    page: `https://fadil369.github.io/doctors/${spid}`,
  }, env);
}

// Step 4 — commerce rails on the shared store: one CONSULT product per SPID,
// unpublished (stays out of main nav — spec §8.4), attributed via note_attributes[spid].
// SKU family: CONSULT-<SPID>-1 (per-consult), using live-verified GraphQL productCreate.
async function provisionCommerce(spid: string, env: Env): Promise<void> {
  if (!env.SHOPIFY_ADMIN_TOKEN) throw new Error('SHOPIFY_ADMIN_TOKEN not set');
  const member = await env.PLATFORM_DB.prepare('SELECT spid, business_name FROM bpr_memberships WHERE spid = ?').bind(spid).first<any>();
  if (!member) throw new Error(`member ${spid} not found`);

  const handle = `consult-${spid.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
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
        title: `${member.business_name} — Consultation (SPID ${spid})`,
        handle,
        productType: 'CONSULT',
        status: 'DRAFT',
        descriptionHtml: `Doctor-owned consultation product for SPID ${spid}. Bookings attributed via note_attributes[spid].`,
      },
    },
  };
  const resp = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN || 'f3rbxp-n1.myshopify.com'}/admin/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify(body),
  });
  const json: any = await resp.json();
  const errs = json?.data?.productCreate?.userErrors || json?.errors || [];
  if (!resp.ok || errs.length) {
    throw new Error(`Shopify productCreate failed: ${JSON.stringify(errs)}`);
  }
  const product = json.data.productCreate.product;
  if (!product?.id) throw new Error('Shopify productCreate returned no product');

  // Variants are a second call: productVariantsBulkCreate (schema check 2026-09-18).
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
        compareAtPrice: '149.00',
        price: '99.00',
        optionValues: [{ optionName: 'Title', name: 'Per consultation' }],
        inventoryItem: { sku: `CONSULT-${spid}-1` },
      }],
    },
  };
  const varResp = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN || 'f3rbxp-n1.myshopify.com'}/admin/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify(varBody),
  });
  const varJson: any = await varResp.json();
  const varErrs = varJson?.data?.productVariantsBulkCreate?.userErrors || varJson?.errors || [];
  if (!varResp.ok || varErrs.length) {
    throw new Error(`Shopify productVariantsBulkCreate failed: ${JSON.stringify(varErrs)}`);
  }
  const variant = varJson.data.productVariantsBulkCreate.productVariants?.[0];
  await markProvisionStep(spid, 'commerce', 'done', {
    product_id: product.id,
    handle: product.handle,
    url: `https://store.brainsait.de/products/${product.handle}`,
    variant_id: variant?.id || null,
    sku: variant?.sku || null,
    price_sar: 99,
  }, env);
}

// Step 5 — ERP rails: Daftra supplier (payouts) + client (invoice series), SPID-scoped.
async function provisionERP(spid: string, env: Env): Promise<void> {
  if (!env.DAFTRA_API_KEY) throw new Error('DAFTRA_API_KEY not set');
  const base = env.DAFTRA_BASE_URL || 'https://brainsait.daftra.com';
  const member = await env.PLATFORM_DB.prepare(
    'SELECT spid, business_name, email, first_name, last_name, phone FROM bpr_memberships WHERE spid = ?'
  ).bind(spid).first<any>();
  if (!member) throw new Error(`member ${spid} not found`);

  const name = member.business_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || spid;

  // Supplier (payouts leg)
  const supResp = await fetch(`${base}/api2/suppliers.json`, {
    method: 'POST',
    headers: { 'apikey': env.DAFTRA_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ Supplier: { business_name: name, email: member.email || '', code: spid } }),
  });
  const supJson: any = await supResp.json();

  // Client (invoice series leg)
  const cliResp = await fetch(`${base}/api2/clients.json`, {
    method: 'POST',
    headers: { 'apikey': env.DAFTRA_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ Client: { business_name: name, email: member.email || '', phone_number: member.phone || '', client_number: spid } }),
  });
  const cliJson: any = await cliResp.json();

  const ok = (j: any) => j?.result === 'successful';
  if (!ok(supJson) && !ok(cliJson)) {
    throw new Error(`Daftra provisioning failed: supplier=${supJson?.result || supJson?.message} client=${cliJson?.result || cliJson?.message}`);
  }
  await markProvisionStep(spid, 'erp', 'done', {
    supplier: ok(supJson) ? { id: supJson.id ?? supJson.data?.id, result: supJson.result } : null,
    client: ok(cliJson) ? { id: cliJson.id ?? cliJson.data?.id, result: cliJson.result } : null,
  }, env);
}

async function runProvisionStep(spid: string, step: string, env: Env): Promise<any> {
  if (await provisionStepDone(spid, step, env)) return { step, status: 'done', reused: true };
  try {
    switch (step) {
      case 'identity': await provisionIdentity(spid, env); break;
      case 'profile': await provisionProfile(spid, env); break;
      case 'storefront': await provisionStorefront(spid, env); break;
      case 'commerce': await provisionCommerce(spid, env); break;
      case 'erp': await provisionERP(spid, env); break;
    }
    return { step, status: 'done' };
  } catch (e: any) {
    await markProvisionStep(spid, step, 'failed', { error: String(e?.message || e) }, env);
    throw e;
  }
}

async function provisionDoctor(spid: string, data: any, env: Env): Promise<any> {
  const member = await env.PLATFORM_DB.prepare('SELECT spid FROM bpr_memberships WHERE spid = ?').bind(spid).first();
  if (!member) return { error: `member ${spid} not found` };

  const steps = Array.isArray(data?.steps) && data.steps.length
    ? data.steps.filter((s: string) => PROVISION_STEPS.includes(s))
    : PROVISION_STEPS;

  const out: any[] = [];
  for (const step of steps) {
    try {
      out.push(await runProvisionStep(spid, step, env));
    } catch (e: any) {
      out.push({ step, status: 'failed', error: String(e?.message || e) });
    }
  }
  return { spid, steps: out };
}

async function provisioningStatus(spid: string, env: Env): Promise<any> {
  const rows = await env.PLATFORM_DB.prepare(
    'SELECT step, status, detail_json, created_at FROM bpr_provisioning_log WHERE spid = ? ORDER BY created_at'
  ).bind(spid).all();
  if (!rows.results.length) return { error: 'no provisioning record for this spid' };
  const parse = (v: unknown) => { try { return JSON.parse(String(v)); } catch { return null; } };
  return {
    spid,
    steps: rows.results.map((r: any) => ({ step: r.step, status: r.status, detail: parse(r.detail_json), at: r.created_at })),
    complete: rows.results.every((r: any) => r.status === 'done'),
  };
}

// ─── Ledger (§8.2 money flows) ──────────────────────────

function ledgerId(): string {
  return `L-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function getLedger(spid: string, env: Env): Promise<any> {
  const member = await env.PLATFORM_DB.prepare('SELECT spid FROM bpr_memberships WHERE spid = ?').bind(spid).first();
  if (!member) return { error: 'member not found' };
  const rows = await env.PLATFORM_DB.prepare(
    'SELECT * FROM bpr_ledger WHERE spid = ? ORDER BY created_at DESC LIMIT 200'
  ).bind(spid).all();
  const balance = (rows.results as any[]).reduce(
    (acc, r) => acc + (r.direction === 'credit' ? r.amount_sar : -r.amount_sar), 0);
  return { spid, balance_sar: balance, entries: rows.results };
}

async function appendLedger(data: any, env: Env): Promise<any> {
  const { spid, direction, amount_sar, ref } = data || {};
  if (!spid || !direction || typeof amount_sar !== 'number') return { error: 'need spid, direction (credit|debit|payout), amount_sar' };
  if (!['credit', 'debit', 'payout'].includes(direction)) return { error: 'direction must be credit|debit|payout' };
  if (!Number.isInteger(amount_sar) || amount_sar < 0) return { error: 'amount_sar must be a non-negative integer' };
  const member = await env.PLATFORM_DB.prepare('SELECT spid FROM bpr_memberships WHERE spid = ?').bind(spid).first();
  if (!member) return { error: 'member not found' };
  const id = ledgerId();
  await env.PLATFORM_DB.prepare(
    'INSERT INTO bpr_ledger (id, spid, direction, amount_sar, ref, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, spid, direction, amount_sar, ref || null, new Date().toISOString()).run();
  const { balance_sar } = await getLedger(spid, env);
  return { id, spid, direction, amount_sar, balance_sar };
}

// ─── Partner aggregate (§9.3) ───────────────────────────

async function partnerAggregate(spid: string, env: Env): Promise<any> {
  const member = await env.PLATFORM_DB.prepare(
    `SELECT spid, email, business_name, first_name, last_name, phone, country_code, order_id,
            plan_type, status, trust_level, created_at, expires_at
     FROM bpr_memberships WHERE spid = ?`
  ).bind(spid).first();
  if (!member) return { error: 'member not found' };

  const slotsHeld = (await env.PLATFORM_DB.prepare(
    'SELECT id, slot_type, specialty, title, state, created_at FROM bpr_slots WHERE holder_spid = ?'
  ).bind(spid).all()).results;
  const slotsPublished = (await env.PLATFORM_DB.prepare(
    'SELECT id, slot_type, specialty, title, state, created_at FROM bpr_slots WHERE org_spid = ?'
  ).bind(spid).all()).results;
  const delegations = (await env.PLATFORM_DB.prepare(
    `SELECT d.id, d.from_spid, d.to_spid, d.slot_id, d.state, d.created_at
     FROM bpr_delegations d WHERE d.from_spid = ? OR d.to_spid = ? ORDER BY d.created_at DESC LIMIT 100`
  ).bind(spid, spid).all()).results;
  const ledger = await getLedger(spid, env);
  const provisioning = await provisioningStatus(spid, env);
  const network = await env.PLATFORM_DB.prepare(
    'SELECT * FROM bpr_network_trust WHERE spid = ?'
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
      ipv6_enabled: !!network.ipv6_enabled,
    } : null,
  };
}

// ─── Provider Verification ──────────────────────────────

async function verifyProvider(spid: string, env: Env): Promise<any> {
  // Check local D1 first
  const member = await env.PLATFORM_DB.prepare(
    'SELECT * FROM bpr_memberships WHERE spid = ? AND status = ?'
  ).bind(spid, 'active').first();

  if (member) {
    return {
      verified: true,
      spid: member.spid,
      name: member.business_name,
      status: member.status,
      trust_level: member.trust_level || 'BIAL-H2',
      verified_at: member.created_at,
    };
  }

  // Fallback to OID line worker
  try {
    const resp = await fetch(`https://oid-line.brainsait-fadil.workers.dev/v1/verify/${spid}`);
    return await resp.json();
  } catch {
    return { verified: false, error: 'Provider not found' };
  }
}

// ─── Member Management ──────────────────────────────────

async function listMembers(env: Env): Promise<any> {
  const members = await env.PLATFORM_DB.prepare(
    `SELECT spid, business_name, email, status, trust_level, created_at, oid FROM bpr_memberships
     WHERE status != 'archived' ORDER BY created_at DESC LIMIT 100`
  ).all();

  return {
    total: members.results.length,
    members: members.results,
  };
}

async function getMember(spid: string, env: Env): Promise<any> {
  const member = await env.PLATFORM_DB.prepare(
    'SELECT * FROM bpr_memberships WHERE spid = ?'
  ).bind(spid).first();

  if (!member) {
    return { error: 'Member not found' };
  }

  return { member };
}

// Offboarding = archive, never delete (spec §8.4). Marks status archived and
// leaves the audit trail intact. Idempotent: archiving an archived member is a no-op success.
async function offboardMember(spid: string, env: Env): Promise<any> {
  const member = await env.PLATFORM_DB.prepare(
    'SELECT spid, status FROM bpr_memberships WHERE spid = ?'
  ).bind(spid).first();

  if (!member) {
    return { error: 'Member not found' };
  }

  await env.PLATFORM_DB.prepare(
    `UPDATE bpr_memberships SET status = 'archived' WHERE spid = ?`
  ).bind(spid).run();

  return { spid, status: 'archived', note: 'Archived per spec §8.4 (never deleted)' };
}

// ─── OID allocation (Master Spec §4/§5/§7, validated 2026-09-04 via oid-base) ───
// Source of truth: BrainSAIT_OID_Registry_Validated.json (Mac ~/workspace/core/ID).
// Only arcs actually registered at oid-base may be published. The old arcs
// 20–23 (provider_registry/verification_badge/network_trust/slot_marketplace)
// were never registered and are retired.
const OID_ROOT = '1.3.6.1.4.1.61026';
const OID_PEN = 61026;
const OID_ORGANIZATION = 'BrainSAIT Ltd';
const OID_RA = 'Mohamed Elfadil Abuagla';
const OID_VALIDATED_DATE = '2026-09-04';

const VALIDATED_OID_LEAVES: { arc: number; identifier: string; description: string; spid: string; status: string }[] = [
  { arc: 1, identifier: 'places', description: 'Place: Sudan', spid: 'SD', status: 'active-approved' },
  { arc: 2, identifier: 'saudi-arabia', description: 'Saudi Arabia namespace for BrainSAIT Identity Fabric', spid: 'SA', status: 'active-approved' },
  { arc: 3, identifier: 'brainsait-global', description: 'BrainSAIT Global namespace for cross-jurisdictional identity services', spid: 'BS', status: 'active-approved' },
  { arc: 4, identifier: 'united-kingdom', description: 'United Kingdom namespace for BrainSAIT Identity Fabric', spid: 'UK', status: 'active-approved' },
  { arc: 5, identifier: 'mena', description: 'Middle East and North Africa (MENA) regional namespace', spid: 'MENA', status: 'active-approved' },
  { arc: 6, identifier: 'global-applications', description: 'Global applications namespace for BrainSAIT platform applications', spid: 'GA', status: 'active-approved' },
  { arc: 7, identifier: 'global-ai-agents', description: 'Global Artificial Intelligence (AI) agents namespace for BrainSAIT autonomous agents', spid: 'AI', status: 'active-approved' },
  { arc: 8, identifier: 'infrastructure', description: 'Infrastructure namespace for BrainSAIT cloud services and endpoints', spid: 'IF', status: 'active-approved' },
  { arc: 9, identifier: 'trust-credentials', description: 'Trust and credentials namespace for verification and security services', spid: 'TC', status: 'active-approved' },
  { arc: 10, identifier: 'terminology', description: 'Terminology namespace for medical and technical terminologies', spid: 'TRM', status: 'active-approved' },
  { arc: 11, identifier: 'data-assets', description: 'Data assets namespace for research datasets and data products', spid: 'DAT', status: 'active-approved' },
  { arc: 12, identifier: 'research', description: 'Research namespace for research projects and publications', spid: 'RES', status: 'active-approved' },
  { arc: 13, identifier: 'education', description: 'Education namespace for courses certifications and training', spid: 'EDU', status: 'active-approved' },
  { arc: 14, identifier: 'commerce', description: 'Commerce namespace for e-commerce and business services', spid: 'CM', status: 'active-approved' },
  { arc: 15, identifier: 'interoperability', description: 'Interoperability namespace for healthcare integration services', spid: 'IOP', status: 'active-approved' },
  { arc: 16, identifier: 'identity-services', description: 'Identity services namespace for core identity platform services', spid: 'IDS', status: 'active-approved' },
  { arc: 17, identifier: 'security-services', description: 'Security services namespace for key management and protection', spid: 'SEC', status: 'active-approved' },
  { arc: 18, identifier: 'network-endpoint-registry', description: 'Network endpoint registry for service discovery', spid: 'NET', status: 'active-approved' },
  { arc: 19, identifier: 'reserved', description: 'Reserved namespace for future BrainSAIT use', spid: 'RSV', status: 'active-approved' },
  { arc: 99, identifier: 'experimental', description: 'Experimental namespace for BrainSAIT Identity Fabric testing', spid: 'EXP', status: 'active-approved-test-only' },
];

// Jurisdiction → first-level arc (validated). Unknown jurisdictions fall back to 3 (brainsait-global).
const JUR_ARCS: Record<string, number> = { SA: 2, SD: 1, UK: 4, MENA: 5, BS: 3 };

// Entity class → sub-arc inside a jurisdiction (Master Spec §5/§7 model).
// Practitioners share one branch (seq is per-branch, not per-class), so
// SA-PHY-000001 and SA-NUR-000001 get distinct sequences in .<jur>.3.
const CLASS_ARCS: Record<string, number> = {
  ORG: 2, HOS: 2,            // Organizations (validated example: SA-HOS-000001 = .2.2.1)
  PHY: 3, NUR: 3, DEN: 3, PHA: 3, TEC: 3, ALL: 3,  // Practitioners
  FAC: 4, CLI: 4, LAB: 4, PHM: 4,  // Facilities
  LOC: 5,                   // Locations
  SVC: 6,                   // Healthcare services
  AGT: 8,                   // AI agents
  DEV: 11,                  // Devices
  NET: 16,                  // Networks
};

export function parseSpid(spid: string): { jurisdiction: string; cls: string; seq: number } | null {
  const m = spid.match(/^([A-Z]{2,4})-([A-Z]{3})-(\d+)$/);
  if (!m) return null;
  return { jurisdiction: m[1], cls: m[2], seq: parseInt(m[3], 10) };
}

// OID for a member = <root>.<jurisdiction arc>.<class arc>.<branch sequence>.
// SA-PHY-000001 → 1.3.6.1.4.1.61026.2.3.1 (matches Master Spec §7 example).
// The branch sequence is allocated per (jurisdiction, class branch) and stored on
// the membership row — it is NOT derivable from the SPID alone.
function oidForAllocation(jurisdiction: string, cls: string, seq: number): string | null {
  const jurArc = JUR_ARCS[jurisdiction] ?? 3;
  const clsArc = CLASS_ARCS[cls];
  if (!clsArc) return null;
  return `${OID_ROOT}.${jurArc}.${clsArc}.${seq}`;
}

function buidForSpid(spid: string): string {
  const p = parseSpid(spid);
  if (!p) return `BUID:XX:USR:000000`;
  return `BUID:${p.jurisdiction}:${p.cls}:${String(p.seq).padStart(6, '0')}`;
}

// Atomically allocate the next OID sequence for a member's (jurisdiction, class) branch.
async function allocateOid(spid: string, env: Env): Promise<string | null> {
  const p = parseSpid(spid);
  if (!p) return null;
  const jurArc = JUR_ARCS[p.jurisdiction] ?? 3;
  const clsArc = CLASS_ARCS[p.cls];
  if (!clsArc) return null;
  const kind = `oid-${p.jurisdiction.toLowerCase()}-${jurArc}-${clsArc}`;
  const row = await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_counters (kind, next) VALUES (?, 1)
     ON CONFLICT(kind) DO UPDATE SET next = next + 1
     RETURNING next`
  ).bind(kind).first<{ next: number }>();
  const seq = row?.next ?? 1;
  return oidForAllocation(p.jurisdiction, p.cls, seq);
}

// Quick registration — no admin token needed. For marketplace: email + name → auto SPID.
async function registerQuick(data: any, env: Env): Promise<any> {
  const email = String(data.email || '').trim();
  const name = String(data.name || '').trim();
  if (!email || !name) return { error: 'email and name required' };

  const nameParts = name.split(/\s+/).filter(Boolean);
  const spid = await mintId('provider', 'SA-PHY', env);
  const now = new Date().toISOString();

  const oid = await allocateOid(spid, env);
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_memberships (spid, email, business_name, first_name, last_name, status, trust_level, created_at, oid)
     VALUES (?, ?, ?, ?, ?, 'active', 'BIAL-H2', ?, ?)`
  ).bind(
    spid, email,
    name,
    nameParts[0] || '',
    nameParts.slice(1).join(' ') || '',
    now,
    oid
  ).run();

  return { spid, status: 'active', registered_at: now, oid, buid: buidForSpid(spid) };
}

async function registerMember(data: any, env: Env): Promise<any> {
  const { email, business_name, first_name, last_name, phone, country_code } = data;

  // Compat: mcp-hub sends a single `name` — split it when first/last are absent
  const nameParts = (first_name || last_name) ? [] : String(data.name || '').trim().split(/\s+/).filter(Boolean);
  const effFirst = first_name || nameParts[0] || '';
  const effLast = last_name || nameParts.slice(1).join(' ') || '';

  // Generate SPID
  const spid = await mintId('provider', 'SA-PHY', env);
  const oid = await allocateOid(spid, env);

  // Create in D1
  await env.PLATFORM_DB.prepare(`
    INSERT INTO bpr_memberships (spid, email, business_name, first_name, last_name, phone, country_code, status, trust_level, created_at, oid)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    spid,
    email,
    business_name || `${effFirst} ${effLast}`.trim(),
    effFirst,
    effLast,
    phone || '',
    country_code || 'SA',
    'active',
    'BIAL-H2',
    new Date().toISOString(),
    oid
  ).run();

  // Send welcome email
  if (env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BrainSAIT <registry@brainsait.org>',
        to: [email],
        subject: `مرحباً بك في BPR — ${spid} | Welcome to BPR`,
        html: `
          <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 2rem;">
            <h1 style="color: #10b981;">مرحباً بك في BrainSAIT Provider Registry</h1>
            <p>تم تسجيلك بنجاح. معرفك:</p>
            <p style="font-size: 1.5rem; color: #10b981; font-family: monospace;">${spid}</p>
            ${oid ? `<p style="color:#555;font-size:.85rem;">OID: <span style="font-family:monospace;">${oid}</span> · <a href="https://registry.brainsait.org/oid/verify/${spid}" style="color:#10b981;">verify</a></p>` : ''}
            <a href="https://registry.brainsait.org/verify/${spid}" style="display: inline-block; background: #10b981; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; margin-top: 1rem;">عرض ملفك</a>
          </div>
        `,
      }),
    });
  }

  return { spid, status: 'active', message: 'Registration successful', oid, buid: buidForSpid(spid) };
}

// ─── Shopify Order Handler ──────────────────────────────

async function handleBPROrderPaid(order: any, env: Env): Promise<any> {
  const customer = order.customer || {};
  const lineItems = order.line_items || [];
  const skus = lineItems.map((li: any) => li.sku || '');

  // Slot marketplace: the request reference arrives either as a line-item
  // property (draft-order path) or as a note attribute (cart-permalink path).
  const noteRef = (order.note_attributes || []).find((a: any) => a.name === 'request_id');
  const propRef = lineItems
    .flatMap((li: any) => li.properties || [])
    .find((p: any) => p.name === 'request_id');
  const requestId = noteRef?.value || propRef?.value;
  if (requestId) {
    return await handleSlotPaid(String(requestId), order, env);
  }

  // Check if this is a BPR product
  const isBPR = skus.some((s: string) => s.includes('BPR'));
  if (!isBPR) {
    return { skipped: true, reason: 'Not a BPR product' };
  }

  // Determine plan type
  const isAnnual = skus.some((s: string) => s.includes('ANNUAL'));
  const isMonthly = skus.some((s: string) => s.includes('MONTHLY'));

  // Register member
  const spid = await mintId('provider', 'SA-PHY', env);

  await env.PLATFORM_DB.prepare(`
    INSERT INTO bpr_memberships (spid, email, business_name, first_name, last_name, order_id, plan_type, status, trust_level, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    spid,
    customer.email,
    `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
    customer.first_name,
    customer.last_name,
    order.id,
    isAnnual ? 'annual' : 'monthly',
    'active',
    'BIAL-H2',
    new Date().toISOString(),
    new Date(Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
  ).run();

  return { spid, status: 'active', plan: isAnnual ? 'annual' : 'monthly' };
}

// ─── MCP Handler ────────────────────────────────────────

async function handleMCP(request: Request, env: Env): Promise<Response> {
  const body = await request.json();

  if (body.method === 'tools/list') {
    return jsonResponse({
      jsonrpc: '2.0',
      id: body.id,
      result: {
        tools: [
          {
            name: 'verify_provider',
            description: 'Verify a healthcare provider by SPID in the BrainSAIT Provider Registry',
            inputSchema: {
              type: 'object',
              properties: { spid: { type: 'string', description: 'Provider SPID (e.g., SA-PHY-000001)' } },
              required: ['spid'],
            },
          },
          {
            name: 'list_providers',
            description: 'List registered healthcare providers',
            inputSchema: {
              type: 'object',
              properties: { limit: { type: 'number', default: 10 } },
            },
          },
          {
            name: 'register_provider',
            description: 'Register a new healthcare provider (admin-gated: requires X-Admin-Token)',
            inputSchema: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                first_name: { type: 'string' },
                last_name: { type: 'string' },
                business_name: { type: 'string' },
              },
              required: ['email', 'first_name', 'last_name'],
            },
          },
          {
            name: 'search_slots',
            description: 'Search live vacancy slots in the marketplace (state/specialty/city/type filters)',
            inputSchema: {
              type: 'object',
              properties: {
                state: { type: 'string', description: 'empty | live | requested | invoiced | verifying' },
                specialty: { type: 'string' },
                city: { type: 'string' },
                type: { type: 'string', description: 'doctor | nurse | ai_agent' },
              },
            },
          },
          {
            name: 'get_slot',
            description: 'Get a single slot by ID with parsed manifest/requirements',
            inputSchema: {
              type: 'object',
              properties: { slot_id: { type: 'string', description: 'slot ID (SA-SLT-000001)' } },
              required: ['slot_id'],
            },
          },
          {
            name: 'get_slot_chain',
            description: 'Full trust chain for a slot: org → slot → holder → delegations (feeds the QR verify page)',
            inputSchema: {
              type: 'object',
              properties: { slot_id: { type: 'string', description: 'slot ID (SA-SLT-000001)' } },
              required: ['slot_id'],
            },
          },
          {
            name: 'request_slot',
            description: 'Request a vacancy slot with your SPID (rate-limited)',
            inputSchema: {
              type: 'object',
              properties: {
                slot_id: { type: 'string' },
                requester_spid: { type: 'string' },
                message: { type: 'string' },
              },
              required: ['slot_id', 'requester_spid'],
            },
          },
        ],
      },
    }, 200);
  }

  if (body.method === 'tools/call') {
    const tool = body.params?.name;
    const args = body.params?.arguments || {};

    let result;

    switch (tool) {
      case 'verify_provider':
        result = await verifyProvider(args.spid, env);
        break;
      case 'list_providers':
        result = await listMembers(env);
        break;
      case 'register_provider':
        if (!isAdmin(request, env)) {
          return jsonResponse({
            jsonrpc: '2.0',
            id: body.id,
            error: { code: -32001, message: 'register_provider requires X-Admin-Token' },
          }, 401);
        }
        result = await registerMember(args, env);
        break;
      case 'search_slots': {
        const u = new URL('https://registry.brainsait.org/slots');
        for (const k of ['state', 'specialty', 'city', 'type']) if (args[k]) u.searchParams.set(k, String(args[k]));
        result = await listSlots(u, env);
        break;
      }
      case 'get_slot': {
        result = (await getSlot(String(args.slot_id), env)).slot ?? { error: 'slot not found' };
        break;
      }
      case 'get_slot_chain': {
        result = await getSlotChain(String(args.slot_id), env);
        break;
      }
      case 'request_slot': {
        result = await createSlotRequest(String(args.slot_id), { spid: args.requester_spid, message: args.message }, env);
        break;
      }
      default:
        return jsonResponse({
          jsonrpc: '2.0',
          id: body.id,
          error: { code: -32601, message: `Unknown tool: ${tool}` },
        }, 200);
    }

    return jsonResponse({
      jsonrpc: '2.0',
      id: body.id,
      result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
    }, 200);
  }

  return jsonResponse({ error: 'Invalid MCP request' }, 400);
}

// ─── Provider Profiles (the 6 W's public page) ─────────

async function getProfile(spid: string, env: Env): Promise<any> {
  const member = await env.PLATFORM_DB.prepare(
    'SELECT spid, business_name, email, status, trust_level, created_at FROM bpr_memberships WHERE spid = ?'
  ).bind(spid).first();
  if (!member) return { error: 'Provider not found' };
  const p = await env.PLATFORM_DB.prepare('SELECT * FROM bpr_profiles WHERE spid = ?').bind(spid).first();
  const parse = (v: unknown) => { try { return v ? JSON.parse(String(v)) : null; } catch { return null; } };
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
    ).bind(spid).all()).results,
  };
}

async function upsertProfile(data: any, env: Env): Promise<any> {
  const spid = String(data?.spid || '');
  if (!spid) return { error: 'missing spid' };
  const member = await env.PLATFORM_DB.prepare('SELECT spid FROM bpr_memberships WHERE spid = ?').bind(spid).first();
  if (!member) return { error: `member ${spid} not found — register first` };
  const now = new Date().toISOString();
  const j = (v: any) => v == null ? null : JSON.stringify(v);
  await env.PLATFORM_DB.prepare(
    `INSERT INTO bpr_profiles (spid, headline, bio, services_json, modes_json, locations_json, availability_json, team_json, pricing_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(spid) DO UPDATE SET headline=excluded.headline, bio=excluded.bio,
       services_json=excluded.services_json, modes_json=excluded.modes_json,
       locations_json=excluded.locations_json, availability_json=excluded.availability_json,
       team_json=excluded.team_json, pricing_json=excluded.pricing_json, updated_at=excluded.updated_at`
  ).bind(spid, data.headline || null, data.bio || null, j(data.services), j(data.modes), j(data.locations), j(data.availability), j(data.team), j(data.pricing), now).run();
  return { spid, profile: 'saved', url: `https://registry.brainsait.org/p/${spid}` };
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

async function renderProfilePage(spid: string, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const d = await getProfile(spid, env);
  if (d.error) return new Response('Not found', { status: 404, headers: corsHeaders });

  const section = (icon: string, en: string, ar: string, inner: string) => `
    <section class="card">
      <h2><span class="ic">${icon}</span> ${en} <span class="ar">${ar}</span></h2>
      ${inner}
    </section>`;
  const li = (arr: any[], render: (x: any) => string) =>
    arr?.length ? `<ul>${arr.map((x) => `<li>${render(x)}</li>`).join('')}</ul>` : '<p class="dim">—</p>';

  const what = li(d.services || [], (s) => esc(s));
  const how = li(d.modes || [], (m) => esc(String(m).replace(/_/g, ' ')));
  const where = li(d.locations || [], (l) => esc(`${l.org || ''}${l.branch ? ' — ' + l.branch : ''}${l.city ? ' · ' + l.city : ''}`));
  const when = d.availability
    ? `<ul>${Object.entries(d.availability).map(([k, v]) => `<li><b>${esc(k)}:</b> ${esc(Array.isArray(v) ? v.join(', ') : v)}</li>`).join('')}</ul>` : '<p class="dim">—</p>';
  // Who assists — data comes as [{count,role,source}] OR plain strings; normalize.
  const who = li(d.team || [], (t: any) => {
    if (typeof t === 'string') return esc(t);
    return esc(`${t.count ? t.count + '× ' : ''}${t.role ?? ''}${t.source ? ' (' + t.source + ')' : ''}`);
  });
  const pricing = d.pricing
    ? `<table class="price">${Object.entries(d.pricing).map(([k, v]) =>
        `<tr><td>${esc(k.replace(/_/g, ' '))}</td><td class="num">${typeof v === 'number' ? esc(v.toLocaleString()) + ' SAR' : esc(v)}</td></tr>`).join('')}</table>`
    : '<p class="dim">—</p>';
  const slots = li(d.slots_held || [], (s) => `${esc(s.title)} <span class="pill">${esc(s.state)}</span>`);

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.name)} — BrainSAIT Provider</title>
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
    <span class="badge">✓ VERIFIED · ${esc(d.trust_level)}</span>
    <h1>${esc(d.name)}</h1>
    <div class="headline">${esc(d.headline || 'Healthcare Provider')}</div>
    <div class="spid">${esc(d.spid)}</div>
    ${d.bio ? `<p class="bio">${esc(d.bio)}</p>` : ''}
  </header>
  ${section('🩺', 'What I provide', 'ماذا أقدم', what)}
  ${section('⚙️', 'How I provide it', 'كيف', how)}
  ${section('📍', 'Where', 'أين', where)}
  ${section('🕐', 'When', 'متى', when)}
  ${section('🤝', 'Who assists', 'فريق العمل', who)}
  ${section('💰', 'Engagement pricing for hospital admins', 'التكلفة للمستشفيات', pricing)}
  ${d.slots_held?.length ? section('🗂', 'Active slots', 'العقود النشطة', slots) : ''}
  <a class="cta" href="mailto:${esc(d.spid)}@providers.brainsait.org?subject=Slot%20request%20for%20${encodeURIComponent(spid)}">Request this operator · اطلب هذا المزود</a>
  <a class="verify" href="/verify/${esc(spid)}">Verify this profile (JSON) · التحقق</a>
</div></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } });
}

function jsonResponse(data: unknown, status: number, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// ─── OID Registry Landing (validated namespace tree) ────
function renderOidLanding(): string {
  const leafCard = (l: { arc: number; identifier: string; description: string; spid: string; status: string }) => {
    const oid = `${OID_ROOT}.${l.arc}`;
    const badge = l.status === 'active-approved-test-only'
      ? '<span class="tag test">TEST</span>'
      : '<span class="tag">APPROVED</span>';
    return `
    <div class="leaf">
      <div class="lrow"><span class="mono">${oid}</span>${badge}</div>
      <div class="lid">${l.identifier} <span class="dim">· ${l.spid}</span></div>
      <div class="ldesc">${l.description}</div>
      <a class="dim" href="https://oid-base.com/get/${oid}" rel="noopener" target="_blank">oid-base ↗</a>
    </div>`;
  };
  const allocRow = (k: string, v: string) => `<div class="arow"><span class="mono">${k}</span><span class="dim">${v}</span></div>`;
  const jurRows = Object.entries(JUR_ARCS).map(([k, v]) => allocRow(k, `${OID_ROOT}.${v}`)).join('');
  const clsRows = Object.entries(CLASS_ARCS).map(([k, v]) => allocRow(k, `<jur>.${v}`)).join('');

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BrainSAIT OID Registry — ${OID_ROOT}</title>
<meta name="description" content="BrainSAIT Identity Fabric — validated OID namespace tree rooted at ${OID_ROOT} (PEN ${OID_PEN}). Saudi healthcare provider registry, OID allocation, verification.">
<style>
  :root { --g: #10b981; --bg: #0b1220; --card: #111a2e; --txt: #e5e7eb; --dim: #8b98b8; }
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--bg); color: var(--txt); font-family: system-ui, 'IBM Plex Sans Arabic', sans-serif; line-height: 1.6; }
  .wrap { max-width: 1060px; margin: 0 auto; padding: 2rem 1rem 4rem; }
  header { text-align: center; padding: 2.5rem 0 1.6rem; }
  .badge { display: inline-block; background: var(--g); color: #04220f; font-weight: 700; font-size: .75rem; padding: .25rem .8rem; border-radius: 999px; letter-spacing: .05em; }
  h1 { font-size: 2rem; margin: .8rem 0 .2rem; }
  .headline { color: var(--g); font-size: 1.05rem; }
  .oid { font-family: ui-monospace, monospace; color: var(--dim); font-size: .95rem; margin-top: .6rem; }
  .ar { direction: rtl; color: var(--dim); font-size: .95rem; margin-top: .2rem; }
  .card { background: var(--card); border: 1px solid #1f2b47; border-radius: 14px; padding: 1.3rem 1.5rem; margin-top: 1.2rem; }
  h2 { font-size: .95rem; text-transform: uppercase; letter-spacing: .08em; margin-bottom: .8rem; }
  a { color: var(--g); }
  ul { padding-left: 1.2rem; } li { margin: .3rem 0; }
  .dim { color: var(--dim); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: .8rem; }
  .leaf { background: #0d1526; border: 1px solid #1c2942; border-radius: 10px; padding: .8rem .95rem; }
  .lrow { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
  .mono { font-family: ui-monospace, monospace; font-size: .82rem; color: var(--txt); }
  .tag { background: #0e3b2e; color: var(--g); font-size: .62rem; font-weight: 700; padding: .12rem .5rem; border-radius: 999px; letter-spacing: .06em; white-space: nowrap; }
  .tag.test { background: #3b2e0e; color: #d4a72c; }
  .lid { font-weight: 600; margin-top: .3rem; font-size: .92rem; }
  .ldesc { color: var(--dim); font-size: .8rem; margin-top: .15rem; }
  .leaf a { font-size: .78rem; }
  .alloc { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
  @media (max-width: 700px) { .alloc { grid-template-columns: 1fr; } }
  .arow { display: flex; justify-content: space-between; gap: .8rem; font-size: .85rem; padding: .22rem 0; border-bottom: 1px dashed #1c2942; }
  footer { text-align: center; color: var(--dim); font-size: .8rem; margin-top: 2.5rem; }
</style></head><body><div class="wrap">
  <header>
    <span class="badge">BRAINSAIT OID REGISTRY</span>
    <h1>BrainSAIT Identity Fabric</h1>
    <div class="headline">Validated OID namespace · ${OID_ORGANIZATION} · PEN ${OID_PEN}</div>
    <div class="ar">نسيج الهوية — شجرة معرّفات OID المعتمدة</div>
    <div class="oid">Root: ${OID_ROOT} · RA: ${OID_RA} · validated ${OID_VALIDATED_DATE}</div>
  </header>

  <section class="card">
    <h2>Validated namespace tree — 20 leaves</h2>
    <div class="grid">${VALIDATED_OID_LEAVES.map(leafCard).join('')}</div>
  </section>

  <section class="card">
    <h2>Provider (BPR) allocation</h2>
    <p class="dim" style="margin-bottom:.7rem;font-size:.85rem">Provider identities allocate <span class="mono">${OID_ROOT}.&lt;jurisdiction&gt;.&lt;class&gt;.&lt;seq&gt;</span> — e.g. <span class="mono">SA-PHY-000001 → ${OID_ROOT}.2.3.1</span>. Sequence is per (jurisdiction, class branch).</p>
    <div class="alloc">
      <div><h2 style="font-size:.8rem">Jurisdictions</h2>${jurRows}</div>
      <div><h2 style="font-size:.8rem">Entity classes</h2>${clsRows}</div>
    </div>
  </section>

  <section class="card">
    <h2>Registry endpoints</h2>
    <ul>
      <li><a href="/oid/leaves">/oid/leaves</a> <span class="dim">— validated tree + allocation map (JSON)</span></li>
      <li>/oid/verify/{spid} <span class="dim">— member OID + oid-base arc verification (JSON)</span></li>
      <li><a href="/p/SA-PHY-000001">/p/{spid}</a> <span class="dim">— provider profile (HTML)</span></li>
      <li><a href="/verify/SA-PHY-000001">/verify/{spid}</a> <span class="dim">— public verification (JSON)</span></li>
      <li><a href="/slots">/slots</a> <span class="dim">— vacancy slot marketplace</span></li>
      <li><a href="/members">/members</a> <span class="dim">— registry members (JSON)</span></li>
      <li><a href="https://id.brainsait.org">id.brainsait.org</a> <span class="dim">— canonical identity resolver</span></li>
      <li><a href="https://verify.brainsait.org">verify.brainsait.org</a> <span class="dim">— QR + trust chain</span></li>
    </ul>
  </section>

  <footer>BrainSAIT Ltd · registry.brainsait.org · <a href="https://oid-base.com/get/${OID_ROOT}">oid-base record ↗</a></footer>
</div></body></html>`;
}

// Verify OID arc exists on oid-base.com
// NOTE: oid-base.com discards requests without a User-Agent header (404), and
// Cloudflare strips UA on outbound fetches by default — send one explicitly.
async function verifyOidArc(arc: number): Promise<boolean> {
  try {
    const res = await fetch(`https://oid-base.com/get-md/${OID_ROOT}.${arc}`, {
      headers: { 'User-Agent': 'brainsait-bpr-registry/1.0 (+https://registry.brainsait.org)' },
    });
    if (!res.ok) return false;
    const text = await res.text();
    // Body uses `oid: "1.3.6.1.4.1.61026.<arc>"` in its YAML front-matter — anchor to that, not a loose substring,
    // so arc 20 can't be satisfied by a page that merely mentions 1.3.6.1.4.1.61026.2.
    const re = new RegExp(`^\\s*oid:\\s*"1\\.3\\.6\\.1\\.4\\.1\\.61026\\.${arc}"\\s*$`, 'm');
    return re.test(text);
  } catch (e) {
    return false;
  }
}
