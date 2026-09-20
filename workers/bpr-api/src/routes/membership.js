// BPR Membership / plans — pricing source of truth + entitlement activation + gating.
// Routes: /membership/*

import { json, badRequest, methodNotAllowed, unauthorized, forbidden, readJsonBody } from '../lib/http.js';
import { getCurrentUser } from '../lib/auth.js';

// Single source of truth for BPR pricing (mirrors catalog.json + Shopify variants + MyFatoorah TIERS).
export const PLANS = [
  {
    id: 'annual',
    label: 'Annual — Recommended',
    labelAr: 'سنوي — موصى به',
    priceSAR: 3960,
    billing: 'annually',
    intervalDays: 365,
    audience: 'all healthcare workers',
  },
  {
    id: 'monthly',
    label: 'Monthly — Junior',
    labelAr: 'شهري — للمبتدئين',
    priceSAR: 163,
    billing: 'monthly',
    intervalDays: 30,
    audience: 'junior / early-career workers',
  },
];

export async function handleMembership(request, env, subpath) {
  if (subpath === '/plans' && request.method === 'GET') return json({ plans: PLANS, currency: 'SAR' });
  if (subpath === '/activate' && request.method === 'POST') return activate(request, env);
  if (subpath === '/status' && request.method === 'GET') return status(request, env);
  return methodNotAllowed();
}

// Returns the requesting user's provider plan (or the requested SPID's public plan state).
async function status(request, env) {
  const url = new URL(request.url);
  const spid = url.searchParams.get('spid');
  if (!spid) {
    const user = await getCurrentUser(request, env);
    if (!user) return unauthorized();
    const row = await env.DB.prepare(
      'SELECT spid, plan_tier, plan_status, plan_expires_at FROM providers WHERE owner_user_id=? LIMIT 1'
    ).bind(user.id).first();
    return json({ spid: row?.spid ?? null, plan: row ?? { plan_tier: 'free', plan_status: 'none' } });
  }
  const row = await env.DB.prepare(
    'SELECT spid, plan_tier, plan_status, plan_expires_at FROM providers WHERE spid=?'
  ).bind(spid).first();
  return json({ spid, plan: row ?? { plan_tier: 'free', plan_status: 'none' } });
}

// Owner activates a plan after a verified checkout. `reference` is the Shopify
// draft-order id / MyFatoorah InvoiceId / accessKey used for reconciliation.
async function activate(request, env) {
  const user = await getCurrentUser(request, env);
  if (!user) return unauthorized();

  const body = await readJsonBody(request);
  const spid = String(body?.spid || '');
  const tier = String(body?.tier || '');
  const reference = String(body?.reference || '');
  if (!spid || !tier || !reference) return badRequest('spid_tier_reference_required');

  const plan = PLANS.find((p) => p.id === tier);
  if (!plan) return badRequest('unknown_tier');

  const existing = await env.DB.prepare('SELECT owner_user_id FROM providers WHERE spid=?').bind(spid).first();
  if (!existing) return badRequest('provider_not_found');
  if (existing.owner_user_id !== user.id) return forbidden('not_owner');

  const now = new Date();
  const expires = new Date(now.getTime() + plan.intervalDays * 86400000);

  await env.DB.prepare(
    'UPDATE providers SET plan_tier=?, plan_status=?, plan_expires_at=?, profile_status=CASE WHEN ?=1 THEN profile_status ELSE profile_status END, updated_at=? WHERE spid=?'
  ).bind(tier, 'active', expires.toISOString(), 1, now.toISOString(), spid).run();

  // Record an audit trail referencing the checkout.
  await env.DB.prepare(
    'INSERT INTO audit_events (id, actor_user_id, action, resource_type, resource_id, metadata, created_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(crypto.randomUUID(), user.id, 'membership.activate', 'provider', spid, JSON.stringify({ tier, reference, expires: expires.toISOString() }), now.toISOString()).run();

  return json({
    ok: true,
    spid,
    plan: { tier, status: 'active', expires_at: expires.toISOString(), price_sar: plan.priceSAR },
    reference,
  });
}
