---
name: test-writer
description: Use when implementing, changing, refactoring, reviewing, or accepting any code, config, build, migration, script, UI, API, dependency, or test change that needs strict executable proof instead of grep, source-text checks, snapshots-only assertions, import-only checks, or manual verification.
---

# Test Writer

Write strict, executable proof for every non-documentation change. A change is not done until a hard test fails for the broken behavior and passes for the fixed behavior.

## Core Rule

Every code, config, dependency, migration, build, script, UI, API, and test change must have a hard executable test or verification that proves the changed effect through the system's public API, UI, command, data store, generated output, or observable side effect.

Use search tools to find context, never as proof. A test that reads source files and checks for text such as function names, strings, branches, imports, or config keys is not a hard test.

## Strict Gate

Before claiming the work is complete, all boxes must be true:

- Every non-documentation change has a matching hard test or executable verification.
- Each new or changed behavior test was observed failing before implementation.
- Each test failed for the intended reason, not because of a typo, missing import, broken fixture, or bad setup.
- Each hard test passes after implementation.
- Each hard test was proven sensitive by a sabotage check: temporarily break the implementation, fixture, route, config, or assertion target, confirm the test fails, then restore it.
- The final report names the test file, RED command/result, GREEN command/result, and sabotage command/result.

If any box is missing, the work is not verified. Do not describe it as done.

## Workflow

1. Inventory the change.
   - List every changed non-documentation file and the behavior, command, config effect, generated output, or contract it can affect.
   - For each item, choose the smallest hard test that would fail if that item were wrong.
2. Write the failing test first.
   - Use the repo's existing test framework and nearest test style.
   - Exercise real code. Mock only at external boundaries such as network, time, payment providers, or filesystem when unavoidable.
   - Run the smallest relevant test command and confirm it fails for the expected reason.
3. Implement the change.
   - Write only enough code to make the new test pass.
   - Keep existing tests green.
4. Prove the test is hard to fool.
   - The test must fail if the new branch is removed, the predicate is inverted, validation is disabled, persistence is skipped, or the handler is not wired.
   - Make a temporary local sabotage such as reverting the new condition, returning the old value, disabling the route, undoing the config, or breaking the generated output. Run the test to watch it fail, then restore the implementation.
5. Report the evidence.
   - Name every changed non-documentation file and its matching hard test.
   - Include the RED failure command/result.
   - Include the GREEN passing command/result.
   - Include the sabotage failure command/result.

## What Counts

| Change type | Good test |
| --- | --- |
| Bug fix | Regression test that reproduces the bug and fails on the old behavior |
| Feature | Acceptance or unit test that proves the new observable outcome |
| Refactor | Existing tests cover unchanged behavior, or add characterization before refactoring |
| UI change | Component, browser, or integration test that interacts with the UI and asserts visible behavior |
| API change | Request/response, validation, persistence, auth, or error-path test through the API boundary |
| Config/build change | Command or parser test proving the config affects runtime/build behavior |
| Dependency change | Test or command proving the dependent behavior still works with the new dependency |
| Test-only change | Run the test, and if it encodes new behavior, sabotage the target so the test fails |

## Exceptions

Exceptions are rare and must be explicit.

Allowed no-test exceptions:

- Documentation-only, comments-only, or formatting-only changes that cannot affect runtime, generated output, configuration, packaging, or behavior.
- A blocked environment where dependencies, credentials, services, or platform access make execution impossible.

Blocked execution is not success. Report it as `Blocked`, include the exact command attempted and failure, and do not claim the change is verified.

## Forbidden Proof

Do not count these as the required test:

- `grep`, `rg`, `awk`, or source-text assertions that only prove code exists.
- Snapshot-only tests with no behavioral assertion.
- Import-only tests that only prove a module loads.
- Tests that assert mocks were called while the real behavior is untested.
- Typecheck, lint, build, or coverage numbers as the only proof.
- Manual smoke checks as the only proof.

These checks can supplement the real test, but they cannot replace it.

## Rationalizations

| Excuse | Reality |
| --- | --- |
| "This is just config." | Run a parser, build, CLI, integration, or generated-output check proving the config effect. |
| "The test passed on the first run." | It did not prove the change. Fix the test until RED proves the old behavior fails. |
| "Existing tests cover it." | For a behavior change, show the specific existing test failing before the fix or add one that does. |
| "Mutation is too much." | A test that survives broken code is not hard. Sabotage it or mark verification blocked. |
| "I checked with grep." | Grep proves text exists. It does not prove behavior. |
| "Manual testing was faster." | Manual checks can supplement proof, never replace the hard test. |

## Example

<Good>

```typescript
test("rejects duplicate slugs after normalization", async () => {
  const projects = createProjectStore();

  await projects.create({ slug: "Alpha" });

  await expect(projects.create({ slug: " alpha " })).rejects.toThrow(
    "slug already exists",
  );
});
```

This fails if trimming, case normalization, duplicate detection, or error propagation is missing.

</Good>

<Bad>

```typescript
test("normalizes slugs", () => {
  const source = readFileSync("src/project-store.ts", "utf8");
  expect(source).toContain("trim().toLowerCase()");
});
```

This only proves text exists. The app can still accept duplicate slugs.

</Bad>

## Red Flags

- The new test passed on the first run.
- The test would still pass if the implementation returned the old value.
- The assertion checks implementation text instead of observable behavior.
- The test only checks that a helper was called.
- The test name says "works" but not what behavior works.
- The change touches any non-documentation file and the final report has no RED and sabotage failure.
- The final answer says "verified" while any hard test, RED run, GREEN run, or sabotage run is missing.

Any red flag means the work is not verified. Tighten the test until it catches broken behavior.
