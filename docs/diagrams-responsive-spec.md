# Diagrams Responsive Redesign — Design Spec

**Task:** R8-FP-DIAGRAMS — responsive scroll/parallax redesign of the how-it-works and consent-revenue-share diagram sections.
**Owner:** designer (spec only — no code changes to the pages)
**Coders implement:** per this spec
**Status:** approved spec, decision-reset toward scroll/parallax + mobile-swipe + responsive (operator, 08-31). Taste-call resolved. Do not re-open.

---

## 1. Context — what is broken and why

Both frontpage diagrams are currently **fixed-size inline SVGs embedded as `<img>` inside a `<figure class="diagram-card">`**:

| Diagram | Page | SVG viewBox | Current behavior |
|---|---|---|---|
| how-it-works | index.html, `#how` section | 900 × 520 | scales down on mobile; internal text shrinks to unreadable; 4 step boxes crowd together |
| consent-revenue-share | rewards.html | 720 × 760 | same problem — tall diagram squished to phone width, text illegible, flow lines overlap |

Root cause: the SVG is a **fixed-size canvas treated as an image**. The browser scales the whole canvas uniformly; internal font sizes are absolute (`font-size="12"`, `font-size="15.5"`, etc.) so on a 390px-wide phone the 12px monospace label is rendered far smaller than legible, and the 4–6 step boxes that sit side-by-side on desktop collapse into a jumble.

The site is **plain HTML/CSS/JS — no build step, no framework, no tracker deps**. script.js already has a vanilla-JS parallax handler for `[data-speed]` layers. The redesign must extend that existing pattern, not introduce new libraries.

Aesthetic to match exactly: paper (`#f8f4ed`) / ink (`#211d2b`) / brush-pink (`#ec4899`) palette; **Fraunces** for display serif, **Inter** for body, **DM Mono** for eyebrows/labels; dashed scribble connectors; 18px / 14px card radii; blush (`#f7d4e3`) card backgrounds; the hand-drawn "shop scene" in the hero is the north-star visual reference.

---

## 2. Options considered + the recommendation

### Option A — Rebuild each diagram as an HTML/CSS layered composition (REAL DOM text, absolutely-positioned layers)

- Every text label becomes real DOM text — never shrinks below its CSS-specified size.
- Layers are `position:absolute` panels inside a shared stage; each layer gets a `[data-speed]` value and reuses the existing parallax handler.
- On mobile, the steps become a **horizontal swipe carousel** (touch-swipe + dots), one step panel visible at a time — so text is always large enough.
- The connecting arrows/connectors can be pure CSS (borders, pseudo-elements, SVG-as-background on a small decorative element) or tiny inline `<svg>` sparks — but the information-carrying text is DOM.
- **Best readability, best mobile experience, best accessibility (real text is selectable / screen-reader-readable), best fit with the site's existing `[data-speed]` parallax pattern.** Costs more build time (each diagram = a small composition of panels), and the coder must lay out connector lines in CSS/SVG rather than freehand SVG paths.

### Option B — Fully-responsive SVG (viewBox + preserveAspectRatio + breakpoint layer show/hide + larger text)

- Keep the SVG as the asset, but rewrite it so text uses `<text>` with `font-size` in **viewBox-relative units that map to real px at the figure's rendered width**, OR promote key labels out of the SVG.
- Use CSS media queries to show/hide SVG groups by breakpoint (`display:none` on `<g>`). On mobile show a rearranged layout (stacked instead of side-by-side).
- **Keeps a single asset file per diagram, easier to version, preserves the exact hand-drawn look.** Costs: SVG text is still an image for the browser — selectability/screen-reader story is worse than DOM text; breakpoint reflow inside an SVG is fragile; the tall consent diagram (760 tall) is hard to reflow without rebuilding the layout logic in SVG coordinates anyway.

### Option C — Hybrid: responsive-stage HTML shell, SVG only for the hand-drawn decorative layer

- An HTML/CSS stage holds the real DOM text panels (the step cards, labels, captions) so text is always readable and swipeable.
- The **hand-drawn connectors, scribble arrows, and illustrative flourishes** come from the existing SVGs as decorative background layers or small inline `<svg>` accents, stripped of the text they no longer need to carry.
- **Best of both: readable DOM text + keeps the paper/ink/brush aesthetic from the original art.** Slightly more coordination between the stage layout and the decorative SVG.

### Recommendation: **Option C — hybrid HTML/CSS stage with DOM text + decorative SVG layer.**

This is the decisive call. Rationale:

1. The operator's complaint is **text becomes unreadable on mobile** + "want parallax and swipe." The unreadable-text problem is solved only by getting text out of the SVG and into DOM. Option C does that decisively.
2. The site's existing aesthetic is a **hand-built paper/ink scene** (the hero shop scene is pure CSS divs). A DOM-text stage with decorative SVG accents is the same philosophy the rest of the site already uses — it's not a new visual language.
3. It reuses the **existing `[data-speed]` parallax handler** from script.js directly (real DOM layers with `data-speed` attributes), so no new parallax engine is needed — just new layers.
4. The mobile swipe treatment (below) is a carousel of **DOM step panels**, which is the natural mobile form factor for a "4 steps" or "6 nodes" diagram anyway.

The **decorative SVG layer** is a scoped, low-risk use of the existing art: each diagram's connector lines and hand-drawn icons can be extracted as a single `position:absolute` decorative `<svg>` (or SVG-background `<div>`) sitting behind/around the DOM text panels. Where a decorative SVG can't cleanly carry the connectors through a responsive reflow, fall back to CSS borders / pseudo-element arrows / tiny inline SVG sparks — the spec below gives the coder the decision rule.

---

## 3. Motion + responsive technique (decided, not open)

### 3.1 Parallax / layer-on-scroll: reuse existing `[data-speed]` pattern, extend with CSS `animation-timeline: view()` for the entrance

- **Sustained scroll parallax:** keep reusing script.js's existing handler. Each new diagram layer that should drift on scroll gets `class="layer" data-speed="<0..1>"`. The existing handler already bounds drift to 220px max and uses `translate3d` + rAF + passive scroll listener. **Do not rewrite the handler.** Add new layers; existing hero layers are untouched.
- **Entrance motion (as each diagram section scrolls into view):** prefer CSS `animation-timeline: view()` (scroll-driven animation, no JS) for the fade+slide-up entrance of the diagram stage and its panels. Exact spec:
  - Each diagram stage gets a CSS keyframes animation (e.g. fade from opacity 0.2 + translateY(24px) → opacity 1 + translateY(0)) with `animation-timeline: view()` and `animation-range: entry 0% entry 30%` (or similar) so the animation plays as the section enters the viewport.
  - **Fallback:** a tiny vanilla-JS `IntersectionObserver` (no library, ~15 lines) that adds a `.in-view` class to the stage when it crosses the top of the viewport (threshold 0.15), and the CSS animation only runs `.diagram-stage.in-view`. This covers browsers that do not yet support `animation-timeline: view()`.
  - The coder picks the keyframes; the spec requires: (a) entrance animation on the stage, (b) no animation on the existing `[data-speed]` parallax layers during entrance (they only do scroll-drift), (c) respect `prefers-reduced-motion` — on reduced-motion the stage is visible immediately, parallax layers still drift (drift is low-velocity and not perceivable as animation by most reduced-motion users, but if QA flags it, disable `data-speed` drift under reduced motion too).
- **Why not make the parallax the main event:** the goal here is *readable diagrams on mobile*, not a flashy hero. Scroll-driven entrance is the "delight" layer; the real deliverable is responsive text + swipe. Keep drift subtle (existing speeds 0.06–0.42 are the reference band — keep new diagram layers in that band, ~0.08–0.28).

### 3.2 Responsive: NO fixed-size canvas that shrinks

**Hard rule for both diagrams:** at no breakpoint may the information-carrying text shrink below its intended read size. Concretely:

- Desktop read size for step-card titles ≈ **Fraunces 25–27px** (matches the existing feature-grid h3 / reward-explainer h2). Body labels ≈ **Inter 12.5–13.5px** (matches existing `feature-grid p` / `.step p`). Eyebrows/mono labels ≈ **DM Mono 11–12px** (matches existing `.eyebrow` / `.feature-num`).
- On mobile, these sizes **do not shrink** — they stay at or above their desktop sizes. The layout reflows (stacked / swiped) to fit.
- The diagram's **container** (`.diagram-card` today) becomes a **`.diagram-stage`** that is `width: min(100%, 1180px)` (same cap as today's `.diagram-card`) with `position:relative` and `overflow:hidden` only as needed for decorative layer clipping.

### 3.3 Mobile swipe / carousel treatment (touch-swipe + dots + arrows, snap-scroll)

Both diagrams have a natural **ordered sequence** (how-it-works: 4 steps + a loyalty branch; consent-revenue-share: 6 nodes in a flow). On mobile (≤ 720px, matching the site's existing breakpoint), the sequence becomes a **horizontal swipe carousel**.

Spec:

- **Carousel container:** a `.diagram-carousel` strip inside the stage, `display:flex; overflow-x:auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; gap`. Each step panel is a flex child with `scroll-snap-align: start; flex: 0 0 100vw` (one panel fills the viewport) — or, if the panel content is short, `flex: 0 0 80vw` centered with padding. The coder picks the fit; the spec requires single-panel viewport fill on a phone, no side-by-side crowding.
- **Indicators:** dots (one per step) below the carousel, matched to the existing DM Mono 11px / pink aesthetic — active dot filled pink, inactive a muted outline. Matching the site's existing `.share-graphic` circle aesthetic is fine.
- **Arrows (optional but recommended):** prev/next arrow buttons fixed at the left/right edge of the carousel on mobile, DM Mono style, pink on dark or ink on blush — matches the site's button/text-link language. Hide on desktop (desktop shows all steps at once).
- **Swiping the carousel does NOT trigger the scroll-parallax handler's drift** (the carousel is its own scroll container; the window scroll handler should not confuse carousel scroll with page scroll). The coder must scope the parallax handler to `window.scrollY` only — it already is, since it reads `window.scrollY` — but the carousel's own scroll must not move the `[data-speed]` layers. Confirm in QA.
- **Scroll-driven entrance still applies:** the whole stage fades in on scroll-into-view; once visible, the carousel is usable. On desktop, the full layout is visible at once (no carousel); the entrance animation still fires.

### 3.4 What stays a decorative SVG vs. what becomes DOM

Per diagram, the decision rule for the coder:

- **Anything a reader must read / select / have read aloud → DOM text.** (titles, step headings, body lines, captions, labels, numbers.)
- **Connectors / arrows / scribbles / illustrative icons → decorative SVG layer** (the existing SVG stripped of its `<text>` elements, kept as paths/shapes), OR CSS/SVG sparks if the reflow makes the original paths awkward. The coder is allowed to redraw connectors in CSS if it's simpler; the aesthetic target is "dashed pink/muted scribble line," which CSS borders + pseudo-elements can hit.

---

## 4. Per-diagram layout spec

### 4.1 how-it-works (index.html, `#how` section)

**What currently exists:** a `#how` section with section header + copy ("From first hello to favorite place."), then a `.steps` grid of **4 `.step` cards** (the numbered 1–4 explainer), then a `<figure class="diagram-card">` with the `<img>` of the SVG.

**Remaining structure decision (item 4 of the task):** the diagram **complements** the existing 4 `.step` cards — it does **not** replace them. The `.steps` cards are the scannable text summary; the diagram is the visual explainer that shows the same 4 steps plus the loyalty-points branch in one picture. On mobile, both are visible, stacked, and the diagram's internal sequence swipes.

**Layout (mobile-first, desktop = the reflow):**

*Mobile (≤ 720px):*

- Section header (existing) + the 4 `.step` cards (existing, stacked: `.steps` already becomes `grid-template-columns:1fr` under the 720 breakpoint — keep that).
- Below the steps: the diagram stage as a **horizontal swipe carousel of 5 panels**:
  - Panel A — "1 · Shop signs up" (matches step card 1): title (Fraunces 25px) + body (Inter 13px) + an icon/accents from the SVG (the sign-up box visual). One panel, full viewport width.
  - Panel B — "2 · Add customers & rewards" (matches step card 2).
  - Panel C — "3 · Customer checks in" (matches step card 3).
  - Panel D — "4 · Opt into data share → earns a revenue share" (matches step card 4).
  - Panel E — the **loyalty-points branch** as its own swipeable panel: the two branch boxes ("+10 points per check-in" and "Redeem rewards") stacked or side-by-side within the panel, with the dashed connector. This is the part that currently hangs below the 4 boxes in the SVG; pulling it into its own panel on mobile is what makes it readable.
- Dots (5) below the carousel; prev/next arrows on the sides.
- The existing SVG's **bottom caption** ("Keep it local. Keep it transparent…") becomes the stage caption below the carousel — DOM text, Inter 13px, muted.

*Desktop (> 720px):*

- The 4 `.step` cards stay as the existing 4-column grid.
- The diagram stage renders as a **single wide composition** (not a carousel): the 4 step panels arranged left→right with pink arrow connectors between them (CSS borders / small inline SVG sparks for the arrows), the loyalty-points branch dropping below step 3 as in the original — but now using DOM text panels + a decorative SVG/dashed-CSS connector, not a shrinking image.
- The stage can still have subtle `[data-speed]` layers for the decorative connector artwork (slow drift), but the text panels are not parallax layers — they sit in normal flow.
- Entrance: the whole stage fades+slides on scroll-into-view.

**Aesthetic details to match:**

- Step panel cards: white fill (`#fff`), 12px radius, 1.5px `#dcd4d2` border — matches the SVG's step boxes exactly (`rect … fill="#fff" stroke="#dcd4d2" stroke-width="1.5" rx="12"`).
- Step number badge: pink circle (`#f7d4e3` fill, `#ec4899` 2px stroke) with the number in DM Mono — matches the SVG's `<circle … fill="#f7d4e3" stroke="#ec4899">` badges.
- Connectors: dashed pink lines, matching the SVG's `stroke-dasharray="4 3"` on muted paths and solid pink arrows with the arrowhead marker. The coder can implement the arrowhead as a tiny inline SVG or a CSS triangle; the target is the existing look.
- Branch connector (loyalty branch dropping from step 3): dashed muted line, same as SVG.

### 4.2 consent-revenue-share (rewards.html)

**What currently exists:** a `rewards.html` page with hero copy, a 3-article `reward-explainer` grid, a `legal-callout`, then a `<figure class="diagram-card">` with the consent-revenue-share SVG, then a CTA button.

**Remaining structure decision:** the diagram **sits as-is below the legal-callout**, replacing the current `<figure><img></figure>`. The page's 3-article explainer + legal-callout stay; the diagram is the visual closer before the CTA. The existing section headers/copy are untouched.

The consent diagram is a **6-node flow** (customer data → consent registry → data-use event → revenue pool → share credits → spendable/withdrawable), taller than it is wide (720×760). On mobile it must not shrink to illegibility.

**Layout (mobile-first):**

*Mobile (≤ 720px):*

- The 3-article explainer (existing, becomes 1-column under 700 breakpoint — keep that).
- The legal-callout (existing, keep).
- The diagram stage as a **horizontal swipe carousel of panels** representing the flow top-to-bottom, one "row" of the flow per panel:
  - Panel 1 — "Your data. Your consent. A share of the value back to you." title block + Step 1 (Customer data / opt-in) panel. (The SVG's title block text — "THE DIFFERENTIATOR" eyebrow + the two Fraunces lines — becomes DOM text at the top of the stage, not inside a carousel panel; it introduces the whole diagram. Then the carousel carries the flow.)
  - Panel 2 — Step 2: Consent registry.
  - Panel 3 — Step 3: Data-use event (audit hash).
  - Panel 4 — Step 4: Revenue pool.
  - Panel 5 — Step 5: Share credits.
  - Panel 6 — Step 6: the two sub-boxes (Spendable in-store / Withdrawable phase-2) together in one panel — they're a pair in the original, keep them paired.
- Dots (6) below; prev/next arrows on the sides.
- The bottom caption ("Compliance as a feature, not a fine-print burden." + "Consent is visible…") becomes DOM text below the carousel.

*Desktop (> 720px):*

- A **single wide composition** (not carousel) laid out to read like the original flow but using DOM text panels:
  - Top: title block (eyebrow + two Fraunces lines) — DOM text.
  - Top row (side by side): Step 1 (Customer data / opt-in), Step 2 (Consent registry), Step 3 (Data-use event) — three panels across, matching the original's top row. Pink arrow connectors between them.
  - Middle: the pink accent band (the SVG's `#pinkBand` gradient strip under the top row) — can be a CSS gradient band or the decorative SVG; matches the original's visual separation.
  - Lower row: Step 4 (Revenue pool) centered, with arrows in/out; Step 5 (Share credits) to its right.
  - Bottom row: the two sub-boxes (Spendable / Withdrawable), with the curved dashed connectors from the credits node — decorative SVG or CSS; matched to the original's curve.
  - Bottom caption bar (the `#ec4899` 0.08 opacity strip with the Fraunces callout) — DOM text on a tinted strip, matches original.
- Sustained parallax: the decorative connector artwork layer can carry a slow `[data-speed]` drift; text panels stay in normal flow.
- Entrance: stage fades+slides on scroll-into-view.

**Aesthetic details to match (from the SVG):**

- Node cards: white fill, 14px radius, 2px `#ec4899` stroke (matching the SVG's node `<rect>`s).
- Icon circles inside nodes: `#f7d4e3` fill, `#ec4899` stroke (matching the SVG). The icons (person, registry card, hash symbol, droplet, coin, store, wallet) — keep as inline SVG sparks or emoji-free icon marks; the coder may redraw them as small inline SVGs to avoid emoji rendering variance. The spec does not mandate the exact icon geometry, only that each node keeps a small icon mark in the pink/blush language.
- Dashed connectors: `stroke-dasharray="4 3"`-look, muted (`#706978`) for the vertical connector from the registry area down to the pool; pink (`#ec4899`) for the flow arrows.
- The "phase two" sub-boxes: dashed `#706978` border (`stroke-dasharray="5 3"` in the SVG) to signal "future/optional."

---

## 5. Where each lives (final)

| Element | Page | Section | Treatment |
|---|---|---|---|
| Existing 4 `.step` cards + section header | index.html `#how` | unchanged | Keep — do not remove, do not reword |
| how-it-works diagram stage | index.html `#how`, after the `.steps` grid | complements the steps | New `.diagram-stage` (replaces the `<figure class="diagram-card"><img>`), DOM-text panels + decorative layer; mobile = 5-panel swipe carousel; desktop = single wide composition |
| consent-revenue-share diagram stage | rewards.html, after `.legal-callout`, before the CTA button | closer visual before CTA | New `.diagram-stage` (replaces the `<figure class="diagram-card"><img>`), DOM-text panels + decorative layer; mobile = 6-panel swipe carousel (title block is stage header, not a carousel panel); desktop = single wide composition |
| Existing `[data-speed]` hero layers | index.html hero | untouched | Reuse as-is; add new diagram layers in the same pattern |
| script.js parallax handler | both pages | untouched | Reuse; scope to window scroll only; carousel scroll must not move `[data-speed]` layers (confirm in QA) |

---

## 6. Implementation guardrails (for the coder; not a code task for me)

1. **No new libraries, no framework, no tracker deps.** Only vanilla HTML/CSS/JS. The site is deliberately tracker/framework-free.
2. **Reuse script.js's existing `[data-speed]` handler** for any parallax layers in the new diagram stages. Do not duplicate or rewrite it.
3. **Entrance animation:** CSS `animation-timeline: view()` + vanilla-JS `IntersectionObserver` fallback (`.in-view` class). Respect `prefers-reduced-motion`.
4. **Mobile carousel:** CSS scroll-snap + touch; dots + arrows. Carousel scroll must not trigger window-scroll parallax drift.
5. **Text is DOM, always readable:** no diagram text below its intended read size at any breakpoint. Desktop read sizes: Fraunces 25–27px titles, Inter 12.5–13.5px body, DM Mono 11–12px eyebrows/labels.
6. **Aesthetic match:** colors, fonts, radii, dashed connectors, pink/blush/ink palette must match the existing site and the original SVGs — see §4 for the exact values to match per diagram.
7. **Accessibility:** diagram stage gets a meaningful `aria-label` / the existing `alt` text is reflowed into visible captions; carousel has aria role/labels on dots and arrows. Real DOM text is screen-reader-readable (an improvement over the current `<img>` approach).
8. **Decorative SVG layer:** the existing `diagrams/*.svg` files are the source for the hand-drawn connector/icon aesthetics. The coder may extract paths/shapes into a decorative inline `<svg>` layer or redraw connectors in CSS — but should not ship a fixed-size `<img>` of either SVG as the diagram again.

---

## 7. What we are NOT changing (scope guard)

- No copy changes to section headers, step-card text, legal-callout, or captions — the wording stays. (The captions currently inside the SVGs become visible DOM captions with the same wording.)
- No changes to the hero, the steps grid, the share-band, the map placeholder, the rewards explainer, the legal-callout, the footer, the cookie dialog, or the sign-in flow.
- No changes to `privacy.html`, `terms.html`, `signin.html`.
- No build-step, no npm packages, no framework.

---

## 8. Files the coder will touch (and the spec lives here)

**Spec file (this doc):** `D:/MeanSquares/HMD-Frontpage/docs/diagrams-responsive-spec.md`

**Pages to change (implementation, not by me):**
- `D:/MeanSquares/HMD-Frontpage/index.html` — replace the `<figure class="diagram-card"><img>` in `#how` with the new `.diagram-stage` markup.
- `D:/MeanSquares/HMD-Frontpage/rewards.html` — replace the `<figure class="diagram-card"><img>` with the new `.diagram-stage` markup.
- `D:/MeanSquares/HMD-Frontpage/styles.css` — new styles for `.diagram-stage`, `.diagram-carousel`, step/node panels, dots, arrows, entrance animation, reduced-motion, mobile breakpoints. May extend `[data-speed]` layer styles if new layers need positioning.
- `D:/MeanSquares/HMD-Frontpage/script.js` — add the small IntersectionObserver fallback for the entrance animation (if not using `animation-timeline: view()` alone); confirm carousel scroll is out of scope for the window parallax handler. Existing cookie + parallax + menu code untouched.

**Not touched:** `diagrams/how-it-works.svg`, `diagrams/consent-revenue-share.svg` (these remain as the aesthetic source / decorative-asset source; not re-embedded as shrinking `<img>`s). The existing hero `[data-speed]` layers and their CSS remain.

---

*End of spec. The frontend-coder implements per §4–§6; QA verifies per §3.4, §5, and the implementation guardrails in §8.*
