---
name: dumb-it-down
description: Explain confusing ideas in extremely plain language, using simple references, analogies, examples, and step-by-step breakdowns. Use when the user asks to dumb something down, simplify, explain like they are new to the topic, make a problem easier to understand, turn dense writing into plain English, unpack jargon, or create beginner-friendly explanations for technical, business, academic, legal, medical, financial, or code-related material.
---

# Dumb It Down

## Overview

Turn hard material into an explanation that feels easy to hold in the user's head. Prefer concrete references, tiny examples, and plain words over cleverness.

## Workflow

1. Identify the thing being explained, the likely audience, and what the user is trying to do with the explanation.
2. Preserve the correct meaning before simplifying. If the topic is high-stakes, current, niche, or source-dependent, consult reliable references before explaining.
3. Split the idea into the fewest useful parts. Start with the core point, then add details in layers.
4. Replace jargon with ordinary words. If a technical term must remain, define it in one short sentence.
5. Use a concrete reference: an everyday analogy, a mini story, a small worked example, a diagram-like list, or a comparison to something familiar.
6. End with a quick recap or "what to remember" section when the topic has multiple moving pieces.

## Output Shape

Default to this structure unless the user asks for another format:

- **One-sentence version:** the simplest truthful summary.
- **Plain-English breakdown:** 3-7 short points in logical order.
- **Simple reference:** an analogy, example, or comparison that makes the idea easier to picture.
- **Why it matters:** the practical consequence or decision the user can make from it.
- **Tiny recap:** only if needed.

## Reference Use

Use references in two ways:

- **Source references:** use the user's source text, local files, docs, official pages, or other reliable material to keep the simplified explanation accurate.
- **Understanding references:** use everyday comparisons, small examples, or familiar mental models to make the idea stick.

Read [references/simplification-patterns.md](references/simplification-patterns.md) when choosing how to simplify a dense or unfamiliar topic.

## Style Rules

- Use short sentences.
- Prefer common words.
- Avoid condescension. "Simple" should feel respectful, not childish.
- Keep accuracy ahead of simplicity. Do not erase important exceptions when they change the meaning.
- State uncertainty clearly when the source material is incomplete.
- For high-stakes topics, include a brief note that the explanation is simplified and should not replace expert advice.

## Examples

User: "Dumb down vector databases."

Response pattern:

- One-sentence version: "A vector database helps computers find things by meaning, not just exact words."
- Plain-English breakdown: explain embeddings, similarity search, storage, and retrieval.
- Simple reference: compare it to finding songs with a similar vibe instead of the exact same title.

User: "Explain this contract clause like I'm new to contracts."

Response pattern: explain what the clause lets each party do, what risk it creates, and what question the user might ask a lawyer.
