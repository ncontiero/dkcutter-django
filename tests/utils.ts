import path from "node:path";
import fs from "fs-extra";
import { PATTERN } from "./constants";

/**
 * Build a list containing absolute paths to the generated files.
 */
export function buildFilesList(baseDir: string) {
  const files = fs.readdirSync(baseDir);
  const paths: string[] = [];
  files.forEach((file) => {
    const filePath = path.join(baseDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      paths.push(...buildFilesList(filePath));
    } else {
      paths.push(filePath);
    }
  });
  return paths;
}

/**
 * Method to check all paths have correct substitutions.
 */
export function checkPaths(paths: string[]) {
  for (const path of paths) {
    const content = fs.readFileSync(path, "utf-8");
    const matches = content.match(PATTERN);
    if (matches) {
      throw new Error(
        `Found match in ${path} at line ${matches.index} with value ${matches[0]}`,
      );
    }
  }
}

/**
 * Construct the args for the project.
 */
export function constructArgs(combination: { [key: string]: any }) {
  const args: string[] = [];
  let name = "";
  for (const [item, value] of Object.entries(combination)) {
    name += `${item}_${value}_`.replaceAll(" ", "");
    args.push(`--${item}`, value);
  }
  name = name.slice(0, -1);
  args.unshift("--projectName", name.toLowerCase().replaceAll(",", "_"));
  return args;
}
