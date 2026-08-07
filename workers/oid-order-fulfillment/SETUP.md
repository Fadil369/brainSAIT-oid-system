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

```bash
wrangler secret put SHOPIFY_WEBHOOK_SECRET
wrangler secret put DELIVERY_ADMIN_TOKEN
wrangler secret put AIRTABLE_API_KEY
```

## Deploy

```bash
npm install
npm run deploy
```

## Register Shopify Webhook

In Shopify Admin → Settings → Notifications → Webhooks:
- Event: `Order payment`
- Format: `JSON`
- URL: `https://fulfillment.brainsait.org/webhooks/shopify/orders-paid`

## Airtable Table

Base: `appE7sxyyLHrCQBSe`  
Table: `OID_Orders` (ID: `tblhmaM8zV3aibbUO`)

Fields: License Key, Shopify Order ID, Customer Email, Customer Name, Product SKU, Product Name, Amount SAR, Status, Language, Asset Bundle, Download URL, Issued At, Expires At, Download Count, Notes
