---
name: new-feature
description: Research the current project and recommend new or next features based on repository context, product surface, docs, issues, tests, TODOs, recent work, and user goals. Use when the user asks what to build next, wants feature recommendations, or needs a prioritized roadmap from the current codebase.
metadata:
  short-description: Recommend next project features
---

# New Feature

Use this skill when the user wants recommended new or next features for the current project.

The output should be actionable recommendations, not a broad product essay.

## Workflow

1. Establish the project shape.
   - Read `README`, `AGENTS.md`, `CONTRIBUTING`, `DESIGN`, roadmap docs, ADRs, and package manifests if present.
   - Inspect source layout, app routes, tests, examples, scripts, and recent commits.
   - Review open issues or PRs when the project issue tracker is available.
2. Identify signals.
   - Existing product capabilities and obvious gaps.
   - Repeated TODOs, FIXME comments, failing/skipped tests, missing docs, missing workflows, or incomplete UX paths.
   - Recent work that suggests a natural next step.
   - Operational needs such as setup, observability, testing, security, accessibility, or release automation.
3. Generate candidate features.
   - Prefer features that are small enough to start soon and meaningful enough to demo.
   - Avoid speculative features that are not supported by project evidence.
   - Do not recommend dependency churn as a feature unless it unlocks user-visible value.
4. Rank recommendations.
   - Default ranking factors: user value, evidence strength, effort, risk, and fit with the project direction.
   - Mark uncertainty explicitly when the repo lacks product context.
5. Present the result.
   - Lead with the top 3-5 recommendations.
   - For each recommendation include:
     - Feature name
     - Why now
     - Evidence from the project
     - Suggested first slice
     - Effort and risk
   - End with a short "Not recommended yet" section when there are tempting but premature ideas.

## Output Format

```markdown
## Recommended Next Features

### 1. Feature name

Why now:

Evidence:

Suggested first slice:

Effort/risk:

### 2. Feature name

...

## Not Recommended Yet

- Idea: reason to defer.
```

## Guardrails

- Cite concrete repo signals, file paths, issue references, or observed behavior.
- If using external research, say what was checked and link sources.
- Do not invent users, roadmap commitments, metrics, or business priorities.
- Ask one targeted question only if the project has too little context to rank recommendations responsibly.
- Do not create issues or PRs unless the user explicitly asks.
