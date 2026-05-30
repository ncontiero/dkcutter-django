import path from "node:path";
import { bold, redBright } from "colorette";
import { colorize, logger, pathExists, remove, spinner } from "dkcutter/utils";
import prompts from "prompts";
import { x } from "tinyexec";

export async function isGitInstalled(dir: string) {
  try {
    const { exitCode } = await x("git", ["--version"], {
      nodeOptions: { cwd: dir },
    });
    return exitCode === 0;
  } catch {
    return false;
  }
}

/** @returns Whether or not the provided directory has a `.git` subdirectory in it. */
export async function isRootGitRepo(dir: string) {
  return await pathExists(path.join(dir, ".git"));
}

/** @returns Whether or not this directory or a parent directory has a `.git` directory. */
export async function isInsideGitRepo(dir: string) {
  try {
    // If this command succeeds, we're inside a git repo
    const { exitCode } = await x(
      "git",
      ["rev-parse", "--is-inside-work-tree"],
      { nodeOptions: { cwd: dir, stdio: "ignore" } },
    );
    return exitCode === 0;
  } catch {
    // Else, it will throw a git-error and we return false
    return false;
  }
}

async function getGitVersion() {
  const { stdout } = await x("git", ["--version"]);
  const gitVersionTag = stdout.toString().trim().split(" ")[2];
  const major = gitVersionTag?.split(".")[0];
  const minor = gitVersionTag?.split(".")[1];
  return { major: Number(major), minor: Number(minor) };
}

/** @returns The git config value of "init.defaultBranch". If it is not set, returns "main". */
async function getDefaultBranch() {
  try {
    const { stdout } = await x("git", [
      "config",
      "--get",
      "init.defaultBranch",
    ]);
    return stdout.toString().trim() || "main";
  } catch (error) {
    console.error(
      "Failed to get git default branch, falling back to 'main':",
      error,
    );
    return "main";
  }
}

/**
 *This initializes the Git-repository for the project
 * @param projectDir The directory of the project.
 * @returns Whether or not the git repo was initialized.
 */
export async function initializeGit(projectDir: string) {
  logger.info("Initializing Git...");

  if (!(await isGitInstalled(projectDir))) {
    logger.warn("Git is not installed. Skipping Git initialization.");
    return false;
  }

  spinner.setText("Creating a new git repo...");
  !spinner.running && spinner.start();

  const isRoot = await isRootGitRepo(projectDir);
  const isInside = await isInsideGitRepo(projectDir);
  const dirName = path.parse(projectDir).name; // skip full path for logging

  if (isInside && isRoot) {
    // Dir is a root git repo
    spinner.stop();
    const { overwriteGit } = (await prompts({
      type: "confirm",
      name: "overwriteGit",
      message: `${bold(
        redBright("Warning:"),
      )} Git is already initialized in "${dirName}". Initializing a new git repository would delete the previous history. Would you like to continue anyways?`,
    })) as { overwriteGit: boolean };

    if (!overwriteGit) {
      spinner.info("Skipping Git initialization.");
      return false;
    }
    // Deleting the .git folder
    await remove(path.join(projectDir, ".git"));
  } else if (isInside && !isRoot) {
    // Dir is inside a git worktree
    spinner.stop();
    const { initializeChildGitRepo } = (await prompts({
      type: "confirm",
      name: "initializeChildGitRepo",
      message: `${bold(
        redBright("Warning:"),
      )} "${dirName}" is already in a git worktree. Would you still like to initialize a new git repository in this directory?`,
    })) as { initializeChildGitRepo: boolean };
    if (!initializeChildGitRepo) {
      spinner.info("Skipping Git initialization.");
      return false;
    }
  }

  // We're good to go, initializing the git repo
  try {
    const branchName = await getDefaultBranch();

    // --initial-branch flag was added in git v2.28.0
    const { major, minor } = await getGitVersion();
    if (major < 2 || (major === 2 && minor < 28)) {
      await x("git", ["init"], { nodeOptions: { cwd: projectDir } });
      // symbolic-ref is used here due to refs/heads/master not existing
      // It is only created after the first commit
      // https://superuser.com/a/1419674
      await x("git", ["symbolic-ref", "HEAD", `refs/heads/${branchName}`], {
        nodeOptions: { cwd: projectDir },
      });
    } else {
      await x("git", ["init", `--initial-branch=${branchName}`], {
        nodeOptions: { cwd: projectDir },
      });
    }
    await x("git", ["add", "."], { nodeOptions: { cwd: projectDir } });
    spinner.succeed(
      colorize("success", "Successfully initialized and staged git."),
    );
    logger.break();
    return true;
  } catch {
    // Safeguard, should be unreachable
    spinner.fail(
      colorize(
        "error",
        "Failed: could not initialize git. Update git to the latest version!",
      ),
    );
    logger.break();
    return false;
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
      `Warning: ${dirName} is already in a git worktree. Skipping Git commit.`,
    );
    return;
  }

  await x("git", ["add", "."], { nodeOptions: { cwd: projectDir } });
  await x("git", ["commit", "-m", message], {
    nodeOptions: { cwd: projectDir },
  });
}
