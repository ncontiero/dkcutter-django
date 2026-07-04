import fs from "node:fs/promises";
import path from "node:path";
import { EXCLUDED_DIRS, PATTERN } from "./constants";

/**
 * Build a list containing absolute paths to the generated files.
 */
export async function buildFilesList(baseDir: string) {
  const files = await fs.readdir(baseDir);
  const paths: string[] = [];
  files.forEach(async (file) => {
    if (EXCLUDED_DIRS.includes(file)) {
      return;
    }

    const filePath = path.join(baseDir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      paths.push(...(await buildFilesList(filePath)));
    } else {
      paths.push(filePath);
    }
  });
  return paths;
}

/**
 * Method to check all paths have correct substitutions.
 */
export async function checkPaths(paths: string[]) {
  for (const path of paths) {
    const content = await fs.readFile(path, "utf-8");
    const matches = content.match(PATTERN);
    if (matches) {
      throw new Error(
        `Found match in ${path} at line ${matches.index} with value ${matches[0]}`,
      );
    }
  }
}

export interface Combination {
  [key: string]: string | boolean | undefined;
}

/**
 * Construct the args for the project.
 */
export function constructArgs(combination: Combination, toolToInsert?: string) {
  const args: string[] = [];
  let name = "";
  if (!("additionalTools" in combination) && toolToInsert) {
    combination.additionalTools = "";
  }
  for (const [item, value] of Object.entries(combination)) {
    name += `${item}_${value}_`.replaceAll(" ", "");
    let newValue = String(value);
    if (toolToInsert && item === "additionalTools") {
      newValue = newValue ? `${newValue},${toolToInsert}` : toolToInsert;
    }
    args.push(`--${item}`, newValue);
  }
  const testName = name.slice(0, -1).toLowerCase().replaceAll(",", "_");
  const projectSlug = testName
    .slice(0, 15)
    .concat(Math.random().toString().slice(2, 7));
  args.unshift("--projectSlug", projectSlug);
  args.push("--installFrontendDeps", "false", "--initializeGit", "false");
  return { args, testName, slug: projectSlug };
}
