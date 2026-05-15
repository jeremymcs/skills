# Skills

Reusable agent skills for project setup and development workflows.

## Available Skills

| Skill | Purpose | Use when |
| --- | --- | --- |
| `$create-issue` | Creates a single post-mortem issue and pull request from completed session work. | Work is already done and needs to be captured in the repo issue tracker, committed, pushed, and opened as a PR. |
| `$falsify-project` | Attempts to disprove project claims before validating the repo, app, or site. | You want an adversarial audit that treats docs and claims as false until code/runtime evidence survives contradiction checks. |
| `$new-feature` | Researches the current project and recommends prioritized new or next features. | You want evidence-backed feature ideas from the current repo, docs, issues, and recent work. |
| `$project-doc-scaffolder` | Scaffolds agent-ready project documentation for a new or existing repository. | A project needs `AGENTS.md`, contributor docs, design notes, issue templates, and a PR template. |
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

Run the scaffold script from this repository:

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

falsify-project/
├── SKILL.md
└── agents/openai.yaml

new-feature/
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
