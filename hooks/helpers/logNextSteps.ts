import type { Context, PackageManager } from "../utils/types";

import { logger } from "../utils/logger";
import { isInsideGitRepo, isRootGitRepo } from "./git";

interface LogNextStepsOptions {
  ctx: Context;
  projectDir: string;
  pkgManager: PackageManager;
}

export async function logNextSteps({
  ctx,
  projectDir,
  pkgManager,
}: LogNextStepsOptions) {
  const commands = [`cd ${ctx.projectSlug}`, "uv sync"];

  if (!ctx.installFrontendDeps) {
    commands.push(`${pkgManager} install`);
  }

  const isGitRepo =
    (await isInsideGitRepo(projectDir)) || (await isRootGitRepo(projectDir));
  if (!isGitRepo) {
    commands.push(`git init`);
  }
  commands.push(
    `git add .`,
    `git commit -m "initial commit"`,
    "docker compose -f docker-compose.local.yml up",
  );

  logger.info(`Next steps:\n  ${commands.join("\n  ")}`);
}
