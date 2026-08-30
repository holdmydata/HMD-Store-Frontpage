# Mean Squares frontpage

Static-first marketing site for Mean Squares, the local-first storefront and loyalty platform for independent shops.

## Run locally

No build step or dependency install is required. From this directory:

```sh
python -m http.server 4173
```

Open http://localhost:4173. Owner, staff, and customer sign-in choices hand off to the storefront app at `http://localhost:3000/login?role=...`. The storefront currently exposes signup from its login flow; the public app URL should replace localhost before launch.

## Pages

- `index.html` — mission, product, how it works, static geo-ready member-shop map, and CTA
- `rewards.html` — one-login, cross-shop points, multi-business redemption, and system rewards explainer
- `signin.html` — role-aware handoff to the storefront login/signup flow
- `privacy.html` and `terms.html` — v1 drafts with loyalty disclosures and Do Not Sell/Opt-Out language, marked for counsel review
- `sitemap.xml` — static XML sitemap for all public pages
- `script.js` — lightweight parallax, mobile nav, and cookie consent

The site uses no SPA framework, tracker, or analytics dependency. Hero and map illustrations are CSS/HTML so the page stays portable and fast.

This repository is ready to push to `holdmydata/HMD-Frontpage`; GitHub authentication and push are intentionally operator-managed.
