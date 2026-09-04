// /auth/* routes: request magic link, confirm token, session me/logout

import { json, badRequest, methodNotAllowed, unauthorized, readJsonBody } from '../lib/http.js';
import { randomId, sha256Hex, signSessionToken, sendMagicLinkEmail, getCurrentUser } from '../lib/auth.js';

export async function handleAuth(request, env, subpath) {
  if (subpath === '/request' && request.method === 'POST') return authRequest(request, env);
  if (subpath === '/confirm' && request.method === 'POST') return authConfirm(request, env);
  if (subpath === '/me' && request.method === 'GET') return authMe(request, env);
  if (subpath === '/logout' && request.method === 'POST') return authLogout(request, env);
  return methodNotAllowed();
}

async function authRequest(request, env) {
  const body = await readJsonBody(request);
  const email = String(body?.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest('invalid_email');

  const purpose = body?.purpose === 'verify_email' ? 'verify_email' : 'login';
  const ttl = Number(env.MAGIC_LINK_TTL_SECONDS || 900);
  const now = Date.now();
  const expiresAt = new Date(now + ttl * 1000).toISOString();
  const rawToken = randomId(24);
  const tokenHash = await sha256Hex(rawToken);
  const id = randomId(16);

  // Upsert user stub on login flow so first-time users get created lazily at confirm.
  // For verify_email we require existing user; handled at confirm step.
  await env.DB.prepare(
    `INSERT INTO magic_links (id, email, token_hash, purpose, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, email, tokenHash, purpose, expiresAt, new Date(now).toISOString()).run();

  try {
    await sendMagicLinkEmail(env, email, rawToken, purpose);
  } catch (e) {
    console.error('sendMagicLinkEmail failed', e);
    return json({ error: 'email_send_failed' }, 502);
  }
  return json({ ok: true, sent: true, purpose });
}

async function authConfirm(request, env) {
  const body = await readJsonBody(request);
  const rawToken = String(body?.token || '').trim();
  const purpose = body?.purpose === 'verify_email' ? 'verify_email' : 'login';
  if (!rawToken) return badRequest('missing_token');

  const tokenHash = await sha256Hex(rawToken);
  const row = await env.DB.prepare(
    `SELECT id, email, purpose, expires_at, used_at FROM magic_links WHERE token_hash=? AND purpose=?`
  ).bind(tokenHash, purpose).first();

  if (!row) return badRequest('invalid_or_expired_token');
  if (row.used_at) return badRequest('token_already_used');
  if (new Date(row.expires_at).getTime() < Date.now()) return badRequest('invalid_or_expired_token');

  const email = row.email;
  const nowIso = new Date().toISOString();

  // Mark used
  await env.DB.prepare('UPDATE magic_links SET used_at=? WHERE id=?').bind(nowIso, row.id).run();

  // Upsert user
  let user = await env.DB.prepare('SELECT id,email,email_verified FROM users WHERE email=?').bind(email).first();
  if (!user) {
    const uid = randomId(16);
    await env.DB.prepare(
      `INSERT INTO users (id,email,email_verified,created_at,updated_at) VALUES (?,?,1,?,?)`
    ).bind(uid, email, nowIso, nowIso).run();
    user = { id: uid, email, email_verified: 1 };
  } else if (purpose === 'verify_email' && !user.email_verified) {
    await env.DB.prepare('UPDATE users SET email_verified=1, updated_at=? WHERE id=?').bind(nowIso, user.id).run();
    user.email_verified = 1;
  }

  // Create session
  const sid = randomId(16);
  const sessionTtl = Number(env.SESSION_TTL_SECONDS || 2592000);
  const exp = Math.floor(Date.now() / 1000) + sessionTtl;
  const secret = env.SESSION_SIGNING_SECRET;
  if (!secret) return json({ error: 'server_misconfigured' }, 500);
  const token = await signSessionToken({ uid: user.id, email: user.email, exp }, secret);
  const tokenHashSession = await sha256Hex(token);
  await env.DB.prepare(
    `INSERT INTO sessions (id,user_id,token_hash,expires_at,created_at) VALUES (?,?,?,?,?)`
  ).bind(sid, user.id, tokenHashSession, new Date(exp * 1000).toISOString(), nowIso).run();

  // Audit
  await env.DB.prepare(
    `INSERT INTO audit_events (id,actor_user_id,action,resource_type,resource_id,metadata,created_at)
     VALUES (?,?,?,?,?,?,?)`
  ).bind(randomId(16), user.id, 'login', 'session', sid, JSON.stringify({ purpose }), nowIso).run();

  return json({ ok: true, token, user: { id: user.id, email: user.email, email_verified: !!user.email_verified } });
}

async function authMe(request, env) {
  const user = await getCurrentUser(request, env);
  if (!user) return unauthorized();
  return json({ user });
}

async function authLogout(request, env) {
  const auth = request.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m) {
    const tokenHash = await sha256Hex(m[1]);
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(tokenHash).run();
  }
  return json({ ok: true });
}

