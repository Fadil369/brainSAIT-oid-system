# OID Order Fulfillment Worker — Setup

## What This Does

Receives `orders/paid` Shopify webhooks, generates a license key per line item, calls the `brainsait-store-delivery` admin API to grant the license, and logs the order to Airtable (`OID_Orders` table in `appE7sxyyLHrCQBSe`).

## Architecture

```
Shopify (orders/paid) ──POST──▶ oid-order-fulfillment
                                        │
                      ┌─────────────────┼──────────────────┐
                      ▼                 ▼                   ▼
              Generate License    Call Delivery Worker   Log Airtable
                Key (UUID)       POST /admin/licenses   OID_Orders table
                                  (x-hub-key auth)
                                        │
                                 KV: license record
                                 R2: asset files
```

## Secrets Required

Set these once with wrangler:

```bash
wrangler secret put SHOPIFY_WEBHOOK_SECRET
# Paste: webhook secret from Shopify > Settings > Notifications > Webhooks

wrangler secret put DELIVERY_ADMIN_TOKEN
# Paste: the ADMIN_TOKEN secret on brainsait-store-delivery worker

wrangler secret put AIRTABLE_API_KEY
# Paste: Airtable personal access token (scope: data.records:write)
```

## Deploy

```bash
npm install
npm run deploy
```

## Register Shopify Webhook

In Shopify Admin → Settings → Notifications → Webhooks, add:
- Event: `Order payment` 
- Format: `JSON`
- URL: `https://fulfillment.brainsait.org/webhooks/shopify/orders-paid`

Or via Shopify CLI:
```bash
shopify webhook trigger --topic orders/paid
```

## Product SKU → Asset Manifest

All SKUs are mapped in `src/index.js` under `SKU_ASSETS`. To add a new product:

1. Add the Shopify product with a SKU matching the key
2. Upload the assets to R2 via the delivery worker admin API:
   ```bash
   curl -X PUT https://assets.brainsait.org/admin/objects/products/{path} \
     -H "x-hub-key: $ADMIN_TOKEN" \
     -H "x-filename: MyFile.zip" \
     -H "content-type: application/zip" \
     --data-binary @myfile.zip
   ```
3. Add the SKU entry to `SKU_ASSETS` in `src/index.js`
4. Re-deploy

## Language Detection

The worker detects the customer's preferred language from `order.customer_locale` and sets the `Language` field in Airtable to `AR` or `EN`. This drives bilingual delivery email templates.

## Monitoring

```bash
wrangler tail oid-order-fulfillment
```

## Airtable Table

Base: `appE7sxyyLHrCQBSe`  
Table: `OID_Orders` (ID: `tblhmaM8zV3aibbUO`)

Fields: License Key, Shopify Order ID, Customer Email, Customer Name, Product SKU, Product Name, Amount SAR, Status, Language, Asset Bundle, Download URL, Issued At, Expires At, Download Count, Notes
