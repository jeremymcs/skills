#!/usr/bin/env node
import fs from "node:fs";
import { builtinModules } from "node:module";
import path from "node:path";

const DEPENDENCY_SECTIONS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
  "bundledDependencies",
  "bundleDependencies",
];

const SOURCE_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".svelte",
  ".ts",
  ".tsx",
  ".vue",
]);

const SKIPPED_DIRECTORIES = new Set([
  ".agents",
  ".cache",
  ".claude",
  ".codex",
  ".git",
  ".gsd",
  ".hg",
  ".next",
  ".nuxt",
  ".output",
  ".parcel-cache",
  ".svelte-kit",
  ".turbo",
  ".venv",
  ".vercel",
  ".yarn",
  "build",
  "coverage",
  "dist",
  "dist-test",
  "node_modules",
  "out",
  "target",
  "vendor",
]);

const ROOT_LOCKFILES = new Map([
  ["pnpm-lock.yaml", "pnpm"],
  ["package-lock.json", "npm"],
  ["npm-shrinkwrap.json", "npm"],
  ["yarn.lock", "yarn"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
]);

const SEVERITY_RANK = { error: 0, warn: 1, info: 2 };

const BUILTIN_MODULES = new Set(
  builtinModules.flatMap((moduleName) => [
    moduleName,
    moduleName.replace(/^node:/, ""),
  ])
);

function parseArgs(argv) {
  const args = {
    json: false,
    scanImports: true,
    strict: false,
    target: ".",
  };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (arg === "--json") {
      args.json = true;
      continue;
    }

    if (arg === "--no-import-scan") {
      args.scanImports = false;
      continue;
    }

    if (arg === "--strict") {
      args.strict = true;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`unknown option: ${arg}`);
    }

    args.target = arg;
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node audit_package_hygiene.mjs [repo-path] [--json] [--strict] [--no-import-scan]

Audit package.json files, lockfiles, workspaces, package entry points, lifecycle
scripts, and basic import/dependency mismatches. Exits with status 1 for errors.
Use --strict to also fail on warnings.`);
}

function readJson(filePath) {
  try {
    return { value: JSON.parse(fs.readFileSync(filePath, "utf8")) };
  } catch (error) {
    return { error };
  }
}

function addFinding(findings, severity, code, message, filePath, detail) {
  findings.push({
    code,
    detail: detail ?? "",
    file: filePath ? normalizePath(filePath) : "",
    message,
    severity,
  });
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativePath(root, filePath) {
  const relative = path.relative(root, filePath);
  return relative === "" ? "." : normalizePath(relative);
}

function listPackageManifests(root) {
  const manifests = [];

  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) {
          visit(path.join(directory, entry.name));
        }
        continue;
      }

      if (entry.isFile() && entry.name === "package.json") {
        manifests.push(path.join(directory, entry.name));
      }
    }
  }

  visit(root);
  return manifests.sort();
}

function listSourceFiles(directory) {
  const files = [];

  function visit(currentDirectory) {
    for (const entry of fs.readdirSync(currentDirectory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) {
          visit(path.join(currentDirectory, entry.name));
        }
        continue;
      }

      const filePath = path.join(currentDirectory, entry.name);
      if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
        files.push(filePath);
      }
    }
  }

  visit(directory);
  return files;
}

function getWorkspacePatterns(manifest) {
  if (Array.isArray(manifest.workspaces)) {
    return manifest.workspaces;
  }

  if (manifest.workspaces && Array.isArray(manifest.workspaces.packages)) {
    return manifest.workspaces.packages;
  }

  return [];
}

function getPnpmWorkspacePatterns(root) {
  const workspacePath = path.join(root, "pnpm-workspace.yaml");
  if (!fs.existsSync(workspacePath)) {
    return [];
  }

  const patterns = [];
  let inPackagesBlock = false;

  for (const line of fs.readFileSync(workspacePath, "utf8").split(/\r?\n/)) {
    if (/^\s*packages\s*:/.test(line)) {
      inPackagesBlock = true;
      continue;
    }

    if (inPackagesBlock && /^\S/.test(line)) {
      inPackagesBlock = false;
    }

    if (!inPackagesBlock) {
      continue;
    }

    const match = line.match(/^\s*-\s+['"]?([^'"]+)['"]?\s*$/);
    if (match) {
      patterns.push(match[1]);
    }
  }

  return patterns;
}

function getRootWorkspacePatterns(root, manifest) {
  return [...new Set([...getWorkspacePatterns(manifest), ...getPnpmWorkspacePatterns(root)])];
}

function globPatternToRegExp(pattern) {
  let source = "^";

  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const nextChar = pattern[index + 1];

    if (char === "*" && nextChar === "*") {
      source += ".*";
      index += 1;
      continue;
    }

    if (char === "*") {
      source += "[^/]*";
      continue;
    }

    if (char === "?") {
      source += "[^/]";
      continue;
    }

    source += char.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
  }

  return new RegExp(`${source}$`);
}

function packageDirectoryIsInWorkspace(relativeDirectory, workspacePatterns) {
  return workspacePatterns
    .filter((pattern) => !pattern.startsWith("!"))
    .map(globPatternToRegExp)
    .some((pattern) => pattern.test(relativeDirectory));
}

function getPackageManager(manifest) {
  if (typeof manifest.packageManager !== "string") {
    return "";
  }

  return manifest.packageManager.split("@")[0];
}

function listRootLockfiles(root) {
  return [...ROOT_LOCKFILES.keys()].filter((fileName) =>
    fs.existsSync(path.join(root, fileName))
  );
}

function getDependencyMap(manifest) {
  const dependencyMap = new Map();

  for (const section of DEPENDENCY_SECTIONS) {
    const dependencies = manifest[section];
    if (!dependencies || typeof dependencies !== "object" || Array.isArray(dependencies)) {
      continue;
    }

    for (const [name, version] of Object.entries(dependencies)) {
      if (!dependencyMap.has(name)) {
        dependencyMap.set(name, []);
      }
      dependencyMap.get(name).push({ section, version });
    }
  }

  return dependencyMap;
}

function collectEntryTargets(value, targets) {
  if (typeof value === "string") {
    if (value.startsWith(".") && !value.includes("*")) {
      targets.add(value);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const child of Object.values(value)) {
    collectEntryTargets(child, targets);
  }
}

function listEntryTargets(manifest) {
  const targets = new Set();

  for (const field of ["main", "module", "types", "typings"]) {
    collectEntryTargets(manifest[field], targets);
  }

  if (typeof manifest.bin === "string") {
    collectEntryTargets(manifest.bin, targets);
  } else if (manifest.bin && typeof manifest.bin === "object") {
    for (const target of Object.values(manifest.bin)) {
      collectEntryTargets(target, targets);
    }
  }

  collectEntryTargets(manifest.exports, targets);
  return [...targets].sort();
}

function extractPackageName(specifier) {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("#") ||
    specifier.startsWith("@/") ||
    specifier.startsWith("~/")
  ) {
    return "";
  }

  const withoutNodePrefix = specifier.replace(/^node:/, "");
  if (BUILTIN_MODULES.has(withoutNodePrefix)) {
    return "";
  }

  if (withoutNodePrefix.startsWith("@")) {
    const [scope, name] = withoutNodePrefix.split("/");
    return scope && name ? `${scope}/${name}` : "";
  }

  return withoutNodePrefix.split("/")[0];
}

function scanImports(packageDirectory) {
  const imports = new Set();
  const importPatterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[^"']+\s+from\s+)?["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const filePath of listSourceFiles(packageDirectory)) {
    const source = fs.readFileSync(filePath, "utf8");
    for (const pattern of importPatterns) {
      for (const match of source.matchAll(pattern)) {
        const packageName = extractPackageName(match[1]);
        if (packageName) {
          imports.add(packageName);
        }
      }
    }
  }

  return imports;
}

function hasManifestDependency(manifest, packageName) {
  return DEPENDENCY_SECTIONS.some((section) =>
    Boolean(manifest[section] && manifest[section][packageName])
  );
}

function auditRoot(root, rootManifest, manifests, findings) {
  const lockfiles = listRootLockfiles(root);
  const packageManager = getPackageManager(rootManifest);
  const workspacePatterns = getRootWorkspacePatterns(root, rootManifest);

  if (!packageManager) {
    addFinding(
      findings,
      "warn",
      "missing-package-manager",
      "Root package.json does not declare packageManager.",
      path.join(root, "package.json"),
      "Declare the expected package manager and version to reduce install drift."
    );
  }

  if (lockfiles.length > 1) {
    addFinding(
      findings,
      "warn",
      "multiple-lockfiles",
      "Multiple root lockfiles are present.",
      root,
      lockfiles.join(", ")
    );
  }

  if (packageManager) {
    for (const lockfile of lockfiles) {
      const expected = ROOT_LOCKFILES.get(lockfile);
      if (expected && expected !== packageManager) {
        addFinding(
          findings,
          "warn",
          "lockfile-package-manager-mismatch",
          `${lockfile} does not match packageManager ${rootManifest.packageManager}.`,
          path.join(root, lockfile),
          `Expected ${packageManager}-managed lockfile.`
        );
      }
    }
  }

  if (workspacePatterns.length > 0 && rootManifest.private !== true) {
    addFinding(
      findings,
      "warn",
      "workspace-root-not-private",
      "Workspace root is not marked private.",
      path.join(root, "package.json"),
      "Mark workspace roots private unless the root package is intentionally published."
    );
  }

  if (manifests.length > 1 && workspacePatterns.length === 0) {
    addFinding(
      findings,
      "warn",
      "missing-workspaces",
      "Multiple package.json files exist but the root manifest has no workspaces declaration.",
      path.join(root, "package.json"),
      "Declare workspaces or confirm the packages are intentionally independent."
    );
  }

  for (const manifestPath of manifests) {
    if (manifestPath === path.join(root, "package.json")) {
      continue;
    }

    const relativeDirectory = relativePath(root, path.dirname(manifestPath));
    if (
      workspacePatterns.length > 0 &&
      !packageDirectoryIsInWorkspace(relativeDirectory, workspacePatterns)
    ) {
      addFinding(
        findings,
        "warn",
        "package-outside-workspaces",
        "Package manifest is not covered by root workspaces.",
        manifestPath,
        `Package directory ${relativeDirectory} does not match ${workspacePatterns.join(", ")}.`
      );
    }
  }
}

function auditManifest(root, manifestPath, manifest, localPackageNames, options, findings) {
  const packageDirectory = path.dirname(manifestPath);
  const isRoot = manifestPath === path.join(root, "package.json");
  const isPublishable = manifest.private !== true && typeof manifest.name === "string";
  const isWorkspacePackage =
    !isRoot &&
    options.workspacePatterns.length > 0 &&
    packageDirectoryIsInWorkspace(relativePath(root, packageDirectory), options.workspacePatterns);
  const dependencyMap = getDependencyMap(manifest);
  const shouldScanImports = options.scanImports && !(isRoot && options.packageCount > 1);
  const declaredImports = shouldScanImports ? scanImports(packageDirectory) : new Set();

  if (isWorkspacePackage && typeof manifest.name !== "string") {
    addFinding(
      findings,
      "warn",
      "missing-package-name",
      "Package manifest does not declare a name.",
      manifestPath,
      "Workspace packages need stable names for dependency and import checks."
    );
  }

  if (typeof manifest.name === "string" && !isValidPackageName(manifest.name)) {
    addFinding(
      findings,
      "warn",
      "invalid-package-name",
      "Package name does not match npm naming conventions.",
      manifestPath,
      manifest.name
    );
  }

  if (isPublishable && typeof manifest.version !== "string") {
    addFinding(
      findings,
      "warn",
      "publishable-package-missing-version",
      "Publishable package does not declare a version.",
      manifestPath,
      "Add version or mark the package private."
    );
  }

  if (isPublishable && typeof manifest.license !== "string") {
    addFinding(
      findings,
      "warn",
      "publishable-package-missing-license",
      "Publishable package does not declare a license.",
      manifestPath,
      "Add license or mark the package private."
    );
  }

  if (isPublishable && !Array.isArray(manifest.files)) {
    addFinding(
      findings,
      "info",
      "publishable-package-missing-files",
      "Publishable package does not declare a files allowlist.",
      manifestPath,
      "Consider files to avoid publishing test fixtures, local config, or source-only artifacts."
    );
  }

  for (const [dependencyName, locations] of dependencyMap) {
    if (manifest.name === dependencyName) {
      addFinding(
        findings,
        "error",
        "self-dependency",
        "Package depends on itself.",
        manifestPath,
        dependencyName
      );
    }

    for (const location of locations) {
      if (typeof location.version !== "string" || location.version.trim() === "") {
        addFinding(
          findings,
          "warn",
          "empty-dependency-version",
          "Dependency has an empty or non-string version.",
          manifestPath,
          `${location.section}.${dependencyName}`
        );
      }

      if (location.version === "latest" || location.version === "*") {
        addFinding(
          findings,
          "warn",
          "floating-dependency-version",
          "Dependency uses a fully floating version.",
          manifestPath,
          `${location.section}.${dependencyName}: ${location.version}`
        );
      }

      if (
        localPackageNames.has(dependencyName) &&
        !location.version.startsWith("workspace:") &&
        !location.version.startsWith("file:")
      ) {
        const severity = location.section === "optionalDependencies" ? "info" : "warn";
        addFinding(
          findings,
          severity,
          "local-package-with-registry-range",
          "Local workspace dependency does not use workspace: or file:.",
          manifestPath,
          `${location.section}.${dependencyName}: ${location.version}`
        );
      }
    }

    const sections = locations.map((location) => location.section);
    const uniqueSections = new Set(sections);
    if (uniqueSections.size > 1) {
      const severity =
        uniqueSections.has("peerDependencies") && uniqueSections.has("devDependencies")
          ? "info"
          : "warn";

      addFinding(
        findings,
        severity,
        "duplicate-dependency-sections",
        "Dependency appears in multiple dependency sections.",
        manifestPath,
        `${dependencyName}: ${sections.join(", ")}`
      );
    }
  }

  for (const target of listEntryTargets(manifest)) {
    const targetPath = path.resolve(packageDirectory, target);
    if (!fs.existsSync(targetPath)) {
      addFinding(
        findings,
        "warn",
        "missing-entry-target",
        "Package entry target does not exist in the working tree.",
        manifestPath,
        target
      );
    }
  }

  auditScripts(manifestPath, manifest, findings);

  if (!shouldScanImports) {
    return;
  }

  for (const importedPackage of declaredImports) {
    if (!hasManifestDependency(manifest, importedPackage) && !localPackageNames.has(importedPackage)) {
      addFinding(
        findings,
        "warn",
        "import-missing-dependency",
        "Imported package is not declared in this manifest.",
        manifestPath,
        importedPackage
      );
    }
  }

  for (const dependencyName of Object.keys(manifest.dependencies || {})) {
    if (!declaredImports.has(dependencyName)) {
      addFinding(
        findings,
        "info",
        "dependency-not-found-in-import-scan",
        "Runtime dependency was not detected by the simple import scan.",
        manifestPath,
        dependencyName
      );
    }
  }
}

function isValidPackageName(packageName) {
  return /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(packageName);
}

function auditScripts(manifestPath, manifest, findings) {
  if (!manifest.scripts || typeof manifest.scripts !== "object") {
    return;
  }

  for (const [scriptName, command] of Object.entries(manifest.scripts)) {
    if (typeof command !== "string") {
      addFinding(
        findings,
        "warn",
        "non-string-script",
        "Package script value is not a string.",
        manifestPath,
        scriptName
      );
      continue;
    }

    if (/^(preinstall|install|postinstall|prepare)$/.test(scriptName)) {
      addFinding(
        findings,
        "info",
        "lifecycle-script",
        "Package has an install/publish lifecycle script.",
        manifestPath,
        `${scriptName}: ${command}`
      );
    }

    if (/(curl|wget)\b.+\|.+(?:sh|bash)|sudo\b|chmod\s+777|rm\s+-rf\s+\//.test(command)) {
      addFinding(
        findings,
        "warn",
        "risky-script-command",
        "Package script contains a risky shell pattern.",
        manifestPath,
        `${scriptName}: ${command}`
      );
    }
  }
}

function severityRank(severity) {
  return SEVERITY_RANK[severity] ?? 3;
}

function buildReport(args) {
  const root = path.resolve(args.target);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`target is not a directory: ${root}`);
  }

  const findings = [];
  const manifests = listPackageManifests(root);
  const packages = [];

  for (const manifestPath of manifests) {
    const result = readJson(manifestPath);
    if (result.error) {
      addFinding(
        findings,
        "error",
        "invalid-package-json",
        "package.json could not be parsed.",
        manifestPath,
        result.error.message
      );
      continue;
    }

    packages.push({ manifest: result.value, manifestPath });
  }

  const rootPackage = packages.find(
    (packageInfo) => packageInfo.manifestPath === path.join(root, "package.json")
  );
  const workspacePatterns = rootPackage
    ? getRootWorkspacePatterns(root, rootPackage.manifest)
    : [];
  const localPackageNames = new Set(
    packages
      .map((packageInfo) => packageInfo.manifest.name)
      .filter((name) => typeof name === "string")
  );

  if (packages.length === 0) {
    return {
      findings,
      packageCount: 0,
      root,
      scanImports: args.scanImports,
    };
  }

  if (rootPackage) {
    auditRoot(
      root,
      rootPackage.manifest,
      packages.map((packageInfo) => packageInfo.manifestPath),
      findings
    );
  }

  for (const packageInfo of packages) {
    auditManifest(
      root,
      packageInfo.manifestPath,
      packageInfo.manifest,
      localPackageNames,
        { ...args, packageCount: packages.length, workspacePatterns },
        findings
      );
  }

  findings.sort((first, second) => {
    const rankDifference = severityRank(first.severity) - severityRank(second.severity);
    if (rankDifference !== 0) {
      return rankDifference;
    }
    return `${first.file}:${first.code}`.localeCompare(`${second.file}:${second.code}`);
  });

  return {
    findings,
    packageCount: packages.length,
    root,
    scanImports: args.scanImports,
  };
}

function printTextReport(report) {
  console.log("# Package Hygiene Audit");
  console.log("");
  console.log(`Target: ${report.root}`);
  console.log(`Package manifests: ${report.packageCount}`);
  console.log(`Import scan: ${report.scanImports ? "enabled" : "disabled"}`);
  console.log("");

  if (report.packageCount === 0) {
    console.log("No package.json files found.");
    return;
  }

  if (report.findings.length === 0) {
    console.log("No package hygiene findings.");
    return;
  }

  for (const severity of ["error", "warn", "info"]) {
    const findings = report.findings.filter((finding) => finding.severity === severity);
    if (findings.length === 0) {
      continue;
    }

    console.log(`## ${severity.toUpperCase()}`);
    console.log("");

    for (const finding of findings) {
      const location = finding.file ? ` (${finding.file})` : "";
      console.log(`- [${finding.code}] ${finding.message}${location}`);
      if (finding.detail) {
        console.log(`  Detail: ${finding.detail}`);
      }
    }

    console.log("");
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildReport(args);

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printTextReport(report);
  }

  const hasErrors = report.findings.some((finding) => finding.severity === "error");
  const hasWarnings = report.findings.some((finding) => finding.severity === "warn");
  return hasErrors || (args.strict && hasWarnings) ? 1 : 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
