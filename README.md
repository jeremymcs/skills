# Skills

Reusable agent skills for project setup and development workflows.

## Available Skills

### project-doc-scaffolder

Scaffolds agent-ready project documentation for a new or existing repository.

It creates:

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
project-doc-scaffolder/
├── SKILL.md
├── agents/openai.yaml
├── assets/templates/
└── scripts/scaffold_project_docs.py
```
