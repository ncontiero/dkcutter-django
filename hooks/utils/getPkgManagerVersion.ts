import type { PackageManager } from "./types";
import { logger } from "dkcutter/utils";
import { x } from "tinyexec";

const pkgManagersDefaultVersions: Record<PackageManager, string> = {
  npm: "npm@12.2.0",
  pnpm: "pnpm@12.10.1",
  yarn: "yarn@4.18.1",
  bun: "bun@1.4.2",
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
