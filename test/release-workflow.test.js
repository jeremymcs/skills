import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);

test("npm release workflow publishes the package through trusted publishing", async () => {
  const workflow = await readWorkflow(".github/workflows/npm-publish.yml");
  const packageJson = JSON.parse(await fs.readFile("package.json", "utf8"));
  const publishJob = workflow.jobs.publish;
  const commands = collectRunCommands(publishJob);

  assert.equal(packageJson.repository.url, "https://github.com/jeremymcs/skills.git");
  assert.equal(workflow.name, "Publish npm package");
  assert.deepEqual(workflow.on.release.types, ["published"]);
  assert.equal(workflow.on.workflow_dispatch.inputs.dry_run.default, true);
  assert.equal(workflow.permissions.contents, "read");
  assert.equal(workflow.permissions["id-token"], "write");
  assert.equal(publishJob["runs-on"], "ubuntu-latest");
  const setupNodeStep = findStep(publishJob, "Set up Node.js");
  assert.equal(setupNodeStep.with["node-version"], 24);
  assert.match(commands, /npm test/);
  assert.match(commands, /npm install -g npm@11/);
  assert.match(commands, /npm pack --dry-run/);
  assert.match(commands, /npm view "\$PACKAGE_NAME@\$PACKAGE_VERSION" version/);
  assert.match(commands, /npm publish --dry-run --access public --tag latest/);
  assert.match(commands, /npm publish --provenance --access public --tag latest/);
  assert.match(commands, /"\$RELEASE_VERSION" != "\$PACKAGE_VERSION"/);
});

async function readWorkflow(filePath) {
  const absolutePath = path.resolve(filePath);
  await fs.access(absolutePath);

  const { stdout } = await execFileAsync("ruby", [
    "-ryaml",
    "-rjson",
    "-e",
    [
      "workflow = YAML.safe_load(File.read(ARGV.fetch(0)), aliases: true)",
      "workflow['on'] = workflow.delete(true) if workflow.key?(true)",
      "puts JSON.generate(workflow)"
    ].join("; "),
    absolutePath
  ]);

  return JSON.parse(stdout);
}

function collectRunCommands(job) {
  return job.steps
    .filter((step) => typeof step.run === "string")
    .map((step) => step.run)
    .join("\n");
}

function findStep(job, name) {
  const step = job.steps.find((candidate) => candidate.name === name);

  assert.ok(step, `Missing workflow step: ${name}`);

  return step;
}
