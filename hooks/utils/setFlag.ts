import type { SetFlagProps } from "./types";
import fs from "fs-extra";
import { generateRandomString } from "./string";

export async function setFlag({
  filePath,
  flag,
  value,
  formatted,
  length = 64,
}: SetFlagProps) {
  if (!value) {
    let randomString = generateRandomString(length);
    if (formatted) {
      randomString = formatted.replace("{}", randomString);
    }
    value = randomString;
  }
  const fileContent = (await fs.readFile(filePath, "utf8")).replace(
    flag,
    value,
  );
  await fs.writeFile(filePath, fileContent);
  return value;
}
