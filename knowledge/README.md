# Site knowledge (Lore)

This folder holds durable project knowledge for humans and coding agents in
plain Markdown, using the repository-installed [Lore skill](../.agents/skills/lore/SKILL.md).
It is not TinaCMS content and is not published as site pages.

- [Site design system](site-design-system.md) — accepted baseline, proposed
  direction, accessibility expectations and unresolved visual decisions.

When changing an established decision, update the relevant document (or write
a new decision with a supersession link where preserving historical rationale
matters). Search before creating new documents; do not duplicate CSS token
definitions here. Source-of-truth token values remain in
`src/styles/global.css`.

Never put confidential former-employer details, private client financials,
tokens or unpublished career evidence here. A private Git repository is not an
excuse to commit material that should not be shared with service providers.
