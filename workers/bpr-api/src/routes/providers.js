// /providers/* routes: CRUD + SPID/OID allocation + identifiers/locations/claims sub-resources

import { json, badRequest, methodNotAllowed, notFound, unauthorized, forbidden, readJsonBody } from '../lib/http.js';
import { randomId, getCurrentUser } from '../lib/auth.js';

const VALID_TYPES = ['physician','dentist','pharmacist','nurse','allied-health','technician','other'];
const TYPE_PREFIX = {
  physician:'PHY', dentist:'DEN', pharmacist:'PHA',
  nurse:'NUR', 'allied-health':'ALH', technician:'TEC', other:'OTH'
};
const OID_PRACTITIONER_BRANCH = '3'; // 1.3.6.1.4.1.61026.3.* per approved hierarchy

export async function handleProviders(request, env, subpath) {
  const user = await getCurrentUser(request, env);
  // Public read for listing/get; writes require auth
  if (request.method === 'GET') {
    if (subpath === '/' || subpath === '') return listProviders(request, env);
    if (/^\/[A-Z]{2,4}-[A-Z]+-\d+$/.test(subpath)) return getProvider(env, subpath.slice(1));
    if (/^\/[A-Z]{2,4}-[A-Z]+-\d+\/identifiers$/.test(subpath)) return listIdentifiers(env, spidFrom(subpath));
    if (/^\/[A-Z]{2,4}-[A-Z]+-\d+\/locations$/.test(subpath)) return listLocations(env, spidFrom(subpath));
    if (/^\/[A-Z]{2,4}-[A-Z]+-\d+\/claims$/.test(subpath)) return listClaims(env, spidFrom(subpath));
    return notFound();
  }
  if (!user) return unauthorized();
  if (request.method === 'POST' && (subpath === '/' || subpath === '')) return createProvider(request, env, user);
  if (request.method === 'PATCH' && /^\/[A-Z]{2,4}-[A-Z]+-\d+$/.test(subpath)) return updateProvider(request, env, user, subpath.slice(1));
  if (request.method === 'POST' && /^\/[A-Z]{2,4}-[A-Z]+-\d+\/identifiers$/.test(subpath)) return addIdentifier(request, env, user, spidFrom(subpath));
  if (request.method === 'POST' && /^\/[A-Z]{2,4}-[A-Z]+-\d+\/locations$/.test(subpath)) return addLocation(request, env, user, spidFrom(subpath));
  if (request.method === 'POST' && /^\/[A-Z]{2,4}-[A-Z]+-\d+\/claims$/.test(subpath)) return addClaim(request, env, user, spidFrom(subpath));
  return methodNotAllowed();
}

function spidFrom(path) {
  return path.split('/')[1];
}

async function listProviders(request, env) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const type = url.searchParams.get('type');
  const specialty = url.searchParams.get('specialty');
  const city = url.searchParams.get('city');
  const verified = url.searchParams.get('verified');
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);
  const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0);

  const clauses = ["profile_status='published'"];
  const binds = [];
  if (type && VALID_TYPES.includes(type)) { clauses.push('provider_type=?'); binds.push(type); }
  if (specialty) { clauses.push('specialty=?'); binds.push(specialty); }
  if (verified === 'true') { clauses.push("verification_status='verified'"); }
  if (q) {
    clauses.push("(lower(name_english) LIKE ? OR lower(name_arabic) LIKE ? OR lower(specialty) LIKE ?)");
    binds.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const countRow = await env.DB.prepare(`SELECT COUNT(*) as c FROM providers ${where}`).bind(...binds).first();
  const rows = await env.DB.prepare(
    `SELECT spid,oid,provider_type,name_english,name_arabic,title_en,specialty,subspecialty,verification_status,profile_status,updated_at
     FROM providers ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`
  ).bind(...binds, limit, offset).all();

  // Enrich with primary location city when present
  const items = [];
  for (const p of (rows.results || [])) {
    const loc = await env.DB.prepare(
      "SELECT city,region,organization_name_en FROM provider_locations WHERE spid=? AND is_primary=1 LIMIT 1"
    ).bind(p.spid).first();
    items.push({ ...p, primary_location: loc || null });
  }
  return json({ items, total: countRow?.c || 0, limit, offset });
}

async function getProvider(env, spid) {
  const p = await env.DB.prepare('SELECT * FROM providers WHERE spid=?').bind(spid).first();
  if (!p) return notFound('provider_not_found');
  const identifiers = (await env.DB.prepare('SELECT * FROM provider_identifiers WHERE spid=? ORDER BY created_at').bind(spid).all()).results || [];
  const locations = (await env.DB.prepare('SELECT * FROM provider_locations WHERE spid=? ORDER BY is_primary DESC, created_at').bind(spid).all()).results || [];
  const claims = (await env.DB.prepare('SELECT * FROM verification_claims WHERE spid=? ORDER BY issued_at DESC').bind(spid).all()).results || [];
  return json({ provider: p, identifiers, locations, claims });
}

async function createProvider(request, env, user) {
  const body = await readJsonBody(request);
  const type = body?.provider_type;
  if (!VALID_TYPES.includes(type)) return badRequest('invalid_provider_type');
  const nameEn = String(body?.name_english || '').trim();
  if (!nameEn) return badRequest('missing_name_english');

  // Allocate SPID + OID atomically
  const seq = await env.DB.prepare('SELECT next_num FROM spid_sequences WHERE provider_type=?').bind(type).first();
  if (!seq) return badRequest('invalid_provider_type');
  const num = Number(seq.next_num);
  const padded = String(num).padStart(6, '0');
  const prefix = TYPE_PREFIX[type] || 'OTH';
  const spid = `SA-${prefix}-${padded}`;
  const oidRoot = env.OID_ROOT || '1.3.6.1.4.1.61026';
  const oid = `${oidRoot}.${OID_PRACTITIONER_BRANCH}.${num}`;

  // Reserve sequence before insert
  await env.DB.prepare('UPDATE spid_sequences SET next_num=? WHERE provider_type=?').bind(num + 1, type).run();

  const nowIso = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO providers (spid,oid,provider_type,name_english,name_arabic,title_en,title_ar,specialty,subspecialty,
       gender,primary_email,bio_en,bio_ar,website_url,orcid,npi,scfhs_file_number,gravatar_email,
       owner_user_id,profile_status,verification_status,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    spid, oid, type, nameEn, body?.name_arabic||null, body?.title_en||null, body?.title_ar||null,
    body?.specialty||null, body?.subspecialty||null, body?.gender||null,
    body?.primary_email||null, body?.bio_en||null, body?.bio_ar||null, body?.website_url||null,
    body?.orcid||null, body?.npi||null, body?.scfhs_file_number||null, body?.gravatar_email||null,
    user.id, 'draft', 'unverified', nowIso, nowIso
  ).run();

  // Auto-add BrainSAIT OID identifier record
  await env.DB.prepare(
    `INSERT INTO provider_identifiers (id,spid,system,value,display,verified,source,issued_at,created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).bind(randomId(16), spid, 'BRAINSAIT_OID', oid, oid, 1, 'BrainSAIT Registry', nowIso, nowIso).run();

  // Audit
  await env.DB.prepare(
    `INSERT INTO audit_events (id,actor_user_id,action,resource_type,resource_id,metadata,created_at)
     VALUES (?,?,?,?,?,?,?)`
  ).bind(randomId(16), user.id, 'create', 'provider', spid, JSON.stringify({ type }), nowIso).run();

  return json({ ok: true, spid, oid }, 201);
}

async function updateProvider(request, env, user, spid) {
  const existing = await env.DB.prepare('SELECT owner_user_id,profile_status FROM providers WHERE spid=?').bind(spid).first();
  if (!existing) return notFound('provider_not_found');
  if (existing.owner_user_id !== user.id) return forbidden('not_owner');

  const body = await readJsonBody(request);
  const allowed = ['name_english','name_arabic','title_en','title_ar','specialty','subspecialty','gender',
    'primary_email','primary_phone_e164','bio_en','bio_ar','website_url','orcid','npi','scfhs_file_number','gravatar_email','profile_status'];
  const sets = [];
  const binds = [];
  for (const k of allowed) {
    if (k in body) { sets.push(`${k}=?`); binds.push(body[k]); }
  }
  if (!sets.length) return badRequest('no_fields_to_update');
  sets.push('updated_at=?'); binds.push(new Date().toISOString());
  binds.push(spid);
  await env.DB.prepare(`UPDATE providers SET ${sets.join(',')} WHERE spid=?`).bind(...binds).run();
  return json({ ok: true, spid });
}

async function listIdentifiers(env, spid) {
  const rows = await env.DB.prepare('SELECT * FROM provider_identifiers WHERE spid=? ORDER BY created_at').bind(spid).all();
  return json({ items: rows.results || [] });
}

async function addIdentifier(request, env, user, spid) {
  const existing = await env.DB.prepare('SELECT owner_user_id FROM providers WHERE spid=?').bind(spid).first();
  if (!existing) return notFound('provider_not_found');
  if (existing.owner_user_id !== user.id) return forbidden('not_owner');

  const body = await readJsonBody(request);
  const system = String(body?.system || '').trim();
  const value = String(body?.value || '').trim();
  if (!system || !value) return badRequest('missing_system_or_value');
  const nowIso = new Date().toISOString();
  const id = randomId(16);
  try {
    await env.DB.prepare(
      `INSERT INTO provider_identifiers (id,spid,system,value,display,verified,source,issued_at,created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).bind(id, spid, system, value, body?.display||null, body?.verified?1:0, body?.source||null, body?.issued_at||nowIso, nowIso).run();
  } catch (e) {
    if (String(e?.message || '').includes('UNIQUE')) return badRequest('identifier_already_exists');
    throw e;
  }
  return json({ ok: true, id }, 201);
}

async function listLocations(env, spid) {
  const rows = await env.DB.prepare('SELECT * FROM provider_locations WHERE spid=? ORDER BY is_primary DESC, created_at').bind(spid).all();
  return json({ items: rows.results || [] });
}

async function addLocation(request, env, user, spid) {
  const existing = await env.DB.prepare('SELECT owner_user_id FROM providers WHERE spid=?').bind(spid).first();
  if (!existing) return notFound('provider_not_found');
  if (existing.owner_user_id !== user.id) return forbidden('not_owner');

  const body = await readJsonBody(request);
  const nowIso = new Date().toISOString();
  const id = randomId(16);
  await env.DB.prepare(
    `INSERT INTO provider_locations (id,spid,organization_name_en,organization_name_ar,facility_oid,role_en,role_ar,
       city,region,country,address_line1,postal_code,latitude,longitude,phone_e164,is_primary,start_date,end_date,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, spid, body?.organization_name_en||null, body?.organization_name_ar||null, body?.facility_oid||null,
    body?.role_en||null, body?.role_ar||null, body?.city||null, body?.region||null, body?.country||'SA',
    body?.address_line1||null, body?.postal_code||null, body?.latitude||null, body?.longitude||null,
    body?.phone_e164||null, body?.is_primary?1:0, body?.start_date||null, body?.end_date||null, nowIso
  ).run();
  return json({ ok: true, id }, 201);
}

async function listClaims(env, spid) {
  const rows = await env.DB.prepare('SELECT * FROM verification_claims WHERE spid=? ORDER BY issued_at DESC').bind(spid).all();
  return json({ items: rows.results || [] });
}

async function addClaim(request, env, user, spid) {
  const existing = await env.DB.prepare('SELECT owner_user_id FROM providers WHERE spid=?').bind(spid).first();
  if (!existing) return notFound('provider_not_found');
  if (existing.owner_user_id !== user.id) return forbidden('not_owner');

  const body = await readJsonBody(request);
  const claimType = body?.claim_type;
  const issuer = String(body?.issuer || '').trim();
  if (!claimType || !issuer) return badRequest('missing_claim_type_or_issuer');
  const nowIso = new Date().toISOString();
  const id = randomId(16);
  await env.DB.prepare(
    `INSERT INTO verification_claims (id,spid,claim_type,issuer,subject_field,status,evidence_url,evidence_hash,
       issued_at,expires_at,last_checked_at,created_by_user_id,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, spid, claimType, issuer, body?.subject_field||null, body?.status||'pending',
    body?.evidence_url||null, body?.evidence_hash||null, body?.issued_at||nowIso,
    body?.expires_at||null, body?.last_checked_at||null, user.id, nowIso, nowIso
  ).run();
  return json({ ok: true, id }, 201);
}

