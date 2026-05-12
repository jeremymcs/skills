---
name: project-doc-scaffolder
description: Scaffold agent-ready project documentation for a new or existing repository, including AGENTS.md, CONTRIBUTING.md, DESIGN.md, issue templates, and pull request templates. Use when a user wants to initialize project docs for coding agents, contributors, design decisions, GitHub issues, or PR review workflows.
metadata:
  short-description: Scaffold agent-ready project docs
---

# Project Doc Scaffolder

Use this skill when a user wants a project initialized with practical Markdown files for agents and collaborators.

## Workflow

1. Inspect the target project before writing.
   - Identify whether it is a git repository.
   - Check for existing `AGENTS.md`, `CONTRIBUTING.md`, `DESIGN.md`, `.github/ISSUE_TEMPLATE/*`, and `.github/pull_request_template.md`.
   - Preserve existing files unless the user explicitly asks to overwrite them.
2. Choose the output set.
   - Default: create all bundled templates.
   - If the user names specific files, create only those files.
   - If the project already has equivalent files, either leave them alone or make a focused patch that matches the existing style.
3. Run the scaffold script when a full default scaffold is appropriate:

```bash
python project-doc-scaffolder/scripts/scaffold_project_docs.py /path/to/project
```

Use `--force` only when the user has explicitly approved overwriting existing files.

4. Customize after scaffolding.
   - Replace placeholders such as project name and default branch if they can be inferred.
   - Keep instructions concise and project-specific.
   - Avoid vendor-specific agent names unless the user requests them.
5. Verify.
   - List created and skipped files.
   - If the target is a git repository, inspect `git status --short`.

## Template Files

Bundled templates live in `assets/templates/` and map to these project paths:

- `AGENTS.md`
- `CONTRIBUTING.md`
- `DESIGN.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/pull_request_template.md`

Prefer editing the generated files in the target project instead of modifying the bundled templates unless the user is improving this skill itself.
