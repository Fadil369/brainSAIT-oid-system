# oid-line — OID LINE storefront + commerce API (brainsait-oid / id.brainsait.org)

Luxury AR/EN storefront + JSON API served same-origin from one Worker.

| Route | Purpose |
|---|---|
| `GET /` | Gold storefront (verify + ROI + concierge/instant invoice) |
| `GET /health` | Liveness |
| `GET /v1/oid-line/products` | 6 SKUs, SAR |
| `GET /v1/verify/{SPID}` | Registry proxy + KV cache + BIAL trust + QR |
| `POST /v1/checkout/webhook` | Shopify `orders/paid` → per-SKU KV fulfillment (multi-shop HMAC) |
| `POST /v1/order/draft` | Instant draft invoice (MyFatoorah-native checkout, gate-independent) |
| `GET /v1/order/status` | Fulfillment record lookup |
| `GET /v1/qr?spid=` | Verify/badge URLs |

## Secrets

| Name | Value |
|---|---|
| `SHOPIFY_HOOK_SECRETS` | `{"brainsait-oid.myshopify.com":"shpss_…"}` (OID-FABRIC app; extend per shop) |
| `WEBHOOK_SECRET` | Legacy fallback single secret |
| `SHOPIFY_OID_TOKEN` | Admin API `shpat_…` (draft orders, products) |

## Ops scripts (`scripts/`)

`shopify-publish.py [--live]` — 8 products + webhook. `shopify-publish-channel.py` — Online Store publication. `shopify-cleanup.py` — dud removal. All read `SHOPIFY_OID_TOKEN` env, never print it.

## Deploy

Push to `main` (touches `workers/oid-line/**`) → `.github/workflows/deploy-oid-line.yml` validates, deploys, sets secrets from repo Secrets, health-checks.
