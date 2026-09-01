# R8-FP-DIAGRAMS QA Report — responsive diagram redesign (commit b25b024)

Date: 2026-08-31 · QA agent: qa · Scope: index.html `#how` + rewards.html consent diagram
Tested in headless Chromium (Edge) via CDP at 375×812 (mobile) and 1280×900 (desktop),
against a local HTTP server (127.0.0.1:4187) serving the committed tree (b25b024).

## VERDICT: NOT PASS — 1 BLOCKER

The redesign's core defect: the global parallax script now translates the diagram
**panels** themselves by up to 220px, displacing them out of their containers.

### Root cause (do not fix the symptoms, fix this)
`script.js` line 6: `const layers = [...document.querySelectorAll('[data-speed]')]`
already existed to move hero layers. Commit b25b024 added `data-speed=".08"…".28"`
attributes to the diagram panels (and a `.diagram-ink-layer` span) so the panels get
caught by the same scroll handler (`move()` applies
`translate3d(0, min(scrollY*speed, 220), 0)` to every `[data-speed]` element).

By the time a user scrolls to the diagram, `scrollY` is large, so every panel is pushed
`translateY(220px)` (cap reached). The CSS grid/flex layout does NOT compensate; the
`overflow:hidden` on `.diagram-stage` clips whatever falls outside.

### Defect D-1 (BLOCKER): Diagram panels displaced ~220px downward on scroll
Affects BOTH diagrams, BOTH viewports. Measured geometry (getBoundingClientRect):

Mobile 375px, diagram centered in viewport (carousel window = clip region):
- index `#how`: carousel window top 464 / bottom 726. Panels span 688–934.
  Only 39px of each 247px panel is inside the carousel window → **16% visible**.
  The 5 step cards are effectively INVISIBLE — user sees empty pink space + dots + caption.
- rewards consent: carousel window 611–947. Panel 1 spans 741–1061 → bottom 114px
  clipped below the window (~64% visible); panels 2–6 only ~35% visible.

Desktop 1280px:
- index `#how`: heading bottom 172 vs first panel top 416 → **244px dead gap** between
  heading and panels. Branch panel ("Good visits add up") spans 677–867 while stage
  bottom is 809 → bottom ~58px clipped by `overflow:hidden`.
- rewards consent: panels are staggered by different translate amounts (115/173/220px)
  → ragged, misaligned rows. Phase panel bottom (1016) exceeds stage bottom (981) → clipped.

Proof (transforms stripped → correct layout): removing the transforms gives
index panel1 top = 196 (gap 24px, not 244px), branch panel fully inside the stage,
rewards rows aligned. So the layout is correct *except* for the parallax displacement.

Screenshots:
- D:\MeanSquares\HMD-Frontpage\docs\qa-evidence\index_mobile_visible.png  (cards invisible)
- D:\MeanSquares\HMD-Frontpage\docs\qa-evidence\rewards_mobile_visible.png (panel clipped)
- D:\MeanSquares\HMD-Frontpage\docs\qa-evidence\index_desktop_stage.png vs index_desktop_stage_stripped.png
- D:\MeanSquares\HMD-Frontpage\docs\qa-evidence\rewards_desktop_stage.png vs rewards_desktop_stage_stripped.png

Fix direction for frontend-coder (do NOT just eyeball): the panels must not be moved by
the global scroll handler. Options: (a) don't put `data-speed` on `.diagram-panel`
(remove it, or scope the parallax selector to the hero / to `.diagram-ink-layer` only),
or (b) exclude `[data-diagram] .diagram-panel` in script.js, or (c) compensate per-panel.
Also decide whether the "subtle data-speed layers" intent applies to panels at all —
on desktop the cap makes all but the slowest panel translate the same 220px, so no
stagger is even visible; on mobile it destroys the carousel.

### Defect D-2 (MINOR / cosmetic): `.diagram-ink-layer` has no CSS
The span exists in index.html (`class="diagram-ink-layer layer"`, data-speed=".12")
but no stylesheet rule targets it → renders as an empty `display:inline` span with no
background (verified: bg none, w/h auto). The intended paper/ink backdrop layer does
nothing. Either style it or remove it.

## Per-check results (checklist from task)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Text readable at ~375px, no fixed-size canvas | FAIL | Font sizes are fine (h3 26px, p 13.5px, small 11px) but the cards are displaced out of the carousel → content not visible (16% on index). Root cause D-1. |
| 2 | No overflow / no forced zoom-out | PASS | `body{overflow-x:hidden}`; visualViewport.scale = 1 at 375px and 1280px; no horizontal scrollbar (docScrollW 476 on index is the pre-existing proof-strip overflow, already clipped by overflow-x:hidden; rewards 375 clean). |
| 3 | Mobile swipe / carousel | PARTIAL | Dots (click → scrolls + aria-selected updates) PASS. Prev/next arrows PASS (scrollLeft 18→369→30). Native touch-swipe cannot be directly driven in this headless harness (touch events not delivered to page), but the carousel uses overflow-x:auto + scroll-snap, the standard mechanism. NOTE: even when it swipes, the visible cards are broken by D-1. |
| 4 | Desktop scroll/parallax motion as specced | FAIL | Layers do translate on scroll, but the effect is applied to the diagram panels with up to 220px displacement → 244px gap + panel clipping (D-1). The intended "subtle" parallax is not subtle and breaks layout. Reduced-motion handling itself works (animation none, opacity 1, scroll-behavior auto under prefers-reduced-motion: reduce). |
| 5 | Both diagrams render on desktop AND mobile | FAIL | index mobile: cards invisible; desktop: 244px gap + branch panel clipped. rewards: panels clipped/misaligned at both sizes (D-1). |
| 6 | Aesthetic (paper/ink/brush + Fraunces/Inter/DM Mono) | PARTIAL | Fonts load and apply (document.fonts.check true for all three); blush background, pink accents, serif headings preserved. Ink layer renders nothing (D-2). Layout broken by D-1. |
| 7 | No console errors / broken assets / tracker deps | PASS* | No JS exceptions. Only a pre-existing 404 for /favicon.ico (not diagram-related). No analytics/tracker requests; only Google Fonts + local css/js. *favicon 404 noted as trivial. |

## Tested configuration
- Browser: Edge (Chromium) headless via CDP, device metrics 375×812 (mobile:true) and 1280×900.
- Server: python http.server on 127.0.0.1:4187 (workspace D:\MeanSquares\HMD-Frontpage).
- Evidence screenshots: D:\MeanSquares\HMD-Frontpage\docs\qa-evidence\*.png
- QA driver scripts (workspace scratch): docs/_qa_cdp.py, _qa_panels.py, _qa_interact.py,
  _qa_swipe_final.py, _qa_mobile_vis.py, _qa_desktop_geo.py, _qa_reduced.py

## Handoff to frontend-coder
BLOCKER D-1 must be fixed before ship: diagram panels are vertically displaced by the
global `[data-speed]` parallax handler. Repro: open index.html, scroll to the #how
diagram at phone width → the 5 step cards are not visible; at desktop width there is a
large gap and the branch panel is clipped. Fix the root cause (scope/exclude the panels
from the scroll handler), then re-verify at 375px and 1280px.
