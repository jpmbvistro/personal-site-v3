# Faster Code, Tougher Tradeoffs — asset provenance

Owner-supplied storybook artwork for article #40. No placeholder or generated
art was substituted. `scripts/prepare-article-assets.mjs <source-directory>`
copies the originals here and writes the committed web derivatives.

## Mapping

| Supplied file | Use | Committed derivative |
| --- | --- | --- |
| `Faster_Code__Tougher_Tradeoffs.png` | OG / social link preview | `public/uploads/faster-code-tougher-tradeoffs-og-1200x630.png` |
| `The_Three_Bears__Cozy_Automation_Workshop.png` | Opening Goldilocks framing | `public/uploads/articles/the-three-bears-cozy-automation-workshop.webp` |
| `Breadth_vs._Depth__Porridge_Automation_Lab.png` | Breadth vs. depth | `public/uploads/articles/breadth-vs-depth-porridge-automation-lab.webp` |
| `Goldilocks_and_the_Code_Review_Crunch.png` | Downstream review pressure | `public/uploads/articles/goldilocks-and-the-code-review-crunch.webp` |
| `Code_Porridge_Bottleneck.png` | Forecasting the next bottleneck | `public/uploads/articles/code-porridge-bottleneck.webp` |
| `Goldilocks_and_the_Automation_Porridge.png` | Intentional Autonomy | `public/uploads/articles/goldilocks-and-the-automation-porridge.webp` |

The social card was supplied at 1731 × 909 (the same ~1.9:1 composition as
1200 × 630) and resized without cropping so its title, author line and artwork
remain intact. The five in-article illustrations were supplied at 1672 × 941
and resized to 1280 × 720 WebP. Originals are retained in `sources/`;
exact dimensions and byte sizes are in `assets.json`.

The supplied social artwork differs from the branching-workflow diagram
described in issue #40's original metadata table. With the owner's approval,
`og:image:alt` describes the artwork actually committed instead of repeating
the stale description. All other approved metadata strings are unchanged.

## Verification

- `npm run build` with `SITE_URL=https://juanvistro.com`, then `npm run check`.
- The article is published in the repo (`draft: false`) now that #39 is live.
  Publication and modification dates are intentionally unset: no real
  go-live date is known yet, so no date is invented. Set them at launch.
- External validation (LinkedIn Post Inspector, X/Facebook previews) and any
  production deployment remain owner/editorial steps outside this repo.
