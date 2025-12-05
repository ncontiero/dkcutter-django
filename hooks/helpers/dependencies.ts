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
    await runCommand({
      cmd: "docker",
      args: ["build", "--load", "-t", tag, "-f", dockerfilePath, "."],
      env: { DOCKER_BUILDKIT: "1" },
      successText: `Docker image ${tag} built successfully.`,
      failText: (error) => `Failed to build Docker image ${tag}:\n${error}`,
    });

    return true;
  } catch {
    return false;
  }
}

async function installFrontendDependencies(
  context: Context,
  nodeImageTag: string,
  nodeDockerImagePath: string,
  projectDir: string,
) {
  if (!context.haveNodePackages || !context.installFrontendDeps) {
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
    await runCommand({
      cmd: command,
      args,
      projectDir,
      successText: "Frontend dependencies installed successfully.\n",
      failText: (error) =>
        `Skipping frontend dependency installation due to an error:\n${error}`,
    });
  } catch {
    // For frontend, we warn but don't exit the process
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
  await runCommand({
    cmd: command,
    args: [...baseArgs, "-r", "requirements/production.txt"],
    successText: "Production dependencies installed successfully.",
    failText: (error) =>
      `Production dependencies installation failed:\n${error}`,
  });

  // Install local (development) dependencies
  await runCommand({
    cmd: command,
    args: [...baseArgs, "--dev", "-r", "requirements/local.txt"],
    successText: "Local dependencies installed successfully.\n",
    failText: (error) => `Local dependencies installation failed:\n${error}`,
  });
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

    if (context.haveNodePackages && context.installFrontendDeps) {
      await installFrontendDependencies(
        context,
        DOCKER_TAGS.node,
        DOCKER_FILES.node,
        projectRootDir,
      );
    }

    await installPythonDependencies(DOCKER_TAGS.uv, DOCKER_FILES.uv);

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
