---
type: domain-concept
status: accepted
title: Tina click-to-edit for object-list fields
updated: 2026-11-02
---

# Tina click-to-edit for object-list fields

In this Astro + Tina integration, clicking a section in the editor preview
posts a `field:selected` message whose name comes from the element's
`data-tina-field` value (`tinaField(object, 'property')`). The editor resolves
that name by walking the query result for `_tina_metadata`.

## Accepted behavior

Anchors that point at an **array position** (a `tinaField` on the list field
itself, e.g. `tinaField(content, 'capabilities')`) resolve to an array, which
never carries metadata. The click captures but resolves to nothing, so the
editor panel does not open or focus the fields. This made the homepage
"Capability transition" band appear non-editable even though the content and
schema were fully wired.

Anchors that point at **mapped list items** resolve cleanly:
`tinaField(item, 'title')`/`tinaField(item, 'text')` inside the `map` produces
`page.homepage.capabilities.<index>.<field>` values, and a click drills the
editor panel directly to `homepage.capabilities.<index>.<field>` inputs with no
manual group navigation. A click inside the item's anchored title/description
also captures correctly.

## Rules

- To make an object-list's items clickable, anchor per mapped item, not at the
  array level. `src/components/AboutPageContent.astro` (building features) had
  this pattern already; `src/components/HomePageContent.astro` (capabilities)
  follows it now.
- Keep non-clickable parents anchor-free rather than pointing them at the
  array; an array-level anchor reads as clickable but does nothing.
- Click capture is enabled only after the editor's `quickEditEnabled`
  handshake; the first click in a freshly loaded preview can be silently
  ignored. Editor tests should prime focus with a known-good click, then click
  under test.

## Related

- Regressions: `tests/tina-capabilities.spec.ts`
- Object-list click flows over nested groups: `tests/tina.spec.ts`
- The homepage band this fixed: [Teaching the home page](../docs/reviews/homepage/README.md)
