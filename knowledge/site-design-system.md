---
type: domain-concept
status: proposed
title: Personal site design system
updated: 2026-10-23
---

# Personal site design system

## Purpose and audience

Juan Vistro's personal site should make a quick, credible first impression for
recruiters/hiring managers while rewarding engineering peers who follow links
from public-facing Asterism projects. The near-term career objective is
engineering leadership with real team-delivery ownership; the longer-term aim
is CTO scope. The site should communicate evidence of people, product and
system leadership without claiming management responsibilities not held.

**Desired feel:** *Editorial Executive × Systems Architect* — calm,
approachable, precise, confident without self-aggrandizement.

Visitors should be able to (1) understand professional scope, (2) find strong
Work case studies, and (3) reach a resume/contact path quickly. Project visitors
should find technical depth and then a route to the broader career narrative.

## Already established and implemented

These are current repository decisions, not new proposals:

- Public site is Astro and Tailwind CSS with semantic, shadcn-compatible tokens
  at [`src/styles/global.css`](../src/styles/global.css).
- **Currently implemented, to be superseded:** ink `#192B39`, warm ivory
  `#F5F2EB`, evergreen `#386E67`, copper `#C7815D`. See the approved
  replacement palette below; `src/styles/global.css` has **not** yet been
  migrated. Semantic text/surface/interactive pairs remain in CSS; do not copy
  hex values into one-off components.
- Serif display and headline roles, sans-serif UI/body roles, monospace technical
  metadata. The current implementation uses system stacks; Newsreader + Inter
  is the accepted next visual direction, **not yet implemented**. No external
  font download/runtime dependency exists in the current build.
- Single [BaseLayout](../src/layouts/BaseLayout.astro) and shared header/footer.
  Native Astro + semantic HTML first; client-side islands only when justified.
- Current sizing includes a broad content max-width, narrower reading measure,
  fluid display/heading sizes and responsive gutters. See CSS for actual values.
- Semantic focus styles, reduced motion, visible navigation, and basic contrast
  are working expectations.
- TinaCMS owns narrative copy and simple structured blocks. Astro owns
  geometry, components and styling. No page builder or rigid narrative schema.

## Accepted brand hierarchy — 2026-10-23

**Editorial leadership is the dominant character.** The site should read first
as the thoughtful publication of a technical leader: confident, approachable,
human-centered, and evidence-driven. Technical systems design is a supporting
language, revealed progressively through diagrams, project screenshots and
implementation detail—not the default treatment of every page.

- **Homepage/About:** prioritize professional positioning, leadership evidence,
  a clear route to Work and a resume/contact action.
- **Work case studies:** editorial narrative first; metrics and diagrams should
  clarify decisions, tradeoffs and results, not create a dashboard aesthetic.
- **Asterism projects:** allow more technical density and product details while
  preserving the shared typographic and navigation system.
- Do not present this as a claim of formal executive or people-management tenure.

This direction is accepted. **The typography pairing has also been chosen:
Newsreader for editorial display/headings and Inter for body/UI** (2026-10-23).
Keep a system monospace stack for occasional technical metadata and code.
**Layout density accepted (2026-10-23): spacious editorial composition with
selective information density.** Give introductions and major transitions ample
breathing room; let related metrics, decision tables, diagrams and implementation
details sit closer together so readers can compare them. Maintain a comfortable
prose measure and a clear mobile reading order. Apply this as a *rhythm*, not
fixed per-section pixel values or a mandatory page template.

Exact font weights, optical sizes, heading scale, font delivery, and illustration
treatment still need examples and validation before finalizing.

## Accepted brand palette and restrained visualizations — 2026-10-23

The owner's logo exploration led to a **replacement** of the previous
blue-ink/evergreen palette, rather than addition of a second competing theme.
The values below are approximate raster-derived samples from the supplied
identity board; exact source-design values may be adjusted once master assets
are available. Before implementation, validate contrast for actual text,
controls, hover and focus combinations (not just the main text pairing).

| Role | Proposed semantic use | Approved sample |
| --- | --- | --- |
| Charcoal | Main body text, readable dense content | `#343432` |
| Deep green | Headlines, strong brand surfaces, primary interaction if contrast holds | `#28332B` |
| Copper | Decorative strokes, callouts, larger marks; not small text on ivory | `#B17750` |
| Stone | Separators, subtle borders, restrained inset surfaces | `#D2C6B8` |
| Warm ivory | Default page background | `#F3EDE3` |

Use semantic CSS tokens to implement this; do not introduce palette-specific
colors in individual components. Owner-reported contrast on warm ivory is
approximately 10.7:1 for charcoal and 11.3:1 for deep green; copper is only
approximately 3.2:1, so it is **not** suitable as ordinary small text on ivory.

**Visual language approved:** restrained systems visualizations—functional
diagrams with meaningful labels and sparse line/dot/connection motifs.
Diagrams should explain leadership decisions, workflows and technical
tradeoffs; motif elements must remain secondary to reading. Avoid generic
AI imagery, busy circuits, decorative charts and unverified metrics.
Homepage should stay predominantly editorial; Work can include decision
diagrams, Projects can be more technically detailed.

### Supplied logo exploration (usage recommendation; production assets pending)

Three raster concepts were supplied: a detailed copper/green **V monogram**,
a **horizontal monogram + JUAN VISTRO wordmark**, and a **stacked
monogram/wordmark**. Suggested roles:
- Horizontal lockup for spacious header/hero contexts where the full name
  remains legible.
- Stacked version for About/footer or other generous vertical placements.
- Simplified, high-contrast **flat vector** monogram for favicon and compact
  marks; fine copper strokes, textured fill and translucent ribbons are unlikely
  to reproduce reliably at 16–32px.

The current samples have white backgrounds. Do not paste that raster white
rectangle onto a warm-ivory page. Prepare transparent SVG/appropriate raster
exports from an owned source and check legibility at real sizes. Use ordinary
accessible text for the actual site name/navigation; the ornate identity mark
does not replace an HTML heading. These are **recommended uses**, not yet a
selection of final masters or authorization to add copyrighted assets.

## Accepted portrait usage — 2026-10-23

Juan approved using the supplied authentic portrait as part of the site's
professional identity. It conveys an approachable, human presence alongside
the editorial leadership positioning; do not replace it with generic stock
photography or a stylized synthetic portrait.

**Recommended composition (to validate in real responsive previews):**
- Homepage hero: one restrained portrait at the **right** of left-aligned
  headline/positioning on wider screens. In the supplied image Juan faces toward
  the viewer's left, creating a natural visual line back to the headline.
- On narrow screens, preserve readable copy and primary Work / résumé paths;
  portrait can move beneath the introductory copy or be cropped more tightly.
- About page may feature a larger portrait. Don't repeat the portrait on every
  project/case study page where real work evidence is more useful.
- The source is on a near-white background with a straight lower crop. Export
  a visually clean web-optimized treatment that harmonizes with the warmer
  ivory page background; avoid an obvious white rectangular image background.
  Keep the subject's appearance authentic. Any background alteration/cropping
  should be reviewed before committing a public asset.
- Use meaningful alt text (e.g., "Portrait of Juan Vistro"), responsive image
  sizing and stable aspect ratio. Protect subject visibility at mobile crops.

**Asset state:** portrait has been supplied in the conversation, but this
documentation PR does **not** commit or publish it. Select an approved final
image file and optimized formats during page implementation.

## Proposed implementations — discuss before treating as final

### Composition and hierarchy

- Lead with one unmistakable idea per screen: who Juan is, what problem he
  solves, and an easy next step. On work pages, surface context and personal
  contribution early; use diagrams to clarify decisions, not decorate.
- Let typography and generous but controlled space carry authority. Prefer
  restrained rules, light surfaces, and a small number of accent moments over
  a dashboard of identical cards.
- Keep Work and Projects visually related but not identical: Work emphasizes
  organizational decisions and outcomes; Projects emphasizes actual interfaces,
  architecture, engineering constraints, and public source links.
- Use a responsive grid that changes layout for narrow screens; do not rely on
  tiny multi-column diagrams on phones.

### Color and surfaces

- Warm ivory is the main canvas; charcoal is standard body text, deep green
  serves display/headings and primary emphasis. Verify interactive contrast.
- Copper is limited to decorative annotation/emphasis; **not small-text links**
  on warm ivory. Stone supplies subtle dividing rules.
- Use borders and subtle backgrounds to organize material; minimize raised
  card treatments, gradients, and large decorative fills.
- Do not encode meanings only in color; preserve visible focus, readable states,
  and non-color affordances.

### Type and voice

- Editorial serif for substantial headlines or narrative pull lines; practical
  sans-serif for paragraphs/UI; mono sparingly for diagrams, data labels and
  contextual metadata.
- Prefer short, specific, meaningful headings. Don't substitute inflated
  executive claims, AI hype, or ornamental jargon for demonstrated impact.
- Use a clear typographic hierarchy and comfortable body measure on desktop.
  Avoid excessive uppercase, cramped microcopy or ultra-thin contrast.
- This is *editorial guidance*, not automated copy scoring or a mandatory story
  structure.

### Graphic language

- Use purpose-built diagrams with clear labels, captions and text alternatives
  to explain team enablement, decision gates, scope tradeoffs and agent
  orchestration.
- Prefer real project screenshots over generic stock/collage photos. Do not use
  invented testimonials, inaccurate mock data or proprietary screenshots.
- Reuse existing `MetricStrip` where appropriate. Create linear flow, matrix,
  or comparison presentation only when more than one story actually benefits.
  Bespoke SVGs remain an acceptable, often better choice.
- Use animation only when it conveys structure or progression; obey
  `prefers-reduced-motion` and avoid scroll-jacking.

### Interaction and accessibility

- Navigation and resume/contact are accessible without reading every case
  study. Desktop and mobile have equivalent routes.
- Support keyboard operation, focus visibility, semantic heading order, touch
  targets, useful alt text, legible contrast (WCAG AA for normal text), and
  responsive tables/figures. Verify at small mobile and wide desktop widths.
- Avoid decorative interactions that obscure important CTAs.

## Open design decisions — Juan to choose

1. **Typography implementation:** Newsreader + Inter accepted; evaluate weights,
   hierarchy, fallback behavior, legibility, font delivery, licensing and speed.
2. **Density implementation:** the editorial/open-to-dense rhythm is accepted;
   evaluate actual spacing and line lengths on mobile and desktop examples.
3. **Motif implementation:** restrained functional systems visualization is
   accepted; test the amount of connecting-line ornament on real pages.
4. **Image implementation:** portrait use is accepted; decide final optimized
   export/background/crop and responsive placement, then use approved public
   project screenshots and purpose-built diagrams on secondary pages.
5. **Dark mode:** deliberately deferred by default unless there is a strong
   user-facing reason.
6. **Visual review gate:** evaluate homepage + Work detail + Asterism project
   page together before accepting new component variants.

## Applying the system in code

- Read [`src/styles/global.css`](../src/styles/global.css) first and reuse its
  CSS variables. The stylesheet is the source of truth for values; this
  document records intent, not an alternate token registry.
- Read the existing component before proposing a new generic primitive.
- Keep changes minimal, responsive and accessible; test in actual content.
- For coding agents, use the [site design-system skill](../.agents/skills/site-design-system/SKILL.md).
- Update this Lore note when a **durable design decision** changes, but do not
  create approval processes, visual-score validators, or extra tracking tools.

## Related work

- [Epic #1](https://github.com/jpmbvistro/personal-site-v3/issues/1)
- [Design-system issue #26](https://github.com/jpmbvistro/personal-site-v3/issues/26)
- [Reusable work pages #9](https://github.com/jpmbvistro/personal-site-v3/issues/9)
