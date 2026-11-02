# UX Scaling — publication-readiness review

Scope: `/work/scaling-ux-capability/`, follow-up to #18. The existing
`feat/case-studies` branch and PR #25 are retained. No merge, deployment, DNS
change, or publication-state change is part of this pass.

## What changed

- The baseline was genuinely small: 12px narrative and supporting copy at a
  16px root, browser viewport scale 1, CSS zoom 1 and device scale 1. This was
  not a zoomed-out screenshot.
- Editorial Work now uses 16px narrative copy (1.65 line height), 14px
  supporting descriptions/diagram annotations and 13px uppercase metadata.
  Light body weight, Newsreader headlines, Inter body text and the palette
  remain unchanged. The shared site's non-editorial 12px token is untouched.
- The three desktop decision columns have more of the row's width and a
  smaller gap to the introduction. Their story and narrative order are
  unchanged; narrower layouts stack them.
- Approach still uses the existing specialist/engineer/team illustration.
  Shorter labels and explanation emphasize operation rather than topology.
  On mobile, those symbols/labels join **Enable → Embed → Support → Apply**,
  removing the repeated three-node illustration. A container breakpoint
  prevents cramped four-column stage descriptions on intermediate widths.
- The original leadership principle retains its italic Newsreader treatment
  and copper rule, but has no quote marks, attribution, or `blockquote`
  semantics. Tina's existing block gets an optional original-thought toggle;
  genuine quotations retain their original behavior.
- Hero callout titles are figure labels rather than H3s before the first H2.
  Supporting copy stays charcoal, not pale gray or small copper text.
- Results explicitly state that follow-through groups may overlap and counts
  are not additive. The 12 participating teams and three distinct observations
  of three teams retain their original labels and qualifiers. Public employer
  attribution remains **Global biotechnology company**.

## Visual comparison

Full-page Chromium captures at native CSS width; open the images at full size
to judge small-screen legibility. Before captures use baseline commit
`70deb55` via local dev. After captures use the production build preview, with
no editor/dev overlay hidden. All use a 1000px viewport height.

| Width | Before | After |
| --- | --- | --- |
| 1440px desktop | [Before](before-1440.png) | [After](after-1440.png) |
| 768px tablet | [Before](before-768.png) | [After](after-768.png) |
| 390px mobile | [Before](before-390.png) | [After](after-390.png) |
| 320px mobile | [Before](before-320.png) | [After](after-320.png) |

The accepted desktop composition, headline sizes, network geometry, section
sequence and horizontal dividers remain recognizable. Larger copy makes the
page moderately longer; consolidating the mobile Approach offsets some of that
growth. No new illustration style, animation, framework or runtime dependency
was introduced.

Reproduce captures with Node 24 and installed Playwright Chromium:

```sh
node scripts/capture-ux-review.mjs before http://localhost:4321
# Stop dev; build; start the documented production preview.
node scripts/capture-ux-review.mjs after http://localhost:4321
```

## Verification results

Node 24.22.1, Playwright 1.64.1 / Chromium, October 30, 2026:

| Check | Result |
| --- | --- |
| `npm test` | **58/58 passed**, including real Tina preview/save/restore and the original-thought toggle |
| `NODE_OPTIONS=--max-old-space-size=3072 npm run test:static` | Passed; runs **two successful `npm run build` builds**, removes fixtures, checks sitemap/metadata and rejects forged production draft access |
| `npm run check` after build | **0 errors, 0 warnings, 0 hints** across 46 files |
| Responsive review | 320, 390, 768, 1024 and 1440px; no horizontal overflow, readable labels and correct stacking |
| Zoom-equivalent reflow | 200% at 720 CSS px / 2× device scale; 400% at 320 CSS px / 4× device scale; no horizontal overflow |
| Accessibility scan | axe-core 4.11.0: **0 violations** at all five widths for WCAG 2/2.1/2.2 A/AA and best-practice tags |
| Links / keyboard | All case-study/header/footer destinations return successful responses; heading order, skip link, menu/Escape, visible focus, native no-JS/reduced-motion reading pass |

The test runner's initial availability probe stalled on this environment's
unused loopback port. Starting the documented server on 4322 first let the
unchanged Playwright configuration reuse it. Chromium used the environment's
existing shared libraries via `LD_LIBRARY_PATH`; no app dependency changed.
A bounded retry now handles the pre-existing fixture-cleanup HMR race in the
release test's DOM overflow check; it still requires the same overflow result.

### Contrast and scan follow-up

[Accessibility results](accessibility.json) retain axe's manual-review entries,
not just the clean violation count. The remaining entries concern decorative
arrows on mobile and text over the SVG layer on desktop. Visual/computed-style
review confirms:

- Charcoal narrative/supporting copy on ivory: **10.71:1**.
- Deep-green headings, principle and links on ivory: **11.28:1**.
- Dark copper uppercase labels on ivory: **5.13:1**; the lighter copper remains
  decorative, not small text.
- Diagram labels over either 8%-opacity ribbon fill: at least **9.31:1** using
  alpha-composited backgrounds; labels inside opaque nodes use the ivory pair.
- Mobile arrows use deep green on ivory (**11.28:1**) and are decorative /
  `aria-hidden`. Relationships also appear in the ordered text and summary.

This is not a claim of comprehensive WCAG conformance or a substitute for
assistive-technology testing. Safari/Firefox and a screen-reader session were
not independently tested in this pass.

### Floating toolbar

There is no authored floating toolbar in this page or the shared shell. Astro's
toolbar is development tooling; Tina's bridge activates in the admin iframe,
not an ordinary top-level visit. The production visitor route was checked for
toolbar elements, visible fixed overlays and editor/dev-toolbar requests:
**none were present** at any reviewed width. Production static checks also
reject accidental Astro-toolbar markup/assets. The after screenshots conceal
no overlays. The reference toolbar is not part of the public page design.

## Publication boundary

The provided participation/outcome facts are preserved, not independently
re-measured. No ROI, satisfaction, defect-reduction, universal self-sufficiency
or nine-distinct-teams claim has been added. The record's existing
`draft: false` is preserved as previously requested by the owner.

Final visual review and external-publication permission remain with Juan.
This local review does not verify deployed TinaCloud editing or hosting/DNS
readiness; those remain covered by the repository's release documentation.
Issue #18 is referenced rather than closed while that review is outstanding;
#26 and #9 are related work, not completed by this refinement.
