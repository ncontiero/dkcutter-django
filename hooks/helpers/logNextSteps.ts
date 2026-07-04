import type { Context } from "../utils/types";
import * as p from "@clack/prompts";
import { dim } from "ansis";

export function logNextSteps(ctx: Context, hasGitInitialized: boolean) {
  const {
    projectSlug,
    installFrontendDeps,
    haveNodePackages,
    initializeGit,
    pkgManager,
  } = ctx;
  const commands = [`cd ${projectSlug}`, "uv sync"];

  if (!installFrontendDeps && haveNodePackages) {
    commands.push(`${pkgManager} install`);
  }

  if (!initializeGit || !hasGitInitialized) {
    commands.push("git init", "git add .", `git commit -m "initial commit"`);
  }

  commands.push("docker compose -f docker-compose.local.yml up");
  p.note(commands.join("\n"), "Next steps", {
    format: (line: string) => dim(line),
  });
}
