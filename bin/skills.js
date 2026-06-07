#!/usr/bin/env node

import { runCli } from "../lib/cli.js";

runCli(process.argv.slice(2), {
  cwd: process.cwd(),
  env: process.env,
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr
}).catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
