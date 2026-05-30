import fs from "node:fs/promises";
import { remove } from "dkcutter/utils";

export async function appendToGitignore(gitignorePath: string, lines: string) {
  await fs.appendFile(gitignorePath, lines);
}

export async function removeFiles(files: string[]) {
  await Promise.all(files.map((file) => remove(file)));
}
