# Juan Vistro · personal-site-v3

Astro + TypeScript + Tailwind CSS, with native Astro rendering and TinaCMS visual editing. This is the foundation milestone (#3), not the finished portfolio. Work/Projects/About/Contact and résumé access belong to later milestones; navigation currently links only to existing sections. No hosting or DNS has been changed.

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

`build` is the same local build CI runs. Public pages work without a running CMS; the refresh endpoint still points to the **local** Tina API, while the built admin expects cloud login. This artifact is for build checks/public-page preview, not editor deployment. Use `dev` for local editing and `build:cloud` for deployment, below.

## Edit a page

1. Run `npm run dev` and open `/admin/index.html` → **Enter Edit Mode**.
2. The homepage opens in the preview. Click its heading, then change **Title** in the sidebar. The preview updates **before** saving. Body is also editable.
3. Click **Save**. The change is written to `content/pages/home.md`; a fresh visit to `/` shows it. Commit/push that file using the normal Git workflow. Local Tina saves files, not Git commits.

This real admin → iframe → native Astro render → Markdown save flow is covered by `tests/tina.spec.ts`, which restores the original file afterward. No mocked CMS or React page islands. The trial is deliberately one small collection; flexible collections, visual blocks, and draft behavior are #6.

```sh
npx playwright install chromium
npm test
```

The seven browser smoke tests cover the editor save, 320/390/768/1440px layouts, link destinations, keyboard skip/menu/Escape behavior, and native navigation without JavaScript. Tests start dev automatically if needed and must not run alongside a build. They verify behavior, not prescribed copy or pixel-perfect mockups. CI stays a single build/typecheck job.

## Hosting & authentication

- Public pages are prerendered (`output: 'static'`). Native visual editing still POSTs to `/tina-island/[name]` for unsaved HTML fragments, so **static-only hosting is insufficient for the editor**. This repo uses `@astrojs/node` standalone; deploy both `dist/client` and `dist/server` through the Node entrypoint, or choose the matching Vercel/Netlify/Cloudflare adapter before deploying. The integration uses Astro's experimental container API; keep the smoke test when upgrading.
- Recommended next step: connect this **private** GitHub repo/branch to a TinaCloud project, grant the Tina GitHub app access, allow the editor's deployed origin, and invite authorized editors. TinaCloud authenticates writers and saves via Git commits; a push must trigger a site rebuild for static pages to update. The render endpoint does not save files or grant write access.
- Set `TINA_PUBLIC_CLIENT_ID`, `TINA_TOKEN` (read-only content token), and `TINA_PUBLIC_BRANCH` in the build environment or an ignored `.env.local`, following `.env.example`; then run `npm run build:cloud`. The cloud script loads `.env`/`.env.local` and supports the original `TINA_CLIENT_ID`/`TINA_BRANCH` names by aliasing them to their public counterparts. Client ID and branch are public configuration; Tina's browser admin requires the `TINA_PUBLIC_` prefix. Keep the **token** server-side/build-only, never in `PUBLIC_*`/`TINA_PUBLIC_*`, browser code, or Git. For this private repo, use only publication-safe content: a read token or a draft flag is not a confidentiality boundary.
- Before the first cloud build, commit/push the foundation (including `tina/config.ts`, `tina/tina-lock.json`, and `content/`) to the configured GitHub branch. TinaCloud indexes the remote branch, not your working directory. If indexing previously failed with “No Tina config found,” use **Reindex** for that branch in TinaCloud after pushing, then retry the build.
- After a cloud build, `npm run test:cloud` checks the actual admin login URL's client ID/origin and scans public assets for the read token. It starts/stops its own loopback preview and does not sign in or save content. A Forbidden popup with `clientId=undefined` means the public client ID was missing when the admin was built; rebuild with `build:cloud`, not the credential-free `build` command.
- Local media goes under `public/uploads`; TinaCloud media can use its configured asset store. Images/blocks and their authoring flow are not part of this one-text-edit trial.
- **Not yet verified:** TinaCloud login, GitHub commit/push, deployed origin settings, and hosted previews. They need the owner's TinaCloud/GitHub project access and a chosen host. Local saving/preview is proven; cloud publishing is not. Do not deploy a local-mode admin as production or expose a local Tina server. Budget/plan eligibility for a private repo and host pricing must be confirmed when choosing deployment in #14.

References: [Astro setup](https://tina.io/docs/frameworks/astro/), [native visual editing / static-site requirements](https://tina.io/docs/contextual-editing/astro/), [TinaCloud](https://tina.io/docs/tinacloud/).

## Small design system

- `src/styles/global.css` owns brand and semantic tokens, system-font typography, spacing, focus, and reduced motion. Ink `#192B39`, ivory `#F5F2EB`, evergreen `#386E67`, copper `#C7815D`. Copper is a restrained accent, **not** small text on ivory. Text pairs meet WCAG AA (evergreen/ivory 5.23:1; muted text/ivory 5.73:1).
- `src/layouts/BaseLayout.astro` is the only global shell. Navigation data lives in `src/lib/navigation.ts`. Mobile navigation is a native nonmodal disclosure with progressive Escape/close behavior.
- Reuse `Container` and `ButtonLink`; ordinary links use global styles. Add components only when actual reuse warrants them. React/shadcn is reserved for interactions that native HTML/Astro cannot reasonably handle; Tailwind semantic colors are already compatible.
- Tina owns authored content in `content/`; Astro owns layout. `src/lib/tina/` connects the generated client to one editable region. Generated client/admin files are ignored; commit `tina/tina-lock.json` when the schema changes. Keep private career evidence and sensitive client details out of this repo, including drafts.
