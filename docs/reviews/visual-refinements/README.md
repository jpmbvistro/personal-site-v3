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

## Smallest implementation scope

### API migration

- Preserve the headline, attribution, four sections, narrative, three decisions,
  results and reflection. No new endpoint population, denominator or outcome.
- Replace the hero's two generic boxed symbols with two small architectural
  motifs: a filtering/branching inquiry and a comparison/investigation loop.
  Native labels are editable in the existing Tina hero block.
- Keep the existing two-investigation component. Give the inherited backlog a
  dimensional illustration, draw explicit necessity branches, label their
  **No / Yes** meanings, and emphasize **37+ removed from scope**.
- Make the typed legacy client's source-of-truth limitation visible, alongside
  actual legacy implementation/responses and the new proxy implementation.
- The copper return runs from corrective work back to live comparison and is
  explicitly labeled **Revalidate after correction**. CI is a durable check,
  not an all-findings-corrected terminal state. No A → B connector is added.
- 200+ endpoints remain investigation context; 75 branches remain a distinct
  finding. Neither becomes a denominator for the other.

The reference's wide, horizontal mini-flow is interpreted as a readable vertical
filter and loop inside the existing editorial columns. This deliberately favors
14px native labels and the established page composition over shrinking a full
mockup into the available space.

### Agentic delivery

- Preserve the existing high-level hero, headline, attribution and metrics.
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
better token consistency and controllable relationships. Use only the three
dimensional illustrations:

| Supplied file | Derivative stem | Use |
| --- | --- | --- |
| `01_ticket_backlog_stack.png` | `ticket-stack` | API inherited backlog and harness ticket intake |
| `02_validated_pr_cube.png` | `pr-cube` | Harness reviewable PR handoff; label/prose qualify the illustration |
| `03_isolated_worktree.png` | `worktree` | Each isolated ticket lane |

`public/uploads/architecture/` contains transparent, trimmed, square 144px and
288px WebP derivatives (Sharp, quality 82, contain fit). The six files total
about 49.4 KiB; each is 4.4–13.8 KiB. Responsive `srcset`/`sizes`, intrinsic
dimensions and lazy loading keep these below-the-fold illustrations small.
The worktree is repeated from one cached resource, not downloaded per lane.
Existing hero stack/PR assets are intentionally unchanged.

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
after, in the corresponding directories. Full-page baseline mobile captures
are included too. See [before verification](before/verification.json) and
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

- Initial targeted browser run: **16/16 passed**, including all five widths,
  per-ticket validation ownership, 2×2 decisions, local correction-loop geometry,
  native no-JavaScript/reduced-motion rendering, links, keyboard skip/focus and
  real Tina preview/edit/save with file restoration.
- Full browser suite: **74/74 passed** with Node 24.22.1 and Chromium, including
  the unchanged UX benchmark, shared shell, links and real editor saves.
- API-specific suite: **8/8 passed again** after making the optional hero-label
  lists null-safe for the CMS. One earlier foreground invocation hit the harness's
  120-second command timeout during server startup; the background rerun finished
  successfully without a test/configuration change.
- Two earlier full runs failed (56/74, then 73/74) when test cleanup let Tina
  index an empty document during truncate/rewrite. The missing record affected
  API navigation first, then Home after its editor test. A shared test-only
  atomic replacement helper fixed the restore/update race; the complete suite
  passed without weaker assertions, hidden overlays or added test retries.
- `NODE_OPTIONS=--max-old-space-size=3072 npm run build`: **passed**.
- `npm run check`: **0 errors, 0 warnings, 0 hints**, 57 files.
- `NODE_OPTIONS=--max-old-space-size=3072 npm run test:static`: **passed**,
  including two more production builds, metadata/sitemap, native diagram/no
  hydration checks, production draft rejection and fixture cleanup/rebuild.
- Production axe-core **4.11.0**: **0 violations across all ten page/width
  combinations**, using WCAG 2/2.1/2.2 A/AA and best-practice tags. The report
  retains incomplete contrast entries for decorative arrows and the unchanged
  harness hero near SVG/artwork; it does not hide them or claim a full audit.
- Measured text/background contrast: **4.61:1** for the API warning metadata on
  its muted surface, **10.14:1** for lane validation text, **10.68:1** for ticket
  names, **10.71:1** for body copy and **11.28:1** for deep-green headlines.
- Final production screenshots inspected at **320, 390, 768, 1024 and 1440px**.
  No horizontal overflow, clipped text, failed images, browser errors or hydrated
  islands in either page. All new illustrations load from the 144px variants at
  device scale 1; the repeated worktree uses the same cached resource. This is
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
