---
name: create-issue
description: Create a single post-mortem GitHub issue and pull request from completed work in the current session. Use when the user wants to turn the contribution just completed into a tracking issue, commit or push the work, and open a PR without decomposing it into multiple implementation tickets.
metadata:
  short-description: Create issue and PR from completed work
---

# Create Issue

Use this skill after a contribution is complete and the user wants a lightweight issue plus PR created from the current session.

This is not a planning or decomposition skill. Do not split work into multiple slices unless the user asks.

## Workflow

1. Gather the completed-work context.
   - Read the current conversation for the user's goal and what changed.
   - Inspect `git status -sb`, recent commits, and the relevant diff.
   - If the repo has a contribution or PR template, follow it.
2. Draft one issue.
   - Title the issue as the completed contribution, not as a future investigation.
   - Body should explain what was done, why it matters, and how it was verified.
   - Include follow-up work only if it is real and not speculative.
3. Publish the issue.
   - Use the project issue tracker already configured for the repository.
   - If no tracker is configured or authentication is missing, stop and say what is blocked.
4. Prepare the PR.
   - If changes are uncommitted, stage only the intended files, commit them, and push a focused branch.
   - If the work is already committed on a branch, push that branch.
   - Do not push directly to the default branch unless the user explicitly requested it.
5. Open the PR.
   - Link the issue with `Closes #NUMBER` or the tracker's equivalent.
   - Summarize the change and verification.
   - Default to a draft PR unless the user asks for ready-for-review.
6. Report the result.
   - Provide the issue URL, PR URL, branch, commit, and checks run.

## Issue Body

```markdown
## Summary

Describe the completed contribution in 1-3 sentences.

## Why

Explain the reason this work was useful.

## What changed

- Change 1
- Change 2
- Change 3

## Verification

- Check or command that passed
- Manual verification, if applicable

## Pull request

Added after the PR exists.
```

## PR Body

```markdown
## Summary

- Change 1
- Change 2

Closes #NUMBER

## Verification

- [ ] Check or command
- [ ] Manual verification, if applicable
```

## Guardrails

- Keep this to one issue and one PR for the completed contribution.
- Do not invent requirements, labels, milestones, or assignees.
- Do not rewrite unrelated history or include unrelated files.
- If the session context is insufficient to describe the work accurately, ask one targeted question.
