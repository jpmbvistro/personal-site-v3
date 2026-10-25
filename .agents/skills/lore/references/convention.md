# Lore Convention

## Frontmatter

Frontmatter is optional. Use it for metadata that benefits from simple machine
inspection, not as a second body language. A useful common set is:

```yaml
---
type: domain-concept
status: active
title: Checkout
updated: 2026-10-06
---
```

Recommended fields:

- `type`: one initial type: `domain-concept`, `capability`, `idea`, `constraint`,
  `engineering-projection`, or `decision`.
- `status`: a lifecycle hint such as `draft`, `proposed`, `active`, `accepted`,
  `deprecated`, `superseded`, or `rejected`. Use the smallest vocabulary that
  fits the repository.
- `title`: optional display title when the filename is not sufficient.
- `updated`: optional ISO date (`YYYY-MM-DD`) for the last meaningful update.
- `superseded-by`: optional slug or link when a document is superseded.

Do not require every field. `decision` documents may use MADR's optional fields
such as `date`, `decision-makers`, `consulted`, and `informed`; avoid duplicating
them with different names without a reason.

## Names and locations

Keep knowledge close to the repository root in `knowledge/`. Use lowercase,
kebab-case slugs for filenames, such as `payment-retry-policy.md`. The slug is
the stable target for `[[payment-retry-policy]]`. A decision may use a MADR-style
numbered filename such as `0001-use-repo-native-markdown.md`; its wikilink target
should use the actual stable slug chosen by the repository.

Do not split a document merely because it has several headings. Split when it
has a distinct subject, owner of truth, lifecycle, or reason to link to it.

## Initial types

| Type | Use for | Usually answer |
| --- | --- | --- |
| `domain-concept` | A term or entity in the problem domain | What does this mean here? |
| `capability` | A product or system ability | What can it do, for whom, and why? |
| `idea` | An uncommitted possibility | What might be worth exploring? |
| `constraint` | A boundary, rule, or non-negotiable | What must or must not be true? |
| `engineering-projection` | A deliberately deferred engineering change | What should change later, and what triggers reconsideration? |
| `decision` | A durable choice and its rationale | What was chosen, from what options, and why? |

This is an initial model. Add a type only after actual usage shows that the
existing types repeatedly lose important meaning.

## Relationships

Use wikilinks when a relationship is meaningful and points to a knowledge
document: `[[checkout]]`, `[[payment-retry-policy]]`. Give the relationship
context in prose or a short `Related` section; do not create link farms.

Useful relationship language includes `depends on`, `constrains`, `enables`,
`motivated by`, `supersedes`, and `reconsider when`. A broken or uncertain link
is worse than no link, so search for the target before adding it. Keep code and
external links as normal Markdown links, for example `[retry handler](src/retry.ts)`.

## Lifecycle and maintenance

Status is descriptive, not a workflow engine. A draft can be useful; an active
concept can still evolve. When updating a document:

1. Search for duplicates and inbound links first.
2. Preserve accurate history and record meaningful uncertainty.
3. Update `updated` if the repository uses that field.
4. Repair links that you intentionally rename, or leave a short supersession
   note when preserving the old document matters.
5. Remove stale material only when it is demonstrably false or no longer useful;
   for decisions, prefer a successor record over rewriting history.

Periodic maintenance can be manual: find orphaned documents, stale statuses,
and links to missing slugs. Do not add an index or validator until usage shows
that these checks are frequent and valuable.

## Decision guidance

Use MADR's recognizable structure: title, Context and Problem Statement,
Considered Options, Decision Outcome, and Consequences. Add Decision Drivers,
Confirmation, Pros and Cons, or More Information when they improve the record.
Capture one decision per document. A later change should normally be a new
decision that links to the old one and marks its status as superseded.
