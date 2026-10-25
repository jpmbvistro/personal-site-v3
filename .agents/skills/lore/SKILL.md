---
name: lore
description: Maintain durable, repo-native product, domain, and engineering knowledge in a project's knowledge/ directory. Use when capturing or updating concepts, capabilities, ideas, constraints, deferred engineering changes, or decisions; when an agent needs to discover existing project knowledge; or when linking code and knowledge with plain Markdown and wikilinks.
license: MIT
metadata:
  version: "0.1"
---

# Lore

Use Lore when knowledge should survive the current task and remain useful to
future humans or agents. Lore is a filesystem convention, not a service.

## Core workflow

1. **Search first.** Inspect `knowledge/` and search both filenames and Markdown
   content for the topic, relevant links, and likely synonyms. Prefer updating
   or linking an existing document to creating a duplicate.
2. **Decide whether to capture.** Capture durable context, rationale, a
   constraint, a reusable concept, or a deferred change. Do not record every
   transient task detail. Ask, "Would a future contributor or agent make a
   better decision if this survived?"
3. **Choose the smallest useful type.** Use one of `domain-concept`,
   `capability`, `idea`, `constraint`, `engineering-projection`, or `decision`.
   If no type fits, do not invent a new ontology member casually; use the
   closest type and explain the mismatch, or leave a normal project document.
4. **Create or update plain Markdown.** Use YAML frontmatter only for compact
   metadata. Put the knowledge itself in prose, headings, lists, and links.
5. **Link related knowledge.** Use `[[kebab-case-slugs]]` for repository-local
   relationships. Add ordinary Markdown links when pointing to code, issues,
   external sources, or paths that are not knowledge documents.
6. **Preserve history.** A decision's changed outcome is a new decision or an
   explicit supersession, not a silent rewrite of the old rationale. Update
   status and add links when circumstances change.
7. **Review the result.** Check that the title, type, status, links, and
   reconsideration conditions are clear to a reader without a Lore-aware tool.

## Where to look

The repository using Lore owns its knowledge in `knowledge/`. Do not move
project knowledge into this skill directory or an external store. If the
repository has no `knowledge/` directory, create it only when the user wants
to establish Lore or capture durable knowledge; otherwise ask before adding
one.

Read [references/convention.md](references/convention.md) when you need the
frontmatter vocabulary, lifecycle guidance, naming rules, relationship advice,
or type-specific guidance. Copy a suitable file from `assets/templates/` when a
template helps, especially for decisions. Templates are prompts, not schemas;
remove unused sections.

For a `decision`, read [assets/templates/decision.md](assets/templates/decision.md). Keep its
MADR sections recognizable and retain the context, options, outcome, and
consequences. MADR-compatible does not require a tool, numbering scheme, or
Obsidian.

## Capture quality bar

- State what is true, intended, proposed, or constrained; distinguish those
  from guesses.
- Include scope and useful context, not implementation trivia that will age
  quickly.
- Link to related concepts and decisions when the relationship helps explain
  the document.
- For `engineering-projection`, always state the deferred change, why it is
  deferred, and observable triggers or conditions that should cause review.
- For `idea`, make its exploratory status obvious; do not present it as a
  commitment.
- For a superseded decision, preserve the original document and link both ways
  where practical.

Lore deliberately has no required index, parser, database, plugin, or CLI.
Introduce mechanical validation only after real usage demonstrates repeated
errors that judgment and review do not handle well.
