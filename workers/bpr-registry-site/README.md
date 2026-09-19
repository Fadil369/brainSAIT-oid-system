# bpr-registry (registry.brainsait.org)

Cloudflare Worker serving **registry.brainsait.org**: BrainSAIT Provider /
OID registry (root OID `1.3.6.1.4.1.61026`).

## Provenance

`src/index.js` was recovered from the **currently deployed** `bpr-registry`
worker (the deployed script, module format, originally bundled from a single
`src/index.ts`). The original TypeScript source was never committed to this
repo, so the repo had drifted from production. This directory restores source
control parity: `src/index.js` is byte-identical (SHA-256 verified) to the
live deployed module as of this commit, plus the root-redirect fix below.

## Changes in this commit (root 404 fix)

1. `GET /` (and `HEAD /`) -> `302` redirect to `/oid` (was: `404 {"error":"Not found"}`).
2. `GET|HEAD /oid` -> minimal HTML landing page for the OID registry
   (previously `/oid` 404'd; only `/oid/verify/:spid` and `/oid/leaves` existed),
   so the root redirect resolves to a real page.
3. `/p/:spid` profile pages now also accept `HEAD` (previously GET-only).

All other routes, bindings, and behavior are unchanged.

## Routes

- `GET /` -> 302 to `/oid`; `GET /oid` -> HTML landing
- `GET /health` -> `{"status":"healthy","service":"bpr-registry"}`
- `GET /p/:spid` -> provider profile HTML page
- `GET /verify/:spid`, `GET /members`, `GET /members/:spid`, `POST /members/:spid/offboard`
- `POST /register`, `POST /register/quick`
- `GET|POST /slots`, `/slots/:id`, `/slots/:id/chain|delegations|request|delegate|subslots`
- `GET /requests`, `POST /requests/:id/approve|reject`
- `GET /api/profiles/:spid`, `POST /profiles`
- `GET|POST /provision/:spid`
- `GET /ledger/:spid`, `POST /ledger`
- `GET /partner/:spid`
- `GET|POST /network`, `GET /network/:spid`, `POST /network/verify`
- `GET /oid/verify/:spid`, `GET /oid/leaves`
- `POST /webhook/order/paid` (Shopify HMAC-verified)
- `POST /mcp` (JSON-RPC tools: verify_provider, list_providers, register_provider,
  search_slots, get_slot, get_slot_chain, request_slot)

Admin-gated routes require the `X-Admin-Token` header.

## Deploy

```bash
cd workers/bpr-registry-site
npx wrangler deploy
```

Secrets are preserved across deploys; do not delete them.
