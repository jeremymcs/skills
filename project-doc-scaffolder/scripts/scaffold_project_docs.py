#!/usr/bin/env python3
"""Scaffold project documentation from bundled templates."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
TEMPLATE_DIR = SKILL_DIR / "assets" / "templates"

TEMPLATE_PATHS = (
    "AGENTS.md",
    "CONTRIBUTING.md",
    "DESIGN.md",
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/feature_request.md",
    ".github/pull_request_template.md",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create agent-ready project Markdown files from templates."
    )
    parser.add_argument(
        "target",
        nargs="?",
        default=".",
        help="Project directory to scaffold. Defaults to the current directory.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files. Use only after explicit approval.",
    )
    return parser.parse_args()


def copy_template(relative_path: str, target_dir: Path, force: bool) -> str:
    source = TEMPLATE_DIR / relative_path
    destination = target_dir / relative_path
    existed = destination.exists()

    if existed and not force:
        return f"skipped existing {relative_path}"

    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
    return f"overwrote {relative_path}" if existed else f"created {relative_path}"


def main() -> int:
    args = parse_args()
    target_dir = Path(args.target).expanduser().resolve()

    if not target_dir.exists():
        raise SystemExit(f"target does not exist: {target_dir}")
    if not target_dir.is_dir():
        raise SystemExit(f"target is not a directory: {target_dir}")

    for relative_path in TEMPLATE_PATHS:
        print(copy_template(relative_path, target_dir, args.force))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
