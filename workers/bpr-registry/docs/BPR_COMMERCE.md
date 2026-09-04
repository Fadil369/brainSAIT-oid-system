# BrainSAIT Provider Registry — Paid Membership & Commerce Spec

> Product: **BrainSAIT Provider Registry (BPR)** — bilingual Saudi healthcare-worker
> identity, verification, discovery + lifetime benefits ecosystem.

## 1. Pricing (unique, two-tier)

| Tier | Price | Billing | Audience | Default |
|------|-------|---------|----------|---------|
| **Annual** | **3,960 SAR** | one–time / yearly | all healthcare workers | ✅ recommended |
| **Monthly (Junior)** | **163 SAR** | recurring monthly | junior / early–career workers | — |

- Annual is the **recommended** plan shown first everywhere.
- Currency: **SAR** everywhere (hard rule — never `$`/`€`).

## 2. Commerce placement

| Surface | Action | Handle / variant |
|---------|--------|------------------|
| **gh.io store** (`fadil369.github.io`) | Featured product in the **Solutions** section. `catalog.json` slug `bpr`: `price=3960, billingEn=annually`, `formats=[Annual 3960, Monthly 163]`, `badges=["SaaS","Featured","SCFHS-anchored"]`, `sku=BPR-ANNUAL`. | `provider-registry` |
| **Shopify** (`store.brainsait.de`) | One product **"Provider Registry — BrainSAIT"** with two variants: `Annual — 3,960 SAR` (default) and `Monthly — 163 SAR`. Set handle `provider-registry`. | variants below |
| **MyFatoorah** (`myfatoorah-checkout` worker) | Annual → one‑time `/create-payment-link` (Shopify draft order priced 3,960). Monthly → recurring `/create-subscription` tier `bpr_monthly` (163 SAR). | `tier: bpr_monthly` |

**Shopify variants** (create once, then feed variant ids into `/create-payment-link`'s `lineItems`):
1. Annual — option `Plan: Annual`, price **3960 SAR**.
2. Monthly — option `Plan: Monthly`, price **163 SAR**.

## 3. Backend wiring (what "registered + paid" triggers)

1. **BrainSAIT Cloud Identity** — mint `users` row + `providers` row → allocates permanent **SPID** (`SA-{TYPE}-{6digits}`) + **OID** (`1.3.6.1.4.1.61026.{branch}.{type}.{num}`) from D1 `bpr-prod`.
2. **mailOTP / magic-link** — email verify + login (`/auth/*`), Resend sender `noreply@brainsait.de`.
3. **notify** — Resend/Telegram welcome + verification + renewal reminders.
4. **n8n** — order webhook → entitlement provisioning → Airtable record → notify.
5. **Airtable** — BOS base "Orders / Contacts / Fulfillment" row per paying worker.
6. **Payment confirmation** — MyFatoorah webhook → draft order completes → `SUBSCRIPTIONS`/`MYFATOORAH_KV` entitlement is written (idempotent; never trusts the webhook, re-verifies via `GetPaymentStatus`).

## 4. Post-registration benefits (what the worker gets)

**Identity & trust**
- Permanent **SPID + OID** (IANA PEN 61026)
- **SCFHS-anchored** verification claims (provenance, status, dates)
- **QR** verification card + **shareable badges**
- **Luxury public verified webpage** (bilingual AR/EN, always live)

**Copilot**
- Free, **always-on clinical copilot** — any time, anywhere, all languages, clinically specialised (Doctor / CDI·Coding·RCM / Patient). Public GPT on OpenAI GPT Store, linked from `/copilot`.

**Ecosystem super-benefits**
- **LEARN** ticket — courses/templates access
- **BUILD** ticket — tooling (gh, cf, shopify, notion, bot, canva, lark, code platform — optional/free)
- **SOLUTION** ticket — Marketplace demos/consulting eligibility

## 5. Incubation (optional, on idea + valid account)
- Provider idea → **incubation**
- **Subdomains** auto-dispatched from the **platforms worker** (`platforms.brainsait.org` `/v1/projects`)
- **Lark super-partner** tooling
- All valid only while the account is **active/paid**.

## 6. Account-validity gating
- `providers.profile_status = published` only while subscription `active`.
- `SUBSCRIPTIONS` KV `status` is the single source of truth read by gating proxies
  (e.g. `pdf-viewer-proxy` pattern) + registry `owner_user_id` check.
- On lapse → `suspended`/`archived`, public page shows "not active", copilot link unaffected (always-on, free).

## 7. Blocking prerequisite (MyFatoorah)
The live `MYFATOORAH_API_KEY` secret is currently **invalid** (401 "token not valid/expired" per the 2026-08-27 diagnostic in `workers/myfatoorah-checkout/RUNBOOK.md`). Before any real charge, regenerate a live key + confirm a full sandbox one-time **and** recurring cycle (Mada sandbox), then set secrets + `RECURRING_LIVE_CONFIRMED=true`. Until then the worker returns 503 for live recurring — by design.

## 8. Membership API (live)

Single source of truth for pricing + entitlement activation + account-validity gating, deployed on `bpr-api` (`registry-api.brainsait.org`):

- `GET  /membership/plans` — returns `annual` (3,960 SAR/yr, 365d) + `monthly` (163 SAR/mo, 30d) with bilingual labels.
- `GET  /membership/status?spid=<spid>` — public plan state (`plan_tier`, `plan_status`, `plan_expires_at`).
- `POST /membership/activate` (owner, bearer) — body `{ spid, tier: annual|monthly, reference }` → sets `plan_status=active`, computes expiry, writes an `audit_events` row keyed by the checkout `reference` (Shopify draft-order id / MyFatoorah InvoiceId / accessKey).

D1: `providers` now carries `plan_tier`, `plan_status` (`pending|active|suspended|expired|none`), `plan_expires_at`. Gating rule: a provider's public verified page is `published` only while `plan_status=active` (or `free` legacy); on lapse → `suspended`/`expired`, public page shows "not active". The copilot link stays always-on/free regardless.

## 9. Live Shopify product (minted 2026-09-03)

Product `BrainSAIT Provider Registry (BPR) — Membership`, handle `provider-registry`, live on `store.brainsait.de/products/provider-registry`:

- Product ID: `8103998390355`
- **Annual** variant `46135696752723` — 3,960 SAR (`BPR-ANNUAL`)
- **Monthly** variant `46135696785491` — 163 SAR (`BPR-MONTHLY`)

`myfatoorah-checkout` worker now exposes `POST /create-bpr-checkout` `{ plan: annual|monthly, customer:{firstName,lastName,email,phone} }` → routes annual to one-time `/create-payment-link` (variant 46135696752723) and monthly to recurring `/create-subscription` tier `bpr_monthly`. Variant ids are pinned in `BPR_PRODUCT`.
