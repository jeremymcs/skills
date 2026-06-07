import fs from "node:fs/promises";
import path from "node:path";
import { discoverSkills, stripFrontmatter } from "./registry.js";
import { resolveModelProfile, resolveTarget } from "./targets.js";

export async function installSkills(options) {
  const skills = await selectSkills(options);
  const target = resolveTarget(options.target);
  const model = resolveModelProfile(options.model);

  if (!target) {
    throw new Error(`Unknown install target: ${options.target}`);
  }

  if (!model) {
    throw new Error(`Unknown model profile: ${options.model}`);
  }

  const destination = path.resolve(options.destination || target.defaultDirectory(options));
  const operations = [];

  for (const skill of skills) {
    operations.push(await installSkill({ skill, target, model, destination, options }));
  }

  if (!options.dryRun) {
    await writeManifest({ destination, target, model, skills });
  }

  return {
    destination,
    model,
    operations,
    skills,
    target
  };
}

export async function selectSkills(options) {
  const skills = await discoverSkills(options.packageRoot);
  const requestedSkills = options.skills ?? [];

  if (options.all || requestedSkills.length === 0) {
    return skills;
  }

  const requested = new Set(requestedSkills);
  const selected = skills.filter((skill) => {
    return requested.has(skill.slug) || requested.has(skill.name);
  });
  const selectedNames = new Set(selected.flatMap((skill) => [skill.slug, skill.name]));
  const missing = requestedSkills.filter((skillName) => !selectedNames.has(skillName));

  if (missing.length > 0) {
    throw new Error(`Unknown skill${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`);
  }

  return selected;
}

async function installSkill({ skill, target, model, destination, options }) {
  if (target.kind === "native") {
    return installNativeSkill({ skill, destination, options });
  }

  return installRuleSkill({ skill, target, model, destination, options });
}

async function installNativeSkill({ skill, destination, options }) {
  const targetDirectory = path.join(destination, skill.slug);
  const status = await copySkillDirectory(skill.directory, targetDirectory, options);

  return {
    kind: "native",
    skill: skill.slug,
    status,
    path: targetDirectory
  };
}

async function installRuleSkill({ skill, target, model, destination, options }) {
  const skillAssetsDirectory = path.join(destination, "_skills", skill.slug);
  const rulePath = path.join(destination, `${skill.slug}${target.extension}`);
  const status = await copySkillDirectory(skill.directory, skillAssetsDirectory, options);
  const ruleStatus = await writeRuleFile({ skill, target, model, rulePath, options });

  return {
    kind: "rule",
    ruleStatus,
    skill: skill.slug,
    status,
    path: rulePath,
    assetsPath: skillAssetsDirectory
  };
}

async function copySkillDirectory(source, destination, options) {
  const exists = await pathExists(destination);

  if (exists && !options.force) {
    return "skipped";
  }

  if (options.dryRun) {
    return exists ? "would-overwrite" : "would-install";
  }

  if (exists) {
    await fs.rm(destination, { recursive: true, force: true });
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.cp(source, destination, { recursive: true });
  return exists ? "updated" : "installed";
}

async function writeRuleFile({ skill, target, model, rulePath, options }) {
  const exists = await pathExists(rulePath);

  if (exists && !options.force) {
    return "skipped";
  }

  if (options.dryRun) {
    return exists ? "would-overwrite" : "would-install";
  }

  await fs.mkdir(path.dirname(rulePath), { recursive: true });
  await fs.writeFile(rulePath, renderRuleFile({ skill, target, model }), "utf8");
  return exists ? "updated" : "installed";
}

export function renderRuleFile({ skill, target, model }) {
  const description = escapeFrontmatter(skill.description || `Use $${skill.slug}.`);
  const body = stripFrontmatter(skill.source);

  if (target.extension === ".mdc") {
    return `---
description: "${description}"
alwaysApply: false
---

# $${skill.slug}

Model profile: ${model.label}. ${model.note}

Full source and bundled assets are installed beside this rule in \`_skills/${skill.slug}/\`.

${body}
`;
  }

  return `# $${skill.slug}

Target: ${target.label}
Model profile: ${model.label}. ${model.note}

Full source and bundled assets are installed beside this rule in \`_skills/${skill.slug}/\`.

${body}
`;
}

async function writeManifest({ destination, target, model, skills }) {
  await fs.mkdir(destination, { recursive: true });

  const manifest = {
    installedAt: new Date().toISOString(),
    installer: "@jeremymcs/skills",
    target: target.name,
    targetLabel: target.label,
    model: model.name,
    skills: skills.map((skill) => skill.slug).sort()
  };

  await fs.writeFile(
    path.join(destination, ".skills-installer.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function escapeFrontmatter(value) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
