import path from "node:path";
import fs from "fs-extra";

import { toBoolean } from "./utils/coerce";
import { logger } from "./utils/logger";
import { updatePackageJson } from "./utils/updatePackageJson";

type AutomatedDepsUpdater = "none" | "renovate" | "dependabot";
type FrontendPipeline = "None" | "Rspack" | "Webpack";
type FrontendPipelineLang = "js" | "ts";
type AdditionalTool = "tailwindcss" | "eslint";
type AdditionalTools = AdditionalTool[];

const context = {
  projectSlug: "{{ dkcutter.projectSlug }}",
  cloudProvider: "{{ dkcutter.cloudProvider }}",
  restFramework: "{{ dkcutter.restFramework }}",
  frontendPipeline: "{{ dkcutter.frontendPipeline }}" as FrontendPipeline,
  frontendPipelineLang:
    "{{ dkcutter.frontendPipelineLang }}" as FrontendPipelineLang,
  additionalTools:
    "{{ dkcutter.additionalTools }}" as unknown as AdditionalTools,
  useCelery: toBoolean("{{ 'celery' in dkcutter.additionalTools }}"),
  automatedDepsUpdater:
    "{{ dkcutter.automatedDepsUpdater }}" as AutomatedDepsUpdater,
};

const projectRootDir = path.resolve(".");
const projectDir = path.resolve(context.projectSlug);
const srcFolder = path.join(projectDir, "src");

function appendToGitignore(gitignorePath: string, lines: string) {
  fs.appendFileSync(gitignorePath, lines);
}

function removeFiles(files: string[]) {
  files.forEach((file) => fs.removeSync(file));
}

function removeSrcFolder() {
  const indexCss = path.join(srcFolder, "index.css");
  fs.moveSync(indexCss, path.join(projectDir, "static", "css", "index.css"), {
    overwrite: true,
  });
  fs.removeSync(srcFolder);
}

function removeRspackFiles() {
  fs.removeSync("rspack");
}

function moveWebpackToRspack() {
  const webpackConfigPath = path.resolve("webpack");
  const rspackConfigPath = path.resolve("rspack");

  const filesToMove = ["prod.config.mjs", "prod.config.ts"];
  filesToMove.forEach((file) => {
    const src = path.join(webpackConfigPath, file);
    const dest = path.join(rspackConfigPath, file);
    fs.moveSync(src, dest);
  });
}

function removeWebpackFiles() {
  fs.removeSync("webpack");
}

function removeLangsFiles(lang: FrontendPipelineLang) {
  const webpackConfigPath = path.resolve("webpack");
  const rspackConfigPath = path.resolve("rspack");

  const configFilesToRemove = [
    `common.config.${lang === "ts" ? "mjs" : "ts"}`,
    `dev.config.${lang === "ts" ? "mjs" : "ts"}`,
    `prod.config.${lang === "ts" ? "mjs" : "ts"}`,
  ];
  const filesToRemove = [
    path.join(srcFolder, `index.${lang === "ts" ? "js" : "ts"}`),
    path.join(srcFolder, `vendors.${lang === "ts" ? "js" : "ts"}`),
  ];

  configFilesToRemove.forEach((file) => {
    fs.removeSync(path.join(webpackConfigPath, file));
    fs.removeSync(path.join(rspackConfigPath, file));
  });
  removeFiles(filesToRemove);

  if (lang === "js") {
    fs.removeSync("tsconfig.json");
  }
}

function removeStaticCSSAndJS() {
  const staticPath = path.join(projectDir, "static");
  removeFiles([path.join(staticPath, "css"), path.join(staticPath, "js")]);
}

function removeTailwindFiles() {
  const tailwindFiles = [path.join("tailwind.config.js")];
  removeFiles(tailwindFiles);
}

function removeEslintFiles() {
  fs.removeSync("eslint.config.mjs");
}

function handleFrontendPipelineAndTools(
  choice: FrontendPipeline,
  lang: FrontendPipelineLang,
  tools: AdditionalTools,
) {
  let scripts: Record<string, string> = {};
  const removeDevDeps = [];
  const removeKeys = [];

  if (choice === "Rspack") {
    scripts = {
      build: `rspack build -c rspack/prod.config.${lang === "js" ? "mjs" : "ts"}`,
      dev: `rspack serve -c rspack/dev.config.${lang === "js" ? "mjs" : "ts"}`,
    };
    removeStaticCSSAndJS();
    moveWebpackToRspack();
    removeWebpackFiles();

    removeDevDeps.push(
      "@babel/core",
      "@babel/preset-env",
      "@babel/preset-typescript",
      "babel-loader",
      "css-loader",
      "css-minimizer-webpack-plugin",
      "mini-css-extract-plugin",
      "terser-webpack-plugin",
      "webpack",
      "webpack-cli",
      "webpack-dev-server",
    );
    removeKeys.push("babel");
  } else if (choice === "Webpack") {
    scripts = {
      build: `webpack --config webpack/prod.config.${lang === "js" ? "mjs" : "ts"}`,
      dev: `webpack serve --config webpack/dev.config.${lang === "js" ? "mjs" : "ts"}`,
    };

    if (lang === "js") {
      removeDevDeps.push("@babel/preset-typescript");
    }
    removeDevDeps.push("@rspack/cli", "@rspack/core");
    removeStaticCSSAndJS();
    removeRspackFiles();
  }

  if (!tools.includes("tailwindcss")) {
    removeTailwindFiles();
    removeDevDeps.push("tailwindcss");
  }

  if (tools.includes("eslint")) {
    scripts.lint = "eslint .";
    scripts["lint:fix"] = "eslint . --fix";
  } else {
    removeEslintFiles();
    removeDevDeps.push("@ncontiero/eslint-config", "eslint");
  }

  removeLangsFiles(lang);
  if (lang === "js") {
    removeDevDeps.push("ts-node", "typescript");
  }

  updatePackageJson({
    projectDir: projectRootDir,
    scripts,
    removeDevDeps,
    keys: removeKeys,
  });
}

function removePackageJsonFile() {
  fs.removeSync(path.join(projectRootDir, "package.json"));
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
  const gitignorePath = path.resolve(".gitignore");

  setFlagsInEnvs(generateRandomUser(), generateRandomUser());
  setFlagsInSettings();

  appendToGitignore(gitignorePath, "\n.env\n.envs/*\n");

  if (context.cloudProvider !== "AWS") {
    removeAwsDockerfile();
  }

  if (context.frontendPipeline === "None") {
    removeRspackFiles();
    removeWebpackFiles();
    removeSrcFolder();
    removeTailwindFiles();
    removeEslintFiles();
    removeNodeDockerfile();
    removePackageJsonFile();
  } else {
    handleFrontendPipelineAndTools(
      context.frontendPipeline,
      context.frontendPipelineLang,
      context.additionalTools,
    );
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
