// /verify/* routes: public verification view + QR payload for a SPID

import { json, notFound, methodNotAllowed } from '../lib/http.js';

export async function handleVerify(request, env, subpath) {
  if (request.method !== 'GET') return methodNotAllowed();
  // Expect /verify/SA-PHY-000001 or /verify/SA-PHY-000001/qr
  const parts = subpath.split('/').filter(Boolean);
  if (!parts.length) return notFound('missing_spid');
  const spid = parts[0];
  const mode = parts[1] || 'summary';

  const provider = await env.DB.prepare(
    'SELECT spid,oid,provider_type,name_english,name_arabic,title_en,specialty,verification_status,profile_status,updated_at FROM providers WHERE spid=?'
  ).bind(spid).first();
  if (!provider) return notFound('provider_not_found');

  const claims = (await env.DB.prepare(
    'SELECT claim_type,issuer,status,issued_at,expires_at,last_checked_at FROM verification_claims WHERE spid=? ORDER BY issued_at DESC'
  ).bind(spid).all()).results || [];

  const identifiers = (await env.DB.prepare(
    'SELECT system,value,verified,source,verified_at FROM provider_identifiers WHERE spid=? ORDER BY created_at'
  ).bind(spid).all()).results || [];

  const primaryLocation = await env.DB.prepare(
    'SELECT organization_name_en,city,region,country FROM provider_locations WHERE spid=? AND is_primary=1 LIMIT 1'
  ).bind(spid).first();

  const summary = {
    spid: provider.spid,
    oid: provider.oid,
    provider_type: provider.provider_type,
    name_english: provider.name_english,
    name_arabic: provider.name_arabic,
    title_en: provider.title_en,
    specialty: provider.specialty,
    verification_status: provider.verification_status,
    profile_status: provider.profile_status,
    primary_location: primaryLocation || null,
    claims_summary: summarizeClaims(claims),
    updated_at: provider.updated_at,
  };

  if (mode === 'qr') {
    // Compact payload suitable for QR encoding on client side
    return json({
      v: 1,
      spid: summary.spid,
      oid: summary.oid,
      vs: summary.verification_status,
      type: summary.provider_type,
      name: summary.name_english,
      spec: summary.specialty || null,
      org: primaryLocation?.organization_name_en || null,
      city: primaryLocation?.city || null,
      url: `${env.APP_ORIGIN || 'https://registry.brainsait.org'}/providers/${summary.spid}`,
      ts: Date.now(),
    });
  }

  return json({ ...summary, claims, identifiers });
}

function summarizeClaims(claims) {
  const out = {};
  for (const c of claims) {
    if (!out[c.claim_type]) out[c.claim_type] = { count: 0, latest_status: null, latest_issued_at: null };
    out[c.claim_type].count += 1;
    if (!out[c.claim_type].latest_issued_at || c.issued_at > out[c.claim_type].latest_issued_at) {
      out[c.claim_type].latest_status = c.status;
      out[c.claim_type].latest_issued_at = c.issued_at;
    }
  }
  return out;
}

