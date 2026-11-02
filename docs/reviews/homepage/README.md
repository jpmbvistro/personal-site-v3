# Editorial engineering-leadership homepage

## Scope and source of truth

This implements the owner's November 1 homepage brief on the existing Astro/Tina
foundation. The verbatim approved headline/support copy and supplied case-study
summaries supersede image-generated copy. The shared header, navigation, footer,
brand signoff and contact/résumé configuration remain intact. No merge,
deployment, DNS change or project publication is included.

Composition references retained here:

- [Supplied desktop reference](references/homepage-desktop.webp), from
  `00_homepage_desktop.png`: headline-first editorial hierarchy, light transitions,
  two-column Work, original perspective and a deep-green closing surface.
- [Asset-pack reference](references/asset-pack.webp), from
  `juan_vistro_homepage_visual_assets/asset-pack-preview.jpg`: green/sage sculptural
  illustration language and four art-only Work thumbnails.
- Existing approved [UX](../ux-scaling/README.md),
  [architectural Work](../visual-refinements/README.md) and
  [CRM](../crm-strategy/README.md) treatments: Newsreader/Inter, semantic palette,
  editorial spacing and responsive native diagrams.

Intentional changes from reference imagery follow the brief: a grounded practice
band rather than a metrics dashboard; UX → agentic delivery → API → CRM; approved
full titles and summaries; “Let's connect”; and no fabricated project interfaces.
This is an implementation for visual review, not an assertion of pixel identity
or final approval of all outstanding #26 identity work. The existing supplied
logo exports were inspected; they contain embedded raster art and exceed 1.6 MB
each. This task does not replace the shared shell's lightweight text wordmark.

## Content and publication

- `content/pages/home.md` owns the headline, rich-text supporting statement,
  practice band, section introductions, curated slug lists, original leadership
  statement and closing action. It is a fixed content group, not a page builder.
- `HomePageContent.astro` is the single native Tina island, including live
  selection resolution. `HomeIntro.astro` retains title/body in-context editing.
- Cards read the Work/Project records' summaries and optional card metadata.
  `selectFeatured` preserves explicit order, deduplicates, and fails closed for
  draft, missing and unselected entries. Indexes continue listing all published
  entries. New entries still default to draft.
- All four Work routes were confirmed published. Case titles are not a claim
  that all teams reached equal maturity, that 40 PRs were deployed, that every
  API finding was fixed, or that nonprofit projections were realized savings.
- **Project cards are deliberately deferred:** Contour has no record; Keel's
  only existing record is a draft describing a harness that stops at awaiting
  verification. The homepage neither changes that state nor exposes its preview.
  The Tina-managed Asterism note preserves the section without inventing public
  availability. Genuine published entries/artifacts can populate the existing
  card layout later, without template changes.
- Contact's Tina `resume` field remains the résumé source (`/resume/`). Missing
  or unsafe configuration produces the available contact action, not a fake file.

## Illustration and assets

`EngineeringLeadershipDiagram.astro` uses native semantic HTML plus decorative
SVG ribbons/connectors. Three sculptural, sage/green domain nodes converge on
Engineering leverage and the three outcomes. Its text alternative explicitly
identifies a philosophy, not an organizational chart. Mobile rearranges nodes
vertically with full-size HTML labels, below the copy and both actions. The
perspective is original prose, not quotation/testimonial markup.

The four supplied art-only thumbnails are encoded to 400px/800px WebP, with
responsive sources, lazy loading, intrinsic dimensions and no crop of their
compositions. Decorative Work imagery does not duplicate the adjacent titles in
alt text; genuine future project artifacts support meaningful descriptions.
Original source hashes and output dimensions/bytes are in [assets.json](assets.json).
Reproduce with:

```sh
node scripts/prepare-homepage-assets.mjs /path/to/juan_vistro_homepage_visual_assets
```

No new runtime dependencies, client islands, charting or animation frameworks.
The homepage opts into the existing editorial token/font scope, including the
shared shell. Editorial font preloads reduce fallback reflow; no external fonts.

## Review captures

Produced from a credential-free **built** loopback preview, not Tina's local
editing iframe:

- [1440px full page](screenshots/page-1440.png)
- [1440px hero](screenshots/hero-1440.png)
- [1440px selected Work](screenshots/selected-work-1440.png)
- [390px full page](screenshots/page-390.png)
- [320px hero](screenshots/hero-320.png) and [diagram](screenshots/diagram-320.png)
- Full-page intermediate checks: [320](screenshots/page-320.png),
  [768](screenshots/page-768.png), [1024](screenshots/page-1024.png)
- [Viewport, contrast, image and local performance observations](screenshots/verification.json)

To reproduce, stop Tina/dev first, build with Node 24, then run a loopback preview
on port 4324 and `node scripts/capture-homepage.mjs`. This machine's browser needs
`LD_LIBRARY_PATH=/tmp/opencode/chromium-runtime/usr/lib/x86_64-linux-gnu` (existing
local runtime libraries, not a project dependency). Loopback performance timings
are sanity checks, not field Core Web Vitals or a Lighthouse score.

## Verification

- Node 24.22.1, `npm ci`; no dependency changes. npm reports existing audit
  findings (28 total, including 21 high); dependency remediation is not included.
- `npm run build` passed; `npm run check` reported no errors, warnings or hints.
- `npm run test:static` passed, including clean builds before/after temporary
  fixtures, canonical/sitemap checks, exact homepage Work order and optimized
  asset availability, and production rejection of draft/forged preview requests.
- `npm test`: **92 passed** in the final full run. Coverage includes the five
  homepage widths, approved copy/order, genuine-artifact project fixtures,
  duplicate/missing/draft selection rejection, résumé fallback, in-page anchor,
  shared navigation/keyboard operation and no-JavaScript/reduced-motion use.
- The real local Tina editor previews and saves the homepage title and leadership
  narrative, and all existing Work/Project/About/Résumé save flows still pass.
  A pre-existing UX editor test now restores content atomically and retries its
  initial iframe until Tina indexing is ready, avoiding empty-document races.
  This harness times out instead of refusing unused loopback ports, so its local
  Tina test server was started explicitly on 4322 before `npm test` and stopped
  before the static build checks; no editor or API was exposed publicly.
- Built-page captures at 320/390/768/1024/1440px show no horizontal overflow or
  unloaded images. The primary hero action precedes the mobile diagram. Hero
  and closing controls retain visible 3px, contrasting keyboard outlines.
- Axe reports zero violations at all five widths. Its unresolved contrast checks
  concern the three gradient-backed domain labels and an aria-hidden link arrow;
  the darkest gradient stop and arrow are checked separately in the capture
  script. This is not a claim of complete WCAG certification.
- Font preloading produced zero observed CLS in the loopback captures. The
  evidence file retains the actual local timings and resource transfer sizes;
  these do not establish deployed/field performance.

## Handoff boundary

The two pending editorial inputs are genuine published Asterism project records
and their public artifacts. No synthetic screenshots or draft publication is a
substitute. Owner visual review remains necessary; wider site identity rollout
and final logo decisions remain in #26. Related architecture/content references
#9 and #18–#21 are not being closed by this homepage work.
