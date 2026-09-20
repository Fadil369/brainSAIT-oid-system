# bpr-registry — BrainSAIT Provider Registry API (registry.brainsait.org)

Source-configured from the live `bpr-api` worker. Serves provider verification
(`GET /api/verify/{SPID}`), membership, magic-link auth — backed by D1 `bpr-prod`,
Vectorize `brainsait-medical`, Workers AI. Trust anchor for `oid-line` verify flow.

## Live routes

- `registry.brainsait.org` (+ `registry-api.brainsait.org` → same service)
- `APP_ORIGIN=https://registry.brainsait.org`, `OID_ROOT=1.3.6.1.4.1.61026`

## Deploy

Manual (production trust anchor — no auto-deploy by design):

```bash
cd workers/bpr-registry
npx wrangler@4.120.0 deploy
```

CI runs `wrangler deploy --dry-run` on changes for bundle validation only.
Secrets live server-side (`wrangler secret put`); never commit them.
