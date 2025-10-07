import type { Context } from "../utils/types";

import os from "node:os";
import path from "node:path";
import { execa, ExecaError } from "execa";
import fs from "fs-extra";
import ora from "ora";

import { colorize, logger } from "../utils/logger";

async function runCommand(
  command: string,
  args: string[],
  failureMessage: string,
) {
  try {
    await execa(command, args);
  } catch (error) {
    logger.error(`${failureMessage}`);

    if (error instanceof ExecaError) {
      // Log the captured output only when an error occurs.
      if (error.stdout) {
        logger.error(`--- STDOUT ---\n${error.stdout}`);
      }
      if (error.stderr) {
        logger.error(`--- STDERR ---\n${error.stderr}`);
      }
    }

    throw new Error(failureMessage);
  }
}

async function tryBuildDockerImage(
  tag: string,
  dockerfilePath: string,
): Promise<boolean> {
  try {
    await execa("docker", ["build", "--load", "-t", tag, "-f", dockerfilePath, "."]);
    return true;
  } catch (error) {
    logger.error(`Failed to build Docker image ${tag}: ${error}`);
    return false;
  }
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

async function installFrontendDependencies(
  context: Context,
  nodeImageTag: string,
  nodeDockerImagePath: string,
) {
  if (
    context.frontendPipeline === "None" &&
    !context.additionalTools.includes("reactEmail")
  ) {
    return; // No action needed
  }

  let command: string = context.pkgManager;
  let args = ["install"];

  const useLocalPackageManager = await isPackageManagerAvailable(
    context.pkgManager,
  );

  if (!useLocalPackageManager) {
    logger.info(
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
        ".:/app",
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
  }

  try {
    await runCommand(command, args, "Failed to install frontend dependencies");
  } catch {
    // For frontend, we warn but don't exit the process
    logger.warn("Skipping frontend dependency installation due to an error.");
  }
}

async function installPythonDependencies(
  uvImageTag: string,
  uvDockerImagePath: string,
) {
  let command = "uv";
  const baseArgs = ["add", "--no-sync"];

  const builtSuccessfully = await tryBuildDockerImage(
    uvImageTag,
    uvDockerImagePath,
  );

  if (builtSuccessfully) {
    command = "docker";
    baseArgs.unshift("run", "--rm", "-v", ".:/app", uvImageTag, "uv");
  } else {
    logger.warn(
      "Could not build Docker image for uv. Falling back to local 'uv'.",
    );
  }

  // Install production dependencies
  await runCommand(
    command,
    [...baseArgs, "-r", "requirements/production.txt"],
    "Failed to install production dependencies",
  );

  // Install local (development) dependencies
  await runCommand(
    command,
    [...baseArgs, "--dev", "-r", "requirements/local.txt"],
    "Failed to install local dependencies",
  );
}

export async function setupDependencies(
  context: Context,
  projectRootDir: string,
) {
  const spinner = ora(
    colorize("info", "Installing dependencies, this might take a while..."),
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
    if (context.installFrontendDeps) {
      await installFrontendDependencies(
        context,
        DOCKER_TAGS.node,
        DOCKER_FILES.node,
      );
    }

    await installPythonDependencies(DOCKER_TAGS.uv, DOCKER_FILES.uv);

    // Cleanup
    await fs.remove(path.join(projectRootDir, "requirements"));
    await fs.remove(composeFolder);

    spinner.succeed(
      colorize("success", "Dependencies installed successfully."),
    );
  } catch {
    spinner.fail(
      colorize("error", "Failed to install dependencies. See logs above."),
    );
    process.exit(1);
  }
}
