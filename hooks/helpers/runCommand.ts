import type { SpawnOptions } from "node:child_process";
import { colorize, spinner } from "dkcutter/utils";
import { x } from "tinyexec";

interface RunCommandProps {
  cmd: string;
  args: string[];
  projectDir?: string;
  stdout?: SpawnOptions["stdio"];
  successText?: string;
  failText?: string | ((error: Error) => string);
  env?: Partial<Record<string, string>>;
}

function failFunction(
  error: Error,
  failText?: string | ((error: Error) => string),
) {
  return colorize(
    "error",
    failText
      ? typeof failText === "function"
        ? failText(error)
        : failText
      : error.message,
  );
}

export async function runCommand({
  cmd,
  args = [],
  projectDir,
  stdout = "pipe",
  successText,
  failText,
  env = {},
}: RunCommandProps) {
  const cmdWithArgs = `${cmd} ${args.join(" ")}`;

  spinner.setText(`Running ${cmdWithArgs}...`);
  !spinner.running && spinner.start();

  const { process } = x(cmd, args, {
    nodeOptions: { cwd: projectDir, stdio: stdout, env },
  });

  await new Promise<void>((resolve, reject) => {
    process?.on("close", (code, signal) => {
      if (code === 0) {
        spinner.succeed(
          colorize(
            "success",
            successText || `${cmdWithArgs} completed successfully.`,
          ),
        );
        resolve();
      } else {
        const error = new Error(
          `Command failed with code ${code} and signal ${signal}`,
        );
        spinner.fail(failFunction(error, failText));
        reject(error);
      }
    });

    process?.on("error", (error) => {
      spinner.fail(failFunction(error, failText));
      reject(error);
    });
  });
}
