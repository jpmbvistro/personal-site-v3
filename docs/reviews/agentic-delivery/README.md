# Agentic delivery harness — review for #20

Assigned scope: `jpmbvistro/personal-site-v3#20`, after completing the #19
narrative correction in PR #29. Branch `feat/20-agentic-delivery` is stacked on
`feat/19-api-migration`; review #25 → #29 → this PR. Only #20 is implemented
here. No merge, deployment or publication-state change is authorized.

## Implementation and composition

- Existing editorial Work layout, Newsreader/Inter, palette, navigation,
  metric strip, illustrated callouts and original-thought block. No new page
  template, dependency, client hydration or general-purpose graph engine.
- The hero recreates backlog → multiple independent ticket layers → reviewable
  PR, with fine copper/ribbon motifs and an explicit recovery label. The checks
  mean validation is required, not that all attempts passed the first time.
- The detailed native Astro/HTML diagram separates sequential proof from later
  parallel scaling, then shows three representative per-ticket worktree,
  coding-agent and isolated-test lanes. Required commands/tests/shadow diff
  govern successful handoff; failure blocks completion.
- Bounded retry and persistent-failure human assistance are separate from the
  success path. The desktop dashed return points back to execution. Langfuse
  evidence → debugging-agent investigation → targeted improvements is a
  distinct, qualified feedback path—not guaranteed automatic correction.
- Mobile deliberately orders intake, isolated execution, validation, PR handoff,
  recovery and improvement. Its per-ticket labels remain native text, not
  a scaled screenshot/SVG. Four editorial decisions stack on small screens.
- Tina edits prose, metrics, captions, phase text and fixed label groups;
  Astro owns presentation. Repeated lane labels are authored once, then
  rendered for each representative ticket. Empty/incomplete new blocks do
  not require a fully populated graph to render safely.

## Supplied artwork

The owner supplied `ChatGPT Image Oct 31, 2026, 03_37_23 PM.png` as the page
composition reference, plus stack, PR-cube and two ribbon elements. These are
conceptual artwork, not screenshots of proprietary tooling.

- `image-gen-3(3).png` → `public/uploads/agentic-delivery/ticket-stack.webp`
- `image-gen-5(3).png` → `public/uploads/agentic-delivery/pr-cube.webp`

Both are trimmed, transparent 320px WebP derivatives with explicit dimensions.
The original full-page mockup is not embedded in the site. Ribbon references
are interpreted with lightweight native SVG strokes; no large raster ribbon
or animation runtime is needed. Decorative assets have empty alt text; their
meanings are supplied by authored HTML labels.

## Claims and distinctions

Sources: [issue #20](https://github.com/jpmbvistro/personal-site-v3/issues/20)
and the owner's approved copy/reference. Supplied facts are preserved, not
independently re-measured:

- 40 corrective tickets reached PR within 30 days; not necessarily merged or
  deployed. This is not the 37+ planned migrations removed in #19.
- 35/40 required no manual code-writing, not zero oversight or intervention.
- Approximately two hours average human intervention per ticket.
- Approximately 1–1.5 days average ticket cycle time, supplied in the approved
  copy (not specified in the issue's original evidence list).
- Earlier behavioral analysis/tests supplied a foundation, not proof of
  parallel code generation. Sequential proof preceded enabling concurrency.
- Structured-output and scope-check changes happened during the delivery
  window. Thinner subsequent harness designs are explicitly later learning.
- Three lanes are illustrative; no exact concurrency maximum, ROI, adoption,
  defect rate or automatic first-pass completion percentage is invented.

Public employer: **Global biotechnology company**. No internal source,
repositories, ticket identifiers or private trace contents. The existing
`draft: false` is preserved; no production hosting, DNS or TinaCloud mutation.
Owner visual/wording review remains; #20 is referenced rather than closed.

## Review captures

Production Chromium, native CSS width, device scale 1 and 1000px viewport
height; no overlay hidden:

- [Desktop full page — 1440px](page-1440.png)
- [Architecture close-up](diagram-1440.png)
- [390px mobile](page-390.png)
- [320px mobile](page-320.png)
- [Layout and accessibility results](accessibility.json)

Reproduce after stopping dev and building:

```sh
NODE_OPTIONS=--max-old-space-size=3072 npm run build
npm run preview
node scripts/capture-agentic-delivery-review.mjs http://localhost:4321 /path/to/axe.min.js
```

## Verification

Node 24.22.1 / Playwright Chromium:

- **74/74 browser tests passed**, covering the new page, corrected API story,
  UX benchmark, shared shell and real Tina saves. The 8 delivery-specific tests
  passed again after adding explicit four-decision reflow assertions.
- **Static checks passed**, including two successful production builds,
  metadata/sitemap, static diagrams/no hydration, conceptual-lane qualifiers,
  fixture cleanup and forged production draft-access rejection.
- **Typecheck: 0 errors, 0 warnings, 0 hints**, 55 files, after the final build.
- Responsive coverage: **320, 390, 768, 1024, 1440px**. No horizontal overflow
  or clipped labels. Each lane independently names its worktree, coding agent,
  isolated tests and required checks. Six diagram groups reflow in DOM order;
  four decisions stack at small widths.
- Keyboard skip/focus and native menu behavior, related links, heading order,
  no-JavaScript and reduced-motion reading passed. Tina preview/edit/save
  checks cover the hero caption, diagram caption, shared per-ticket worktree
  label and recovery text; files are restored after the tests.
- Production axe-core **4.11.0**: **0 violations** at all five widths for WCAG
  2/2.1/2.2 A/AA and best-practice tags. No toolbar or hidden overlay in captures.
- Text contrast: body/ivory **10.71:1**, deep-green/ivory **11.28:1**,
  dark-copper metadata **5.13:1**. Actual tinted-lane body contrast is
  **8.96:1** and ticket headings **9.44:1**. Hero text is on opaque nodes or
  outside the artwork; even the conservative full-opacity ribbon-over-ivory
  bound is **8.28:1** for its labels.

The audit retains axe's incomplete contrast entries for decorative arrows and
text near the hero SVG/artwork. Computed ancestor backgrounds and the bounded
ribbon calculation supplement that scan rather than concealing its limitations.
These checks are not comprehensive WCAG certification; manual screen-reader
and Safari/Firefox testing are not claimed.

The first broad run exposed an old authoring-test assumption: clicking the
rich-text editor's center could open the new hero embed instead of placing a
caret. The insertion test now focuses the native editable surface and uses the
keyboard to create its trailing paragraph. Real insertion, editing, reordering
and saving pass; no editor behavior is mocked or validation assertion weakened.

Chromium uses the environment's existing shared libraries through
`LD_LIBRARY_PATH`. No application dependency was added. The four PNGs and
accessibility report linked above are final production-preview captures.
