# Editorial About page

## Scope and source of truth

This implements the owner's approved About-page editorial direction from
[issue #35](https://github.com/jpmbvistro/personal-site-v3/issues/35) on the
shared Astro/Tina shell: Newsreader/Inter typography, semantic warm-ivory /
deep-green / copper tokens, one BaseLayout/header/footer, and the deep-green
"Let's connect" closing band shared with the homepage via
`src/components/ClosingBand.astro`.

The full proposed copy is committed in [content/pages/about.md](../../content/pages/about.md)
Tina-backed content, including the editorial-status caveat: **role wording,
2012, EMW / East Meets Words titles, DraftKings chronology, and interim
engineering-management responsibilities are proposed, not final fact-checked
public copy.** Nothing merges or publishes until Juan approves the copy and the
portrait. Tina owns the narrative text, headings, links and feature copy; Astro
owns layout, styling and illustration (`content/pages/about.md` is a fixed
composition, not a page builder).

Composition follows the supplied full-page About mockup and the GitHub-hosted
vector reference, with the approved icon illustrations committed as editable
SVG sources under `public/icons/about/` (about 1–2 KB each; the 1024px PNG
exports stay optional and are not committed). The synthetic portrait shown in
the mockup is never reused: the portrait field stays unset and an accessible
framed placeholder ("Portrait to come") renders until Juan supplies an
authentic headshot.

Section composition: hero (eyebrow, display headline, intro prose with the
central question, portrait slot), 01 / THE PATH HERE (heading left, narrative
plus three icon stages with fine copper connectors), 02 / HOW I WORK (serif
statement, three copper-badged principles), 03 / BEYOND MY DAY JOB (two scoped
endeavor cards: Impact Innovations → the published nonprofit CRM story,
Asterism → `/projects/`; links resolve to existing routes only), 04 / WHAT'S
NEXT, the three-action links row, and the shared closing band.

## Captures

- [1440px full page](screenshots/page-1440.png), [hero](screenshots/hero-1440.png),
  [stage row](screenshots/stages-1440.png), [features](screenshots/features-1440.png)
- [Mobile hero](screenshots/hero-320.png) and [portrait placeholder](screenshots/portrait-320.png)
- Full-page intermediate checks: [320](screenshots/page-320.png),
  [390](screenshots/page-390.png), [768](screenshots/page-768.png),
  [1024](screenshots/page-1024.png)
- [Viewport, contrast, focus, heading-order and performance observations](screenshots/verification.json)

Re-capture after changes with the built server:

- `npm run build` (no dev server running; Tina shares the port)
- `npm run preview`, then
  `node scripts/capture-about-review.mjs http://127.0.0.1:4321`

## Verification

- `npm run build` and `npm run check` pass; the About route prerenders.
- Playwright suite: 97/97 passing on this branch, including the Tina visual
  edit/save round trip for `/about/` (run with exported
  `LD_LIBRARY_PATH=/tmp/opencode/nsslibs/root/usr/lib/x86_64-linux-gnu` here;
  the local browser needed `libnspr4`/`libnss3`/`libasound2` system libraries
  that could not be installed without a password).
- The capture script asserts no horizontal overflow at 320/390/768/1024/1440,
  WCAG-ratio-gated sampled text contrast, loaded decorative icons, visible
  focus, and a semantic heading order (one H1 → four H2 sections → H3 items).

## Known limitations and follow-ups

- Factual/editorial approval gates publication (see the copy caveat above).
- The owner-supplied headshot replaces the placeholder; export an optimized,
  warm-background-harmonized treatment when it arrives (see
  [site design system](../../knowledge/site-design-system.md)).
- Pre-existing (not introduced here): a stray comment fragment from
  `@tinacms/astro`'s TinaIsland renders as visible text near the header on
  island pages, including the homepage. Worth an upstream fix.
