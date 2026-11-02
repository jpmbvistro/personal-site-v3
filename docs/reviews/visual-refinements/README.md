# Final visual refinement — API migration and agentic delivery

Assigned scope: `jpmbvistro/personal-site-v3#19` and `#20`. `#26` is a design
reference only. This is a focused refinement of the existing implementations,
not a new story template, redesign of the shared shell, or production release.

## Review boundary

Branch `feat/case-study-visual-refinements` starts at `8b39ba2`, the head of
`feat/20-agentic-delivery` / PR #30. Review the existing stack #25 → #29 → #30
before this refinement PR. The PR targets that branch to exclude unrelated,
unmerged work. Retarget/rebase only after the upstream work is integrated.

Refs #19 and #20 without closing either: the original case-study PRs and final
owner visual/wording review remain outstanding. #26 is not completed here.
Existing `draft: false` records are preserved; no merge, deployment, DNS,
TinaCloud mutation or publication-state change is performed.

## Current composition — owner-directed mockup fidelity pass

The owner requested a closer match to the supplied mockups and a wider page
after the first PR iteration. The two architectural stories now use a **90rem
(1440px) maximum canvas**, instead of 72rem. At a 1440px viewport, content is
1344px wide with the existing 48px gutters. The shared header/footer align with
that canvas on these pages; other Work entries, including the approved UX
reference, retain their existing width. Prose still has its reading measure.

`--content-width-wide` owns the value. `WorkPage` opts in through the presence
of either architectural figure, including local Tina preview. The existing
Container now explicitly honors its semantic maximum instead of being capped
by Tailwind's unrelated `.container` breakpoints.

### API migration

- Preserve the headline, attribution, four sections, narrative, three decisions,
  results and reflection. No new endpoint population, denominator or outcome.
- Replace the hero's two generic boxed symbols with two small architectural
  motifs: a filtering/branching inquiry and a comparison/investigation loop.
  Native labels are editable in the existing Tina hero block.
- Keep the existing two-investigation component, now as two softly outlined
  architectural panels. The scope side uses an illustrated evidence column →
  necessity decision → **No / Yes** branches. The larger layered-stack artwork
  accompanies **37+ removed from scope**, rather than a generic backlog box.
- Make the typed legacy client's source-of-truth limitation visible, alongside
  actual legacy implementation/responses and the new proxy implementation.
- The copper return runs from corrective work back to live comparison and is
  explicitly labeled **Revalidate after correction**. CI is a durable check,
  not an all-findings-corrected terminal state. No A → B connector is added.
- 200+ endpoints remain investigation context; 75 branches remain a distinct
  finding. Neither becomes a denominator for the other.

The wider canvas makes horizontal relationships practical without shrinking
labels. The behavioral panel now reads actual inputs → live comparison →
discrepancy investigation/corrective prioritization, with a copper return below
the corrective work. Its two endpoints track the real column centers. Narrow
containers recompose into vertical evidence, branches and an explicit side loop.
At tablet sizes the two investigation panels stack before their labels become
cramped. The mockup's automatic-looking Match → CI branch is intentionally not
copied: the qualified CI capability remains a separate outcome.

### Agentic delivery

- Preserve the existing high-level hero, headline, attribution and metrics.
- Use the mockup's larger intake/PR illustrations, three compact horizontal
  ticket lanes, sage ticket labels, inline worktree/agent/check symbols and
  outlined recovery/improvement panels. Each lane still contains its detailed
  requirements; it is not reduced to an unexplained shield. The extra validation
  information makes the rows taller than the mockup, deliberately preserving
  technical meaning and 14px annotations.
- Tablet lanes keep three independent step columns but move icons above their
  labels to avoid splitting technical words mid-word. Browser assertions check
  the actual text range for “implementation,” not merely whether its box overflows.
- Refactor only the detailed bespoke architecture: intake → independent ticket
  lanes → reviewable PR. Each illustrative lane visibly owns its Git worktree,
  isolated test context, coding agent, required commands, tests and applicable
  shadow-diff integration tests. Validation is no longer a detached shared stage.
- Separate sibling paths below execution: **failure recovery** for one ticket,
  and **system improvement** from diagnostic evidence across executions.
  Their desktop connectors originate beneath execution, not PR handoff. Mobile
  uses explicit failure rules and relationship prose, not a false PR → failure
  pipeline or unreadably scaled connectors.
- Bounded retry can distinguish transient anomalies; persistent failures retain
  human-directed, ad hoc agent assistance. Evidence-led fixes inform subsequent
  executions, not automatic recovery or guaranteed success.
- Change four-decision lists to an editorial **2×2** layout, stacking below
  640px. The accepted three-decision API/UX layouts remain unchanged.
- Shorten the four decisions to two scannable sentences each. Preserve the
  detailed structured-output and scope-interpretation discoveries in Results
  and Reflection, explicitly during the 30 days. The thinner harness remains
  a subsequent evolution, not the original architecture.

## References and asset selection

Inspected the supplied Windows files through `/mnt/e/Downloads`:

- `Two Decisions, One Safer Migration.png` — API composition reference.
- `ChatGPT Image Nov 1, 2026, 08_55_44 AM-2.png` — harness composition reference.
- `image-gen-3(3).png` — the owner's additional layered-stack illustration.
- `architecture_diagram_png_assets/` and the matching ZIP manifest — all twelve
  elements inspected together, with dimensions, alpha channels and file sizes.

The two composition files are treated as the references named in the task,
not as evidence for technical facts. The alias filenames
`two_investigations_safer_migration.png` and
`agentic_delivery_harness_architecture.png` were not separate local files.
No full mockup is embedded as page content.

All pack elements are 1024×1024 transparent PNGs. The ribbon's maximum alpha
is only 46/255; its large raster canvas adds little value over the existing
native strokes. The flat icon/arrow elements are clean, but native SVG gives
better token consistency and controllable relationships. Raster selection:

| Supplied file | Derivative stem | Use |
| --- | --- | --- |
| `01_ticket_backlog_stack.png` | `ticket-stack` | First-pass variant; superseded in the current diagrams |
| `02_validated_pr_cube.png` | `pr-cube` | Harness reviewable PR handoff; label/prose qualify the illustration |
| `03_isolated_worktree.png` | `worktree` | Each isolated ticket lane |
| `image-gen-3(3).png` | Existing `agentic-delivery/ticket-stack.webp` | API removed-work outcome and harness intake, matching the hero's layered stack |

`public/uploads/architecture/` contains transparent, trimmed, square 144px and
288px WebP derivatives (Sharp, quality 82, contain fit). The six files total
about 49.4 KiB; each is 4.4–13.8 KiB. Responsive `srcset`/`sizes`, intrinsic
dimensions and lazy loading keep these below-the-fold illustrations small.
The worktree is repeated from one cached resource, not downloaded per lane.
Existing hero stack/PR assets are intentionally unchanged.

The additionally supplied stack is the same source already optimized for the
hero (320×371px, about 13.9 KiB). Reuse that derivative rather than creating a
duplicate or shipping the oversized PNG. Its source has edge artifacts at full
resolution, but the existing small WebP treatment is clean at the 56–128px
illustration sizes used here. The four active pack derivatives total about
34 KiB; the first-pass square-stack variants are no longer requested by pages.
`ArchitectureIcon.astro` supplies the genuinely repeated, decorative outline
symbols in native SVG, using the surrounding semantic colors.

All meaningful text, branches and loops remain Astro/HTML/SVG. Images have
empty alt text and decorative SVGs are `aria-hidden`; native labels carry
meaning. Each main figure has an accessible name and an explicit relationship
description. There is no React island, graph library or added runtime package.

## Before and after

Production Chromium at device scale 1, 1000px viewport height. Baseline is the
existing built `8b39ba2` implementation, before source changes. No overlay is
hidden to manufacture a clean capture; final captures use the production build.

| Case study | Before desktop | After desktop | After 390px | After 320px |
| --- | --- | --- | --- | --- |
| API | [1440px](before/api-1440.png) | [1440px](after/api-1440.png) | [390px](after/api-390.png) | [320px](after/api-320.png) |
| Harness | [1440px](before/harness-1440.png) | [1440px](after/harness-1440.png) | [390px](after/harness-390.png) | [320px](after/harness-320.png) |

Diagram close-ups are captured at **1440, 1024, 768, 390 and 320px**, before and
after. Updated **1920px** captures verify the wider maximum:
[API](after/api-1920.png) / [harness](after/harness-1920.png).
Full-page baseline mobile captures are included too. See
[before verification](before/verification.json) and
[after verification](after/verification.json).

Reproduce with Node 24, after stopping the local dev server:

```sh
NODE_OPTIONS=--max-old-space-size=3072 npm run build
npm run preview
node scripts/capture-case-study-refinements.mjs http://localhost:4321 after /path/to/axe.min.js
```

This environment uses existing Chromium shared libraries via
`LD_LIBRARY_PATH=/tmp/opencode/chromium-runtime/usr/lib/x86_64-linux-gnu`.
No application dependency or system-wide browser installation was added.

## Verification and limitations

- Current mockup-fidelity pass: **17/17 targeted tests and 75/75 full browser
  tests passed** with Node 24.22.1 and Chromium. Includes the unchanged UX
  benchmark, shared shell, links, real editor saves and a new 1920px assertion
  proving the two stories widen while the UX reference stays at 72rem.
- In the first iteration, two full runs failed (56/74, then 73/74) when test cleanup let Tina
  index an empty document during truncate/rewrite. The missing record affected
  API navigation first, then Home after its editor test. A shared test-only
  atomic replacement helper fixed the restore/update race; the complete suite
  passed without weaker assertions, hidden overlays or added test retries.
- `NODE_OPTIONS=--max-old-space-size=3072 npm run build`: **passed**.
- `npm run check`: **0 errors, 0 warnings, 0 hints**, 58 files.
- `NODE_OPTIONS=--max-old-space-size=3072 npm run test:static`: **passed**,
  including two more production builds, metadata/sitemap, native diagram/no
  hydration checks, production draft rejection and fixture cleanup/rebuild.
- Production axe-core **4.11.0**: **0 violations across all twelve page/width
  combinations**, using WCAG 2/2.1/2.2 A/AA and best-practice tags. The report
  retains incomplete contrast entries for decorative arrows, the gradient
  investigation panels and the unchanged harness hero near SVG/artwork; it does
  not hide them or claim a full audit. Conservative computed bounds supplement
  these entries: **4.91:1** minimum across the panel gradient stops, and **8.28:1**
  for hero labels against the ribbon at its maximum rendered opacity.
- Measured text/background contrast: **4.88:1** for the API warning metadata,
  **10.71:1** for lane validation text, **9.80:1** for ticket names, **10.71:1**
  for body copy and **11.28:1** for deep-green headlines.
- Final production screenshots inspected at **320, 390, 768, 1024, 1440 and 1920px**.
  No horizontal overflow, clipped text, failed images, browser errors or hydrated
  islands in either page. The pack illustrations load from the 144px variants at
  device scale 1; the layered stack reuses the existing 320px resource, including
  the same cached URL in the harness hero and intake. This is
  a basic resource/layout review, not a Lighthouse or Core Web Vitals claim.

Final captures use a separate loopback preview on port 4324 so the pre-existing
preview on 4321 need not be stopped. No dev server is left sharing Tina's build
port. The ordinary reproduction command above can still use 4321.

Remaining human review: visual/wording acceptance. Supplied outcome evidence is
preserved, not independently re-measured. Automated Chromium checks are not a
comprehensive WCAG certification; manual screen-reader and Safari/Firefox
testing are not claimed. No known content-accuracy issue is intentionally
introduced; identified findings, corrected work, PR handoff and deployment
remain explicitly different concepts.
