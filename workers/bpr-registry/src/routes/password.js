// Password authentication routes: /auth/password/*

import { json, badRequest, methodNotAllowed, unauthorized, readJsonBody } from '../lib/http.js';
import { randomId, sha256Hex, signSessionToken } from '../lib/auth.js';

export async function handlePasswordAuth(request, env, subpath) {
  if (subpath === '/request' && request.method === 'POST') return passwordRequest(request, env);
  if (subpath === '/confirm' && request.method === 'POST') return passwordConfirm(request, env);
  return methodNotAllowed();
}

async function passwordRequest(request, env) {
  const body = await readJsonBody(request);
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  if (!email || !password) return badRequest('email_and_password_required');

  // Look up user
  const user = await env.DB.prepare('SELECT id, email, email_verified FROM users WHERE email=?').bind(email).first();
  if (!user) return badRequest('invalid_credentials');

  // Verify password (SHA-256 for demo; bcrypt/argon2 in production)
  const passwordHash = await sha256Hex(password);
  
  // Check stored hash
  const stored = await env.DB.prepare('SELECT password_hash FROM users WHERE id=?').bind(user.id).first();
  if (!stored || stored.password_hash !== passwordHash) {
    return badRequest('invalid_credentials');
  }

  // Set password hash for first-time users
  if (!stored) {
    await env.DB.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(passwordHash, user.id).run();
  }

  // Issue session
  const token = await createSession(user.id, user.email, env);
  return json({ ok: true, token, user: { id: user.id, email: user.email } });
}

async function passwordConfirm(request, env) {
  return json({ message: 'Use /auth/password/request for authentication' }, 200);
}

async function createSession(userId, email, env) {
  const sid = randomId(16);
  const sessionTtl = Number(env.SESSION_TTL_SECONDS || 2592000);
  const exp = Math.floor(Date.now() / 1000) + sessionTtl;
  const secret = env.SESSION_SIGNING_SECRET;
  if (!secret) throw new Error('server_misconfigured');
  const token = await signSessionToken({ uid: userId, email, exp }, secret);
  const tokenHash = await sha256Hex(token);
  await env.DB.prepare(
    'INSERT INTO sessions (id,user_id,token_hash,expires_at,created_at) VALUES (?,?,?,?,?)'
  ).bind(sid, userId, tokenHash, new Date(exp * 1000).toISOString(), new Date().toISOString()).run();
  return token;
}