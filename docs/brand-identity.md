# Juan Vistro — personal identity reference (October 2026)

Status: **approved creative direction; site-wide palette and supplied header/footer lockups implemented at the owner's request (2026-11-02)**.
Owner: Juan Vistro. This is the design reference for the personal-site-v3 site. The original October exploration and its implementation cautions are retained below as historical context; current rollout is described in [the design system](../knowledge/site-design-system.md#site-wide-consistency-and-logo-restoration--2026-11-02).

## Identity
- **Positioning:** thoughtful, innovative, creative, visionary; quiet confidence and maturity rather than an eager junior-developer portfolio. Communicate technical leadership and product ownership without losing the person's multidisciplinary, human-centered creative identity.
- **Approved mark:** a structured, deep green serif **V** with the copper leaf-like accent **above the left stroke**; a subtle, water-like translucent **J-shaped backlayer** sits behind it. This is the cleaner **Combined Mark B** direction, not the more elaborate A.
- **Wordmark:** “JUAN VISTRO” in an editorial, custom high-contrast, lightly serifed/flared style. Preserve the copper leaf on the initial V of VISTRO; the **A crossbar is a small inverted copper triangle** rather than a swoosh. Prefer using the approved wordmark artwork rather than recreating the customized letters with CSS.
- **Favicon:** simplified V with copper leaf only; omit the faint J at tiny sizes because it disappears.
- **Expressive variant:** a more visible water-flow/J only for large hero-style composition or a possible future animation. No hover animation is necessary for launch.
- **Relationship to Asterism:** independent personal identity; do not force shared logos or colors.

## Palette sampled from the original exploration board

These are **approximate median raster samples from the circular swatches**, not authored source design tokens. Sampled from the visual board, then rounded to reproducible HEX values.

| Token | Hex | Use |
| --- | --- | --- |
| Charcoal | `#343432` | Body text, strong text contrast |
| Deep green | `#28332B` | Main mark, typography, solid dark surfaces |
| Copper | `#B17750` | Leaf, inverse A crossbar, rules, ornament, larger UI highlights |
| Stone | `#D2C6B8` | Subtle surfaces, borders, dividers |
| Warm ivory | `#F3EDE3` | Primary light canvas / proposed background |

The first four came from the board's color swatches; warm ivory is a representative sample of the board background (not a labeled circle).

### Approximate WCAG contrast guidance

- Charcoal on warm ivory: **10.7:1**, WCAG AA/AAA for ordinary text.
- Deep green on warm ivory: **11.3:1**, WCAG AA/AAA for ordinary text.
- Copper on warm ivory: **3.2:1**, **not** AA for normal-size text (needs 4.5:1). Keep copper for decor, small non-text accent marks, and large graphical detail; if used for essential text, choose and verify a darker accessible variant.
- Stone on warm ivory: **1.4:1**, decorative only, not text or essential low-contrast controls.
- Test interactive focus and border contrast separately against their actual adjacent backgrounds. Color alone must not communicate state.

The original reference-only change left the prior blue-ink/evergreen palette in place. That staged rollout is now superseded: `src/styles/global.css` maps this approved palette to semantic tokens globally rather than combining two themes.

## Canonical supplied visual resources

| File | Content | Intended use |
| --- | --- | --- |
| `public/brand/juan-vistro-mark.svg` | V + copper leaf + subtle flowing J layer | Large/medium standalone mark |
| `public/brand/juan-vistro-stacked.svg` | Mark stacked above custom JUAN VISTRO wordmark | About/brand composition, larger vertical placements |
| `public/brand/juan-vistro-horizontal.svg` | Mark at left of custom JUAN VISTRO wordmark | Navbar/footer candidate, large enough to preserve readability |

These three files preserve **the user-supplied SVG exports**, which visually incorporate the approved reference elements; they are not regenerated substitutions. The corresponding PNG originals were also supplied to the conversation, but the repo currently includes the SVG renditions. **Important: these SVG exports contain embedded raster images, masks and filter artwork, not production-quality editable text/path outlines**. They may be large and can appear on white-backed canvases. Do not treat them as lightweight icon SVGs or assume their background is transparent. Inspect at real sizes and against dark/light surfaces before shipping; rebuild genuine editable vectors when production needs clean scaling, minimal size, or responsive recoloring.

## Header/footer design direction (original exploration)

- **Header desktop:** V + leaf or horizontal wordmark on the left; link navigation on right (current pages: Home, Work, Projects, About, Contact); warm ivory background, deep green text, optional thin stone dividing rule. Prefer ordinary links, no decorative animation.
- **Header mobile:** V + leaf, optional short name; preserve existing keyboard-operable disclosure/skip link behavior and sufficient tap targets.
- **Footer:** deep green background option with ivory wordmark/text, restrained copper leaf/rule, clear Contact and social links, no overly dense content. Preserve factual, author-supplied content and links; never invent social handles.
- Maintain generous negative space and editorial hierarchy, but site must still read quickly as a senior engineering/technology leadership portfolio (work and projects highly discoverable).
- Responsive typography should use a clean sans for UI; an expressive high-contrast serif can be used for headings. Existing `Iowan Old Style`/Palatino is a **fallback**, not an exact match for the hand-designed wordmark. A production brand-font match is not established.

### Implemented application — 2026-11-02

The owner selected the **horizontal supplied lockup for the header** (including
mobile) and **vertical/stacked lockup for the footer**. Both sit on the shared
warm-ivory surface; the dark footer above remains an unused option. Accessible
home links name the site independently of the image lettering. Navigation and
the keyboard-operable mobile disclosure are retained.

`scripts/prepare-brand-assets.mjs` crops empty canvas margins and produces the
committed `public/brand/juan-vistro-{horizontal,stacked}.webp` derivatives (about
26 KB and 46 KB). The original SVGs remain untouched. CSS multiply blends their
white canvas into the ivory without redrawing the custom wordmark or removing
the translucent J backlayer. These are light-surface raster derivatives, not
editable vector masters or suitable inverse/dark-surface assets.

## Original implementation review checklist
1. Decide whether to re-author performant genuine vector logos; if using current exports, verify embedded image scaling, white backgrounds, and loading weight.
2. Produce a purpose-built small favicon asset from V + copper accent only, with adequate optical weight at 16/32 px.
3. Approve header and footer mockups before editing `SiteHeader.astro` / `SiteFooter.astro`.
4. Introduce semantic palette tokens in `global.css` with contrast checks and reduced-motion behavior.
5. Test at 320, 390, 768, and 1440 px and verify actual text, clickable controls, color contrast, keyboard traversal, and reduced motion.
