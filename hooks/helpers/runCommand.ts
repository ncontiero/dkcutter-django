import { type StdoutStderrOption, execa } from "execa";
import ora, { type Ora } from "ora";

export async function execWithSpinner(
  cmd: string,
  args: string[] = [],
  stdout: StdoutStderrOption = "pipe",
  onDataHandle?: (spinner: Ora) => (data: Buffer) => void,
  projectDir?: string,
) {
  const spinner = ora(`Running ${cmd} ${args.join(" ")}...`).start();
  const subprocess = execa(cmd, args, { cwd: projectDir, stdout });

  await new Promise<void>((resolve, reject) => {
    if (onDataHandle) {
      subprocess.stdout?.on("data", onDataHandle(spinner));
    }

    subprocess.on("error", (e) => reject(e));
    subprocess.on("close", () => resolve());
  });

  return spinner;
}

export function runCommand(
  cmd: string,
  args: string[] = [],
  projectDir?: string,
): Promise<Ora> {
  return execWithSpinner(
    cmd,
    args,
    // cmd === "bun" ? "ignore" : "pipe",
    "pipe",
    undefined,
    projectDir,
  );
}
