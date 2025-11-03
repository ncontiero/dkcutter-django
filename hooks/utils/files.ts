import fs from "fs-extra";

export async function appendToGitignore(gitignorePath: string, lines: string) {
  await fs.appendFile(gitignorePath, lines);
}

export async function removeFiles(files: string[]) {
  await Promise.all(files.map((file) => fs.remove(file)));
}
