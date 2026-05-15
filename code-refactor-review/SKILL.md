---
name: code-refactor-review
description: Review code changes for refactor quality through function scope, naming, and file organization. Use when the user wants to know whether a change fits the existing codebase, introduces shallow abstractions, uses misleading names, or places code in the wrong module or directory.
metadata:
  short-description: Review refactor fit and organization
---

# Code Refactor Review

Use this skill to review whether code changes feel native to the codebase.

This is a review skill. Lead with concrete findings, not praise or a summary.

## Workflow

1. Gather context.
   - Inspect the diff, nearby files, exports, immediate callers, and sibling modules.
   - Identify the local naming, file, directory, and module patterns before judging the change.
   - Prefer repo conventions over generic style preferences.
2. Review through three lenses.
   - Function scope and module boundaries.
   - Naming.
   - File and directory organization.
3. Report only actionable findings.
   - Prioritize issues that would make future changes harder, hide bugs, or confuse callers.
   - Include file and line references when possible.
   - Suggest the smallest correction that restores fit with the codebase.

## Lens 1: Function Scope And Boundaries

Look for:

- Functions or modules mixing unrelated responsibilities.
- Shallow wrappers that only rename or forward another call without adding leverage.
- Abstractions at the wrong level: too broad, too narrow, or leaking implementation details.
- Logic extracted only to make a test easy while the real behavior remains scattered across callers.
- Modules that require callers to know too many invariants, ordering rules, or config details.

Useful question: if this function or module were deleted, would complexity disappear, concentrate in a better place, or spread across callers?

## Lens 2: Naming

Look for:

- Function names that do not describe the actual behavior.
- Names that expose incidental implementation details.
- File names that do not match sibling naming patterns.
- Generic names such as `utils`, `helpers`, `manager`, or `service` when the code has a clearer domain name available.
- Re-exports that make ownership or import paths ambiguous.

Prefer names that describe the domain behavior and match existing project vocabulary.

## Lens 3: File And Directory Organization

Look for:

- A directory created for a single file with no clear reason to grow.
- Code placed by technical type instead of the surrounding repo's domain or feature pattern.
- Files that group unrelated concerns because they happened to change together.
- Shared utilities moved too far from their only caller.
- New folders that bypass existing package, route, or module conventions.

Good placement should make the next related change obvious.

## Output Format

```markdown
## Findings

1. Severity - Title
   - File:
   - Lens:
   - Problem:
   - Why it matters:
   - Suggested change:

## Open Questions

- Question, if any.

## What Fits Well

- Optional, brief notes for decisions that should stay.
```

## Guardrails

- Do not propose broad refactors unrelated to the diff.
- Do not rename for taste; tie naming feedback to behavior, caller clarity, or repo convention.
- Do not flag a pattern as wrong until checking sibling code.
- Do not treat a single-file directory as automatically wrong; it is a prompt to ask whether the directory earns its keep.
- If there are no actionable issues, say that directly and note any residual risk.
