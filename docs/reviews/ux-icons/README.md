# Supplied UX artwork integration

The owner supplied eight PNGs from the `ux diagram` folder on 2026-11-02 and
asked to enrich the UX case-study diagrams. The first two are composition
references, not page screenshots to embed. The remaining six supply the
distributed-ownership, limited-capacity, skepticism, research, integration and
specialist-partnership illustrations.

- The native hero and approach diagrams use extracted people and layered-stack
  symbols from reference 2. Their HTML labels, native connectors, twelve team
  nodes, Tina-authored explanations and separate mobile compositions remain.
- The six illustrations enrich the challenge callouts, hero outcomes and result
  indicators, explicitly selected through Tina's existing illustration field.
  Other stories retain their outline icons.
- These are decorative conceptual illustrations, not project screenshots or
  numeric diagrams. Miniature figures/nodes inside the supplied artwork do not
  encode team/expert counts or additional outcomes. The twelve native team nodes
  and adjacent authored text remain the factual explanation.
- No story text, publication status, metrics or claims changed.

## Assets

`assets.json` records supplied filenames, source hashes, symbol crops and the
committed WebP derivatives. Full-size PNGs are not shipped. Regenerate explicitly:

```sh
node scripts/prepare-ux-assets.mjs '/path/to/ux diagram'
```

The sources have opaque pale paper backgrounds. The offline preparation
normalizes that paper and unmattes light pixels, feathering the outside edge so
the supplied forms and shading sit on the shared ivory canvas rather than a
different-colored square. These are optimized raster derivatives, not new vector
masters. Both 128px and 256px versions support responsive rendering; the images
are lazy-loaded, dimensioned, and hidden from assistive technology because the
adjacent live text carries the meaning.
