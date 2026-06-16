import os from "node:os";
import path from "node:path";

export const modelProfiles = {
  auto: {
    label: "Auto",
    note: "Use the active model or IDE default."
  },
  "gpt-5": {
    label: "GPT-5",
    note: "Prefer GPT-5-class reasoning when the tool supports model hints."
  },
  "gpt-4.1": {
    label: "GPT-4.1",
    note: "Prefer GPT-4.1-class coding and instruction following when supported."
  },
  "claude-sonnet": {
    label: "Claude Sonnet",
    note: "Prefer Claude Sonnet-class balanced coding and writing when supported."
  },
  "claude-opus": {
    label: "Claude Opus",
    note: "Prefer Claude Opus-class deep reasoning when supported."
  },
  "gemini-pro": {
    label: "Gemini Pro",
    note: "Prefer Gemini Pro-class long-context work when supported."
  },
  local: {
    label: "Local model",
    note: "Use the local model configured by the host CLI or IDE."
  }
};

export const targets = {
  codex: {
    label: "Codex",
    kind: "native",
    aliases: ["openai", "codex-cli"],
    defaultDirectory(context) {
      const codexHome = context.env.CODEX_HOME || path.join(os.homedir(), ".codex");
      return path.join(codexHome, "skills");
    }
  },
  claude: {
    label: "Claude Code",
    kind: "native",
    aliases: ["claude-code"],
    defaultDirectory() {
      return path.join(os.homedir(), ".claude", "skills");
    }
  },
  agents: {
    label: "Project agents",
    kind: "native",
    aliases: ["project", "project-agents", "openai-agents"],
    defaultDirectory(context) {
      return path.join(context.cwd, ".agents", "skills");
    }
  },
  cli: {
    label: "Portable CLI",
    kind: "native",
    aliases: ["generic", "manual"],
    defaultDirectory(context) {
      return path.join(context.cwd, ".agent-skills");
    }
  },
  cursor: {
    label: "Cursor rules",
    kind: "rule",
    extension: ".mdc",
    aliases: ["cursor-rules"],
    defaultDirectory(context) {
      return path.join(context.cwd, ".cursor", "rules", "skills");
    }
  },
  windsurf: {
    label: "Windsurf rules",
    kind: "rule",
    extension: ".md",
    aliases: ["windsurf-rules"],
    defaultDirectory(context) {
      return path.join(context.cwd, ".windsurf", "rules", "skills");
    }
  },
  continue: {
    label: "Continue rules",
    kind: "rule",
    extension: ".md",
    aliases: ["continue-rules"],
    defaultDirectory(context) {
      return path.join(context.cwd, ".continue", "rules", "skills");
    }
  }
};

export function resolveTarget(name) {
  if (!name) {
    return null;
  }

  if (targets[name]) {
    return { name, ...targets[name] };
  }

  const foundName = Object.entries(targets).find(([, target]) => {
    return target.aliases?.includes(name);
  })?.[0];

  if (!foundName) {
    return null;
  }

  return { name: foundName, ...targets[foundName] };
}

export function listTargetNames() {
  return Object.keys(targets);
}

export function resolveModelProfile(name = "auto") {
  return modelProfiles[name] ? { name, ...modelProfiles[name] } : null;
}
