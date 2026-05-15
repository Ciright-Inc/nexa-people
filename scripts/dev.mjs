/**
 * Start Next dev with a sane ComSpec on Windows (system COMSPEC may include a trailing newline).
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const port = process.env.PORT?.trim() || "5175";

const dbUrl = process.env.DATABASE_URL?.trim();
if (dbUrl && /YOUR_PASSWORD|REPLACE_ME|CHANGEME|<password>/i.test(dbUrl)) {
  console.warn(
    "\n[dev] WARNING: DATABASE_URL contains a placeholder (YOUR_PASSWORD).\n" +
      "       Sites will fail until you paste the real URL from Railway → PostgreSQL → Connect.\n" +
      "       Run: npm run db:check\n"
  );
}

if (process.platform === "win32") {
  const cmd = "C:\\Windows\\System32\\cmd.exe";
  if (existsSync(cmd)) {
    process.env.ComSpec = cmd;
    process.env.COMSPEC = cmd;
  }
}

const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "dev", "-p", port], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
