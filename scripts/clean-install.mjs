import { execSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const npmCli = join(process.execPath, "..", "node_modules", "npm", "bin", "npm-cli.js");

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root, env: process.env });
}

function removeDir(name) {
  const path = join(root, name);
  if (!existsSync(path)) return;
  try {
    console.log(`Removing ${name}…`);
    rmSync(path, { recursive: true, force: true, maxRetries: 8, retryDelay: 800 });
  } catch {
    const backup = `${name}.old.${Date.now()}`;
    console.log(`Could not delete ${name}; renaming to ${backup}…`);
    renameSync(path, join(root, backup));
  }
}

removeDir(".next");
removeDir("node_modules");

run(`node "${npmCli}" cache clean --force`);
run(`node "${npmCli}" ci`);

console.log("\nDone. Run: npm run dev");
