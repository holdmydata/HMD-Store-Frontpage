# Mean Squares frontpage

Static-first marketing site for Mean Squares, the local-first storefront and loyalty platform for independent shops.

## Run locally

No build step or dependency install is required. From this directory:

```sh
python -m http.server 4173
```

Open http://localhost:4173. The owner/staff/customer sign-in choices link to the storefront app at `http://localhost:3000/login` with a role query parameter. Set `STOREFRONT_LOGIN_URL` in your deployment process and replace those links when the public app URL is decided.

## Pages

- `index.html` — mission, product, how it works, compliance-as-a-feature, CTA
- `signin.html` — role-aware handoff to the storefront login
- `privacy.html` and `terms.html` — v1 drafts marked for counsel review
- `script.js` — lightweight parallax, mobile nav, and cookie consent

The site uses no SPA framework, tracker, or analytics dependency. Hero illustration is CSS/HTML so the page stays portable and fast.
