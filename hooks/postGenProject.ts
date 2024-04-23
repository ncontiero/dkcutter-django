import path from "node:path";
import fs from "fs-extra";

import { logger } from "./utils/logger";
import { toBoolean } from "./utils/coerce";

type AutomatedDepsUpdater = "none" | "renovate" | "dependabot";

const context = {
  projectSlug: "{{ dkcutter.projectSlug }}",
  cloudProvider: "{{ dkcutter.cloudProvider }}",
  restFramework: "{{ dkcutter.restFramework }}",
  useTailwindcss: toBoolean("{{ dkcutter.useTailwindcss }}"),
  useCelery: toBoolean("{{ dkcutter.useCelery }}"),
  automatedDepsUpdater:
    "{{ dkcutter.automatedDepsUpdater }}" as AutomatedDepsUpdater,
};

function appendToGitignore(gitignorePath: string, lines: string) {
  fs.appendFileSync(gitignorePath, lines);
}

function removeFiles(files: string[]) {
  files.forEach((file) => fs.removeSync(file));
}

function removeTailwindFiles(projectDir: string) {
  const tailwindFiles = [
    path.join("tailwind.config.js"),
    path.join(projectDir, "tailwind.css"),
  ];
  removeFiles(tailwindFiles);
}

function handleUseTailwind(projectDir: string) {
  removeTailwindFiles(projectDir);
  fs.removeSync("package.json");
}

function removeCeleryFiles() {
  const celeryFiles = [path.join("config", "celery_app.py")];
  removeFiles(celeryFiles);
}

function handleAutomatedDepsUpdater(option: AutomatedDepsUpdater) {
  const githubFolder = path.resolve(".github");
  const filesToRemove = [];
  switch (option) {
    case "none":
      filesToRemove.push(
        path.join(githubFolder, "renovate.json"),
        path.join(githubFolder, "dependabot.yml"),
      );
      break;
    case "renovate":
      filesToRemove.push(path.join(githubFolder, "dependabot.yml"));
      break;
    case "dependabot":
      filesToRemove.push(path.join(githubFolder, "renovate.json"));
      break;
  }
  removeFiles(filesToRemove);
}

function generateRandomString(n: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * characters.length);
    result += characters.charAt(index);
  }
  return result;
}

type SetFlag = {
  filePath: string;
  flag: string;
  length?: number;
  value?: string;
  formatted?: string;
};
function setFlag({ filePath, flag, value, formatted, length = 64 }: SetFlag) {
  if (!value) {
    let randomString = generateRandomString(length);
    if (formatted) {
      randomString = formatted.replace("{}", randomString);
    }
    value = `${randomString}`;
  }
  const fileContent = fs.readFileSync(filePath, "utf8").replace(flag, value);
  fs.writeFileSync(filePath, fileContent);
  return value;
}

function setDjangoSecretKey(filePath: string) {
  return setFlag({ filePath, flag: "!!!SET DJANGO_SECRET_KEY!!!" });
}
function setDjangoAdminUrl(filePath: string) {
  return setFlag({
    filePath,
    flag: "!!!SET DJANGO_ADMIN_URL!!!",
    length: 32,
    formatted: "{}/",
  });
}
function generateRandomUser() {
  return generateRandomString(32);
}
function setPostgresUser(filePath: string, value: string) {
  return setFlag({
    filePath,
    flag: "!!!SET POSTGRES_USER!!!",
    value,
  });
}
function setPostgresPassword(filePath: string, value?: string) {
  return setFlag({ filePath, flag: "!!!SET POSTGRES_PASSWORD!!!", value });
}
function setCeleryFlowerUser(filePath: string, value: string) {
  return setFlag({ filePath, flag: "!!!SET CELERY_FLOWER_USER!!!", value });
}
function setCeleryFlowerPassword(filePath: string, value?: string) {
  return setFlag({
    filePath,
    flag: "!!!SET CELERY_FLOWER_PASSWORD!!!",
    value,
  });
}

function setFlagsInEnvs(postgresUser: string, celeryFlowerUser: string) {
  const localDjangoEnvsPath = path.join(".envs", ".local", ".django");
  const prodDjangoEnvsPath = path.join(".envs", ".production", ".django");
  const localPostgresEnvsPath = path.join(".envs", ".local", ".postgres");
  const ProdPostgresEnvsPath = path.join(".envs", ".production", ".postgres");

  setDjangoSecretKey(prodDjangoEnvsPath);
  setDjangoAdminUrl(prodDjangoEnvsPath);

  setPostgresUser(localPostgresEnvsPath, postgresUser);
  setPostgresPassword(localPostgresEnvsPath);
  setPostgresUser(ProdPostgresEnvsPath, postgresUser);
  setPostgresPassword(ProdPostgresEnvsPath);

  setCeleryFlowerUser(localDjangoEnvsPath, celeryFlowerUser);
  setCeleryFlowerPassword(localDjangoEnvsPath);
  setCeleryFlowerUser(prodDjangoEnvsPath, celeryFlowerUser);
  setCeleryFlowerPassword(prodDjangoEnvsPath);
}

function setFlagsInSettings() {
  const settingsPath = path.join("config", "settings");
  setDjangoSecretKey(path.join(settingsPath, "local.py"));
  setDjangoSecretKey(path.join(settingsPath, "test.py"));
}

function removeCeleryComposeDirs() {
  const celeryFiles = [
    path.join("compose", "local", "django", "celery"),
    path.join("compose", "production", "django", "celery"),
  ];
  removeFiles(celeryFiles);
}
function removeAwsDockerfile() {
  const awsFiles = [path.join("compose", "production", "aws")];
  removeFiles(awsFiles);
}
function removeNodeDockerfile() {
  const nodeFiles = [path.join("compose", "local", "node")];
  removeFiles(nodeFiles);
}
function removeApiStarterFiles() {
  const apiStarterFiles = [
    path.join("config", "api.py"),
    path.join("tests", "test_swagger.py"),
  ];
  removeFiles(apiStarterFiles);
}

function main() {
  const projectDir = path.resolve(context.projectSlug);
  const gitignorePath = path.resolve(".gitignore");

  setFlagsInEnvs(generateRandomUser(), generateRandomUser());
  setFlagsInSettings();

  appendToGitignore(gitignorePath, ".env");
  appendToGitignore(gitignorePath, ".envs/*");

  if (context.cloudProvider !== "AWS") {
    removeAwsDockerfile();
  }

  if (!context.useTailwindcss) {
    handleUseTailwind(projectDir);
    removeNodeDockerfile();
  }

  if (context.cloudProvider === "None") {
    logger.warn(
      "You chose to not use any cloud providers, media files won't be served in production.",
    );
  }

  if (!context.useCelery) {
    removeCeleryFiles();
    removeCeleryComposeDirs();
  }

  if (context.restFramework === "None") {
    removeApiStarterFiles();
  }

  handleAutomatedDepsUpdater(context.automatedDepsUpdater);

  logger.success("Project initialized, keep up the good work!");
}

main();
