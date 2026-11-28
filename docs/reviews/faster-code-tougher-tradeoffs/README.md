# Faster Code, Tougher Tradeoffs — asset provenance

Owner-supplied storybook artwork for article #40. No placeholder or generated
art was substituted. `scripts/prepare-article-assets.mjs <source-directory>`
copies the originals here and writes the committed web derivatives.

## Mapping

Roles were assigned by inspecting the artwork, not by filename or generation
order. The control-room illustration is the on-page hero; the literal glass
bottle is the bottleneck figure; the workshop is the framework figure.

| Supplied file | Editorial role | Committed derivative |
| --- | --- | --- |
| `Faster_Code__Tougher_Tradeoffs.png` | OG / social link preview only | `public/uploads/faster-code-tougher-tradeoffs-og-1200x630.png` |
| `Goldilocks_and_the_Code_Review_Crunch.png` | On-page hero (control room, Autonomy/Risk/Human Review levers) | `public/uploads/articles/goldilocks-and-the-code-review-crunch.webp` |
| `Breadth_vs._Depth__Porridge_Automation_Lab.png` | Breadth vs. depth (wide pool / deep tub) | `public/uploads/articles/breadth-vs-depth-porridge-automation-lab.webp` |
| `Code_Porridge_Bottleneck.png` | Downstream bottleneck (giant Code Porridge bottle) | `public/uploads/articles/code-porridge-bottleneck.webp` |
| `Goldilocks_and_the_Automation_Porridge.png` | Intentional Autonomy (three labeled bowls) | `public/uploads/articles/goldilocks-and-the-automation-porridge.webp` |
| `The_Three_Bears__Cozy_Automation_Workshop.png` | Progressive framework (measuring/fitting equipment) | `public/uploads/articles/the-three-bears-cozy-automation-workshop.webp` |
| `Porridge_Factory_Development_Cycle.png` | Technical cycle diagram (five stages, loop from 05 back to 01) | `public/uploads/articles/progressive-software-factory-development-cycle.webp` |

The social card was supplied at 1731 × 909 (the same ~1.9:1 composition as
1200 × 630) and resized without cropping so its title, author line and artwork
remain intact. The five on-page illustrations were supplied at 1672 × 941
and resized to 1280 × 720 and 640 × 360 WebP derivatives with intrinsic
dimensions and `srcset`. Originals are retained in `sources/`; exact dimensions
and byte sizes are in `assets.json`.

The supplied social artwork supersedes the branching-workflow diagram from the
original metadata table; `og:image:alt` describes the Goldilocks artwork that
is actually committed. All other approved metadata strings are unchanged.

The owner-supplied cycle art (1536 × 1024) was resized to 1280 × 853 and
640 × 427 WebP without cropping; the figure carries those intrinsic dimensions
so its layout reservation matches the artwork. It depicts the Goldilocks
factory even though the original brief preferred a non-storybook diagram — the
owner explicitly directed its use. Its stage labels are deliberately redundant
with the five-step list in the prose, which remains the semantic equivalent,
especially at mobile widths.

Reading time is computed from authored prose only (paragraphs, list items,
headings and original-text callout text; not image alt text, captions, labels,
the closing CTA or metadata) at 200 words per minute, rounded up with a
one-minute floor.

The approved headshot (`juan_vistro_portrait_q76.webp`) appears beside the
author bio after the closing action. Both the Work With Me invitation and the
About-the-author link render as real button links, with the Work With Me action
on the site's deep-green surface so it stays the primary closing action.

## Verification

- `npm run build` with `SITE_URL=https://juanvistro.com`, then `npm run check`.
- The article is published in the repo (`draft: false`) now that #39 is live.
  Publication and modification dates are intentionally unset: no real
  go-live date is known yet, so no date is invented. Set them at launch.
- External validation (LinkedIn Post Inspector, X/Facebook previews) and any
  production deployment remain owner/editorial steps outside this repo.
