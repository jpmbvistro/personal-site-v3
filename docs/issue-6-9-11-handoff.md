# Issues #6, #9, and #11

Assigned repository: `jpmbvistro/personal-site-v3`. Branch: `issue-6-9-11`.
Scope: flexible Tina collections and one proven visual block (#6), reusable Work/Project pages (#9), and Home/index/About/Contact routes (#11). No deployment, DNS changes, content publication, private-evidence import, or closure of parent epic #1 is included.

## Delivered

- Required title/body/draft contracts; optional metadata and links; new records default to draft.
- Native Astro detail templates, shared cards, automatic published-only homepage/index listings, editable page copy, and working contact destinations.
- Contact now links to a temporary `/resume/` page using the owner's supplied résumé text. It is Tina-editable and can later be replaced via Contact's Résumé URL field. No original PDF binary was available to copy, and no recreated PDF is presented as the original.
- Real local admin/iframe editing and file saves for Home, Work, Projects, and About.
- A typed metric strip inserted, edited, reordered, saved, and previewed through Tina. Static output retains its semantic, mobile-friendly definition list without JavaScript.
- Short Moderna and Keel samples remain drafts. The older Moderna prototype was not present; #20's supplied material was used for the minimal Work sample instead. Content tasks #18–#21 remain separate.
- Production preview routes return 404, including with forged edit signals. Render endpoints reject saved drafts while successfully rendering a published record against a live CMS API.
- Fixed a discovered publication-boundary bug: Tina's local build server can leave `NODE_ENV=development` in its Astro child. The build now explicitly sets production, and the local-preview guard also requires Vite's development **mode**, not just `DEV`.

## Verification

- `npm ci` succeeded on Node 24.16.0. npm reported existing dependency audit findings (26 total); no unrelated dependency upgrade was attempted.
- `npm test`: **22 passed**. Includes 320/390/768/1440px route checks, résumé access, keyboard/native navigation, no-JavaScript rich text, publication/unpublication without restarting dev, collection-to-preview navigation, actual visual saves (including Résumé), and the typed-block authoring trial. Temporary content is restored/removed.
- After the résumé update, `NODE_OPTIONS=--max-old-space-size=3072 npm run build` passed and generated `/resume/index.html`; typechecking and `git diff --check` also passed.
- `NODE_OPTIONS=--max-old-space-size=3072 npm run test:static`: **passed**, including two full Tina/Astro builds, generated metric/minimal-entry output, production forged-request rejection with a live CMS, and a final fixture-free rebuild.
- `npm run check`: no errors, warnings, or hints.
- `git diff --check`: passed.

The explicit heap cap avoids Tina admin-bundle memory pressure on this 8 GB machine; uncapped attempts stalled and a 1536 MB attempt exhausted the heap. No generated clients/admin bundles, credentials, or test fixtures belong in the commit.

## Issue disposition

### Owner clarification: local development only

The owner chose Vercel for eventual hosting, confirmed existing TinaCloud/GitHub configuration and access checks (including rejection of unauthorized writes), and explicitly deferred hosted draft previews. These are owner-reported confirmations, not new cloud tests by this agent. A staging URL or Vercel adapter migration is not required to finish the agreed local scope. Local Tina remains intentionally unauthenticated on loopback; hosted authentication must not be confused with the local editor.

| Issue | Status | Remaining acceptance work |
| --- | --- | --- |
| #6 | Local scope complete; hosted preview deferred by owner | Existing cloud setup/access checks are owner-confirmed. Hosted visual draft preview is intentionally deferred to deployment work, not a blocker for continued local development. Retain a non-closing reference until that deferred acceptance is reconciled with the issue. |
| #9 | Complete locally | Both real sample records use the reusable templates and visual editor; publication is the author's choice. No additional case-study count or speculative diagram components are required. |
| #11 | Complete locally | The owner authorized the supplied résumé as a placeholder. Contact links to its readable HTML rendition; no PDF file or additional deployment setup is needed for local completion. |

For a PR containing this change, use `Closes #9`, `Closes #11`, and `Refs #6`, stating the owner's hosted-preview deferral rather than asking for local setup again. Do not silently claim the deferred hosted preview is implemented or close epic #1. No issues were manually closed, and no PR, merge, deployment, or DNS cutover was performed in this execution.
