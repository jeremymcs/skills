export const splash = String.raw`
    _____ __ __ ____ __    __    _____
   / ___// //_//  _// /   / /   / ___/
   \__ \/ ,<   / / / /   / /    \__ \
  ___/ / /| |_/ / / /___/ /____ ___/ /
 /____/_/ |_/___//_____/_____//____/

  Skills by Jeremy
  Agent-ready installs for Codex, Claude Code, Cursor,
  Windsurf, Continue, and portable CLI workflows.
`;

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m"
};

export function color(text, colorName, enabled = true) {
  if (!enabled || !colors[colorName]) {
    return text;
  }

  return `${colors[colorName]}${text}${colors.reset}`;
}

export function formatList(items) {
  return items.map((item) => `  - ${item}`).join("\n");
}
