# Repository guidance

- Node 24; `npm ci`, `npm run dev`. Stop dev before `npm run build` (shared Tina port). Build generates Tina types; then `npm run check`. `npm test` runs browser smoke tests after `npx playwright install chromium`.
- Read README.md for the proven local editor flow and unverified cloud/deployment requirements. Do not expose local-mode Tina publicly or change DNS as part of feature work.
- Keep one `BaseLayout`/header/footer. Reuse semantic tokens in `src/styles/global.css` and the shared navigation list. Prefer native Astro and HTML; add React/shadcn only for a concrete interactive need.
- Tina owns text/data; Astro owns rendering. Extend collections/blocks when actual content needs them, not as a general-purpose page builder. Commit `tina/tina-lock.json`; never commit generated clients/admin bundles, `.env`, or tokens.
- Keep keyboard focus, readable contrast, reduced motion, and small-screen layout working. Test behavior, not exact copy/mockup geometry.
- Author only public-safe content; do not invent claims, metrics, client details, résumé files, or dead-end links. Drafts are not confidential storage. Do not add editorial scoring, approvals, or evidence registries.
