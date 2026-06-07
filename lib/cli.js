import { createInterface } from "node:readline/promises";
import { discoverSkills } from "./registry.js";
import { installSkills } from "./installer.js";
import { listTargetNames, modelProfiles, resolveTarget, targets } from "./targets.js";
import { color, formatList, splash } from "./ui.js";

export async function runCli(argv, context) {
  const runtime = normalizeContext(context);
  const parsed = parseArgs(argv);

  if (parsed.help) {
    runtime.stdout.write(`${helpText()}\n`);
    return 0;
  }

  if (parsed.version) {
    runtime.stdout.write("0.1.0\n");
    return 0;
  }

  if (!parsed.quiet && parsed.command !== "list" && parsed.command !== "targets") {
    runtime.stdout.write(color(splash, "cyan", shouldUseColor(runtime)));
  }

  if (parsed.command === "list") {
    await listSkills(runtime);
    return 0;
  }

  if (parsed.command === "targets") {
    listTargets(runtime);
    return 0;
  }

  const options = await resolveInstallOptions(parsed, runtime);
  const targetNames = expandTargets(options.target);

  for (const targetName of targetNames) {
    const result = await installSkills({ ...options, target: targetName });
    printInstallSummary(result, runtime);
  }

  return 0;
}

export function parseArgs(argv) {
  const parsed = {
    all: false,
    command: "install",
    dryRun: false,
    force: false,
    model: "auto",
    quiet: false,
    skills: [],
    target: null,
    yes: false
  };
  const commands = new Set(["install", "list", "targets", "help"]);
  const remaining = [...argv];

  if (commands.has(remaining[0])) {
    parsed.command = remaining.shift();
  }

  if (parsed.command === "help") {
    parsed.help = true;
  }

  for (let index = 0; index < remaining.length; index += 1) {
    const arg = remaining[index];

    switch (arg) {
      case "--all":
        parsed.all = true;
        break;
      case "--dry-run":
        parsed.dryRun = true;
        break;
      case "--force":
      case "--overwrite":
        parsed.force = true;
        break;
      case "--help":
      case "-h":
        parsed.help = true;
        break;
      case "--model":
        parsed.model = readValue(remaining, ++index, arg);
        break;
      case "--no-splash":
      case "--quiet":
        parsed.quiet = true;
        break;
      case "--skill":
      case "--skills":
        parsed.skills.push(...splitList(readValue(remaining, ++index, arg)));
        break;
      case "--target":
      case "--targets":
      case "--ide":
      case "--cli":
        parsed.target = readValue(remaining, ++index, arg);
        break;
      case "--to":
      case "--destination":
      case "--dest":
        parsed.destination = readValue(remaining, ++index, arg);
        break;
      case "--version":
      case "-v":
        parsed.version = true;
        break;
      case "--yes":
      case "-y":
        parsed.yes = true;
        break;
      default:
        if (arg.startsWith("-")) {
          throw new Error(`Unknown option: ${arg}`);
        }

        parsed.skills.push(...splitList(arg));
        break;
    }
  }

  return parsed;
}

async function resolveInstallOptions(parsed, context) {
  const options = {
    ...parsed,
    cwd: context.cwd,
    env: context.env
  };

  if (parsed.target) {
    return options;
  }

  if (canPrompt(context) && !parsed.yes) {
    return promptForInstallOptions(options, context);
  }

  throw new Error("Choose an install target with --target, or run in a TTY for the installer wizard.");
}

async function promptForInstallOptions(options, context) {
  const skills = await discoverSkills();
  const rl = createInterface({
    input: context.stdin,
    output: context.stdout
  });

  try {
    context.stdout.write("\nTargets:\n");
    listNumbered(context, listTargetNames(), (targetName) => {
      return `${targetName} - ${targets[targetName].label}`;
    });

    const targetAnswer = await rl.question("\nInstall target(s), comma-separated [agents]: ");
    options.target = targetAnswer.trim() || "agents";

    context.stdout.write("\nSkills:\n");
    listNumbered(context, skills.map((skill) => skill.slug), (slug) => slug);

    const skillsAnswer = await rl.question("\nSkills to install [all]: ");

    if (skillsAnswer.trim()) {
      options.skills = splitList(skillsAnswer);
      options.all = false;
    } else {
      options.all = true;
    }

    context.stdout.write("\nModel profiles:\n");
    listNumbered(context, Object.keys(modelProfiles), (modelName) => {
      return `${modelName} - ${modelProfiles[modelName].label}`;
    });

    const modelAnswer = await rl.question("\nModel profile [auto]: ");
    options.model = modelAnswer.trim() || "auto";

    const overwriteAnswer = await rl.question("Overwrite existing skill folders? [y/N]: ");
    options.force = /^y(es)?$/i.test(overwriteAnswer.trim());

    return options;
  } finally {
    rl.close();
  }
}

async function listSkills(context) {
  const skills = await discoverSkills();
  const lines = skills.map((skill) => `$${skill.slug} - ${skill.description}`);
  context.stdout.write(`${formatList(lines)}\n`);
}

function listTargets(context) {
  const lines = Object.entries(targets).map(([name, target]) => {
    return `${name} - ${target.label} (${target.kind})`;
  });
  context.stdout.write(`${formatList(lines)}\n`);
}

function printInstallSummary(result, context) {
  const skipped = result.operations.filter(isSkippedOperation).length;
  const colorEnabled = shouldUseColor(context);

  context.stdout.write(
    `\n${color(result.target.label, "green", colorEnabled)} -> ${result.destination}\n`
  );

  for (const operation of result.operations) {
    const status = operation.ruleStatus
      ? `${operation.status}/${operation.ruleStatus}`
      : operation.status;
    context.stdout.write(`  ${status.padEnd(17)} $${operation.skill}\n`);
  }

  if (skipped > 0) {
    context.stdout.write(
      color(`  ${skipped} existing skill(s) skipped. Re-run with --force to overwrite.\n`, "yellow", colorEnabled)
    );
  }
}

function isSkippedOperation(operation) {
  if (operation.ruleStatus) {
    return operation.status === "skipped" && operation.ruleStatus === "skipped";
  }

  return operation.status === "skipped";
}

function expandTargets(value) {
  const names = splitList(value);

  if (names.includes("all")) {
    return listTargetNames();
  }

  const resolvedNames = names.map((name) => {
    const target = resolveTarget(name);

    if (!target) {
      throw new Error(`Unknown install target: ${name}`);
    }

    return target.name;
  });

  return [...new Set(resolvedNames)];
}

function readValue(args, index, optionName) {
  const value = args[index];

  if (!value || value.startsWith("-")) {
    throw new Error(`Missing value for ${optionName}`);
  }

  return value;
}

function splitList(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listNumbered(context, values, render) {
  values.forEach((value, index) => {
    context.stdout.write(`  ${index + 1}. ${render(value)}\n`);
  });
}

function canPrompt(context) {
  return Boolean(context.stdin.isTTY && context.stdout.isTTY);
}

function shouldUseColor(context) {
  return Boolean(context.stdout.isTTY && context.env.NO_COLOR !== "1");
}

function normalizeContext(context) {
  return {
    cwd: context.cwd || process.cwd(),
    env: context.env || {},
    stdin: context.stdin || process.stdin,
    stdout: context.stdout || process.stdout,
    stderr: context.stderr || process.stderr
  };
}

function helpText() {
  return `Usage:
  npx @jeremymcs/skills install --target codex --all
  npx @jeremymcs/skills install --target cursor --skill dumb-it-down --model gpt-5
  npx @jeremymcs/skills list
  npx @jeremymcs/skills targets

Targets:
  codex       ~/.codex/skills or $CODEX_HOME/skills
  claude      ~/.claude/skills
  agents      ./.agents/skills
  cli         ./.agent-skills
  cursor      ./.cursor/rules/skills
  windsurf    ./.windsurf/rules/skills
  continue    ./.continue/rules/skills
  all         install into every target above

Options:
  --all                    Install every skill
  --skill <name[,name]>    Install selected skills
  --target <name[,name]>   Install target or targets
  --model <profile>        auto, gpt-5, gpt-4.1, claude-sonnet, claude-opus, gemini-pro, local
  --dest <path>            Override the target destination
  --force                  Overwrite existing installed skills
  --dry-run                Print planned work without writing files
  --quiet                  Hide the splash
  --yes                    Disable prompts`;
}
