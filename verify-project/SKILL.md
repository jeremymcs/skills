---
name: verify-project
description: Verify whether a project, repository, or app does what it claims by inspecting the full codebase, running available checks, exercising behavior when possible, and producing an evidence-backed completion report with gaps and next steps. Use when the user asks to audit project completion, validate implementation against stated goals, or determine what remains to finish a repo or app.
metadata:
  short-description: Verify project completion status
---

# Verify Project

Use this skill when the user wants a real project verification, not a document review.

The goal is to answer: "Does this project actually do what it says it does, and what remains to finish it?"

## Workflow

1. Establish claimed scope.
   - Read `README`, `AGENTS.md`, `CONTRIBUTING`, `DESIGN`, PRDs, ADRs, roadmap docs, issue templates, package manifests, examples, and visible user-facing copy.
   - Identify the project type, intended users, promised workflows, core features, setup path, and success criteria.
   - Treat docs as claims to verify, not as proof.
2. Inspect the implementation.
   - Review the full source tree at a practical level: routes, entrypoints, domain logic, data layer, API boundaries, tests, scripts, config, deployment files, and generated assets.
   - Use fast searches for TODO/FIXME, skipped tests, placeholder copy, mock data, disabled checks, hardcoded secrets, missing error paths, and incomplete integrations.
   - Follow the main workflows end to end through the code.
3. Run objective checks.
   - Install dependencies only when appropriate for the repo and environment.
   - Run the smallest relevant test, lint, typecheck, build, and smoke-test commands.
   - If an app can run locally, start it and verify the primary user flows through a browser or HTTP client.
   - Capture failures exactly enough that the next contributor can reproduce them.
4. Compare claims to reality.
   - Mark each major claimed capability as `Complete`, `Partial`, `Missing`, or `Blocked`.
   - Base status on code and runtime evidence, not intent.
   - Separate product gaps from code quality gaps and operational gaps.
5. Produce the report.
   - Lead with an overall completion assessment.
   - Include evidence for every major conclusion.
   - Prioritize next steps by what blocks the project from honestly shipping or being useful.

## Report Format

````markdown
## Verification Report

Overall status: Complete | Mostly complete | Partial | Not yet functional | Blocked

Confidence: High | Medium | Low

### What the project claims

- Claim 1
- Claim 2

### What was verified

- Check or workflow: result
- Check or workflow: result

### Capability status

| Capability | Status | Evidence | Gap |
| --- | --- | --- | --- |
| Capability name | Complete/Partial/Missing/Blocked | File, command, or observed behavior | Remaining work |

### Findings

1. Finding title
   - Evidence:
   - Impact:
   - Recommended fix:

### Next steps

1. Highest priority step
2. Next priority step
3. Next priority step

### Verification commands

```bash
commands that were run
```

### Limits of this verification

- Anything that could not be run, accessed, or proven.
````

## Guardrails

- Do not stop at ADRs, PRDs, or Markdown. Use them only to define claims.
- Do not mark a capability complete unless code or runtime behavior supports it.
- Do not hide skipped checks, missing dependencies, auth blockers, or environment gaps.
- Do not create issues or PRs unless the user explicitly asks.
- If the repo is too large to inspect exhaustively, state the sampling strategy and residual risk.
- Prefer concrete file paths, command outputs, HTTP responses, screenshots, or browser observations over general impressions.
