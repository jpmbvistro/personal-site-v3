# Release QA and hosting handoff

Assigned scope: `jpmbvistro/personal-site-v3#14` — basic QA, CMS deployment, and domain cutover. The owner's execution override defers domain hosting/cutover until the site is done. **No deployment, DNS change, cloud content write, or issue closure is part of this local execution.**

QA and deployment preparation can proceed autonomously. Actual deployment needs approval, an eligible Vercel plan, and access to the existing TinaCloud project. Hosted authenticated editing/publishing must be verified on that deployment, not inferred from a local test. #14 remains partial (`Refs #14`), not complete.

## Repeatable QA

Use Node 24 and `npm ci`. Stop any dev server first: Tina build/dev share ports 4001/9000. On the 8 GB development machine, use the documented heap cap for build commands.

```sh
npx playwright install chromium
npm test
NODE_OPTIONS=--max-old-space-size=3072 npm run test:static
npm run check
```

- Browser tests cover core routes at phone/desktop widths, single shared shell, skip-link/menu keyboard behavior, no-JavaScript navigation, résumé/contact destinations, and native visual editing with real local saves. External URLs are checked for the supplied destination, not third-party uptime or delivery of email.
- Static tests temporarily publish fixtures (without publishing the author's drafts), build with a reserved example origin, and check metadata, sitemap inclusion/exclusion, published HTML, and draft rejection with forged edit cookies. A missing draft flag also stays unpublished. Fixtures are removed and the ordinary artifact rebuilt on exit.
- With no `SITE_URL`, pages have `noindex, nofollow` and no canonical URL, `og:url`, or sitemap. Setting `SITE_URL` enables canonical URLs and Astro's sitemap for generated public pages only. Open Graph/Twitter title and description reuse each page's existing content; no fabricated image or account handle is added.
- `npm audit` reports transitive advisories in the Tina toolchain and the Vercel adapter's routing utilities. The suggested direct-package downgrades are not compatible release fixes. These remain a dependency risk to review before public deployment; do not use `npm audit fix --force` blindly.

### Observed in this execution

- `npm ci` completed on Node 24.16.0; npm reports 25 advisories after adding the adapters/integration (19 high, 3 moderate, 3 low). No forced dependency downgrade was applied.
- `npm test`: **25 passed**, including real local Tina saves. The first run exposed a navigation/HMR race in the publication test; bounded navigation/listing retries resolved it, and the full rerun passed.
- `NODE_OPTIONS=--max-old-space-size=3072 npm run test:static`: **passed**, including the clean final rebuild. The first invocation hit the tool's two-minute timeout during cleanup rebuilding; a rerun without that short limit completed. The clean artifact was also checked for noindex, absent canonical/sitemap, and absent fixture routes.
- `VERCEL=1 NODE_OPTIONS=--max-old-space-size=3072 npm run build:cloud`: **passed** against the configured TinaCloud branch. The generated routing config includes the Tina render function. Locally invoking the packaged Node 24 function rendered the homepage island through TinaCloud and returned 404 for forged draft preview requests. All 109 packaged public files were scanned without finding the read token; draft files were absent and the homepage had noindex. No deployment was performed.
- `NODE_OPTIONS=--max-old-space-size=3072 npm run build:cloud`, followed by `npm run test:cloud`: **passed** with the Node adapter. Public routes, production draft URLs, login client ID/origin, and public-asset token exclusion passed. No cloud sign-in or save was attempted.
- `npm run check`: **0 errors, 0 warnings, 0 hints**. Authored content and `tina/tina-lock.json` are unchanged; generated admin/client and Vercel artifacts remain ignored.
- The cloud-build environment loader rejects `TINA_PUBLIC_IS_LOCAL=true` before starting Tina.
- Read-only external checks returned HTTP 200 for the supplied GitHub profile and LinkedIn profile (LinkedIn required GET rather than HEAD). This does not test email delivery or guarantee future third-party availability.

## Future Vercel deployment (not executed)

1. Confirm plan eligibility and authorize deployment. Keep Squarespace and all DNS untouched; use a Vercel-provided URL first. Do not attach the custom domain yet.
2. Import this GitHub repository in Vercel using Node **24.x**. `vercel.json` selects `npm ci` and **`npm run build:cloud`**, not the credential-free local build. The Astro config selects `@astrojs/vercel` when Vercel supplies `VERCEL=1`; local checks retain the standalone Node adapter. Public pages stay prerendered, while `/tina-island/*` is a serverless render endpoint. Do not override the output directory to `dist/client` or deploy only static files: visual refresh needs the function.
3. Set `TINA_PUBLIC_CLIENT_ID`, build/server-only `TINA_TOKEN`, and `TINA_PUBLIC_BRANCH` in the appropriate Vercel environment. Never set `TINA_PUBLIC_IS_LOCAL=true` there; the cloud build rejects it. Keep the token out of `PUBLIC_*`/`TINA_PUBLIC_*`, browser bundles, logs, and Git. Leave **`SITE_URL` unset for previews**; set it only to the selected public origin when indexing is intended. Never set it globally to the future domain before cutover.
4. Push/merge only through the normal review workflow. TinaCloud must index the matching remote branch with `tina/config.ts`, `tina/tina-lock.json`, and content; reindex in TinaCloud if necessary. For a preview, point Tina at a disposable editing branch, not an unrelated production branch. A Tina save creates a commit on its configured branch, and Vercel must rebuild that branch before prerendered pages reflect it.
5. Add the exact deployed **origin** to the existing TinaCloud project's allowed origins. Check authorized sign-in, unauthorized write rejection, media upload, and live iframe refresh on a published page. Save a harmless public-safe change on the editing branch, confirm its Git commit and successful rebuild, and confirm the deployed page changes. Revert the test content normally afterward. Do not call this verified until the real hosted flow passes.
6. Draft forms remain editable through **Edit in Admin**, but hosted draft visual previews intentionally return 404. Check that draft public URLs, cards, and sitemap entries stay absent, including with an edit cookie. Authenticated hosted draft preview is still deferred; neither a cookie nor `noindex` is access control. Do not bypass the existing boundary to make a preview appear.
7. For an additional cloud artifact check, build locally with `npm run build:cloud`, then run `npm run test:cloud`. It checks public routes/draft rejection, the real login URL's client ID/origin, and scans `dist/client` for the read token. It does **not** prove deployed authentication, Git publishing, media uploads, or deployed Vercel function behavior. It needs the **Node** artifact (no `VERCEL=1`), not `.vercel/output`.

You can validate Vercel packaging locally, without deploying, by running `VERCEL=1 NODE_OPTIONS=--max-old-space-size=3072 npm run build`. This uses local Tina data and emits `.vercel/output` to inspect; **do not deploy that local-mode artifact**. Real Vercel builds must use `build:cloud`. Run the normal build again before using `preview`, `test:static`, or `test:cloud`.

## Simple rollback and eventual domain cutover

- **Before domain work:** Squarespace still serves the domain. A failed Vercel preview has no domain impact; remove it or redeploy the last known-good Git revision. For a live Vercel deployment, use Vercel's rollback/promote action for a known-good deployment, then revert the faulty code/content commit through the normal Git workflow so the next build does not reintroduce it. A code rollback does not undo Tina's Git commits or project settings.
- **Only when separately authorized and the site is ready:** export/screenshot the existing DNS zone, record Squarespace's current website records and TTLs, and retain the Squarespace site during the transition. Change only the required website A/AAAA/CNAME records according to Vercel's current project instructions; do not change nameservers or MX/TXT/email-related records. Confirm both apex/www behavior, TLS, redirects, navigation, and send/receive email after propagation. Set the chosen canonical `SITE_URL` and rebuild. No DNS values are guessed here.
- **Domain rollback:** restore only the saved website records to Squarespace (leave email records alone), allow for the recorded TTL, verify the old website and email, and keep both hosts available until propagation settles. Do not cancel Squarespace while it is the fallback.

## Remaining acceptance criteria

- Authorized Vercel deployment and deployed-origin editor/media/Git-save/rebuild checks.
- Any decision/implementation for authenticated hosted draft visual preview; current production rejection is intentional.
- Custom-domain availability, email/DNS checks, and an exercised hosting/domain rollback — deferred by the owner.

Do not close #14 or parent #1 based on local QA or adapter packaging alone.
