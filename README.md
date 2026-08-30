# HMD Storefront frontpage

Static-first marketing site for HMD Storefront, a Mean Squares company: a local-first storefront and loyalty platform for independent shops.

## Run locally

No build step or dependency install is required. From this directory:

```sh
python -m http.server 4173
```

Run the local preview command above and open the address it reports. In production, the public frontpage is https://themeansquares.com and role sign-in links hand off to the storefront app at `https://app.themeansquares.com/login?role=...`. The app URL is the production handoff configured for this static site.

## Pages

- `index.html` — mission, product, how it works, static geo-ready member-shop map, and CTA
- `rewards.html` — one-login, cross-shop points, multi-business redemption, and system rewards explainer
- `signin.html` — role-aware handoff to the storefront login/signup flow
- `privacy.html` and `terms.html` — v1 drafts with loyalty disclosures and Do Not Sell/Opt-Out language, marked for counsel review
- `sitemap.xml` — static XML sitemap for all public pages
- `script.js` — lightweight parallax, mobile nav, and cookie consent

The site uses no SPA framework, tracker, or analytics dependency. Hero and map illustrations are CSS/HTML so the page stays portable and fast.

This repository is public at `holdmydata/HMD-Store-Frontpage`. Production hosting is planned on the operator's own VM (self-hosted, Caddy auto-TLS) — see the internal VM hosting plan.
