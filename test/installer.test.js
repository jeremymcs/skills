import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parseArgs, runCli } from "../lib/cli.js";
import { installSkills } from "../lib/installer.js";
import { discoverSkills } from "../lib/registry.js";

test("discovers packaged skills from SKILL.md metadata", async () => {
  const skills = await discoverSkills();
  const slugs = skills.map((skill) => skill.slug);

  assert.ok(slugs.includes("dumb-it-down"));
  assert.ok(slugs.includes("project-doc-scaffolder"));
  assert.equal(skills.every((skill) => skill.description.length > 0), true);
});

test("installs selected skills into a native target", async () => {
  await withTempDirectory(async (directory) => {
    const destination = path.join(directory, "skills");
    const result = await installSkills({
      all: false,
      cwd: directory,
      destination,
      env: {},
      force: false,
      model: "auto",
      skills: ["dumb-it-down"],
      target: "cli"
    });

    assert.equal(result.operations.length, 1);
    assert.equal(result.operations[0].status, "installed");
    assert.equal(await fileExists(path.join(destination, "dumb-it-down", "SKILL.md")), true);
    assert.equal(
      await fileExists(path.join(destination, "dumb-it-down", "references", "simplification-patterns.md")),
      true
    );
    assert.equal(await fileExists(path.join(destination, ".skills-installer.json")), true);
  });
});

test("skips existing native skills unless force is set", async () => {
  await withTempDirectory(async (directory) => {
    const options = {
      all: false,
      cwd: directory,
      destination: path.join(directory, "skills"),
      env: {},
      force: false,
      model: "auto",
      skills: ["dumb-it-down"],
      target: "cli"
    };

    await installSkills(options);
    const result = await installSkills(options);

    assert.equal(result.operations[0].status, "skipped");
  });
});

test("renders IDE rule files and keeps skill assets nearby", async () => {
  await withTempDirectory(async (directory) => {
    const destination = path.join(directory, ".cursor", "rules", "skills");
    const result = await installSkills({
      all: false,
      cwd: directory,
      destination,
      env: {},
      force: false,
      model: "gpt-5",
      skills: ["dumb-it-down"],
      target: "cursor"
    });
    const rulePath = path.join(destination, "dumb-it-down.mdc");
    const rule = await fs.readFile(rulePath, "utf8");

    assert.equal(result.operations[0].kind, "rule");
    assert.match(rule, /description: "Explain confusing ideas/);
    assert.match(rule, /Model profile: GPT-5/);
    assert.equal(await fileExists(path.join(destination, "_skills", "dumb-it-down", "SKILL.md")), true);
  });
});

test("parses install flags and comma-separated selections", () => {
  const parsed = parseArgs([
    "install",
    "--target",
    "codex,cursor",
    "--skills",
    "dumb-it-down,zero-techdebt",
    "--model",
    "claude-opus",
    "--force",
    "--quiet"
  ]);

  assert.equal(parsed.command, "install");
  assert.equal(parsed.target, "codex,cursor");
  assert.deepEqual(parsed.skills, ["dumb-it-down", "zero-techdebt"]);
  assert.equal(parsed.model, "claude-opus");
  assert.equal(parsed.force, true);
  assert.equal(parsed.quiet, true);
});

test("runs non-interactive install through the CLI", async () => {
  await withTempDirectory(async (directory) => {
    const destination = path.join(directory, "installed");
    const output = createWritableCapture();

    await runCli(
      [
        "install",
        "--quiet",
        "--target",
        "cli",
        "--skill",
        "zero-techdebt",
        "--dest",
        destination
      ],
      {
        cwd: directory,
        env: {},
        stdin: { isTTY: false },
        stdout: output,
        stderr: createWritableCapture()
      }
    );

    assert.match(output.toString(), /Portable CLI/);
    assert.equal(await fileExists(path.join(destination, "zero-techdebt", "SKILL.md")), true);
  });
});

async function withTempDirectory(callback) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "skills-installer-"));

  try {
    await callback(directory);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function createWritableCapture() {
  let output = "";

  return {
    isTTY: false,
    write(chunk) {
      output += chunk;
    },
    toString() {
      return output;
    }
  };
}
