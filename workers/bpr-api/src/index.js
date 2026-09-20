// BrainSAIT Provider Registry API — Cloudflare Worker entry
// Routes: /auth/*, /providers/*, /verify/*, /health

import { handleAuth } from './routes/auth.js';
import { handlePasswordAuth } from './routes/password.js';
import { handleProviders } from './routes/providers.js';
import { handleVerify } from './routes/verify.js';
import { handleCopilot } from './routes/copilot.js';
import { handleFhir } from './routes/fhir.js';
import { handleMembership } from './routes/membership.js';
import { corsHeaders, json, notFound, methodNotAllowed } from './lib/http.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    // Global CORS for browser clients on registry.brainsait.org
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    try {
      let res;
      if (path.startsWith('/auth')) {
        if (path.startsWith('/auth/password')) {
          res = await handlePasswordAuth(request, env, path.slice(14) || '/');
        } else {
          res = await handleAuth(request, env, path.slice(5) || '/');
        }
      } else if (path.startsWith('/providers')) {
        res = await handleProviders(request, env, path.slice(10) || '/');
      } else if (path.startsWith('/verify')) {
        res = await handleVerify(request, env, path.slice(7) || '/');
      } else if (path.startsWith('/copilot')) {
        res = await handleCopilot(request, env, path.slice(8) || '/');
      } else if (path.startsWith('/fhir')) {
        res = await handleFhir(request, env, '/' + path.slice(5));
      } else if (path.startsWith('/membership')) {
        res = await handleMembership(request, env, path.slice(11) || '/');
      } else if (path === '/health') {
        res = json({ ok: true, service: 'bpr-api', ts: Date.now() });
      } else {
        res = notFound();
      }

      // Attach CORS headers to every response
      const h = new Headers(res.headers);
      for (const [k, v] of Object.entries(corsHeaders(env))) h.set(k, v);
      return new Response(res.body, { status: res.status, headers: h });
    } catch (err) {
      console.error('bpr-api error', err);
      return json({ error: 'internal_error', message: String(err?.message || err) }, 500);
    }
  },
};

