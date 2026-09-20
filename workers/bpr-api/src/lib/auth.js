// Auth + crypto helpers for BPR API (Cloudflare Workers runtime)

const encoder = new TextEncoder();

export function randomId(bytes = 16) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, b => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256Hex(value) {
  const data = encoder.encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

export async function signSessionToken(payload, secret) {
  // HMAC-SHA256 signed JSON token: header.payload.signature (base64url)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${header}.${body}.${sig}`;
}

export async function verifySessionToken(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`));
  const expectedB64 = btoa(String.fromCharCode(...new Uint8Array(expected)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (expectedB64 !== sig) return null;
  try {
    const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() > payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function gravatarHash(email) {
  // We compute async via sha256Hex elsewhere; Gravatar uses MD5 but we store SHA-256 for safety
  // and map to gravatar URL at read time. This helper is sync placeholder.
  return email ? String(email).trim().toLowerCase() : '';
}

export async function sendMagicLinkEmail(env, toEmail, token, purpose) {
  const origin = env.APP_ORIGIN || 'https://registry.brainsait.org';
  const link = `${origin}/auth/confirm?token=${encodeURIComponent(token)}&purpose=${purpose}`;
  const subject = purpose === 'login'
    ? 'Sign in to BrainSAIT Provider Registry'
    : 'Verify your email for BrainSAIT Registry';
  const html = `
    <div style="font-family:system-ui,sans-serif;color:#0a3d3b;max-width:560px;margin:0 auto">
      <h2 style="color:#0a3d3b">BrainSAIT Provider Registry</h2>
      <p>${purpose === 'login' ? 'Click below to sign in securely (no password):' : 'Confirm your email address:'}</p>
      <p><a href="${link}" style="display:inline-block;background:#c9a86a;color:#0a3d3b;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">${purpose === 'login' ? 'Sign in' : 'Verify email'}</a></p>
      <p style="font-size:12px;color:#666">This link expires in ${Math.round((env.MAGIC_LINK_TTL_SECONDS || 900) / 60)} minutes. If you did not request this, ignore it.</p>
    </div>`;
  const from = env.RESEND_FROM || 'BrainSAIT Registry <noreply@brainsait.org>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ from, to: [toEmail], subject, html }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`resend_error:${res.status}:${t.slice(0, 200)}`);
  }
  return res.json();
}

export async function getCurrentUser(request, env) {
  const auth = request.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const secret = env.SESSION_SIGNING_SECRET;
  if (!secret) return null;
  const payload = await verifySessionToken(m[1], secret);
  if (!payload || !payload.uid) return null;
  const row = await env.DB.prepare('SELECT id,email,email_verified,display_name FROM users WHERE id=?').bind(payload.uid).first();
  return row || null;
}

