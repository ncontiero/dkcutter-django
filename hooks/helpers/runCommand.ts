import { type StdoutStderrOption, execa } from "execa";
import { oraPromise } from "ora";
import { colorize } from "../utils/logger";

interface RunCommandProps {
  cmd: string;
  args: string[];
  projectDir?: string;
  stdout?: StdoutStderrOption;
  successText?: string;
  failText?: string | ((error: Error) => string);
  env?: Partial<Record<string, string>>;
}

export function runCommand({
  cmd,
  args = [],
  projectDir,
  stdout = "pipe",
  successText,
  failText,
  env = {},
}: RunCommandProps) {
  const cmdWithArgs = `${cmd} ${args.join(" ")}`;
  return oraPromise(execa(cmd, args, { cwd: projectDir, stdout, env }), {
    text: `Running ${cmdWithArgs}...`,
    successText: colorize(
      "success",
      successText || `${cmdWithArgs} completed successfully.`,
    ),
    failText: (error) =>
      colorize(
        "error",
        failText
          ? typeof failText === "function"
            ? failText(error)
            : failText
          : error.message,
      ),
  });
}
