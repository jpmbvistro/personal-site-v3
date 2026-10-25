---
name: site-design-system
description: Use when creating, revising, or reviewing the personal site's Astro components, layouts, typography, color, visual diagrams, or responsive behavior. Keep UX and presentation consistent with the accepted design system without enforcing subjective content judgments.
---

# Personal site design system

Read [site design system](../../../knowledge/site-design-system.md) first.
That document distinguishes **current decisions** from **proposals pending
Juan's choice**. Do not silently turn proposals into hard requirements.

## Before changing UI

1. Inspect `src/styles/global.css`, relevant existing Astro components/layouts,
   and the content route in question. These are the implementation source of
   truth for tokens and patterns.
2. Identify the page's reader and task: recruiter/hiring manager scanning for
   evidence and resume/contact, or technical visitor discovering Asterism work.
3. Choose the smallest coherent change that improves hierarchy, comprehension,
   responsive behavior, or accessibility. Avoid designing a new system for a
   one-off element.

## Implement consistently

- Use existing semantic tokens and spacing/type scale. Avoid one-off hardcoded
  palette values, duplicate shared headers/footers, and gratuitous new primitives.
  If a repeated need is genuinely missing, add a semantic token/component once.
- Keep the Editorial Executive × Systems Architect direction: readable
  typography, calm composition, factual diagrams and purposeful emphasis.
- **Astro first:** prefer native Astro and semantic HTML for editorial layouts,
  static content, links, metric strips, and SVG/data visualizations.
- **Selective shadcn/ui is allowed, not default:** consider an individual
  shadcn/ui component for a concrete complex interaction (e.g., dialog, drawer,
  or accessible tabs) when native HTML and existing Astro components do not
  already meet the need. Articulate what behavior/accessibility benefit warrants
  the dependency; don't install shadcn/React just for branding or replace
  working components.
- If selecting shadcn, adapt its component classes to the existing semantic
  design tokens and editorial style. Astro can server-render React components
  without client hydration; add a client directive only where browser
  interactivity actually requires JavaScript. Keep interaction bundles narrow
  and test keyboard, touch, reduced-motion and responsive behavior.
- Do not add a theme engine, Storybook, or a general visualization runtime
  by default.
- Keep TinaCMS for authored content. Do not make the CMS responsible for arbitrary
  visual layout or impose editorial story templates/claim approval.
- Treat diagrams as explanations: clear labels and text alternatives; use
  reusable simple blocks only when they earn reuse, otherwise bespoke SVG.
- Preserve mobile reading order and navigability, text contrast, keyboard
  focus, touch usability and reduced-motion behavior.

## Review and handoff

- Check desktop, 390px and 320px width and keyboard navigation for UI edits.
  Run existing build/type/browser checks as proportionate to the change.
- Compare the result against accepted tokens and components. When noticing a
  tension with an **open** aesthetic choice, describe options to Juan rather
  than inventing or enforcing a decision.
- If a durable decision is accepted, update `knowledge/site-design-system.md`
  as needed, using the [Lore skill](../lore/SKILL.md). Do not duplicate token
  values in the skill.
- No mandatory content scoring, publication approvals, exact mockup geometry,
  or subjective aesthetic linting. Enforce objective code/UX constraints and
  flag visual judgment for human discussion.
