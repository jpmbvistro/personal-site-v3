---
name: github-playbook
description: Use when scoping outcome-sized GitHub issues for capable coding agents, assessing autonomous execution readiness, planning stacked PRs, creating/triaging issues and epics, and handing work to review. Preserves correct issue closure and approval boundaries.
---

# Asterism GitHub playbook

Apply these conventions to GitHub work across Asterism repositories. Read `references/conventions.md` for examples and edge cases.

## Non-negotiable handoff rules

1. **Issue-free PRs are valid.** Never fabricate an issue merely to satisfy a template or check.
2. **Capture assignments at the start.** When directed to execute issue(s), record the exact repository and issue numbers in the work context. Do not rely on the branch name, commit message, or eventual memory of the prompt.
3. **Account for every assigned issue at handoff.** For each assigned issue, determine whether its acceptance criteria are fully satisfied. In the PR description:
   - Fully satisfied: `Closes #42` (or `Closes owner/repo#42` for another repo).
   - Partially completed: `Refs #42`, with the remaining work stated clearly; never use a closing keyword.
   - Not addressed: explain in the remaining-work section and reference the issue without closing it.
   - Several completed issues: include a separate closing line for **each**; there is no one-issue-per-PR rule.
4. **Verify before publishing the PR.** Compare its closing and non-closing references against the original assignments and the work actually done. Update the PR body when scope changes.
5. **Epic safety.** Never close a parent epic merely because a child issue is completed. Closing an epic deliberately requires verifying its completion criteria/children and checking the explicit epic-closure box in the PR.

## Outcome-sized issues and autonomous execution (default)

**Default: one coherently scoped issue → one autonomous agent assignment → one or more reviewable PRs.** Choose the issue boundary around a testable product workflow or bounded engineering capability that a capable agent can reasonably implement and verify. Do not create separate prerequisite issues merely for API, schema, UI and integration layers if they all serve the same outcome and have no genuinely independent decision/acceptance boundary. Conversely, do not create one giant issue for unrelated outcomes. **Issues describe outcomes and constraints; PRs describe reviewable code changes.** An epic groups outcomes, not necessarily one agent execution.

### Scope/readiness check before opening or assigning an issue

Assess these five questions against repository evidence, not a model-name-specific token/LOC threshold:

1. **Outcome/requirements:** Is success observable and sufficiently specified, with any acceptable discovery bounded?
2. **Architecture:** Can an agent follow accepted repo patterns and make ordinary in-scope decisions, or must a load-bearing choice first be approved?
3. **Verification:** Are realistic tests, fixtures, integration checks or an observable product flow available to prove success independently of the agent's narration?
4. **Dependencies:** Can the agent proceed through prerequisites in a branch/stack without waiting for unknown external outcomes or unauthorized merges?
5. **Risk/authority:** Are consequential security/privacy/data/migration/production decisions bounded by existing rules and explicit authorization?

Classify the proposed issue as **autonomous**, **autonomous with named gates**, or **discovery first**. For a gate, state the *specific decision/evidence* requiring human review; do not make every PR a founder gate. For discovery first, use a bounded spike with a tangible experiment and follow-up implementation outcome. A separate issue is warranted for a genuinely independently useful outcome, unbounded research, a material policy/architecture decision, or a dependency that cannot safely be progressed inside one execution. Size is empirical; refine from completion and remediation evidence rather than hard-coding a frontier model's claimed capabilities.

### Agent execution and review

1. **Record scope:** capture the assigned issue ID, acceptance criteria, explicitly permitted operations, accepted architecture, dependencies, and named decision gates at intake. A PR may still be issue-free if no issue was assigned.
2. **Execute autonomously:** inspect the repo, plan internal steps, make ordinary in-scope technical decisions, write code, tests and migrations, run checks, remediate failures, and confirm the end-to-end result. Do **not** require founder approval between implementation layers, commits, or ordinary PR stages.
3. **Choose PR strategy on reviewability, not issue count:** default to one PR if the diff is coherent and reviewable. Use stacked PRs for separable, independently reviewable layers (e.g., contract, UI, integration) when this improves review; do not create a stack ceremonially. A stack may use intermediate PRs based on preceding branches; preserve correct base targets, explain dependency order and avoid asserting that a PR targeting a non-default branch will auto-close an issue. The PR actually completing all criteria must include the proper closing reference before merge to the default branch.
4. **Escalate when necessary:** pause affected work for unapproved material product/scope/architecture/policy changes; consequential security, privacy, data-loss or deployment risk; unresolved blockers after reasonable investigation; and authentic founder product/UX acceptance. Continue independent authorized work when safe. Never infer permission to merge, deploy, publish, mutate production data, spend money, grant credentials or bypass branch/code-owner protections.
5. **Consolidated handoff:** show the working outcome, branches/PR review order, actual test/CI evidence, scope/issue disposition, residual risks and only decisions needed. Review can occur incrementally without repeated product acceptance meetings.

**Exception for existing small tickets:** when several related pre-existing issues jointly define one cohesive capability, one agent assignment may cover them without rewriting history. Record every explicitly assigned issue; only close each upon fully satisfying its criteria. This is a migration/coordination convenience, **not** the default way to author new issues. Models and harnesses (Codex, OpenCode, Keel or successors) may differ; the policy is model-agnostic and does not grant unattended execution or merge authority.


## Issue creation

- Create an epic when the desired outcome spans multiple independently deliverable issues; title it `[EPIC] <outcome>`. Use GitHub's native parent/sub-issue relationship where available.
- Child/ordinary issues use concise, actionable titles without a required prefix, e.g. `Persist worker restart checkpoints`. Use `[SPIKE]` for a time-boxed investigation and `[BUG]` when it helps triage.
- Epic body: objective, success/exit criteria, scope and exclusions, child issues, dependencies, decisions still open.
- Child issue body: desired behavior, acceptance criteria, constraints/context, evidence or verification, parent epic link if applicable.
- Prefer native hierarchy as the source of truth; text links are a fallback when the API or agent cannot establish a sub-issue relationship.
- Do not create implementation instructions that artificially prevent discovery. Record uncertainties, not invented architectural facts.
- Default to **one autonomous outcome-sized issue**, with implementation-layer subtasks/checklists inside it where useful. Do not split schema/API/UI/testing into separate issues unless they are independently valuable or have a real decision/dependency boundary. Record the readiness classification and named gates when applicable.
- Decompose epics into independently valuable product/engineering outcomes; dependencies should express real technical or decision constraints, not ceremonial PR merge gates. Existing smaller related issues may be assigned together as an exception.

## PR creation

- Use the repository's PR template if present. Keep the summary, verification evidence, known limitations, and issue disposition in the PR body.
- If the work had no assigned issue, omit the closing-reference section or leave it empty. This is a supported case.
- An outcome-sized issue may have one PR or a stack of PRs. Intermediate PRs reference the issue without closing it when criteria remain incomplete. The final PR can close it only when its full criteria are met and it is merged to the default branch; rebase/retarget stacked PRs safely and keep the dependency order clear.
- For an exception covering multiple explicitly assigned issues, each PR closes only issues whose criteria it has fully satisfied, and the final handoff reconciles all assignments.
- Use GitHub's recognized closing keywords **in the PR body** for completed work; a bare issue link does not auto-close it.
- If an assigned issue is only partly done, use a non-closing reference and list what remains. Do not represent a partial outcome as complete for cleaner ticket bookkeeping.
- For child issues, close only the child; relate it to its epic with a non-closing `Part of #EPIC` line where useful.
- Issue-auto-closure works when GitHub merges the PR into the default branch; merging into a non-default target does not carry that guarantee.
- Closing keywords can be used once per issue, including multiple issues in one PR. GitHub also accepts `Fixes` and `Resolves` and cross-repository `owner/repo#number`.

## Before you hand off

- Confirm the PR has the right base branch and accurately represents the delivered work.
- For each assigned issue, record complete/partial/not done; reconcile references in the PR body.
- Explain why a linked epic is actually complete if you intend to close it, not merely that its child PR merged.
- Report what tests were run, what passed, and what is unknown; do not claim checks ran when they did not.
- Do not close issues manually to compensate for a missing closing keyword; fix the PR description before merge where feasible.

## Boundary with automation

The reusable CI workflow verifies the closing references that appear in a PR and requires explicit acknowledgment for epic closure. It intentionally **does not require any references**. It cannot infer assignments that occurred outside GitHub. Keel should later compare its recorded input issue IDs against proposed PR issue dispositions and flag omissions before PR creation.
