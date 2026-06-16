import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([
  ".git",
  ".github",
  "bin",
  "lib",
  "node_modules",
  "test"
]);

export function getPackageRoot() {
  return packageRoot;
}

export async function discoverSkills(root = packageRoot) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || ignoredDirectories.has(entry.name)) {
      continue;
    }

    const skillDirectory = path.join(root, entry.name);
    const skillFile = path.join(skillDirectory, "SKILL.md");

    if (!(await fileExists(skillFile))) {
      continue;
    }

    const source = await fs.readFile(skillFile, "utf8");
    const frontmatter = parseFrontmatter(source);
    const name = frontmatter.name || entry.name;

    skills.push({
      name,
      slug: entry.name,
      description: frontmatter.description || "",
      directory: skillDirectory,
      skillFile,
      source
    });
  }

  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

export function parseFrontmatter(source) {
  if (!source.startsWith("---\n")) {
    return {};
  }

  const endIndex = source.indexOf("\n---", 4);

  if (endIndex === -1) {
    return {};
  }

  const frontmatter = {};
  const body = source.slice(4, endIndex).split("\n");

  for (const line of body) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    frontmatter[key] = unwrapScalar(rawValue);
  }

  return frontmatter;
}

export function stripFrontmatter(source) {
  if (!source.startsWith("---\n")) {
    return source.trim();
  }

  const endIndex = source.indexOf("\n---", 4);

  if (endIndex === -1) {
    return source.trim();
  }

  return source.slice(endIndex + 4).trim();
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function unwrapScalar(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}
