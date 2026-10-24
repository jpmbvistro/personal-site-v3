# Juan Vistro · personal-site-v3

Astro + TypeScript + Tailwind CSS, with native Astro rendering and Git-backed TinaCMS visual editing. Home, Work, Projects, About, and Contact share one responsive shell. Work/project detail pages are generated from published collection records. No hosting or DNS has been changed.

## Run locally

Use Node 24 (`nvm use`), then:

```sh
npm ci
npm run dev
```

- Site: <http://localhost:4321/>
- Editor: <http://localhost:4321/admin/index.html>
- Tina API: <http://localhost:4001/graphql>

No credentials needed locally. Keep the dev command running; Tina and Astro run together. `--ignore-lock` keeps Astro 7 in the foreground (its agent auto-backgrounding otherwise stops Tina's parent process). Use only one Tina command at a time; stop dev before building so port 4001 is available. Keep the unauthenticated local editor/API on loopback, not a public network.

```sh
npm run build        # credential-free local Tina index + static pages + Node endpoint
npm run check        # Astro/TypeScript; run dev or build first to generate Tina types
npm run preview      # built Node server, default http://localhost:4321
```

On this 8 GB development machine, Tina's production admin bundle needs an explicit heap cap to avoid memory pressure: `NODE_OPTIONS=--max-old-space-size=3072 npm run build` (also applies to `test:static`). The local dev editor does not need that workaround.

`build` is the same local build CI runs. Public pages work without a running CMS; the refresh endpoint still points to the **local** Tina API, while the built admin expects cloud login. This artifact is for build checks/public-page preview, not editor deployment. Use `dev` for local editing and `build:cloud` for deployment, below.

## Edit content locally

1. Run `npm run dev` and open `/admin/index.html` → **Enter Edit Mode**.
2. The homepage opens in the preview. Click its heading, then change **Title** or **Body** in the sidebar. The preview updates **before** saving. Navigate to About/Contact or use Tina's navigation menu to select a collection record.
3. Click **Save**. The change is written to `content/pages/home.md`; a fresh visit to `/` shows it. Commit/push that file using the normal Git workflow. Local Tina saves files, not Git commits.
4. Create Work/Projects entries from their collections. New entries default to **Draft**. A draft opens at `/preview/work/<filename>/` or `/preview/projects/<filename>/` in local dev, using the same detail component as a published page. Filenames supply slugs; nested folders are supported.
5. To publish deliberately, clear **Draft**, save, then commit/push the content and rebuild. Only an explicit `draft: false` generates public routes and cards; missing flags also stay hidden. Publishing never happens automatically as part of drafting.

The real admin → iframe → native Astro render → file save flow is covered by `tests/tina.spec.ts`, which restores the original files afterward. No mocked CMS or React page islands. Local saves write files, **not Git commits**. Hosted TinaCloud saves commit to the configured GitHub branch. Cloud artifact/login-URL checks are covered separately; they do not verify authenticated hosted saves.

### Flexible stories and visual blocks

- Work and Projects require only title, ordered rich-text body, and draft status. Summaries, organization/role, tags, project status, and labeled links are optional. Omitted values render no placeholder sections. Cards on the homepage/indexes read the same records, ordered by filename; the homepage shows the first three in each collection.
- Rich text supports links and images. Upload publication-safe media to `public/uploads`, insert it with Tina's image toolbar, and provide useful alt text and captions. Bespoke architecture diagrams should be static SVG/image figures with text alternatives—not a node/edge editor.
- **Metric strip**: use the body toolbar's overflow menu → **Embed → Metric strip**. Open the block's options → **Edit** to change its caption, add/edit values/labels/qualifiers, and drag entries to reorder them. Values are display strings (`37+`, `35/40`), not quantities to sum. The native Astro `MetricStrip.astro` renders a responsive definition list without client JavaScript. Empty strips render nothing.
- Work's optional **Presentation → Editorial with lead figure** uses the same shell, with the body's opening figure alongside the introduction on desktop. **Editorial sections** is an optional native Tina list: edit section labels, headings and rich-text content, and drag entries to reorder them. Narrative/figure sections and decision-list sections are optional, not a required story template. Ordinary Markdown continues to use the simple presentation; prose is not duplicated between the body and sections.
- #18's **UX enablement figure** has two fixed compositions (hero network and approach flow). Tina edits its caption, explanation and node labels—not geometry. Twelve nodes represent participating teams, not uniform maturity or additive outcome groups. The component has separate desktop and vertical mobile markup; outcomes remain outside the topology. Insert figures inside a section's rich-text content as needed. The top-level first figure supplies the editorial hero visual.
- The editorial presentation applies #26's accepted warm-ivory/charcoal/deep-green/copper/stone tokens and self-hosted Newsreader + Inter (licenses/provenance in `public/fonts/`). Site-wide migration and design-system documentation remain in #26/#27; this does not create a second global shell or complete those issues.
- Tina owns text and structured data; Astro owns layout. Do not add custom blocks unless an actual story needs them. Process flows and decision matrices are not implemented speculatively.
- Four Work case studies use the evidence supplied in #18–#21:
  - `content/work/scaling-ux-capability.mdx` — UX enablement (#18).
  - `content/work/api-migration-confidence.mdx` — API migration decisions (#19).
  - `content/work/ai-assisted-delivery.mdx` — AI-assisted delivery (#20).
  - `content/work/nonprofit-crm-selection.mdx` — nonprofit CRM selection (#21).
- The owner has marked the four stories published in the local content records. During #18's redesign the owner explicitly chose to retain that state; this task does not deploy the site. New entries still default to draft, and draft support is verified with temporary fixtures rather than forcing the author's stories back to draft. Publication and these content tasks are not launch prerequisites. The UX story links to the related migration story's public route.
- Metrics describe the supplied observations, not invented ROI or autonomous delivery. No private Career OS/Vela evidence or confidential client financial figures are imported. `content/projects/keel.mdx` remains a minimal draft based on Keel's README, not a claim that its planned verification/publishing stages exist.
- Contact links to `/resume/`, a temporary, Tina-editable HTML rendition of the résumé supplied by the owner. Its source is `content/pages/resume.md`; the attachment was available as extracted text/page images, not a copyable original PDF. The headline, experience, skills, and contact details come from that supplied résumé. To replace it later, set Contact's optional **Résumé URL** field to another page or an uploaded public-safe PDF. The link is labeled **View résumé**, not a claim of a PDF download.

### Draft boundary

Draft preview is intentionally **local-only**. `npm run dev` sets the public, nonsecret `TINA_PUBLIC_IS_LOCAL=true` flag so Tina's collection links open local previews for either publication state; do not set this flag for cloud builds. A production build returns 404 for `/preview/*` even with a forged edit cookie. The island endpoint also refuses to fetch saved draft records in production. An edit cookie, same-origin POST, or `noindex` tag is not authentication. The owner explicitly deferred hosted draft preview until deployment work; it is not a local-development blocker. Use **Edit in Admin** for a draft's collection form rather than its unavailable hosted visual preview.

Drafts are absent from generated public routes, listings, and the sitemap (when enabled with `SITE_URL`). They are **not confidential storage**: only publication-safe material belongs in this Git repo or Tina project. Never commit private evidence, sensitive financials, tokens, or proprietary engineering artifacts.

```sh
npx playwright install chromium
npm test
npm run test:static   # stop dev first; temporary fixtures, static checks, then clean rebuild
```

Browser tests cover real visual saves for Home/Work/Projects/About/Résumé (including all four Work stories), editorial sections/figure captions, résumé access from the homepage, typed-block insertion/editing/reordering, draft exclusion, automatic listings, minimal entries, 320/390/768/1440px layouts, link destinations, keyboard skip/menu/Escape behavior, and native content/navigation without JavaScript. Tests use port **4322** so an existing preview on 4321 can remain open; Tina still needs 4001/9000 free. Do not run tests alongside a build. `test:static` checks generated editorial/metric/minimal-entry HTML and production draft exclusion (including an editorial draft fixture), sitemap omission and forged preview requests, then removes its temporary fixtures and rebuilds. CI stays a single build/typecheck job.

## Hosting & authentication

**Current scope:** local QA and Vercel deployment preparation for #14; **domain hosting/cutover is deferred until the site is done**. No deployment or DNS change has been made. The owner has chosen **Vercel** and reports TinaCloud/GitHub authorization, environment configuration, and authorized/unauthorized access checks are already set up; these are not proof of deployed editing/publishing. See [release QA, Vercel setup, and rollback](docs/release.md) for the remaining hosted checks. An origin means the URL's scheme and host (plus port when applicable). Tina's branch setting selects which repository branch to read/save; the GitHub app authorization grants repository access, not a separate per-branch editor invitation. GitHub branch protections still apply.

- Public pages are prerendered (`output: 'static'`). Native visual editing still POSTs to `/tina-island/[name]` for unsaved HTML fragments, so **static-only hosting is insufficient for the editor**. Local builds use `@astrojs/node` standalone; on Vercel (`VERCEL=1`), `@astrojs/vercel` packages the dynamic routes as functions. `vercel.json` requires the cloud build command. The integration uses Astro's experimental container API; keep the smoke test when upgrading.
- Shared Open Graph/Twitter metadata uses the existing page titles/descriptions. Leave `SITE_URL` unset for previews (noindex; no canonical/sitemap). Set it in the build environment or ignored `.env.local` only to the chosen public origin when ready for indexing; Astro then emits canonical URLs and a sitemap of public pages. This does not attach a domain or change DNS.
- TinaCloud authenticates writers and saves via Git commits; a push must trigger a site rebuild for static pages to update. When deployment work starts, confirm the deployed origin in the existing TinaCloud project. The render endpoint does not save files or grant write access.
- Set `TINA_PUBLIC_CLIENT_ID`, `TINA_TOKEN` (read-only content token), and `TINA_PUBLIC_BRANCH` in the build environment or an ignored `.env.local`, following `.env.example`; then run `npm run build:cloud`. The cloud script loads `.env`/`.env.local` and supports the original `TINA_CLIENT_ID`/`TINA_BRANCH` names by aliasing them to their public counterparts. Client ID and branch are public configuration; Tina's browser admin requires the `TINA_PUBLIC_` prefix. Keep the **token** server-side/build-only, never in `PUBLIC_*`/`TINA_PUBLIC_*`, browser code, or Git. For this private repo, use only publication-safe content: a read token or a draft flag is not a confidentiality boundary.
- Before the first cloud build, commit/push the foundation (including `tina/config.ts`, `tina/tina-lock.json`, and `content/`) to the configured GitHub branch. TinaCloud indexes the remote branch, not your working directory. If indexing previously failed with “No Tina config found,” use **Reindex** for that branch in TinaCloud after pushing, then retry the build.
- After a Node cloud build, `npm run test:cloud` checks the public routes/draft boundary, the actual admin login URL's client ID/origin, and scans public assets for the read token. It starts/stops its own loopback preview and does not sign in or save content. A Forbidden popup with `clientId=undefined` means the public client ID was missing when the admin was built; rebuild with `build:cloud`, not the credential-free `build` command.
- Local media goes under `public/uploads`; TinaCloud media can use its configured asset store. Hosted media upload and authenticated saves need verification against the chosen project/host.
- **Verification boundary:** local saving/preview, cloud builds, login-URL/token checks, and a locally invoked packaged Vercel renderer have passed (see [release results](docs/release.md)). Existing authenticated cloud access checks remain owner-confirmed; deployed-origin sign-in/saves/uploads/rebuilds have not been independently tested. Hosted draft visual previews remain unsupported. Do not deploy a local-mode artifact as production or expose a local Tina server. Confirm plan eligibility/pricing before deployment.

References: [Astro setup](https://tina.io/docs/frameworks/astro/), [native visual editing / static-site requirements](https://tina.io/docs/contextual-editing/astro/), [TinaCloud](https://tina.io/docs/tinacloud/).

## Small design system

- `src/styles/global.css` owns brand and semantic tokens, system-font typography, spacing, focus, and reduced motion. Ink `#192B39`, ivory `#F5F2EB`, evergreen `#386E67`, copper `#C7815D`. Copper is a restrained accent, **not** small text on ivory. Text pairs meet WCAG AA (evergreen/ivory 5.23:1; muted text/ivory 5.73:1).
- `src/layouts/BaseLayout.astro` is the only global shell. Navigation data lives in `src/lib/navigation.ts`. Mobile navigation is a native nonmodal disclosure with progressive Escape/close behavior.
- Reuse `Container` and `ButtonLink`; ordinary links use global styles. Add components only when actual reuse warrants them. React/shadcn is reserved for interactions that native HTML/Astro cannot reasonably handle; Tailwind semantic colors are already compatible.
- Tina owns authored content in `content/`; Astro owns layout. `src/lib/tina/` connects the generated client to native editable regions. Generated client/admin files are ignored; commit `tina/tina-lock.json` when the schema changes. Keep private career evidence and sensitive client details out of this repo, including drafts.
