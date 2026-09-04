// HTTP helpers for BPR API

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function notFound(message = 'not_found') {
  return json({ error: message }, 404);
}

export function methodNotAllowed() {
  return json({ error: 'method_not_allowed' }, 405);
}

export function badRequest(message = 'bad_request') {
  return json({ error: message }, 400);
}

export function unauthorized(message = 'unauthorized') {
  return json({ error: message }, 401);
}

export function forbidden(message = 'forbidden') {
  return json({ error: message }, 403);
}

export function corsHeaders(env) {
  const origin = env?.APP_ORIGIN || 'https://registry.brainsait.org';
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': 'authorization,content-type,accept',
    'access-control-allow-credentials': 'true',
    'access-control-max-age': '86400',
  };
}

export async function readJsonBody(request) {
  const ct = (request.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('application/json')) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

