import type { PackageManager } from "./types";
import { execa } from "execa";
import { logger } from "./logger";

const pkgManagersDefaultVersions: Record<PackageManager, string> = {
  npm: "npm@11.7.0",
  pnpm: "pnpm@10.26.0",
  yarn: "yarn@4.12.0",
  bun: "bun@1.3.5",
};

export async function getPkgManagerVersion(packageManager: PackageManager) {
  try {
    const { stdout } = await execa(packageManager, ["-v"]);
    return `${packageManager}@${stdout}`;
  } catch {
    logger.warn(
      `Failed to get version for package manager ${packageManager}, using default version instead.`,
    );
    return pkgManagersDefaultVersions[packageManager];
  }
}
