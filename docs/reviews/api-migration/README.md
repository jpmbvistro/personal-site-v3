# API migration — complementary investigations (#19)

Assigned scope: `jpmbvistro/personal-site-v3#19`, on `feat/19-api-migration`
in draft PR #29. It remains stacked on `feat/case-studies` / PR #25, the shared
editorial foundation and UX Scaling benchmark. Related #9, #20 and #26 are not
additional assignments. No merge, deployment or publication-state change.

## Narrative and information-architecture correction

This revision supersedes the initial sequential-gate illustration
([previous review](https://github.com/jpmbvistro/personal-site-v3/blob/44b2d07fbb43d9c1d4032f4ec272b187b42fb2d6/docs/reviews/api-migration/README.md)).
The earlier diagram incorrectly implied an endpoint handoff from scope review
into behavioral validation. The owner's clarification is authoritative: these
are complementary investigations, with no established common population or
timeline between them.

The existing editorial Work layout, 60/40 hero, fonts, tokens, section rhythm
and shell are preserved. Progressive disclosure now gives each section a task:

- **Hero:** individual contribution and two independent questions, not a
  miniature sequential workflow. No repeated hero metric strip.
- **Challenge:** uncertainty about necessary scope is distinct from uncertainty
  about behavior in a business-critical registry/inventory API migration.
- **Investigations:** tools, evidence and mechanics, explained beside the
  diagrams. A filter removes unnecessary scope; a separate comparison,
  investigation and prioritization loop supports revalidation.
- **Key Decisions:** three shorter accounts of judgment and consequence,
  rather than repeating the technical procedure and figures.
- **Results:** one principal metric strip plus reflection on trustworthy
  sources and collaborative discovery. The corrective harness is linked,
  not retold.

## Why the visualization is more accurate

Both investigations have the same heading hierarchy and equal desktop column
allocation, **not forced equal heights or matching mechanics**. There is no
connector between A and B—not even in the mobile layout or hero preview.

- **A — scope filter:** inherited backlog → traffic and supported applications
  → agreed criteria → decision. The 37+ removal branch is prominent; necessary
  work is a separate endpoint, with no invented retained count or onward arrow.
- **B — investigation loop:** actual legacy behavior and new proxy → live
  comparison → source-level discrepancy investigation → corrective
  prioritization → revalidation against live responses. The return connector
  spans only that cycle; there is no automatic match/success gate.
- The typed-client/static-comparison assumption is visibly struck through and
  deprioritized, separate from the trusted behavioral inputs. Legacy JavaScript
  analysis and its 75-branch finding have their own place in the loop.
- CI is the durable capability, not proof that all findings were fixed.
  The 200+ endpoint observation appears once as behavioral context in the
  adjacent narrative, not as a denominator or a funnel stage.

Tina controls headings, narrative summaries, captions, verified metrics and
fixed label groups. Astro owns the local SVG/HTML geometry. The obsolete gate,
handoff and success-state fields are removed from both the record and schema;
new narrative fields use textareas. Mobile reflows native text and local
connectors, rather than scaling desktop text. No dependency, hydration island,
page template or arbitrary graph editor is introduced.

## Claims and remaining uncertainty

Sources: [issue #19](https://github.com/jpmbvistro/personal-site-v3/issues/19)
and the owner's narrative correction. All factual anchors are supplied evidence,
not independently re-measured:

- 37+ planned endpoint migrations removed after historical traffic and
  supported-application review; criteria agreed with Product, technical leads
  and engineering leadership. Kibana/CloudWatch views and a reusable agent
  skill supported approximately one year of usage investigation.
- Management-approved shadow-diff MVP in approximately three weeks; live
  comparisons exposed discrepancies across 200+ endpoints and missing
  negative-path behavior. Follow-on coding-agent analysis examined legacy
  JavaScript and identified 75 missed behavioral branches.
- Shadow-diff checks integrated into CI. Engineering leadership prioritized
  corrective bugs other than negative-path parity issues, as specified in #19.
- The separate harness's approximate 95% corrective-ticket figure is deliberately
  omitted here to keep this story focused; its story remains linked.

Endpoint totals, retained/migrated counts, population overlap and relative
timing between A and B are **not established and not asserted**. No savings,
zero-incidents, universal validation, full parity or all-findings-fixed claim.
The public attribution remains **Global biotechnology company**. This story
does not describe the separate research-workflow migration into Benchling.

The existing `draft: false` is preserved, not a new authorization to publish.
No production hosting, DNS, TinaCloud content or deployment has been changed.
Owner visual/wording review remains; keep #19 open while review is outstanding.

## Current review captures

Production-preview Chromium, native CSS widths, device scale 1 and a 1000px
viewport height; no overlay concealed:

- [1440px desktop full page](page-1440.png)
- [Investigation diagrams close-up](diagram-1440.png)
- [390px mobile](page-390.png)
- [320px mobile](page-320.png)
- [Responsive/accessibility results](layout.json)

Reproduce with Node 24 after stopping dev:

```sh
NODE_OPTIONS=--max-old-space-size=3072 npm run build
npm run preview
node scripts/capture-api-migration-review.mjs http://localhost:4321 /path/to/axe.min.js
```

## Verification for this revision

Node 24.22.1 / Playwright Chromium:

- **66/66 browser tests passed**, including the 8 revised API tests, real Tina
  narrative/label preview-save-restore, the UX benchmark, keyboard navigation,
  related-work links, no-JavaScript and reduced-motion reading.
- **Static checks passed**, including two successful production builds,
  diagram HTML/no-hydration assertions, metadata/sitemap, temporary-fixture
  cleanup, and rejection of forged production draft access.
- **Typecheck: 0 errors, 0 warnings, 0 hints** across 50 files after final build.
- At 320, 390, 768, 1024 and 1440px: no horizontal scrolling, clipped labels
  or overlapping hero questions. Tests check both local loop endpoints and
  the absence of any connector between investigations.
- Production axe-core 4.11.0: **0 violations** at all five widths for WCAG
  2/2.1/2.2 A/AA and best-practice tags. Captures contain no dev toolbar.
- Text/ivory contrast: charcoal **10.71:1**, deep green **11.28:1**, dark-copper
  metadata **5.13:1**. Copy is native 16px narrative / 14px annotation text,
  never scaled SVG text. Axe's incomplete contrast entries concern decorative,
  assistive-technology-hidden arrows; their computed colors are charcoal or
  deep green on ivory. This is not comprehensive WCAG certification.
- Rendered story text decreased from **903 to 713 whitespace-separated words**
  (including diagram labels), measured from `.entry-story` in the browser.

Manual screen-reader testing and Safari/Firefox are not claimed. Chromium uses
the environment's existing shared libraries through `LD_LIBRARY_PATH`; no app
dependency was added. All four linked PNGs and `layout.json` are refreshed for
this correction; earlier gate captures remain available in Git history.
