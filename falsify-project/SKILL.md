---
name: falsify-project
description: Audit a project, repo, app, or site by assuming its documented claims are false until disproven through code inspection, tests, builds, runtime checks, and contradiction hunting. Use when the user wants an adversarial validation that attempts to disprove README, ADR, PRD, roadmap, or marketing claims before accepting the project as working.
metadata:
  short-description: Disprove project claims before validation
---

# Falsify Project

Use this skill when the user wants adversarial project verification.

Default stance: every README, ADR, PRD, roadmap, issue, and UI claim is untrusted until evidence proves it.

## Workflow

1. Extract claims.
   - Read docs, manifests, visible UI copy, examples, scripts, tests, issue templates, and recent commits.
   - Convert claims into falsifiable statements such as "users can sign in", "the app deploys", "the API persists records", or "tests cover the core workflow".
   - Do not treat architecture docs, product docs, or TODOs as evidence that something works.
2. Build a disproof plan.
   - For each important claim, identify the fastest way to prove it false.
   - Prefer direct contradiction: missing code paths, dead links, failing commands, placeholder implementations, mock-only flows, skipped tests, unhandled errors, missing persistence, broken setup, inaccessible UI, or non-working integrations.
   - Rank claims by user impact and centrality to the project.
3. Inspect the whole project at a practical level.
   - Map entrypoints, routes, commands, domain logic, data storage, API boundaries, auth, integrations, tests, config, deployment, and docs.
   - Use search for `TODO`, `FIXME`, `mock`, `stub`, `placeholder`, `skip`, `only`, `throw new Error`, disabled code, fake data, and missing environment variables.
   - Follow the primary workflows end to end through the implementation.
4. Run falsification checks.
   - Run setup, lint, typecheck, test, build, smoke, and start commands that the repo advertises or makes available.
   - If the app/site can run, exercise the claimed primary user flows through browser automation, HTTP requests, CLI commands, or direct runtime checks.
   - Record exact failures and the command, URL, screen, or code path that exposed them.
5. Decide claim status.
   - `Disproven`: evidence shows the claim is false.
   - `Unproven`: not enough evidence to validate the claim.
   - `Partially proven`: a narrow version works, but the full claim does not.
   - `Validated`: repeated code/runtime evidence supports the claim and no attempted disproof succeeded.
   - Validation is allowed only after serious contradiction checks fail.
6. Produce the report.
   - Lead with disproven and unproven claims.
   - Put validated claims after the failure analysis.
   - Give next steps that would convert disproven/unproven claims into validated behavior.

## Report Format

````markdown
## Falsification Report

Overall status: Broken | Mostly broken | Partially working | Mostly working | Validated

Confidence: High | Medium | Low

### Claims tested

| Claim | Status | Disproof attempt | Evidence |
| --- | --- | --- | --- |
| Claim text | Disproven/Unproven/Partially proven/Validated | What was tried to break it | File, command, response, or observation |

### Disproven claims

1. Claim
   - Disproof evidence:
   - Impact:
   - Required fix:

### Unproven or partial claims

1. Claim
   - Missing evidence:
   - Risk:
   - Required verification:

### Validated claims

- Claim: evidence that survived disproof attempts.

### Commands and checks run

```bash
commands that were run
```

### Next steps to make the project true

1. Highest priority fix or verification step
2. Next priority fix or verification step
3. Next priority fix or verification step

### Limits of this audit

- Anything that could not be accessed, run, inspected, or falsified.
````

## Guardrails

- Start from distrust. Do not summarize docs as if they are true.
- Disprove before validating. The report must show attempted contradiction for important claims.
- Do not validate by absence of evidence. If a claim cannot be tested, mark it `Unproven`.
- Do not hide environment blockers, skipped tests, missing secrets, or unavailable services.
- Do not create issues, PRs, or fixes unless the user explicitly asks.
- If the repo is too large to inspect exhaustively, state the sampling strategy and residual risk.
- Prefer concrete file paths, commands, screenshots, HTTP responses, test failures, and runtime observations over opinions.
