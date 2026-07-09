import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { configPath, starterConfig } from "./lib/config.js";
import { exportMarkdown } from "./lib/markdown-export.js";
import {
  copyReferencedAssets,
  createSiteDataFile,
  loadSite,
} from "./lib/site.js";

const [command, vaultArgument, ...arguments_] = process.argv.slice(2);
const vault = vaultArgument ? path.resolve(vaultArgument) : undefined;
const outputFlag = arguments_.find((value) => value.startsWith("--out="));
const outputIndex = arguments_.indexOf("--out");
const outputValue =
  outputFlag?.slice(6) ??
  (outputIndex >= 0 ? arguments_[outputIndex + 1] : undefined);
const output = outputValue ? path.resolve(outputValue) : undefined;
const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);

function usage() {
  console.error(
    "Usage: everend-compendium <build|dev|init|markdown> <vault> [--out=<directory>]",
  );
}

function runAstro(args: string[], source: string) {
  const astro = path.join(root, "node_modules", "astro", "astro.js");
  const child = childProcess.spawnSync(process.execPath, [astro, ...args], {
    cwd: root,
    env: { ...process.env, COMPENDIUM_SOURCE: source },
    stdio: "inherit",
  });
  if (child.status !== 0) process.exitCode = child.status ?? 1;
}

if (
  !command ||
  !vault ||
  !["build", "dev", "init", "markdown"].includes(command)
) {
  usage();
} else if (command === "init") {
  const destination = configPath(vault);
  if (fs.existsSync(destination))
    throw new Error(`${destination} already exists.`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, starterConfig);
  console.log(`Created ${destination}`);
} else {
  const site = loadSite(vault);
  if (command === "markdown") {
    exportMarkdown(site, output ?? path.join(vault, "compendium-markdown"));
  } else {
    const temp = createSiteDataFile(site);
    try {
      if (command === "build") {
        const out = output ?? path.join(root, "dist");
        runAstro(["build", "--outDir", out], temp.file);
        if (!process.exitCode) {
          copyReferencedAssets(site, out);
          console.log(
            `Built ${site.entities.length} entries and ${site.stories.length} stories to ${out}`,
          );
        }
      } else {
        runAstro(["dev", "--host"], temp.file);
      }
    } finally {
      temp.dispose();
    }
  }
}
