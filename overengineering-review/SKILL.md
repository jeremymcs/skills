---
name: overengineering-review
description: Review code for overengineering and avoidable complexity, then write an HTML findings report. Use when the user asks whether code is too abstract, too layered, too generic, prematurely extensible, hard to follow, or more complex than the problem requires.
---

# Overengineering Review

Use this skill to inspect code for avoidable complexity and produce a self-contained HTML report.

## Workflow

1. Define scope.
   - Identify the files, diff, branch, feature, or subsystem under review.
   - Inspect nearby callers, tests, docs, and sibling patterns before judging complexity.
   - Prefer evidence from the codebase over generic simplicity advice.
2. Map the actual problem being solved.
   - State the concrete behavior or user need the code supports.
   - Identify current scale: number of callers, variants, data shapes, plugins, integrations, and lifecycle states.
   - Separate real requirements from speculative future flexibility.
3. Look for overengineering signals.
   - Extra layers that only forward calls or rename concepts.
   - Generic abstractions with one real implementation.
   - Factories, registries, adapters, managers, or strategy objects before there is meaningful variation.
   - Configuration that duplicates code paths or exposes internals to callers.
   - Types, schemas, or inheritance hierarchies that are broader than the supported behavior.
   - File or package splits that make a simple change require cross-module navigation.
   - Tests that mainly protect the abstraction instead of user-visible behavior.
4. Check the blast radius before recommending simplification.
   - Trace callers, public APIs, tests, generated artifacts, migrations, and integration points.
   - Mark each recommendation as `Low`, `Medium`, or `High` risk based on likely breakage.
   - Avoid deleting abstraction that already protects real variability, external contracts, or hard-won operational boundaries.
5. Produce findings.
   - Lead with actionable findings ordered by severity.
   - Include specific file paths and line references when available.
   - Explain why the code is more complex than the current need, not just that it feels complex.
   - Recommend the smallest simplification that preserves behavior.
6. Write the HTML report directly.
   - Create one self-contained `.html` file with inline CSS and no external assets.
   - Include findings, file evidence, impact, recommendation, risk, positive signals, open questions, and verification.
   - Escape code snippets and copied source text so review content renders as text, not markup.
   - Open or inspect the HTML file when possible before claiming the artifact is ready.

## HTML Structure

Use this structure unless the task needs a different layout:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Overengineering Review</title>
  <style>
    /* Inline, readable report styles. */
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Overengineering Review</h1>
      <p><strong>Scope:</strong> Files, diff, feature, or subsystem reviewed.</p>
      <p>Short conclusion and highest-priority theme.</p>
    </header>
    <section>
      <h2>Findings</h2>
      <article>
        <h3>High - Abstraction has one implementation and hides the real behavior</h3>
        <p><strong>Category:</strong> Premature abstraction</p>
        <p><strong>Evidence:</strong> Path and line evidence, caller count, tests, or runtime proof.</p>
        <p><strong>Impact:</strong> Why this makes future work harder or riskier.</p>
        <p><strong>Recommendation:</strong> Smallest safe simplification.</p>
        <p><strong>Risk:</strong> Medium</p>
      </article>
    </section>
    <section>
      <h2>Positive Signals</h2>
    </section>
    <section>
      <h2>Open Questions</h2>
    </section>
    <section>
      <h2>Verification</h2>
    </section>
  </main>
</body>
</html>
```

## Output Standards

- The final deliverable must be an `.html` file, not a prose-only answer.
- The report must be useful to a maintainer deciding what to simplify next.
- Do not recommend broad rewrites when a smaller deletion, inline move, rename, or module merge solves the problem.
- Do not treat complexity as automatically bad. Name the requirement that would justify keeping it.
- Do not credit any AI in the report.
