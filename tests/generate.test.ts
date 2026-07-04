import { resolve } from "node:path";
import { emptyDir, pathExists, remove } from "dkcutter/utils";
import { x } from "tinyexec";
import { glob } from "tinyglobby";
import { afterAll, beforeAll, it as vitestIt } from "vitest";
import {
  INVALID_SLUGS,
  SUPPORTED_COMBINATIONS,
  UNSUPPORTED_COMBINATIONS,
} from "./constants";
import {
  type Combination,
  buildFilesList,
  checkPaths,
  constructArgs,
} from "./utils";

const TEST_OUTPUT = resolve(".test");

const isWindows = process.platform === "win32";
const TIMEOUT = isWindows ? 300_000 : 150_000;

beforeAll(async () => {
  await emptyDir(TEST_OUTPUT);
});
afterAll(async () => {
  await remove(TEST_OUTPUT);
}, TIMEOUT);

const it = vitestIt.extend<{
  supportedOptions: string[];
  unsupportedOptions: string[];
  invalidSlugs: string[];
}>({
  supportedOptions: [],
  unsupportedOptions: [],
  invalidSlugs: [],
});

function runProjectCheckTest(combination: Combination) {
  const runTypeCheck = process.env.RUN_TYPE_CHECK === "true";
  const { args, testName, slug } = constructArgs(
    combination,
    runTypeCheck ? "eslint-ts" : undefined,
  );
  it.concurrent(
    testName,
    async ({ supportedOptions }) => {
      const target = resolve(TEST_OUTPUT, slug);

      // Generate the project
      await x("bun", ["run", "generate", "-o", TEST_OUTPUT, ...args, "-y"], {
        nodeOptions: { cwd: TEST_OUTPUT },
        throwOnError: true,
      });

      // Check that the project was generated
      const paths = await buildFilesList(target);
      checkPaths(paths);

      // Check that the project is linted
      await x("ruff", ["check", "."], {
        nodeOptions: { cwd: target, stdio: "inherit" },
        throwOnError: true,
      });
      await x("ruff", ["format", "."], {
        nodeOptions: { cwd: target, stdio: "inherit" },
        throwOnError: true,
      });

      // django-upgrade
      const files = await glob("**/*.py", {
        cwd: target,
        expandDirectories: false,
        ignore: ["**/node_modules/**"],
      });
      await x("django-upgrade", ["--target-version", "6.0", ...files], {
        nodeOptions: { cwd: target },
        throwOnError: true,
      });

      // djLint
      const autofixableRules = "H014,T001";
      // TODO: remove T002 when fixed https://github.com/djlint/djLint/issues/687
      const ignoredRules = "H006,H030,H031,T002";
      await x(
        "djlint",
        ["--lint", "--ignore", `${autofixableRules},${ignoredRules}`, "."],
        { nodeOptions: { cwd: target }, throwOnError: true },
      );
      await x("djlint", ["--check", "."], {
        nodeOptions: { cwd: target },
        throwOnError: true,
      });

      const hasPackageJson = await pathExists(resolve(target, "package.json"));
      const hasTypescriptConfig = await pathExists(
        resolve(target, "tsconfig.json"),
      );
      if (hasPackageJson && hasTypescriptConfig && runTypeCheck) {
        // Install dependencies
        await x("bun", ["install"], { nodeOptions: { cwd: target } });
        // Check types
        await x("bun", ["run", "typecheck"], {
          nodeOptions: { cwd: target, stdio: "inherit" },
          throwOnError: true,
        });
      }

      const hasEslint = await pathExists(resolve(target, "eslint.config.js"));
      if (hasEslint) {
        const getWarnings = process.env.GET_WARNINGS === "true";
        const args = getWarnings ? ["--max-warnings", "0"] : [];
        await x("bun", ["run", "lint", ...args], {
          nodeOptions: { cwd: target, stdio: "inherit" },
          throwOnError: true,
        });
      }

      supportedOptions.push(slug);
    },
    TIMEOUT,
  );
}

function runUnsupportedOptionsTest(
  combination: Combination,
  testOption: "slug" | "options" = "options",
) {
  const { args, testName, slug } = constructArgs(combination);
  it.concurrent(
    testName,
    async ({ expect, invalidSlugs, unsupportedOptions }) => {
      // Generate the project and check that it fails
      const { exitCode } = await x(
        "bun",
        ["run", "generate", "-o", TEST_OUTPUT, ...args, "-y"],
        { nodeOptions: { cwd: TEST_OUTPUT } },
      );
      expect(exitCode).not.toBe(0);
      if (exitCode === 0) return;
      if (testOption === "slug") invalidSlugs.push(slug);
      if (testOption === "options") unsupportedOptions.push(slug);
    },
    30_000,
  );
}

for (const combination of SUPPORTED_COMBINATIONS) {
  runProjectCheckTest(combination);
}
for (const combination of UNSUPPORTED_COMBINATIONS) {
  runUnsupportedOptionsTest(combination);
}
for (const slug of INVALID_SLUGS) {
  runUnsupportedOptionsTest({ projectSlug: slug }, "slug");
}

it("should have the same number of supported options", ({
  expect,
  supportedOptions,
}) => {
  expect(supportedOptions.length).toBe(SUPPORTED_COMBINATIONS.length);
});
it("should have the same number of unsupported options", ({
  expect,
  unsupportedOptions,
}) => {
  expect(unsupportedOptions.length).toBe(UNSUPPORTED_COMBINATIONS.length);
});
it("should have the same number of invalid slugs", ({
  expect,
  invalidSlugs,
}) => {
  expect(invalidSlugs.length).toBe(INVALID_SLUGS.length);
});
