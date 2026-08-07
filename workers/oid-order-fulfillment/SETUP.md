# OID Order Fulfillment Worker — Setup

## What This Does

Receives `orders/paid` Shopify webhooks, generates a deterministic license key per purchased unit, calls the `brainsait-store-delivery` admin API to grant the license, and upserts the order in Airtable (`OID_Orders` table in `appE7sxyyLHrCQBSe`). Shopify retries therefore reuse the same license instead of minting duplicates.

## Architecture

```
Shopify (orders/paid) ──POST──▶ oid-order-fulfillment
                                        │
                      ┌─────────────────┼──────────────────┐
                      ▼                 ▼                   ▼
              Generate License    Call Delivery Worker   Log Airtable
                Key (BSOID key)   POST /admin/licenses   OID_Orders table
                                  (x-hub-key auth)
                                        │
                                 KV: license record
                                 R2: asset files
```

## Secrets Required

```bash
wrangler secret put SHOPIFY_WEBHOOK_SECRET
wrangler secret put LICENSE_SIGNING_SECRET
wrangler secret put DELIVERY_ADMIN_TOKEN
wrangler secret put AIRTABLE_API_KEY
wrangler secret put RESEND_API_KEY   # optional — customer delivery email is skipped, not failed, when absent
```

`RESEND_FROM_EMAIL` is a plain `[vars]` entry in `wrangler.toml` (not a secret) — must stay on a
domain verified in the Resend account the API key belongs to.

On a successful order, the worker also POSTs an admin sale notification to
`https://hub.brainsait.de/telegram/send` using the `DELIVERY_ADMIN_TOKEN` value as `X-Hub-Key`
(the hub's Telegram relay accepts the same key as the delivery Worker's admin API). No separate
secret needed; this silently no-ops if the hub is unreachable.

The GitHub `production` environment must contain:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `SHOPIFY_WEBHOOK_SECRET`
- `LICENSE_SIGNING_SECRET`
- `DELIVERY_ADMIN_TOKEN`
- `RESEND_API_KEY` (optional)
- `AIRTABLE_API_KEY`

Protect the environment with required reviewers. The deployment workflow accepts production pushes and manual dispatches only from `main`.

Set the repository variable `PRODUCTION_DEPLOY_ENABLED=true` only after all
production environment secrets are configured. Keep it `false` when
deployments are performed directly from protected infrastructure.

## Deploy

```bash
npm install
npm test
npm run deploy
```

## Register Shopify Webhook

In Shopify Admin → Settings → Notifications → Webhooks:
- Event: `Order payment`
- Format: `JSON`
- URL: `https://fulfillment.brainsait.org/webhooks/shopify/orders-paid`

Health endpoint: `GET https://fulfillment.brainsait.org/health`

## Airtable Table

Base: `appE7sxyyLHrCQBSe`  
Table: `OID_Orders` (ID: `tblhmaM8zV3aibbUO`)

Fields: License Key, Shopify Order ID, Customer Email, Customer Name, Product SKU, Product Name, Amount SAR, Status, Language, Asset Bundle, Download URL, Issued At, Expires At, Download Count, Notes
