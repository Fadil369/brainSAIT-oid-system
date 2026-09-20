# BrainSAIT Identity Storefront

Public Cloudflare Worker storefront + Knowledge Hub for `identity.brainsait.org`.

## What It Is

A premium enterprise platform that combines:
- **Product storefront** — OID Line products with stories, dossiers, and Shopify CTAs
- **Knowledge Hub** — 7 articles from the BrainSAIT knowledge base covering OID architecture, information architecture philosophy, implementation guides, and multimedia
- **Registry-first positioning** — `registry.brainsait.org` as the main featured product
- **Architecture visualization** — interactive topology of the identity commerce system

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing: hero, registry feature, architecture map, pathfinder, KB preview, product grid |
| `/products` | OID Line product collection with buyer pathfinder |
| `/products/:slug` | Product dossier: story, risk/asset/next-move, activation runway, Shopify CTA |
| `/knowledge` | Knowledge Hub: featured article, stats, pillar navigation, article grid |
| `/knowledge/:slug` | Full article with Arabic RTL content, OID trees, API tables, media grid |
| `/architecture` | System architecture: experience/commerce/trust layers |
| `/sitemap.xml` | SEO sitemap including all products + KB articles |
| `/health` | Liveness with product + article counts |

## Knowledge Base Content

All content ingested from `/Users/fadil369/ID/media/`:

| Article | Category | Source |
|---|---|---|
| Introduction to OID | foundations | مقدمه حول المعرفات.txt |
| Technical Architecture | architecture | العمارة التقنيه.txt |
| Information Architecture Guide | philosophy | دليل هندسه المعلومات.txt |
| Hidden Architecture of Digital Identity | philosophy | الهندسه الخفيه للهندسه الرقميه.txt |
| OID Badge Management Guide | guides | دليل الهويه .txt |
| BrainSAIT OID Management System | architecture | دليل برينسايت لاداره معرفات الكائنات.txt |
| Deployment Guide (media) | media | 2× MP4 + 1× M4A + 1× PNG |

## Design System

- Fonts: Cormorant Garamond (display), Inter (body), IBM Plex Sans Arabic (Arabic)
- Theme: clean dark (#0a0a0b), no noise, no grain, no spinning animations
- Mobile-first: responsive breakpoints at 640px and 900px
- Colors: muted gold (#c9a96e), teal (#2ec4a6), cyan (#5ad4e6)

## Run

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

No Shopify/Admin secrets needed. CI: `.github/workflows/deploy-identity-storefront.yml`.
