# Skills

Reusable agent skills for project setup and development workflows.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations and pull request verification.

## NPX Installer

This repository ships a dependency-free Node CLI for installing every skill into agent CLIs and IDE rule folders.

Run the guided installer:

```bash
npx @jeremymcs/skills
```

Install every skill for Codex:

```bash
npx @jeremymcs/skills install --target codex --all
```

Install selected skills into project-local agent skills:

```bash
npx @jeremymcs/skills install --target agents --skill dumb-it-down,zero-techdebt
```

Export a skill as Cursor rules with a model profile hint:

```bash
npx @jeremymcs/skills install --target cursor --skill github-repo-hygiene --model gpt-5
```

### Installer Targets

| Target | Output |
| --- | --- |
| `codex` | Native skill folders in `~/.codex/skills` or `$CODEX_HOME/skills` |
| `claude` | Native skill folders in `~/.claude/skills` |
| `agents` | Native project skill folders in `./.agents/skills` |
| `cli` | Portable native skill folders in `./.agent-skills` |
| `cursor` | Cursor rule files in `./.cursor/rules/skills` plus bundled skill assets |
| `windsurf` | Windsurf rule files in `./.windsurf/rules/skills` plus bundled skill assets |
| `continue` | Continue rule files in `./.continue/rules/skills` plus bundled skill assets |
| `all` | Installs to every target above |

The native targets copy each skill directory exactly, including `SKILL.md`, metadata, scripts, references, and templates. IDE rule targets create one rule file per skill and keep the full skill source beside the rules in `_skills/<skill>/`.

### Installer Options

```bash
npx @jeremymcs/skills list
npx @jeremymcs/skills targets
npx @jeremymcs/skills install --target codex,cursor --all --force
npx @jeremymcs/skills install --target cli --dest /tmp/agent-skills --dry-run
```

Supported model profiles are `auto`, `gpt-5`, `gpt-4.1`, `claude-sonnet`, `claude-opus`, `gemini-pro`, and `local`. Model profiles are hints for hosts that surface model-specific instructions; native skill installs preserve the original skill content.

## Available Skills

| Skill | Purpose | Use when |
| --- | --- | --- |
| `$create-issue` | Creates a single post-mortem issue and pull request from completed session work. | Work is already done and needs to be captured in the repo issue tracker, committed, pushed, and opened as a PR. |
| `$dumb-it-down` | Turns confusing ideas into plain-language explanations with simple references. | You want dense writing, jargon, code, contracts, technical topics, or abstract ideas broken down so they are extremely easy to understand. |
| `$falsify-project` | Attempts to disprove project claims before validating the repo, app, or site. | You want an adversarial audit that treats docs and claims as false until code/runtime evidence survives contradiction checks. |
| `$from-issue` | Researches an existing issue, asks only codebase-unanswerable questions, implements a patch, verifies it, and opens a PR. | You want Codex to take a GitHub issue, tracker ticket, bug report, feature issue, or local issue artifact from investigation through pull request. |
| `$github-repo-hygiene` | Audits GitHub repository, package, and dependency hygiene. | You want evidence-backed recommendations for package manifests, dependencies, workspaces, docs, CI, security, contribution flow, branch settings, releases, and repo cleanliness. |
| `$new-feature` | Researches the current project and recommends prioritized new or next features. | You want evidence-backed feature ideas from the current repo, docs, issues, and recent work. |
| `$project-doc-scaffolder` | Scaffolds agent-ready project documentation for a new or existing repository. | A project needs `AGENTS.md`, contributor docs, design notes, issue templates, and a PR template. |
| `$system-diagrammer` | Walks code slowly to diagram and verify system, data, workflow, and integration connections. | You need a careful code-backed map of how systems connect, including findings, evidence, recommended fixes, breaks, edge cases, and disconnects. |
| `$to-adr` | Turns an architecture discussion or design decision into a complete ADR. | A conversation has clarified a decision, rejected option, tradeoff, or architecture direction that future contributors should not re-litigate. |
| `$verify-project` | Verifies whether a project, repo, or app actually does what it claims. | You need a code-backed completion report with evidence, gaps, and next steps. |
| `$zero-techdebt` | Reviews code changes for function scope, naming, and file organization fit. | You want to know whether a refactor or code change fits the existing codebase without adding shallow abstractions or confusing structure. |

## Project Doc Scaffolder

`$project-doc-scaffolder` creates:

- `AGENTS.md`
- `CONTRIBUTING.md`
- `DESIGN.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/pull_request_template.md`

## Usage

Run the project doc scaffold script from this repository:

```bash
python3 project-doc-scaffolder/scripts/scaffold_project_docs.py /path/to/project
```

Existing files are skipped by default. To overwrite existing files after reviewing the impact:

```bash
python3 project-doc-scaffolder/scripts/scaffold_project_docs.py /path/to/project --force
```

## Skill Layout

Each skill lives in its own folder and includes a required `SKILL.md`. Supporting templates, scripts, and metadata live under that skill folder.

Current layout:

```text
create-issue/
├── SKILL.md
└── agents/openai.yaml

dumb-it-down/
├── SKILL.md
├── agents/openai.yaml
└── references/simplification-patterns.md

falsify-project/
├── SKILL.md
└── agents/openai.yaml

github-repo-hygiene/
├── SKILL.md
├── agents/openai.yaml
└── scripts/audit_package_hygiene.mjs

from-issue/
├── SKILL.md
└── agents/openai.yaml

new-feature/
├── SKILL.md
└── agents/openai.yaml

system-diagrammer/
├── SKILL.md
└── agents/openai.yaml

to-adr/
├── SKILL.md
└── agents/openai.yaml

verify-project/
├── SKILL.md
└── agents/openai.yaml

zero-techdebt/
├── SKILL.md
└── agents/openai.yaml

project-doc-scaffolder/
├── SKILL.md
├── agents/openai.yaml
├── assets/templates/
└── scripts/scaffold_project_docs.py
```
