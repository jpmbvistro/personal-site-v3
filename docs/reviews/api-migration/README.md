# Evidence-driven API migration — review for #19

Assigned scope: `jpmbvistro/personal-site-v3#19`. Related #9, #20 and #26
are context, not additional assignments. Implementation is on
`feat/19-api-migration`, stacked on the UX benchmark's `feat/case-studies`
(PR #25). Review the shared foundation first; this PR contains only the API
story and its supporting components/tests. No merge or deployment is authorized.

## Implementation decisions

- Reuse the editorial Work presentation, Newsreader/Inter, semantic palette,
  shared metric strip and three-decision editorial primitive. The compact lead
  figure gives this story a 60/40 copy-to-visual hero without changing the UX
  story's wider network figure.
- Two bespoke, static Astro blocks: a compact preview and the full decision
  diagram. No new template, dependency, hydration or graph engine. The new
  optional full-width section layout leaves other stories' order/layout alone.
- Equal-width, equal-height desktop gates give necessity and correctness equal
  visual standing. The continuation starts beside the retained-work lane and
  curves to Gate 2's heading, not directly to its pass/CI outcome. On small
  screens the same semantic content reflows: Gate 1, explicit retained work,
  Gate 2. Exit and mismatch branches stack, and the return line stays beside
  the investigation instead of scaling down a desktop SVG.
- The typed-client/static-comparison assumption is struck through, marked
  superseded, and separated from trusted behavioral inputs. The mismatch loop
  returns to shadow-diff comparison; CI represents repeatable checks, not full
  parity or completed correction of every finding.
- Tina owns prose, section headings/order, metrics, figure captions and fixed
  gate label groups. Astro owns geometry. Empty/incomplete gate objects during
  block insertion render no diagram rather than throwing. The real admin test
  edits nested labels, previews without saving, saves, checks visitor output,
  and restores the original content file.

## Claims and publication boundary

Source: [issue #19](https://github.com/jpmbvistro/personal-site-v3/issues/19)
and the owner's implementation request. The supplied image was read from
`E:\Downloads\Evidence-Driven API Migration Case Study.png` via the local
Windows mount, used only as a composition reference, and not committed.

The four annotations describe **different observations**, not a funnel:

- 37+ planned migrations removed after traffic/support review.
- Contract discrepancies surfaced across 200+ endpoints through response comparison.
- 75 missed behavioral branches identified through legacy implementation analysis.
- Shadow-diff validation integrated into CI.

No endpoint totals/migrated totals, savings estimates, full parity, zero incidents,
or claim that all branches were fixed. Negative-path parity issues are explicitly
excluded from the initial corrective prioritization. The separate harness story
is linked; its corrective tickets are not conflated with removed migration work.
The public organization label remains **Global biotechnology company**.

The existing `draft: false` record is preserved, not a new publication decision.
No production host, DNS, deployment, or TinaCloud content has been changed.

## Review captures

Production-preview Chromium, native CSS widths, device scale 1, 1000px viewport
height. No overlay is hidden by the capture script.

- [Desktop full page — 1440px](page-1440.png)
- [Desktop architecture close-up](diagram-1440.png)
- [390px mobile](page-390.png)
- [320px mobile](page-320.png)
- [Responsive layout and accessibility audit](layout.json)

Reproduce after stopping dev and building:

```sh
NODE_OPTIONS=--max-old-space-size=3072 npm run build
npm run preview
node scripts/capture-api-migration-review.mjs http://localhost:4321 /path/to/axe.min.js
```

## Verification

Node 24.22.1, Playwright Chromium, October 31, 2026:

- `npm test`: **66/66 passed**, including the existing UX, shell, draft-boundary
  and real Tina editing suites. After the final semantic-only correction
  (a diagram note is not a complementary page landmark), the #19 suite was
  rerun separately: **8/8 passed**.
- Responsive assertions cover 320, 390, 768, 1024 and 1440px: no horizontal
  scrolling, clipped diagram text or overlapping hero labels; equal desktop
  gate widths/heights; retained-work connector enters Gate 2's heading.
- Keyboard skip/focus, native navigation, heading order, link destinations,
  no-JavaScript reading, and reduced-motion reading passed. Tina caption and
  nested-label edits preview before saving, save to content, and render for a
  fresh visitor; tests restore the author's files.

- `NODE_OPTIONS=--max-old-space-size=3072 npm run test:static`: **passed**,
  including two successful production builds, API figure/native HTML checks,
  metadata/sitemap checks, fixture cleanup and forged production draft-access
  rejection. No diagram hydration island is emitted.
- `npm run check` after the final build: **0 errors, 0 warnings, 0 hints**
  across 50 files.
- Final production-preview axe-core **4.11.0** scan: **0 violations** at all
  five widths for WCAG 2/2.1/2.2 A/AA and best-practice tags. No toolbar or
  horizontal overflow at any capture width; no overlay was concealed.
- Computed text/background contrast: charcoal **10.71:1**, deep green
  **11.28:1**, dark-copper metadata **5.13:1**. Diagram copy remains at actual
  14px, questions at 16px, and gate metadata at 13px; it is not scaled SVG text.

The audit retains axe's incomplete color-contrast entries for decorative glyphs
and arrows, all hidden from assistive technology. Their computed colors are
charcoal or deep green on ivory; the meaningful labels sit on the same ivory
canvas (including opaque backgrounds over the hero's decorative ribbon).
Arrows are not the only relationship explanation: branch labels and the figure
summary remain available as native text.

Automated scans and contrast checks are not comprehensive WCAG certification.
A screen-reader session and Safari/Firefox were not independently tested.

Earlier runs exposed a narrow-preview overlap and a nested complementary
landmark; both were corrected rather than waived. An earlier reused local
Tina instance lost an unrelated record from its index after repeated test
mutations; a fresh server restored it. The existing link test now scopes its
checks to visitor landmarks instead of Astro's injected dev-toolbar links.
The new font/navigation setup retry is bounded and does not retry layout
assertions. Chromium uses this environment's existing shared libraries via
`LD_LIBRARY_PATH`; no application dependency was added.

## Owner review still required

- Review visual hierarchy, the two-gate explanation, and public wording/claims
  against the supplied evidence. No new factual gap was filled with an estimate.
- Confirm that the approximately three-week MVP detail and the description of
  excluded negative-path prioritization should remain in the public narrative.
- Authorize any later publication/deployment separately. Keep #19 open until
  page/claim review and acceptance are complete; this handoff only references it.
