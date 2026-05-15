---
name: to-adr
description: Turn an architecture discussion, design conversation, rejected proposal, or selected refactoring direction into a complete Architecture Decision Record. Use after a conversation has clarified context, decision, alternatives, tradeoffs, consequences, or an architecture choice that future contributors should not re-litigate.
metadata:
  short-description: Turn architecture discussion into ADR
---

# To ADR

Use this skill after an architecture or design conversation has produced a decision worth preserving.

The goal is to write a durable ADR from the discussion, not to restart architecture exploration.

## Workflow

1. Gather decision context.
   - Read the current conversation first.
   - Identify the decision, why it came up, alternatives discussed, constraints, tradeoffs, and consequences.
   - If the discussion came from architecture work, preserve the project's domain language and architecture vocabulary: module, interface, implementation, depth, seam, adapter, leverage, and locality.
2. Inspect existing project conventions.
   - Look for `docs/adr/`, `adr/`, `decisions/`, `CONTEXT.md`, `DESIGN.md`, and existing ADR files.
   - Match the existing ADR location, numbering, title style, status vocabulary, and format.
   - If no convention exists, create `docs/adr/NNNN-title.md` starting at `0001`.
3. Check whether an ADR is justified.
   - Write an ADR for decisions that future contributors or agents need to understand.
   - Do not write an ADR for ephemeral priority calls, obvious implementation details, or undecided options.
   - If the conversation rejected a tempting architecture direction for a load-bearing reason, that can be an ADR.
4. Fill gaps only when necessary.
   - Ask one targeted question if the decision, status, or chosen option is unclear.
   - Do not ask for information that can be inferred from the conversation or existing ADRs.
5. Write the ADR.
   - Include enough context that a future agent understands why the decision was made.
   - Explain alternatives and rejected options without straw-manning them.
   - Make consequences concrete: what gets easier, what gets harder, and what follow-up work remains.
   - For architecture ADRs, describe how the decision changes locality, leverage, test surface, and future seams.
   - Keep implementation snippets out unless they encode the decision more clearly than prose.
6. Verify.
   - Confirm the ADR path and title.
   - Check for broken numbering, duplicate titles, unresolved placeholders, and stale contradictions with existing ADRs.
   - Report what was created or updated.

## Default ADR Format

Use this only when the project has no existing ADR format.

```markdown
# NNNN - Decision title

Status: Proposed | Accepted | Superseded

Date: YYYY-MM-DD

## Context

What situation, pressure, constraint, or recurring confusion led to this decision?

## Decision

What did we decide?

## Alternatives Considered

- Option: why it was not chosen.

## Consequences

- Positive consequence.
- Negative or tradeoff consequence.
- Follow-up work required.
```

## Guardrails

- Do not invent a decision. If the conversation only explored options, draft a proposed ADR and mark the unresolved question clearly.
- Do not re-litigate existing ADRs unless the conversation explicitly decided to supersede or reopen one.
- Do not create multiple ADRs unless the conversation contains multiple independent decisions.
- Do not create issues or PRs unless the user explicitly asks.
- Preserve precise terms from `CONTEXT.md` and existing ADRs.
- Prefer one complete ADR over a generic summary document.
