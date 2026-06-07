---
name: github-repo-hygiene
description: Audit and improve GitHub repository hygiene using evidence from local files, package manifests, dependency metadata, and GitHub settings. Use when the user asks for best practices, repo cleanup, repository hygiene, project health, package.json or dependency hygiene, monorepo health, npm/package publishing readiness, GitHub setup, maintainer readiness, contribution workflow, security posture, CI checks, issue or PR templates, branch protection, Dependabot, CodeQL, licensing, release readiness, or open-source/private repository governance.
metadata:
  short-description: Audit GitHub repo hygiene
---

# GitHub Repo Hygiene

Use this skill when the user wants a repository to be easier to maintain, safer to collaborate on, clearer for contributors, and less likely to drift in package or dependency configuration.

Default stance: repo hygiene is contextual. Verify the repo's purpose before recommending public open-source defaults, enterprise controls, or heavy process.

## Bundled Tools

- `scripts/audit_package_hygiene.mjs`: Audit Node package manifests, workspace declarations, lockfiles, dependency sections, local package links, entry points, lifecycle scripts, and simple import/dependency mismatches. Run it before manual package/dependency recommendations when a repo has `package.json` files.

## Success Criteria

- The audit covers local repository files and GitHub-hosted settings when accessible.
- Package and dependency findings are backed by manifest, lockfile, or import-scan evidence.
- Findings are evidence-backed and prioritized by risk, not preference.
- Recommendations are concrete, small, and appropriate for the repo's size, audience, and activity.
- Policy-sensitive changes are proposed clearly before editing.

## Workflow

1. Establish repo context.
   - Identify whether the repo is private, public, package/library, app/service, template, docs-only, archived, or experimental.
   - Read `README`, package manifests, project docs, existing `.github/` files, CI config, release config, security files, and recent git history.
   - If GitHub access is available, inspect repo metadata, default branch, open PRs/issues, branch protection, actions, security alerts, releases, and topics.
2. Inventory hygiene surfaces.
   - Documentation: `README`, setup, usage, architecture notes, troubleshooting, changelog, license, support, security policy, code of conduct when appropriate.
   - Contribution flow: `CONTRIBUTING`, issue templates, PR template, labels, discussions, ownership, review expectations.
   - Automation: CI, test/lint/typecheck/build jobs, status checks, release automation, stale workflows, scheduled maintenance.
   - Security: secret scanning, Dependabot, CodeQL or language-appropriate scanning, dependency review, least-privilege workflow permissions, pinned actions, secret handling docs.
   - Package and dependency hygiene: `package.json`, workspace declarations, lockfiles, package manager metadata, dependency sections, peer dependency patterns, local package links, lifecycle scripts, package entry points, publish metadata, and stale or missing dependency signals.
   - Governance: branch protection, required reviews, required checks, CODEOWNERS, merge strategy, release/versioning policy, archival signals.
   - Repository cleanliness: ignored files, generated artifacts, dead config, duplicate docs, broken links, misleading badges, stale TODOs, missing examples, unclear scripts.
3. Run package hygiene automation when applicable.
   - If the repo contains `package.json`, run:

     ```bash
     node github-repo-hygiene/scripts/audit_package_hygiene.mjs <repo-path>
     ```

   - Use `--json` when another tool or report needs structured findings.
   - Use `--strict` only when the user wants warnings to fail the check.
   - Treat import-scan findings as heuristics. Confirm them from source before editing dependencies.
4. Classify findings.
   - Use `Must fix` for broken setup, unsafe defaults, missing critical checks, exposed secrets, misleading docs, or blocked collaboration.
   - Use `Should fix` for maintainability gaps that will create recurring friction.
   - Use `Nice to have` for polish, optional community files, or scale-dependent process.
   - Mark anything unverified instead of assuming.
5. Recommend fixes.
   - Tie every recommendation to evidence and impact.
   - Prefer minimal repo-native changes over generic templates.
   - Avoid adding process that the repo cannot realistically maintain.
   - For GitHub settings that cannot be changed from files, provide exact setting names and suggested values.
6. Edit only when asked or clearly in scope.
   - Safe file edits include templates, docs, Dependabot config, workflow permission tightening, and obvious broken references.
   - Ask before changing license, branch policy, package ownership, security posture, release strategy, contributor governance, or dependency removals based only on heuristic import scans.
7. Verify.
   - Run available checks relevant to changed files.
   - Validate YAML and Markdown links when possible.
   - Re-run `audit_package_hygiene.mjs` after package, dependency, workspace, or lockfile edits.
   - If GitHub settings were inspected but not changed, state the access limits and manual steps.

## Output Format

````markdown
## Repo Hygiene Report

Scope: local files only | local files + GitHub settings
Repo type:
Confidence: High | Medium | Low

### Findings

| Priority | Finding | Evidence | Recommendation |
| --- | --- | --- | --- |
| Must fix/Should fix/Nice to have | What is wrong or missing | File, command, GitHub setting, or observation | Specific fix |

### Recommended Changes

1. Highest-impact change
   - Why:
   - Files/settings:
   - Verification:

### Changes Made

- File or setting changed, if any.

### Verification

```bash
commands run
```

### Limits

- Anything not inspected, inaccessible, or intentionally deferred.
````

## Guardrails

- Do not recommend generic open-source files for every repo. Match the repo's audience and lifecycle.
- Do not silently change licenses, branch protections, repository visibility, release policy, or governance rules.
- Do not treat badges, templates, or workflows as healthy unless they point to working commands and current project reality.
- Do not remove dependencies from import-scan evidence alone; confirm dynamic imports, CLIs, config files, generated code, and peer dependency requirements first.
- Do not hide unavailable GitHub access. Report whether the audit covered local files only or GitHub settings too.
- Do not credit any AI for generated docs, templates, or recommendations.
