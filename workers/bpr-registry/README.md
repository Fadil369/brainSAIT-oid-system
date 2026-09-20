# bpr-registry — BrainSAIT OID Provider Registry (flagship)

Cloudflare Worker at `registry.brainsait.org` (+ `oid.brainsait.org` alias).

The live source of this worker **used to diverge from this repo** (the repo held the
legacy JS `bpr-api` build; prod ran a newer TS codebase deployed outside VCS).
This directory is now the canonical source — deploy from here only:

```bash
cd workers/bpr-registry
npx wrangler deploy
npx wrangler d1 migrations apply brainsait-platform --remote
```

## OID allocation (Master Spec §4/§5/§7)

OIDs are minted only from the **validated** namespace tree (20 leaves, verified at
oid-base.com 2026-09-04 — see `BrainSAIT_OID_Registry_Validated.json` in the Mac
`~/workspace/core/ID` folder). Format:

```
1.3.6.1.4.1.61026.<jurisdiction arc>.<class arc>.<branch sequence>
```

- Jurisdictions: SA→.2, SD→.1, UK→.4, MENA→.5, BS→.3
- Classes: ORG/HOS→2, PHY/NUR/DEN/PHA/TEC/ALL→3, FAC/CLI/LAB/PHM→4, LOC→5, SVC→6, AGT→8, DEV→11, NET→16
- Example: `SA-PHY-000001 → 1.3.6.1.4.1.61026.2.3.1` (matches spec §7)

The never-registered arcs 20–23 (provider_registry/verification_badge/network_trust/
slot_marketplace) were **retired** — publishing them violated the governance rule.

## Routes

| Route | Purpose |
|---|---|
| `/` | 302 → `/oid` (front door) |
| `/oid` | Validated namespace tree (HTML, bilingual) |
| `/oid/leaves` | Validated tree + BPR allocation map (JSON) |
| `/oid/verify/{spid}` | Member OID + oid-base arc verification (JSON) |
| `/verify/{spid}` | Public provider verification (JSON) |
| `/p/{spid}` | Provider profile (HTML) |
| `/members`, `/members/{spid}` | Member list/detail (JSON, includes allocated OID) |
| `/slots`, `/slots/{id}`, `/slots/{id}/chain` | Vacancy slot marketplace |
| `/partner/{spid}`, `/provision/{spid}` | Partner aggregate + doctor stack provisioning |
| `/register`, `/register/quick` | Member registration (admin / quick) — allocates OID |
| `/webhook/order/paid` | Shopify HMAC-gated payment webhook |
| `/mcp` | MCP endpoint |

## Secrets (wrangler secret put)

`ADMIN_TOKEN`, `WEBHOOK_SECRET`, `SHOPIFY_ADMIN_TOKEN`, `SHOPIFY_STORE_DOMAIN`,
`RESEND_API_KEY`, `DAFTRA_API_KEY`, `DAFTRA_BASE_URL`.

## Migrations

`migrations/0001..0004` — 0004 adds `bpr_memberships.oid` and backfills the seed
members to spec allocation.
