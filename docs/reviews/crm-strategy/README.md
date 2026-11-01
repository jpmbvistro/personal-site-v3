# Nonprofit CRM technology strategy — #21

Assigned scope: `jpmbvistro/personal-site-v3#21`. #9 (Work architecture) and #26
(design system) are references, not assigned closures. This is a local
implementation and review handoff, not a deployment.

## Review boundary

Branch `feat/21-nonprofit-crm-strategy` starts at `890106c`, the head of
`feat/case-study-visual-refinements` (PR #31). The new PR targets that branch to
keep its diff limited to CRM work. Upstream review order: #25 → #29 → #30 → #31
→ this PR. Retarget after the upstream work is integrated; do not merge the
stack automatically.

Refs #21 without closing it in this stacked PR. The implementation addresses
the requested page; owner visual/wording review and integration into the default
branch remain. The existing owner-selected `draft: false` state is preserved.
New Work entries still default to draft. No publication-state change, hosted
CMS write, deployment, DNS change or confidential record import is performed.

## Implementation

- Existing `WorkPage`, `EntryContent`, `StorySection`, `MetricStrip`,
  `EditorialCallouts` and original-thought `BlockQuote`; one shared shell.
- The headline leads a broad editorial hero, with summary alongside at desktop
  and the full decision storyboard below. The 90rem canvas reuses the existing
  wide token; the UX benchmark remains 72rem. Narrative copy stays at 16px,
  figure descriptions at 14px, stage metadata at 13px. Prose retains a reading
  measure even beneath a wide figure.
- Four authored sections, three thinly separated desktop decisions, three
  delivered outcomes and a clearly original leadership reflection. Mobile
  stacks the decisions and all stages in reading order.
- Two bespoke static Astro figure blocks registered in the existing Tina
  rich-text registry. Captions, relationship descriptions, platform labels,
  tradeoffs, model assumptions and conceptual categories are editable—not
  geometry, image placement or arbitrary SVG coordinates. Decisions, outcomes
  and related-work links use the existing fields/blocks.
- Figure images are decorative (`alt=""`); HTML carries the actual labels.
  Both figures have an accessible name and linked description. Connections,
  ribbons and abstract fee curves are native SVG/CSS, not flattened mockups.
  No new dependency, client calculator, React island or animation.

## Comparison with supplied visual references

Inspected every supplied image in `E:\Downloads\New folder` through the mounted
`/mnt/e/Downloads/New folder`. The two decision mockup files are duplicates;
the combined “Nonprofit CRM Strategy” image repeats both diagrams. The
individual artwork files have timestamped filenames; the descriptive names
below map them to their intended use. Retained reference derivatives:

- [CRM decision transformation](references/crm_decision_transformation_mockup.webp)
- [Donor cost model](references/donor_cost_model_mockup.webp)

**Decision transformation:** retains balanced initial A/B panels, restrained
copper intervention/forward arrows, a sage outcome surface, dimensional stack
art and quiet ribbons. The outcome repeats **Platform A** and explicitly says
it is an amended offer from the same vendor. Initial tradeoffs have equal
visual weight; no third product or fake selection metric is introduced.
The intervention credits Juan's modeling and Impact Innovations' commercial
engagement separately. At small widths the same HTML becomes A → B (grouped
as initial alternatives), intervention → negotiated A; there is deliberately
no arrow implying that A becomes B.

**Donor model:** retains pyramid + assumptions → central scenario model →
relative fee exposure, with restrained copper junctions. Tier names live
beside the artwork as HTML, explicitly illustrative rather than original
client labels. The comparison uses solid/dashed conceptual lines and a visible
“Illustrative curves · Not to scale · No client scenario values” notice—no
axis values, dates, rates, donor counts, dollars or fabricated client outputs.
The legend stacks at phone widths so platform names remain intact.

Intentional differences from the mockups: typography/palette inherit the
accepted site tokens; functional explanations take more space; conceptual
curves are visibly qualified rather than presented as data; small screens
recompose vertically instead of scaling down a desktop image. The headline
remains more prominent than either diagram.

## Asset handling

All seven supplied illustrations are 1254×1254 RGBA PNGs. Their original
combined size is approximately 5.68 MiB. They have genuine transparency, but
some white/yellow edge specks are visible at source resolution; their reduced
illustration sizes are visually clean against the warm-ivory surfaces. No
white rectangular matte is introduced, and no image carries essential text.

Originals are retained under [sources/](sources/) outside the public directory.
[assets.json](assets.json) records exact source dimensions, byte counts,
original timestamped filenames and derivative sizes.

| Retained descriptive source | Use |
| --- | --- |
| `layered_sage_platform_stack.png` | Comparable A/B illustrations; larger negotiated A with a native decorative check |
| `copper_handshake_emblem.png` | Complementary vendor-engagement intervention |
| `warm_ivory_calculator_badge.png` | Scenario-model junction |
| `isometric_green_growth_chart_icon.png` | Donor-volume assumption, not a realized growth claim |
| `isometric_green_slider_settings_icon.png` | Configurable giving distribution, not an interactive control |
| `stacked_green_coin_transaction_icon.png` | Fee-structure input |
| `three_tiered_green_and_copper_pyramid.png` | Conceptual giving tiers with external HTML labels |

Sharp trims transparent margins and exports square, transparent WebP at quality
85 / alpha quality 100. Small illustrations have 128/256px variants; the pyramid
has 320/640px variants. Intrinsic sizes, responsive `srcset` and lazy loading
for the model prevent unnecessary layout shifts/large downloads. The outcome
reuses the same cached stack resource rather than a new illustration style.

All fourteen derivatives total about 153.3 KiB. The eight distinct resources
requested by scale-1 Chromium total about 57.9 KiB (the A/B stack is reused).
The original source files and review screenshots are not copied into public
assets. Reproduce asset preparation explicitly, not as part of a normal build:

```sh
node scripts/optimize-crm-assets.mjs '/mnt/e/Downloads/New folder'
```

## Screenshots

Production Chromium, scale 1, 1000px viewport height; fonts and lazy images
settled before capture. No hidden development overlay or screenshot-only CSS.

| View | Full page | Decision transformation | Donor model |
| --- | --- | --- | --- |
| 1440px | [Desktop](screenshots/crm-1440.png) | [Figure](screenshots/decision-1440.png) | [Figure](screenshots/model-1440.png) |
| 1024px | — | [Figure](screenshots/decision-1024.png) | [Figure](screenshots/model-1024.png) |
| 768px | — | [Figure](screenshots/decision-768.png) | [Figure](screenshots/model-768.png) |
| 390px | [Mobile](screenshots/crm-390.png) | [Figure](screenshots/decision-390.png) | [Figure](screenshots/model-390.png) |
| 320px | — | [Readability](screenshots/decision-320.png) | [Readability](screenshots/model-320.png) |

```sh
# Node 24; stop dev/tests before building (Tina uses shared ports).
NODE_OPTIONS=--max-old-space-size=3072 npm run build
npm run check
HOST=127.0.0.1 PORT=4324 npm run preview
node scripts/capture-crm-strategy.mjs http://localhost:4324 docs/reviews/crm-strategy/screenshots /path/to/axe.min.js
```

The environment's existing Chromium runtime requires
`LD_LIBRARY_PATH=/tmp/opencode/chromium-runtime/usr/lib/x86_64-linux-gnu`.
Preview uses 4324 to leave the pre-existing loopback preview on 4321 alone.

## Accuracy and verification boundary

- `npm test`: **83/83 passed**, including eight CRM-specific checks, all five
  requested viewport widths, diagram reading order, image loading, accessible
  names/descriptions, nonfabricated figures, related links, keyboard focus,
  no-JavaScript/reduced-motion rendering and actual Tina unsaved preview/save.
  Existing UX/API/harness, shared shell, collection, draft and editor tests pass.
- `npm run check`: **0 errors, 0 warnings, 0 hints** (63 files).
- `NODE_OPTIONS=--max-old-space-size=3072 npm run build`: **passed**.
- `NODE_OPTIONS=--max-old-space-size=3072 npm run test:static`: **passed**,
  including two more production builds, CRM native figure/sitemap/accuracy
  assertions, production draft rejection, fixture cleanup and a clean rebuild.
- Final production capture / axe-core **4.11.0**: **0 violations across all
  five requested widths**, with WCAG 2/2.1/2.2 A/AA and best-practice tags.
  [verification.json](screenshots/verification.json) retains axe's incomplete
  contrast checks around decorative SVGs; these are not silently suppressed.
  Computed text/background contrast is at least **4.54:1** on the actual
  surfaces; the conservative copper-ribbon overlap bound is **4.73:1**.
- Final screenshots inspected at 320, 390, 768, 1024 and 1440px. No horizontal
  overflow, clipped text, failed images, browser errors, dev toolbar or hydrated
  islands. The production figures remain static, readable native HTML/SVG.
- Initial verification caught a test typing error and missing explicit
  `aria-hidden` on the model SVG (its container was already hidden); both were
  corrected before the passing full run. A conservative ribbon contrast bound
  also prompted a lower-opacity treatment, rather than ignoring the finding.

The public narrative uses the owner-supplied facts in #21 and this assignment.
Juan owns the financial model; Impact Innovations owns the vendor engagement.
The concession enables the required feature without the unaffordable upgrade;
the page invents no vendor, contract, fee rate or financial amount. Modeled
growth is not claimed as realized growth. First-year savings compare actual
activity against the alternative fee structure—not additional fundraising
revenue caused by CRM selection. The migration and subsequent operational use
remain explicit outcomes.

The financial evidence is supplied by the owner, not independently remeasured
from private records. No unresolved factual question is known. Final visual
and wording acceptance remain with the owner. Automated Chromium checks are
not a comprehensive WCAG certification; manual screen-reader testing and
Safari/Firefox validation are not claimed.
