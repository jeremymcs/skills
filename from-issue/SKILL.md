---
name: from-issue
description: Research and implement a code change from an existing issue, ticket, or issue-like artifact. Use when the user says "$from-issue", asks Codex to work from a GitHub issue, local markdown issue, tracker ticket, bug report, feature issue, or AFK implementation ticket, and expects codebase research, linked PR verification, targeted questions, a patch, verification, branch push, and pull request creation.
---

# From Issue

Use this skill to take one existing issue from "needs implementation" to a verified pull request.

Default to action. Ask questions only after reading the issue and exploring the codebase, and only when the answer cannot be responsibly inferred from code, docs, tests, ADRs, or issue comments.

## Workflow

1. Resolve the issue source.
   - Accept issue numbers, URLs, branch names, tracker IDs, local markdown files, pasted issue bodies, or conversation context.
   - Fetch the full issue body, labels, linked issues, linked pull requests, comments, acceptance criteria, screenshots, and current status when the tracker is available.
   - If the issue tracker is unknown, inspect repo docs such as `AGENTS.md`, `CONTRIBUTING`, `.github`, `docs/agents`, and local issue folders before asking.
   - Do not close, edit, relabel, or reassign the issue unless the user explicitly asks.
2. Establish working context.
   - Inspect repo instructions, package manifests, test scripts, recent commits, relevant ADRs, and domain docs.
   - Check `git status -sb` before editing. Preserve unrelated user changes.
   - Create or switch to a focused branch when implementation will proceed. Use the repository's branch conventions when documented; otherwise use a short `codex/issue-<id>-<slug>` branch.
3. Research the implementation path.
   - Trace the relevant workflow through source, tests, API boundaries, data model, UI, and configuration.
   - Prefer concrete evidence over assumptions: file paths, existing tests, runtime behavior, logs, failing commands, or issue comments.
   - Treat issue text as a hypothesis. Verify that the codebase still matches it.
   - If the issue is too large, identify the smallest tracer-bullet slice that satisfies the acceptance criteria and say what is deliberately out of scope.
4. Verify any existing pull request.
   - If the issue has linked, closing, or referenced PRs, inspect them before creating a competing patch.
   - Read the PR description, diff, review comments, check results, and linked commits.
   - Compare the PR against the issue's acceptance criteria and the current codebase behavior.
   - Decide whether the PR is the correct fix, a partial fix, stale, broken, or unrelated.
   - If the PR is the correct fix, verify it with the relevant checks and report that result instead of duplicating the work.
   - If the PR is incomplete or wrong, either review/comment with concrete evidence when asked, or create a separate fix only after explaining why the existing PR does not satisfy the issue.
5. Interrogate uncertainty.
   - Ask one question at a time.
   - For each question, include the recommended answer and the evidence that led to it.
   - Do not ask questions that codebase exploration can answer.
   - If the user is unavailable and the uncertainty is low-risk, choose the conservative path and document the assumption.
6. Create the patch.
   - Implement the narrowest change that satisfies the issue.
   - Follow existing local patterns, naming, abstractions, formatting, and test style.
   - Add or update tests proportional to risk and blast radius.
   - Avoid opportunistic refactors, dependency churn, unrelated formatting, or broad rewrites.
7. Verify.
   - Run the smallest meaningful checks first, then broader checks when the touched surface justifies it.
   - Include a regression test for bugs whenever practical.
   - For UI changes, run the app when feasible and verify the changed workflow in a browser.
   - If a check cannot run, capture the blocker and any partial evidence.
8. Prepare the pull request.
   - Review the diff and ensure only intended files changed.
   - Commit with a focused message if the user asked for commit/PR or if pushing a PR is part of the request.
   - Push the branch and open a PR against the appropriate base branch.
   - Link the source issue using the tracker's closing syntax only when the PR fully resolves it; otherwise use a non-closing reference.
   - Default to a draft PR when meaningful uncertainty remains, checks are blocked, or the user did not specify ready-for-review.
9. Report the result.
   - Provide the issue reference, branch, PR URL, summary of changes, and verification commands.
   - Call out assumptions, blocked checks, and any follow-up work that is real rather than speculative.

## Issue Research Checklist

Use this checklist while exploring, but do not dump it into the final answer unless useful:

- What user-visible behavior does the issue require?
- What acceptance criteria or comments constrain the solution?
- Does the issue already have a linked PR, and does that PR actually satisfy the acceptance criteria?
- What existing code owns the workflow?
- What tests currently cover it?
- What domain language does the project use for this concept?
- What hidden coupling or migration risk exists?
- What is the smallest demoable fix?

## Question Format

When a human decision is required, ask:

```markdown
Question:

Recommended answer:

Why I think so:
```

Ask only one question, then wait. If implementation can proceed safely without waiting, state the assumption and continue.

## PR Body

Use the repository's PR template when present. Otherwise use:

```markdown
## Summary

- Change 1
- Change 2

Closes #ISSUE_NUMBER

## Verification

- [ ] Command or manual check
- [ ] Command or manual check

## Notes

- Assumption, blocked check, or follow-up if needed
```

Use `Refs #ISSUE_NUMBER` instead of `Closes` when the PR does not fully satisfy the issue.

## Guardrails

- Do not implement before reading the issue and researching the relevant code.
- Do not ask broad planning questions before doing codebase research.
- Do not exceed the issue's scope without explicit approval.
- Do not include unrelated user changes in commits or PRs.
- Do not push directly to the default branch unless explicitly requested.
- Do not mark a PR ready when verification is missing or materially blocked.
- Do not invent issue labels, milestones, owners, product requirements, or external commitments.
