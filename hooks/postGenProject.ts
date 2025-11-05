import type {
  AdditionalTools,
  AutomatedDepsUpdater,
  Context,
  FrontendPipeline,
  FrontendPipelineLang,
  PackageManager,
} from "./utils/types";

import path from "node:path";
import fs from "fs-extra";

import { setupDependencies } from "./helpers/dependencies";
import { initializeGit, stageAndCommit } from "./helpers/git";
import { logNextSteps } from "./helpers/logNextSteps";
import { toBoolean } from "./utils/coerce";
import { appendToGitignore, removeFiles } from "./utils/files";
import { getPkgManagerVersion } from "./utils/getPkgManagerVersion";
import { logger } from "./utils/logger";
import { setFlag } from "./utils/setFlag";
import { generateRandomString } from "./utils/string";
import { updatePackageJson } from "./utils/updatePackageJson";

const context: Context = {
  projectSlug: "{{ dkcutter.projectSlug }}",
  pkgManager: "{{ dkcutter._pkgManager }}" as PackageManager,
  pkgRun: "{{ dkcutter._pkgRun }}",
  cloudProvider: "{{ dkcutter.cloudProvider }}",
  restFramework: "{{ dkcutter.restFramework }}",
  frontendPipeline: "{{ dkcutter.frontendPipeline }}" as FrontendPipeline,
  frontendPipelineLang:
    "{{ dkcutter.frontendPipelineLang }}" as FrontendPipelineLang,
  additionalTools:
    "{{ dkcutter.additionalTools }}" as unknown as AdditionalTools,
  useTailwindInReactEmail: toBoolean("{{ dkcutter.useTailwindInReactEmail }}"),
  useCelery: toBoolean("{{ 'celery' in dkcutter.additionalTools }}"),
  automatedDepsUpdater:
    "{{ dkcutter.automatedDepsUpdater }}" as AutomatedDepsUpdater,
  installFrontendDeps: toBoolean("{{ dkcutter.installFrontendDeps }}"),
  initializeGit: toBoolean("{{ dkcutter.initializeGit }}"),
  haveNodePackages: toBoolean("{{ dkcutter._haveNodePackages }}"),
};

const TEMPLATE_REPO = "ncontiero/dkcutter-django";

const projectRootDir = path.resolve(".");
const projectDir = path.resolve(context.projectSlug);
const srcFolder = path.join(projectDir, "src");
const staticFolder = path.join(projectDir, "static");

const webpackConfigFolder = path.join(projectRootDir, "webpack");
const rspackConfigFolder = path.join(projectRootDir, "rspack");

async function handleReactEmailSetup({
  scripts,
}: {
  scripts: Record<string, string>;
}) {
  const buildScript = scripts.build;
  const devScript = scripts.dev;

  const emailCMD: string[] = [context.pkgManager];
  const workspace = `@${context.projectSlug}/emails`;
  switch (context.pkgManager) {
    case "npm":
      emailCMD.push("run", "-w", workspace);
      break;
    case "pnpm":
    case "bun":
      emailCMD.push(`--filter=${workspace}`, "run");
      break;
    case "yarn":
      emailCMD.push("workspace", workspace);
      break;
  }

  const cmd = emailCMD.join(" ");
  scripts = {
    build: buildScript,
    "build:email": `${cmd} export`,
    dev: devScript,
    "dev:email": `${cmd} dev`,
  };

  const emailsFolder = path.join(projectRootDir, "emails");
  const emailsComponents = path.join(emailsFolder, "components");
  const emailsComponentsTailwind = path.join(
    emailsFolder,
    "components-with-tailwind",
  );
  if (context.useTailwindInReactEmail) {
    await fs.remove(emailsComponents);
    await fs.move(emailsComponentsTailwind, emailsComponents);
  } else {
    await fs.remove(emailsComponentsTailwind);
    await fs.remove(path.join(emailsFolder, "utils"));
  }

  return scripts;
}

async function handleFrontendPipelineAndTools(
  choice: FrontendPipeline,
  lang: FrontendPipelineLang,
  tools: AdditionalTools,
) {
  let scripts: Record<string, string> = {};
  const removeDevDeps = [];
  const removeKeys = [];
  const filesToRemove = [];

  const removeWebpack = () => {
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
    filesToRemove.push(webpackConfigFolder);
  };
  const removeRspack = () => {
    removeDevDeps.push("@rspack/cli", "@rspack/core");
    filesToRemove.push(rspackConfigFolder);
  };
  const removeStaticFiles = () => {
    filesToRemove.push(
      path.join(staticFolder, "css"),
      path.join(staticFolder, "js"),
    );
  };

  const configFilesExt = lang === "js" ? "mjs" : "ts";

  if (choice === "Rspack") {
    scripts = {
      build: `rspack build -c rspack/prod.config.${configFilesExt}`,
      dev: `rspack serve -c rspack/dev.config.${configFilesExt}`,
    };

    const filesToMove = ["prod.config.mjs", "prod.config.ts"];
    await Promise.all(
      filesToMove.map((file) =>
        fs.move(
          path.join(path.resolve("webpack"), file),
          path.join(path.resolve("rspack"), file),
        ),
      ),
    );

    removeWebpack();
    removeStaticFiles();
  } else if (choice === "Webpack") {
    scripts = {
      build: `webpack --config webpack/prod.config.${configFilesExt}`,
      dev: `webpack serve --config webpack/dev.config.${configFilesExt}`,
    };

    if (lang === "js") {
      removeDevDeps.push("@babel/preset-typescript");
    }
    removeRspack();
    removeStaticFiles();
  } else {
    removeWebpack();
    removeRspack();
    removeDevDeps.push(
      "autoprefixer",
      "postcss",
      "postcss-loader",
      "postcss-preset-env",
      "webpack-bundle-tracker",
      "webpack-merge",
    );
    removeKeys.push("browserslist");
    filesToRemove.push("postcss.config.mjs");
  }

  if (!tools.includes("tailwindcss")) {
    removeDevDeps.push("tailwindcss", "@tailwindcss/postcss");
  } else {
    removeDevDeps.push("autoprefixer", "postcss-preset-env");
  }

  if (tools.includes("reactEmail")) {
    scripts = await handleReactEmailSetup({ scripts });
  } else {
    filesToRemove.push("pnpm-workspace.yaml", "emails");
    removeKeys.push("workspaces");
  }

  if (tools.includes("eslint")) {
    scripts.lint = "eslint .";
    scripts["lint:fix"] = "eslint . --fix";
  } else {
    filesToRemove.push("eslint.config.mjs");
    removeDevDeps.push("@ncontiero/eslint-config", "eslint");
  }

  const configFilesToRemoveExt = lang === "ts" ? "mjs" : "ts";
  const configFilesToRemove = [
    `common.config.${configFilesToRemoveExt}`,
    `dev.config.${configFilesToRemoveExt}`,
    `prod.config.${configFilesToRemoveExt}`,
  ];
  configFilesToRemove.forEach((file) => {
    filesToRemove.push(
      path.join(webpackConfigFolder, file),
      path.join(rspackConfigFolder, file),
    );
  });

  const filesToRemoveExt = lang === "ts" ? "js" : "ts";
  filesToRemove.push(
    path.join(srcFolder, `index.${filesToRemoveExt}`),
    path.join(srcFolder, `vendors.${filesToRemoveExt}`),
  );

  if (lang === "js") {
    filesToRemove.push("tsconfig.json");
    removeDevDeps.push("ts-node", "typescript");
  }

  await removeFiles(filesToRemove);

  await updatePackageJson({
    projectDir: projectRootDir,
    scripts,
    removeDevDeps,
    keys: removeKeys,
  });
}

async function setDjangoSecretKey(filePath: string) {
  return await setFlag({ filePath, flag: "!!!SET DJANGO_SECRET_KEY!!!" });
}
async function setDjangoAdminUrl(filePath: string) {
  return await setFlag({
    filePath,
    flag: "!!!SET DJANGO_ADMIN_URL!!!",
    length: 32,
    formatted: "{}/",
  });
}
function generateRandomUser() {
  return generateRandomString(32);
}
async function setPostgresUser(filePath: string, value: string) {
  return await setFlag({
    filePath,
    flag: "!!!SET POSTGRES_USER!!!",
    value,
  });
}
async function setPostgresPassword(filePath: string, value?: string) {
  return await setFlag({
    filePath,
    flag: "!!!SET POSTGRES_PASSWORD!!!",
    value,
  });
}
async function setCeleryFlowerUser(filePath: string, value: string) {
  return await setFlag({
    filePath,
    flag: "!!!SET CELERY_FLOWER_USER!!!",
    value,
  });
}
async function setCeleryFlowerPassword(filePath: string, value?: string) {
  return await setFlag({
    filePath,
    flag: "!!!SET CELERY_FLOWER_PASSWORD!!!",
    value,
  });
}

async function setFlagsInEnvs(postgresUser: string, celeryFlowerUser: string) {
  const localDjangoEnvsPath = path.join(".envs", ".local", ".django");
  const prodDjangoEnvsPath = path.join(".envs", ".production", ".django");
  const localPostgresEnvsPath = path.join(".envs", ".local", ".postgres");
  const ProdPostgresEnvsPath = path.join(".envs", ".production", ".postgres");

  await setDjangoSecretKey(prodDjangoEnvsPath);
  await setDjangoAdminUrl(prodDjangoEnvsPath);

  await setPostgresUser(localPostgresEnvsPath, postgresUser);
  await setPostgresPassword(localPostgresEnvsPath);
  await setPostgresUser(ProdPostgresEnvsPath, postgresUser);
  await setPostgresPassword(ProdPostgresEnvsPath);

  await setCeleryFlowerUser(localDjangoEnvsPath, celeryFlowerUser);
  await setCeleryFlowerPassword(localDjangoEnvsPath);
  await setCeleryFlowerUser(prodDjangoEnvsPath, celeryFlowerUser);
  await setCeleryFlowerPassword(prodDjangoEnvsPath);
}

async function setFlagsInSettings() {
  const settingsPath = path.join("config", "settings");
  await setDjangoSecretKey(path.join(settingsPath, "local.py"));
  await setDjangoSecretKey(path.join(settingsPath, "test.py"));
}

async function main() {
  setFlagsInEnvs(generateRandomUser(), generateRandomUser());
  setFlagsInSettings();

  const gitignorePath = path.resolve(".gitignore");
  await appendToGitignore(gitignorePath, "\n.env\n.envs/*\n");

  const filesToRemove = [];

  if (context.cloudProvider !== "AWS") {
    filesToRemove.push(path.join("compose", "production", "aws"));
  }

  if (context.frontendPipeline === "None") {
    filesToRemove.push(
      rspackConfigFolder,
      webpackConfigFolder,
      "postcss.config.mjs",
    );

    await fs.move(
      path.join(srcFolder, "index.css"),
      path.join(staticFolder, "css", "index.css"),
      { overwrite: true },
    );
    filesToRemove.push(srcFolder);

    if (!context.additionalTools.includes("reactEmail")) {
      filesToRemove.push(
        "package.json",
        "tsconfig.json",
        "eslint.config.mjs",
        ".nvmrc",
        ".yarnrc.yml",
        "pnpm-workspace.yaml",
        "emails",
        path.join("compose", "local", "node"),
      );
    }
  }

  if (context.haveNodePackages) {
    const pkgVersion = await getPkgManagerVersion(context.pkgManager);
    if (pkgVersion) {
      await updatePackageJson({
        projectDir: projectRootDir,
        modifyKey: { packageManager: pkgVersion },
      });
    } else {
      await updatePackageJson({
        projectDir: projectRootDir,
        keys: ["packageManager"],
      });
    }

    if (context.pkgManager === "bun") {
      logger.break();
      logger.warn(
        "Bun's Node.js compatibility is a work in progress. You might face issues with tools like Webpack or other Node.js tools.",
      );
      logger.warn(
        "If you encounter issues, check Bun's compatibility documentation: https://bun.sh/docs/runtime/nodejs-compat",
      );
      logger.break();
    }

    const yarnFiles = [".yarnrc.yml"];
    const pnpmFiles = ["pnpm-workspace.yaml"];
    switch (context.pkgManager) {
      case "npm":
      case "bun":
        filesToRemove.push(...yarnFiles, ...pnpmFiles);
        break;
      case "yarn":
        filesToRemove.push(...pnpmFiles);
        break;
      case "pnpm":
        filesToRemove.push(...yarnFiles);
        await updatePackageJson({
          projectDir: projectRootDir,
          keys: ["workspaces"],
        });
        break;
    }

    await handleFrontendPipelineAndTools(
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
    filesToRemove.push(
      path.join("config", "celery_app.py"),
      path.join("compose", "local", "django", "celery"),
      path.join("compose", "production", "django", "celery"),
    );
  }

  if (context.restFramework === "None") {
    filesToRemove.push(
      path.join("config", "api.py"),
      path.join("tests", "test_swagger.py"),
    );
  }

  const dependabotFile = path.join(".github", "dependabot.yml");
  const renovateFile = path.join(".github", "renovate.json");
  switch (context.automatedDepsUpdater) {
    case "none":
      filesToRemove.push(renovateFile, dependabotFile);
      break;
    case "renovate":
      filesToRemove.push(dependabotFile);
      break;
    case "dependabot":
      filesToRemove.push(renovateFile);
      break;
  }

  await removeFiles(filesToRemove);

  await setupDependencies(context, projectRootDir);
  logger.break();

  if (context.initializeGit) {
    const repoInitialized = await initializeGit(projectRootDir);
    if (repoInitialized) {
      await stageAndCommit(
        projectRootDir,
        `feat: initial commit from ${TEMPLATE_REPO}`,
      );
    }
    logger.break();
  }

  await logNextSteps({
    ctx: context,
    pkgManager: context.pkgManager,
    projectDir: projectRootDir,
  });
}

main().catch((error) => {
  logger.error(`An error occurred: ${error}`);
  process.exit(1);
});
