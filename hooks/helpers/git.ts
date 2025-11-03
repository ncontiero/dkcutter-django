import path from "node:path";
import { bold, green, red, redBright } from "colorette";
import { execa } from "execa";
import fs from "fs-extra";
import ora from "ora";
import prompts from "prompts";

import { logger } from "../utils/logger";

export async function isGitInstalled(dir: string) {
  try {
    await execa("git", ["--version"], { cwd: dir });
    return true;
  } catch {
    return false;
  }
}

/** @returns Whether or not the provided directory has a `.git` subdirectory in it. */
export async function isRootGitRepo(dir: string) {
  return await fs.exists(path.join(dir, ".git"));
}

/** @returns Whether or not this directory or a parent directory has a `.git` directory. */
export async function isInsideGitRepo(dir: string) {
  try {
    // If this command succeeds, we're inside a git repo
    await execa("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd: dir,
      stdout: "ignore",
    });
    return true;
  } catch {
    // Else, it will throw a git-error and we return false
    return false;
  }
}

async function getGitVersion() {
  const stdout = (await execa("git", ["--version"])).toString().trim();
  const gitVersionTag = stdout.split(" ")[2];
  const major = gitVersionTag?.split(".")[0];
  const minor = gitVersionTag?.split(".")[1];
  return { major: Number(major), minor: Number(minor) };
}

/** @returns The git config value of "init.defaultBranch". If it is not set, returns "main". */
async function getDefaultBranch() {
  try {
    const gitConfig = await execa("git", [
      "config",
      "--get",
      "init.defaultBranch",
    ]);
    return gitConfig.stdout.toString().trim() || "main";
  } catch (error) {
    console.error(
      "Failed to get git default branch, falling back to 'main':",
      error,
    );
    return "main";
  }
}

// This initializes the Git-repository for the project
export async function initializeGit(projectDir: string) {
  logger.info("Initializing Git...");

  if (!(await isGitInstalled(projectDir))) {
    logger.warn("Git is not installed. Skipping Git initialization.");
    return;
  }

  const spinner = ora("Creating a new git repo...\n").start();

  const isRoot = await isRootGitRepo(projectDir);
  const isInside = await isInsideGitRepo(projectDir);
  const dirName = path.parse(projectDir).name; // skip full path for logging

  if (isInside && isRoot) {
    // Dir is a root git repo
    spinner.stop();
    const { overwriteGit } = await prompts({
      type: "confirm",
      name: "overwriteGit",
      message: `${bold(
        redBright("Warning:"),
      )} Git is already initialized in "${dirName}". Initializing a new git repository would delete the previous history. Would you like to continue anyways?`,
    });

    if (!overwriteGit) {
      spinner.info("Skipping Git initialization.");
      return;
    }
    // Deleting the .git folder
    await fs.remove(path.join(projectDir, ".git"));
  } else if (isInside && !isRoot) {
    // Dir is inside a git worktree
    spinner.stop();
    const { initializeChildGitRepo } = await prompts({
      type: "confirm",
      name: "initializeChildGitRepo",
      message: `${bold(
        redBright("Warning:"),
      )} "${dirName}" is already in a git worktree. Would you still like to initialize a new git repository in this directory?`,
    });
    if (!initializeChildGitRepo) {
      spinner.info("Skipping Git initialization.");
      return;
    }
  }

  // We're good to go, initializing the git repo
  try {
    const branchName = await getDefaultBranch();

    // --initial-branch flag was added in git v2.28.0
    const { major, minor } = await getGitVersion();
    if (major < 2 || (major === 2 && minor < 28)) {
      await execa("git", ["init"], { cwd: projectDir });
      // symbolic-ref is used here due to refs/heads/master not existing
      // It is only created after the first commit
      // https://superuser.com/a/1419674
      await execa("git", ["symbolic-ref", "HEAD", `refs/heads/${branchName}`], {
        cwd: projectDir,
      });
    } else {
      await execa("git", ["init", `--initial-branch=${branchName}`], {
        cwd: projectDir,
      });
    }
    await execa("git", ["add", "."], { cwd: projectDir });
    spinner.succeed(
      `${green("Successfully initialized and staged")} ${bold(green("git"))}\n`,
    );
  } catch {
    // Safeguard, should be unreachable
    spinner.fail(
      `${bold(
        red("Failed:"),
      )} could not initialize git. Update git to the latest version!\n`,
    );
  }
}

export async function stageAndCommit(projectDir: string, message: string) {
  if (!(await isGitInstalled(projectDir))) {
    logger.warn("Git is not installed. Skipping Git commit.");
    return;
  }

  const isRoot = await isRootGitRepo(projectDir);
  const isInside = await isInsideGitRepo(projectDir);
  const dirName = path.parse(projectDir).name; // skip full path for logging

  if (isInside && !isRoot) {
    // Dir is inside a git worktree
    logger.warn(
      `${bold(
        redBright("Warning:"),
      )} "${dirName}" is already in a git worktree. Skipping Git commit.`,
    );
    return;
  }

  await execa("git", ["add", "."], { cwd: projectDir });
  await execa("git", ["commit", "-m", message], { cwd: projectDir });
}
