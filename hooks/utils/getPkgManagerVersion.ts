import type { PackageManager } from "./types";
import { logger } from "dkcutter/utils";
import { x } from "tinyexec";

const pkgManagersDefaultVersions: Record<PackageManager, string> = {
  npm: "npm@11.16.0",
  pnpm: "pnpm@11.5.1",
  yarn: "yarn@4.16.0",
  bun: "bun@1.3.14",
};

export async function getPkgManagerVersion(packageManager: PackageManager) {
  try {
    const { stdout } = await x(packageManager, ["-v"], { throwOnError: true });
    const version = stdout.toString().trim();
    return `${packageManager}@${version}`;
  } catch {
    logger.warn(
      `Failed to get version for package manager ${packageManager}, using default version instead.`,
    );
    return pkgManagersDefaultVersions[packageManager];
  }
}
