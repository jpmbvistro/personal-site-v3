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
- Core palette: ink `#192B39`, warm ivory `#F5F2EB`, evergreen `#386E67`,
  restrained copper `#C7815D`. Semantic text/surface/interactive pairs live
  in CSS; **do not copy token hex values into one-off components**.
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
Exact font weights, optical sizes, heading scale, spacing/density, font delivery
and illustration treatment still need examples and validation before finalizing.

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

- Warm ivory is the main canvas, ink the main text/heading color.
- Evergreen conveys navigation and action. Copper is a limited annotation or
  emphasis color; **not a default small-text/link color on ivory**.
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
2. **Density:** more expansive editorial storytelling or somewhat tighter,
   higher-information case-study sections? Show actual mobile/desktop examples.
3. **Technical motifs:** subtle connection lines, modular diagrams, or nearly
   invisible motifs? Make the site distinctive without generic AI imagery.
4. **Image approach:** authentic portrait and real public-project screenshots
   vs selective custom SVG illustrations; ensure all images are appropriate.
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
