import type { Context } from "../utils/types";

import os from "node:os";
import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import ora from "ora";

import { colorize, logger } from "../utils/logger";
import { runCommand } from "./runCommand";

function buildVolumeArg() {
  const absoluteAppPath = path.resolve(process.cwd());
  return `${absoluteAppPath}:/app`;
}

async function isPackageManagerAvailable(pkgManager: string) {
  try {
    const { exitCode } = await execa(pkgManager, ["--version"], {
      reject: false,
    });
    return exitCode === 0;
  } catch {
    return false;
  }
}

async function tryBuildDockerImage(
  tag: string,
  dockerfilePath: string,
): Promise<boolean> {
  try {
    const buildSpinner = await runCommand("docker", [
      "build",
      "--load",
      "-t",
      tag,
      "-f",
      dockerfilePath,
      ".",
    ]);

    (buildSpinner ?? ora()).succeed(
      colorize("success", "Docker image built successfully."),
    );
    return true;
  } catch (error) {
    logger.error(`Failed to build Docker image ${tag}: ${error}`);
    return false;
  }
}

async function installFrontendDependencies(
  context: Context,
  nodeImageTag: string,
  nodeDockerImagePath: string,
  projectDir: string,
) {
  if (!context.haveNodePackages || !context.installDependencies) {
    return; // No action needed
  }

  logger.info("Installing frontend dependencies...");

  let command: string = context.pkgManager;
  let args = ["install"];

  const useLocalPackageManager = await isPackageManagerAvailable(
    context.pkgManager,
  );

  if (!useLocalPackageManager) {
    logger.warn(
      `'${context.pkgManager}' not found locally. Attempting to use Docker as a fallback.`,
    );

    const builtSuccessfully = await tryBuildDockerImage(
      nodeImageTag,
      nodeDockerImagePath,
    );

    if (builtSuccessfully) {
      command = "docker";
      const userInfo = os.userInfo();
      const userArgs =
        userInfo?.uid !== -1 ? ["-u", `${userInfo.uid}:${userInfo.gid}`] : [];

      args = [
        "run",
        "--rm",
        "-v",
        buildVolumeArg(),
        ...userArgs,
        nodeImageTag,
        context.pkgManager,
        "install",
      ];
    } else {
      logger.warn(
        `Could not build Docker image for Node.js. Falling back to local '${context.pkgManager}'.`,
      );
    }
  } else if (context.pkgManager === "yarn") {
    await fs.writeFile(path.join(projectDir, "yarn.lock"), "", {
      encoding: "utf-8",
    });
  }

  try {
    const installSpinner = await runCommand(command, args, projectDir);

    (installSpinner ?? ora()).succeed(
      colorize("success", "Frontend dependencies installed successfully.\n"),
    );
  } catch {
    // For frontend, we warn but don't exit the process
    logger.warn("Skipping frontend dependency installation due to an error.");
  }
}

async function installPythonDependencies(
  uvImageTag: string,
  uvDockerImagePath: string,
) {
  logger.info("Installing Python dependencies...");

  let command = "uv";
  const baseArgs = ["add", "--no-sync"];

  const useLocalPackageManager = await isPackageManagerAvailable("uv");
  if (!useLocalPackageManager) {
    logger.warn(
      "'uv' not found locally. Attempting to use Docker as a fallback.",
    );

    const builtSuccessfully = await tryBuildDockerImage(
      uvImageTag,
      uvDockerImagePath,
    );

    if (builtSuccessfully) {
      command = "docker";
      baseArgs.unshift("run", "--rm", "-v", buildVolumeArg(), uvImageTag, "uv");
    } else {
      logger.warn(
        "Could not build Docker image for uv. Falling back to local 'uv'.",
      );
    }
  }

  // Install production dependencies
  const installProdSpinner = await runCommand(command, [
    ...baseArgs,
    "-r",
    "requirements/production.txt",
  ]);

  (installProdSpinner ?? ora()).succeed(
    colorize("success", "Production dependencies installed successfully."),
  );

  // Install local (development) dependencies
  const installDevSpinner = await runCommand(command, [
    ...baseArgs,
    "--dev",
    "-r",
    "requirements/local.txt",
  ]);

  (installDevSpinner ?? ora()).succeed(
    colorize("success", "Local dependencies installed successfully.\n"),
  );
}

async function syncPythonDependencies(uvImageTag: string) {
  logger.info("Syncing Python dependencies...");

  let command = "uv";
  const args = ["sync"];

  const useLocalPackageManager = await isPackageManagerAvailable("uv");
  if (!useLocalPackageManager) {
    logger.warn(
      "'uv' not found locally. Attempting to use Docker as a fallback.",
    );

    command = "docker";
    args.unshift("run", "--rm", "-v", buildVolumeArg(), uvImageTag, "uv");
  }

  try {
    // Sync dependencies
    const syncSpinner = await runCommand(command, args);
    (syncSpinner ?? ora()).succeed(
      colorize("success", "Python dependencies synced successfully.\n"),
    );
  } catch (error) {
    logger.warn("Skipping Python dependency sync due to an error.");
    logger.error(
      `Python dependency sync failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    if (error instanceof Error && error.stack) {
      logger.error(error.stack);
    }
  }
}

export async function setupDependencies(
  context: Context,
  projectRootDir: string,
) {
  const spinner = ora(
    colorize("info", "Installing dependencies, this might take a while...\n"),
  ).start();

  const composeFolder = path.join(projectRootDir, "compose", "local", "runner");

  // Constants for configuration
  const DOCKER_FILES = {
    uv: path.join(composeFolder, "uv.Dockerfile"),
    node: path.join(composeFolder, "node.Dockerfile"),
  };
  const DOCKER_TAGS = {
    uv: "dkcutter-django-uv-runner:latest",
    node: "dkcutter-django-node-runner:latest",
  };

  try {
    spinner.stopAndPersist();

    if (context.haveNodePackages && context.installDependencies) {
      await installFrontendDependencies(
        context,
        DOCKER_TAGS.node,
        DOCKER_FILES.node,
        projectRootDir,
      );
    }

    await installPythonDependencies(DOCKER_TAGS.uv, DOCKER_FILES.uv);
    if (context.installDependencies) {
      await syncPythonDependencies(DOCKER_TAGS.uv);
    }

    spinner.start();
    // Cleanup
    await fs.remove(path.join(projectRootDir, "requirements"));
    await fs.remove(composeFolder);

    spinner.succeed(
      colorize("success", "Dependencies installed successfully."),
    );
  } catch {
    spinner.fail(colorize("error", "Failed to install dependencies."));
    process.exit(1);
  }
}
