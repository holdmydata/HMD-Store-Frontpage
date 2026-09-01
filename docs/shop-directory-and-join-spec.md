# Store Directory + Join Page — Design Spec (paper aesthetic)

**Task:** R8-FP-2 — the frontpage becomes the customer-facing portal HOME for multiple stores.
**Owner:** designer (spec only — no code changes to either repo)
**Coders implement:** per this spec (child task t_ba9130ac).
**Status:** approved direction — reuse the responsive/mobile-first/paper/vanilla-JS design language already shipped in the diagrams redesign (t_999de3de → `docs/diagrams-responsive-spec.md`). Do not re-open the aesthetic.

---

## 0. Design language to match exactly (from the live frontpage repo)

The existing site is plain HTML/CSS/JS — **no build step, no framework, no tracker deps**. This spec adds two pages + small edits, all in that language.

**Tokens (styles.css `:root`, verbatim):**
- `--ink:#211d2b` · `--muted:#706978` · `--paper:#f8f4ed` · `--pink:#ec4899` · `--blush:#f7d4e3` · `--line:#dcd4d2`
- `--serif:'Fraunces',Georgia,serif` (display) · `--sans:'Inter',Arial,sans-serif` (body) · `--mono:'DM Mono',monospace` (eyebrows/labels)
- Dark section background in use: `#30283b` (hero, `.legal-callout`).
- Radii in use: 18px (diagram-card/stage), 12px (step/node panels), 2px (nav-cta).
- Read sizes: display titles Fraunces 25–40px; body Inter 13–16px; eyebrows/labels DM Mono 11–12px uppercase, letter-spacing .12em, pink.
- Scroll entrance: `.diagram-stage` uses `animation:diagram-enter .8s ease both; animation-timeline:view(); animation-range:entry 0% entry 30%` with `@media(prefers-reduced-motion:reduce)` disabling it. New sections should reuse this exact entrance pattern.
- Parallax: existing `[data-speed]` layers in script.js (window scroll only, capped at 220px, band 0.06–0.42). New decorative layers may reuse it; keep new speeds ~0.08–0.24.

**Components to reuse as-is:** `.site-header` (wordmark `× HMD Storefront`, nav, `.nav-cta`, `.menu` mobile), `.eyebrow`, `.section-intro`, `.feature-grid`/`.feature-num`, `.button.button-pink`, `.text-link`, `.step` cards, `.legal-callout`, footer (wordmark + link row + `© 2026 HMD Storefront — a Mean Squares company. Built for the neighborhood.`), `.cookie` banner, mobile drawer pattern (menu button → nav column, `#211d2b` background).

**Role-handoff pattern already live (signin.html, verbatim):**
`https://storefront.holdmydata.store/login?role=customer` / `role=staff` / `role=owner`.
This is the production app base the directory and join CTAs must point at. Do not invent a new auth flow; do not point at `themeansquares.com` (retired from published links — commit 697ba26).

---

## 1. STORE DIRECTORY — page/UI design

### 1.1 Decision: separate page `directory.html` (NOT replacing the index `#shops` section)

- The directory is **data-driven**; the homepage stays a static marketing site. Give the directory its own URL (`directory.html`), its own sitemap entry, and its own search/empty/loading states.
- The existing `#shops` map-section on index.html is **upgraded to a static teaser** that links into `directory.html` (§1.7). Keep the map graphic (CSS pins) — it is the visual anchor of "local"; just change the label + add a CTA.
- Add a `directory.html` link to the **nav and footer of every page** (index, rewards, privacy, terms, signin, join). Recommended nav label: **`Find a shop`**. Footer link: `Find a shop`.

### 1.2 Page structure (mobile-first)

```
site-header (existing, dark bg #30283b inline style like rewards.html)
main.directory-page
  section.directory-hero (compact paper hero, NOT the 92vh dark hero)
    p.eyebrow      — "Local, by design"
    h1             — "Find a member <em>shop.</em>"   (Fraunces, matches #shops h2 wording)
    p.hero-text    — "Search the network of independent shops. Points and rewards live in your corner."
  section.directory-search
    label (sr-only) "Search member shops"
    input#shopSearch.search-input   (paper treatment, §1.3)
    p.search-meta#directoryCount   — live result count (DM Mono 11px, muted): "12 member shops" / "3 of 12 shops"
  section.directory-grid (role="list")
    → JS renders shop cards here (§1.4–1.6). Static HTML carries only:
       - loading skeleton markup (hidden after load, §1.5)
       - empty-state markup (hidden unless 0 results, §1.6)
  section.directory-empty (hidden by default)   — §1.6
footer (existing)
<script src="script.js">  (directory renderer lives in script.js, §1.8)
```

### 1.3 Search input treatment (paper aesthetic)

- Background `#fff`, 1.5px solid `var(--line)` border, 12px radius, padding 14px 16px 14px 42px; focus state: border-color `var(--pink)`, subtle pink glow (`box-shadow:0 0 0 3px rgba(236,72,153,.15)`).
- Left inset icon: a small inline SVG magnifier (or `⌕` in DM Mono, pink) positioned `left:14px; top:50%; translateY(-50%)` — matches the site's scribble/symbol language (no icon font).
- Width: `min(100%, 680px)`, centered. Placeholder: `"Search by name, city, or what you love"`.
- Filtering: **client-side** on `input`, no server round-trip (research: v1 client-side search — t_6500e265 §search). Match case-insensitively against **name, description, city, state**. 150ms debounce (a 4-line `setTimeout` reset) — cheap and matches the vanilla-JS rule.
- Under the input, `.search-meta` line updates per keystroke.

### 1.4 Shop card layout

Grid: `repeat(auto-fill, minmax(280px, 1fr))`, gap 24px, `max-width:min(100%,1180px)` centered. Card (`article.shop-card`, white `#fff`, 1.5px `var(--line)` border, 14px radius — matches diagram panels):

```
┌──────────────────────────────┐
│ [photo area 16:10]            │   → <img class="shop-photo" alt="<Shop Name>"> 
│   or monogram placeholder      │     or .shop-mono monogram (§1.4.1)
├──────────────────────────────┤
│  h3  Shop Name (Fraunces 25px)│
│  p   Description (Inter 13px, muted, 2-line clamp) │
│  p.address  Street · City, ST  │   DM Mono 11px muted, stacked lines
│  p.hours    "Mon–Fri 8–6"      │   DM Mono 11px muted (formatting §1.4.2)
│  a.card-cta  "See my rewards ↗"│   text-link style, pink arrow
└──────────────────────────────┘
```

- **Card CTA = the customer-login handoff** (§3): every card links to the app sign-in with `role=customer`, carrying `&shop=<slug>` so the app/portal can land the customer on the right shop. `href="https://storefront.holdmydata.store/login?role=customer&shop=<slug>"`. Label stays generic (`See my rewards ↗`) — do not promise per-shop features the app doesn't expose yet.
- Whole card is NOT one link (avoid giant tap targets / nested-link a11y problems); only the CTA + name link. Name may link to the same customer handoff.
- Accessibility: grid is `role="list"`, cards `role="listitem"`; photo gets `alt="<Shop Name>"`; CTA has `aria-label="See my rewards at <Shop Name>"`.

#### 1.4.1 Missing-photo fallback — paper-style monogram

When `photoUrl` is null/empty or the image fails to load (`onerror`):

- A `.shop-mono` div, aspect-ratio 16/10, background `var(--blush)`, 1px `var(--line)` inset border, centered **DM Mono 48px** letters = **first two initials of the shop name** (e.g. "The Daily Grind" → `TG`), color `var(--pink)`, opacity ~0.9.
- Decor: a small paper texture feel via the same repeating-linear-gradient overlay the site already uses on `.map-placeholder` (white 1px diagonal lines at low opacity) — keeps it on-brand, pure CSS, no image.
- Same markup the coder renders for a photo with `src` — only the inner content switches. `onerror` must swap the `<img>` for the monogram (or render the monogram element alongside and toggle `hidden`).

#### 1.4.2 Hours formatting (from the v1 hours JSON contract)

The `hours` field is the versioned JSON contract (t_6500e265): `{"v":1,"days":[{"day":"mon","open":"09:00","close":"18:00","closed":false}, ...]}` — `day` = lowercase 3-letter `mon..sun`, open/close are 24h `HH:MM` **local to the shop's timezone**, `closed:true` for closed days, absent day = closed.

Renderer rules (small pure function, ~20 lines):
- If `hours` missing/null → show `Hours not listed`.
- If every day `closed:true` or all absent → `Closed — check with the shop`.
- Otherwise collapse to a single line: group consecutive same-time open days (`Mon–Fri 8:00am–6:00pm`), else list `Mon 8–6 · Wed 9–5` (space-separated `·`). Use 12-hour with am/pm for display, derived from the 24h value.
- If `hours.v` is not `1` (future contract) → render `Hours not listed` and log a console.warn — never crash the card.

### 1.5 Loading state

- On `DOMContentLoaded`, the grid shows **3–6 skeleton cards** (static HTML, replaced when data arrives): each a `.shop-skeleton` div — 16/10 blush block + two greyed (`var(--line)`) text bars + one shorter bar, with a gentle `@keyframes pulse` (opacity .55→1) and `animation-timeline`/reduced-motion handling exactly like the diagram entrance.
- Search input is rendered but disabled (`pointer-events:none`, muted) until the first fetch resolves.
- Copy above the grid while loading (optional, DM Mono 11px muted): `Looking up your neighborhood…`.
- **Timeouts:** fetch aborts after 8s → treat as error state (§1.6 error). Do not hard-fail the page; the directory is a progressive enhancement.

### 1.6 Empty + error states

**Empty (API OK, 0 shops returned):**
```
<section class="directory-empty">
  p.eyebrow   "Early days"
  h2          "No member shops yet."
  p           "We're on-boarding the first shops now. Check back soon — or be the first on your block."
  a.button.button-pink  "Sell your store ↗"  → join.html# (the join page, §2)
  small       "Shops appear here once they turn on directory listing in their storefront."
</section>
```
Keep a paper-appropriate visual: reuse the `.map-placeholder` pin graphic (3 CSS `×` pins on blush diagonal-line background) at reduced height — it ties "empty network" to the site's map language. **This is the required "no member shops yet" state.**

**Search-no-match (directory has shops, filter finds 0):**
Same section, different copy: h2 `No shops match that.` + p `Try a city, a name, or what you're looking for.` + a `.text-link` "Clear search" that empties the input and re-renders. (Do NOT show the "No member shops yet" CTA here.)

**Error / API unreachable (network fail, CORS fail, non-2xx, timeout):**
h2 `We couldn't reach the directory.` + p `The network is still growing — try again in a moment.` + a text-link "Reload". Log one `console.warn` (site is tracker-free; never send the error anywhere).

### 1.7 index.html `#shops` upgrade (static teaser, not dynamic)

Keep the section header (`Local, by design` / `Find a member shop.`) and the `.map-placeholder` graphic. Changes:
- Replace the `.map-label` text `Member shop map — Coming soon…` with: `Member shops` + `Explore the directory →` as a `.text-link` linking `directory.html`.
- Add under the map a centered `.button.button-pink` `Find a member shop ↗` → `directory.html`.
- Keep everything else in `#shops` untouched (no fetch on the homepage — it stays static and tracker-free).

### 1.8 Data contract (for the coder)

- **Endpoint:** public GraphQL, `POST {API_BASE}/graphql` with `Content-Type: application/json`, body:
```json
{"query":"query { storeDirectory { id name slug addressLine1 addressLine2 city state postalCode photoUrl description hours } }"}
```
- **API base URL:** define once at the top of `script.js` as a constant, default `https://storefront.holdmydata.store` (the production app base already used by signin.html roles, and the Scheme A domain recommended by research t_6500e265). Allow a local override for dev: `window.HMD_API_BASE = 'http://localhost:3000'` in console, or `?api=` query param — keep the default hard-coded to production.
- **Response shape:** `data.storeDirectory: [StoreDirectoryEntry!]!`, each entry with the 13-field whitelist above (all nullable except id/name/slug). Unauthenticated by design; never render `deletedAt`/system-shop.
- **Sorting:** server returns name asc — render in that order; do not re-sort client-side.
- **Renderer:** small vanilla functions in `script.js` (a shared script already loaded by every page): `fetchDirectory()`, `renderDirectory(entries)`, `formatHours(hours)`, `shopMono(name)`, `filterDirectory(query)`. No framework, no DOM library. Use `textContent` for all data-driven text (XSS-safe), never `innerHTML` with API strings.
- **CORS note for QA:** production `CORS_ORIGINS` must include the directory's origin (research recommends `https://marketing.holdmydata.store` / the site's host); local dev is served on `http://localhost:4173` (already in the app's local CORS allowlist per t_6500e265). If CORS blocks locally, the error state covers it — do not fake data.

---

## 2. JOIN PAGE — "SELL YOUR STORE" (static)

### 2.1 Purpose + placement

Static marketing page `join.html` recruiting member shops. Fully static (no fetch). Same header/footer as other pages. Nav label: **`Sell your store`** (nav + footer on every page). Sitemap + canonical/og added.

### 2.2 Section layout (top to bottom)

1. **Hero** (compact paper hero, matching directory hero / rewards page style, dark `#30283b` optional — pick the dark hero for CTA contrast like `.legal-callout`):
   - `p.eyebrow` — `SELL YOUR STORE`
   - `h1` — `Your regulars keep your doors open.` / `Keep them coming back.` (Fraunces, one `<em>` flourish allowed)
   - `p` — one plain-language line: "A loyalty program for independent shops — set up in minutes, owned by you, with your customers' trust front and center."
   - `a.button.button-pink` — `Start free for your shop ↗` → `signin.html?role=owner`
   - `p.fine` — `No credit card. No chain template. Set up at your own pace.`

2. **Benefit cards** (`section.join-benefits`): a `feature-grid`-style 3-column grid of honest, plain-language benefits. Each card: `span.feature-num` (01–03), Fraunces `h3`, Inter muted `p`. Cards:
   - **01 · Keep the relationship yours.** "No faceless points ecosystem between you and your regulars. Rewards, check-ins, and gifts you set up — not a chain template."
   - **02 · Reward the people who already love you.** "Loyalty members spend more and come back more. The numbers below are industry benchmarks, applied to a typical independent shop — estimates, not promises."
   - **03 · Data with a clear story.** "Customers opt in per purpose, can change their mind anytime, and a share of the value comes back to them and to you. We don't sell your customers' data to brokers."

3. **Benefits-in-numbers stat strip** (`section.join-numbers`) — **the honest figures, verbatim from research t_1b64e3b5 §1.5 / §1.3**, each stat a big Fraunces number + DM Mono label + a `small` source tag. **Never alter these numbers; never drop the "estimate" label.**
   - `12–18%` — "More incremental revenue per year from loyalty members (Accenture). Estimate."
   - `3×` — "Repeat customers spend more per visit (industry benchmark). Estimate."
   - `25–95%` — "More profit from a 5% bump in retention (Bain & Company). Estimate."
   - `$800–$14,000` — "Estimated net benefit per year for a typical independent shop doing ~$120k/yr (low to high scenario). Estimate."
   - `2–12 weeks` — "Typical time for a program to pay for itself (SMB ROI benchmarks). Typical, not guaranteed."
   - One-line honesty footer (DM Mono 11px, muted): `Figures are industry benchmarks applied to a typical independent cafe/retail shop (~$120k/yr). Estimates with assumptions — see the research methodology, not guarantees.`
   - The strip is a 3- or 5-stat grid on desktop, stacked on mobile. Reuse the existing `.reward-explainer`/stat-card paper pattern (blush card backgrounds, white number cards if a chart-like look is wanted — the coder picks the card vs chart treatment; a simple SVG range bar is allowed but optional).

4. **How to join** (`section.join-steps`) — reuse the `.steps` 4-card pattern from index:
   - `1 · Make it yours.` "Open your shop profile and choose the rewards your regulars will love."
   - `2 · People check in.` "A quick name, phone, or email turns a visit into a relationship."
   - `3 · Good things add up.` "Customers earn points and redeem gifts, with consent they can see and change anytime."
   - `4 · Show up in the directory.` "Turn on directory listing to appear in Find a shop — your address, hours, and a welcome to new neighbors."
   - (Reusing the exact index.html step-copy rhythm keeps the voice consistent; step 4 is new and directory-specific.)

5. **CTA closer** (`section.join-cta`, mirroring the index `.cta`):
   - `p.eyebrow` — `Your corner of the world`
   - `h2` — `Make loyalty feel <em>local again.</em>`
   - `a.button.button-pink` — `Start free for your shop ↗` → `signin.html?role=owner`
   - `p.fine` — `No credit card required. Set up at your own pace.`

### 2.3 CTA destination (decided)

All join CTAs → **`signin.html?role=owner`** (the existing static role-handoff page, which already links to `https://storefront.holdmydata.store/login?role=owner`). Do not deep-link past signin.html from the frontpage; signin.html remains the single handoff page.

### 2.4 Link to the deep-dive methodology page (conditional, per child card)

The deep-dive pages (benefits.html / data-story.html) belong to sibling task t_e788a260, which is **not yet implemented**. Therefore:
- The join page must be **self-contained**: the numbers above are shown inline with their labels; do not require the deep-dive page to exist.
- If/once `benefits.html` exists, add one `.text-link` under the stat strip: `See the full methodology → benefits.html`. Implement this link **only if the file exists** (the coder decides at build time; if it doesn't exist yet, omit it rather than ship a 404).

---

## 3. CUSTOMER-LOGIN HANDOFF (directory → app portal)

### 3.1 Pattern (confirmed)

Reuse the **existing signin.html role-handoff pattern** — do not build a new auth flow.

- Directory card CTA → `https://storefront.holdmydata.store/login?role=customer&shop=<slug>` (§1.4). The app's Login.js already routes `role=customer` to the customer portal (`/portal`); the extra `shop=<slug>` param lets the portal pre-select/confirm the shop where the customer started.
- The `signin.html` page itself stays as-is for direct visits (top-level nav `Sign in`).

### 3.2 Shop-aware signin touch (small, vanilla, optional-but-recommended)

If the frontpage wants the sign-in page to acknowledge which shop a customer came from (nice-to-have; skip if it complicates the handoff):
- Directory cards may alternatively link `signin.html?role=customer&shop=<slug>` and a ~6-line addition to `script.js` rewrites the customer link on signin.html to append `&shop=<slug>` and shows a one-line confirm strip: `Looking for <Shop Name>? Sign in below — your points are right there.` (name derived from a small map of slug→name passed in the query or hardcoded data; do not over-engineer).
- **Recommendation:** keep v1 as the direct app link in §3.1 (simplest, no signin.html JS). Add the shop-aware signin only if the coder finds the direct link insufficient for QA's "customer reaches their portal" check. Decide once, write it in the commit message.

### 3.3 Confirmation of existing handoff (for QA)

- signin.html role links already point at `https://storefront.holdmydata.store/login?role=customer|staff|owner` (verified live, commit 697ba26) — this is the production domain per research Scheme A (t_6500e265/t_1b64e3b5). No `themeansquares.com` references remain in published links.

---

## 4. RECOMMENDED PRIORITY if scope must be trimmed

Must-have (in order) — if any of these go, the feature is not delivered:
1. **directory.html** with: fetch + render, loading skeleton, empty state ("No member shops yet"), missing-photo monogram fallback, client-side search + result count, per-card customer-login CTA (`role=customer&shop=<slug>`).
2. **Customer handoff working** (the CTA URL above; app Login.js routes to /portal).
3. **join.html** with hero + 3 benefit cards + the 5 honest stats (verbatim, labeled estimates) + 4 how-to-join steps + owner CTA.
4. **Nav/footer + sitemap.xml + canonical/og** wiring for both new pages.

Trimmable / defer (in order):
5. index `#shops` teaser upgrade (CTA into directory) — page still reachable via nav; defer the teaser polish.
6. Shop-aware signin.html confirm strip (§3.2) — nice-to-have.
7. Stat-strip SVG range chart (§2.2 #3) — plain stat cards are sufficient; chart is polish.
8. `benefits.html` methodology link — only when the sibling page exists.

---

## 5. Implementation guardrails (for the coder; not a code task for me)

1. **No new libraries, no framework, no tracker/analytics deps** — vanilla HTML/CSS/JS only, matching the site's deliberate constraint. All data-driven text via `textContent`.
2. **Only directory.html is dynamic.** join.html and everything else stays static. index.html stays static (the `#shops` teaser links out; it does not fetch).
3. **Graceful degradation:** if the API/CORS is unreachable locally, render the error state (§1.6) — never hard-fail, never fake data, one `console.warn`.
4. **Aesthetic match:** exact token colors/fonts from §0; entrance/parallax per the diagrams spec; reduced-motion respected.
5. **Files touched:** `directory.html` (new), `join.html` (new), `styles.css` (new section), `script.js` (add directory renderer; existing cookie/parallax/menu untouched), `index.html` (`#shops` teaser only), all pages' nav/footer + `sitemap.xml` + canonical/og for the two new pages, `README.md` (pages list). No changes to `diagrams/*.svg`, privacy/terms copy.
6. **Scope:** no changes to either repo beyond the frontpage repo for the coder; this spec itself lives in the designer workspace (not committed).

---

## 6. What QA verifies (checklist for @qa)

- [ ] directory.html loads without console errors on `python -m http.server 4173`.
- [ ] Loading skeleton shows, then cards render (or error/empty state — never blank).
- [ ] Search filters client-side (name/city/state, case-insensitive); count updates; no-match state shows; clear-search works.
- [ ] Missing `photoUrl` renders the blush monogram (first two initials); a broken image URL also falls back to monogram.
- [ ] Hours render per the v1 contract incl. missing-hours and closed-all-day edge cases.
- [ ] Card CTA lands on `https://storefront.holdmydata.store/login?role=customer&shop=<slug>`.
- [ ] join.html renders all 5 benefit stats **verbatim** with estimate labels; all CTAs → `signin.html?role=owner`.
- [ ] Nav/footer on every page link to directory.html and join.html; sitemap.xml lists both; canonical/og present.
- [ ] Reduced-motion disables pulse/entrance animations; no trackers/analytics requests in the network tab.
- [ ] Signin.html role handoff unchanged and pointing at `storefront.holdmydata.store`.

---

*End of spec. frontend-coder implements per §1–§3; QA verifies per §6. No code changes were made by the designer.*
