# GitHub conventions and worked examples

## Title and hierarchy

| Kind | Title | Treatment |
| --- | --- | --- |
| Epic | `[EPIC] Durable agent execution` | Parent issue; track deliverable children and exit criteria |
| Feature/task | `Recover interrupted worker session` | Ordinary child or independent issue |
| Spike | `[SPIKE] Investigate OpenCode message retrieval` | A bounded experiment with a written conclusion |
| Bug | `[BUG] Recovery metadata is dropped` | A verified defect and reproduction |

Native GitHub sub-issues are preferred to repeating the epic number in every child title. If tooling cannot add a native sub-issue relationship, write `Parent epic: #10` in the child's body and request hierarchy repair.

## Default: one outcome-sized issue, optional stacked PRs

Create one issue, `#42 — Native pump-session management`, with acceptance criteria covering authenticated create/read/edit/delete contracts, native create/edit/delete screens, failure states and end-to-end tests. The agent owns the capability autonomously; it chooses internal steps and PR boundaries based on reviewability. It does not need approval after every API/schema/UI layer.

**Option A (preferred when reviewable):** one PR targeting `main`, implementing and validating the complete outcome, with `Closes #42` in the PR body.

**Option B (when smaller reviews materially help):** one agent assignment with a three-PR stack:

| PR | Base branch | Deliverable | Issue disposition |
| --- | --- | --- | --- |
| A | `main` | Authenticated API + persistence + tests | `Refs #42` — not complete |
| B | PR A's head | Native UI + error states | `Refs #42` — not complete |
| C | PR B's head | End-to-end workflow/tests + final evidence | `Refs #42` until complete and targeted/merged to default branch |

The agent can prepare the next PR on a dependent branch while earlier PRs await review, subject to repository permissions; it must not merge them without authorization. After A and B are merged and C is rebased/retargeted to `main`, **C** can use `Closes #42` when all criteria are demonstrably satisfied. GitHub closing keywords in PRs targeting non-default branches may not auto-close issues. Do not put premature `Closes #42` on A or B, and do not make the stack mandatory.

## Exception: multiple existing narrow issues

If the repo *already* has `#42` (API contract), `#43` (native create), and `#44` (native edit/delete), one autonomous assignment may cover all three as a single capability. An API-only PR that completes #42 may use `Closes #42` (when ultimately merged to the default branch) while referencing `Refs #43` and `Refs #44`; later PR(s) close #43/#44 only when fully satisfied. **Do not create three tickets by default solely to reproduce this structure.**

## Readiness and a genuine human gate

Before creating/assigning the issue, check requirements, architecture, verification, dependencies and risk:

- **Autonomous:** a known API/UI workflow with existing patterns and runnable end-to-end checks.
- **Autonomous with named gate:** the issue is otherwise executable but a new tenant-isolation policy must be chosen; stop only that affected decision, present evidence/options and continue unrelated permitted work.
- **Discovery first:** a critical external runtime API is unverified and implementation cannot be specified/tested reliably; run a bounded proof-of-concept before authoring the outcome issue.

A gate is **not** a compulsory merge after each dependency. Nor does being autonomous permit merging PRs, deploying, deleting production data or spending money without authorization.


## PR without any issue

A PR implementing a maintenance adjustment with no assigned issues is fine:

```md
## Summary
Improve setup documentation.

## Verification
Checked examples against the CLI.

## Issue disposition
No issue was assigned.
```

There is no requirement to create a corresponding issue. CI must pass.

## PR that completes two assigned issues

```md
## Summary
Implement checkpoint recovery and add restart integration tests.

## Completed issues
Closes #42
Closes #43

## Verification
- Unit tests passed
- Integration recovery test passed

## Remaining work
None for these two issues.
```

The two closing lines are intentional; each issue can auto-close on merge to the default branch.

## PR that only partly completes assigned work

```md
## Summary
Add checkpoint persistence, but not automated recovery.

## Related or incomplete issues
Refs #42

## Remaining work
- Restore checkpoint on SIGKILL restart.
- Prove recovery with an integration test.
```

Do **not** say `Closes #42` until issue #42's acceptance criteria are satisfied. Creating a follow-up child issue does not, by itself, make the original issue complete.

## PR for a child of an epic

```md
## Completed issues
Closes #43

## Related or incomplete issues
Part of #40
```

Issue #40 remains open unless its **own** exit criteria are complete. To close an epic intentionally, add the following exact acknowledgment to the PR body:

```md
- [x] Epic closure reviewed: all exit criteria and child issues verified complete
```

Do not check this box for normal child-issue PRs.

## Cross-repository issues

Use a full owner/repo reference for another repository:

```md
Closes jpmbvistro/keel#42
```

GitHub's auto-closing behavior and access rules apply. The shared PR validator does not independently fetch cross-repository issues, because the PR workflow token might not have access to them; review those references yourself.

## GitHub behavior

- Closing keywords must appear in the description (or supported commit message); a non-closing plain issue reference does not close an issue.
- A PR must target/merge into the default branch for GitHub's normal linked-issue auto-closure.
- An agent must not assume every issue mentioned in background context is an assigned deliverable. Only explicit assigned work is reconciled.
- The CI validator does not know which issues appeared in prior prompts. It only checks closers actually present.
