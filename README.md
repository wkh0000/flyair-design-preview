# FlyAir — Design Preview

A static, design-only preview of the FlyAir consumer travel site, deployed to
GitHub Pages. Live booking, payments and admin actions are intentionally
disabled in this build — they require the backend (.NET 8 + SQL Server +
Travelport Galileo GDS) that lives in the private project repository.

**Live preview:** https://wkh0000.github.io/flyair-design-preview/

## What's in this build

- Hero with anchored cloud + landing-plane scroll effect
- Header glass effect, sticky-on-scroll, sliding sections
- 17 footer info pages (about, terms, privacy, baggage, FAQ, refunds, …) with
  real Travellers Marketplace company details
- Footer with IATA-style accreditation seal + payment partners + powered-by
  Travellers Marketplace link
- WCAG 2.1 basics — skip-to-content, focus-visible, semantic landmarks

## What is intentionally disabled

- `/api/*` backend calls (no server in the static preview)
- Live flight search via Travelport
- Payment + booking confirmation flows
- Admin save/edit endpoints
- Form submissions (contact, newsletter, support) — show "design preview" UX
  but POST nothing

A pink "Design preview" banner is pinned to the top of every page to make the
preview status obvious.

## Operated by

This brand is powered by **Travellers Marketplace (Pvt) Ltd** — a Sri Lankan
travel agency incorporated in 2019 (BR No PV 00214561), CAA-licensed
(A-1710) and IATA accredited. Visit
[travellers.lk](https://travellers.lk) for the parent group's services.

## Local development

```bash
npm ci --legacy-peer-deps
npm start                 # ng serve on http://localhost:4200
npm run build             # default (production) build
ng build --configuration=demo --base-href "/flyair-design-preview/"
```

## Deploy

A push to `main` triggers `.github/workflows/deploy.yml` which builds the
demo configuration and publishes to GitHub Pages.
