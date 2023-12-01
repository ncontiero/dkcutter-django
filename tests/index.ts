import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";

import { logger } from "./logger";

const PATTERN = /{{(\s?dkcutter)[.](.*?)}}/;

const SUPPORTED_COMBINATIONS = [
  { postgresqlVersion: "15" },
  { postgresqlVersion: "14" },
  { postgresqlVersion: "13" },
  { postgresqlVersion: "12" },
  { postgresqlVersion: "11" },
  { postgresqlVersion: "10" },
  { cloudProvider: "AWS", useWhitenoise: true },
  { cloudProvider: "AWS", useWhitenoise: false },
  { cloudProvider: "GCP", useWhitenoise: true },
  { cloudProvider: "GCP", useWhitenoise: false },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Mailgun" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Mailjet" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Mandrill" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Postmark" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Sendgrid" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "SendinBlue" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "SparkPost" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "'Other SMTP'" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "None" },
  // Note: cloudProvider=None AND useWhitenoise=false is not supported
  { cloudProvider: "AWS", mailService: "Mailgun" },
  { cloudProvider: "AWS", mailService: "'Amazon SES'" },
  { cloudProvider: "AWS", mailService: "Mailjet" },
  { cloudProvider: "AWS", mailService: "Mandrill" },
  { cloudProvider: "AWS", mailService: "Postmark" },
  { cloudProvider: "AWS", mailService: "Sendgrid" },
  { cloudProvider: "AWS", mailService: "SendinBlue" },
  { cloudProvider: "AWS", mailService: "SparkPost" },
  { cloudProvider: "AWS", mailService: "'Other SMTP'" },
  { cloudProvider: "AWS", mailService: "None" },
  { cloudProvider: "GCP", mailService: "Mailgun" },
  { cloudProvider: "GCP", mailService: "Mailjet" },
  { cloudProvider: "GCP", mailService: "Mandrill" },
  { cloudProvider: "GCP", mailService: "Postmark" },
  { cloudProvider: "GCP", mailService: "Sendgrid" },
  { cloudProvider: "GCP", mailService: "SendinBlue" },
  { cloudProvider: "GCP", mailService: "SparkPost" },
  { cloudProvider: "GCP", mailService: "'Other SMTP'" },
  { cloudProvider: "GCP", mailService: "None" },
  // Note: cloudProviders GCP and None
  // with mailService Amazon SES is not supported
  { useWhitenoise: true },
  { useWhitenoise: false },
  { useMailpit: true },
  { useMailpit: false },
  { useSentry: true },
  { useSentry: false },
  { restFramework: "None" },
  { restFramework: "DRF" },
  { restFramework: "DNRF" },
  { useCelery: true },
  { useCelery: false },
  { useTailwindcss: true },
  { useTailwindcss: false },
];
const UNSUPPORTED_COMBINATIONS = [
  { postgresqlVersion: 5 },
  { postgresqlVersion: 20 },
  { restFramework: "NOn" },
  { restFramework: "Rest" },
  { cloudProvider: "None", useWhitenoise: false },
  { cloudProvider: "Non" },
  { mailService: "Non" },
  { mailService: "Other" },
];
const INVALID_SLUGS = [
  "",
  " ",
  "1est",
  "tes1@",
  "t!es",
  "project slug",
  "Project_Slug",
];

/**
 * Build a list containing absolute paths to the generated files.
 */
function buildFilesList(baseDir: string) {
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
function checkPaths(paths: string[]) {
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

async function generateProject(args: string[] = [], output: string = ".test") {
  logger.info(
    `Generating project ${args[1]} with args: ${args.slice(2).join(" ")}`,
  );
  await execa("pnpm", ["generate", ".", "-o", output, ...args, "-y"]);
  const paths = buildFilesList(path.join(output, args[1]));
  checkPaths(paths);
  logger.success(`✓ Project ${args[1]} generated`);
}

function generateRandomString(n: number) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * characters.length);
    result += characters.charAt(index);
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function constructArgs(combination: { [key: string]: any }) {
  const args = ["--projectName", generateRandomString(8)];
  for (const [item, value] of Object.entries(combination)) {
    args.push(`--${item}`, value);
  }
  return args;
}

async function testCMDPasses(
  cmd: string,
  projectDir: string,
  projectName: string,
  args: string[] = [],
  insertDirectory = true,
) {
  const cmdCapitalized = cmd.charAt(0).toUpperCase() + cmd.slice(1);
  const dirArg = insertDirectory ? projectDir : "";
  const result = await execa(cmd, [dirArg, ...args], { cwd: projectDir });
  if (result.failed) {
    throw new Error(`${cmdCapitalized} failed for ${projectName}`);
  }
  logger.success(`✓ ${cmdCapitalized} passed for ${projectName}`);
}

async function testBlackPasses(projectDir: string, projectName: string) {
  await testCMDPasses("black", projectDir, projectName, [
    "--check",
    "--diff",
    "--exclude",
    "migrations",
    ".",
  ]);
}

async function testDjLintPasses(projectDir: string, projectName: string) {
  const autofixableRules = "H014,T001";
  // TODO: remove T002 when fixed https://github.com/Riverside-Healthcare/djLint/issues/687
  const ignoredRules = "H006,H030,H031,T002";

  await testCMDPasses("djlint", projectDir, projectName, [
    "--lint",
    "--ignore",
    `${autofixableRules},${ignoredRules}`,
    ".",
  ]);
}

async function main() {
  let test = ".test";
  await fs.ensureDir(test);
  test = path.resolve(test);
  let testsPassed = 0;

  for (const combination of SUPPORTED_COMBINATIONS) {
    const args = constructArgs(combination);
    try {
      await generateProject(args, test);
      const projectDir = path.join(test, args[1]);
      await testCMDPasses("flake8", path.join(test, args[1]), args[1]);
      await testBlackPasses(projectDir, args[1]);
      await testCMDPasses("isort", projectDir, args[1]);
      await testDjLintPasses(projectDir, args[1]);
      await testCMDPasses("djlint", projectDir, args[1], ["--check", "."]);
      logger.success(`✓ All checks passed for project ${args[1]}`);
      logger.break();
      testsPassed += 6;
    } catch (e) {
      let msg = `Failed to generate project ${args[1]} with args: ${args
        .slice(2)
        .join(" ")}`;
      if (e instanceof Error) {
        msg = `${msg}\n${e.message}`;
      }
      logger.error(msg);
      process.exit(1);
    }
  }

  let pass = 0;
  for (const combination of UNSUPPORTED_COMBINATIONS) {
    const args = constructArgs(combination);
    try {
      await generateProject(args, test);
    } catch (e) {
      logger.success(
        `✓ Expected error when creating project ${args[1]} with args: ${args
          .slice(2)
          .join(" ")}`,
      );
      logger.break();
      pass += 1;
      testsPassed += 1;
      continue;
    }
  }
  if (pass !== UNSUPPORTED_COMBINATIONS.length) {
    logger.error(
      `Unsupported Combinations: Expected ${UNSUPPORTED_COMBINATIONS.length} errors, but got ${pass}`,
    );
    process.exit(1);
  }

  pass = 0;
  for (const slug of INVALID_SLUGS) {
    const args = constructArgs({ projectSlug: slug });
    try {
      await generateProject(args, test);
    } catch (e) {
      logger.success(
        `✓ Expected error when creating project ${args[1]} with slug "${slug}"`,
      );
      logger.break();
      pass += 1;
      testsPassed += 1;
      continue;
    }
  }
  if (pass !== INVALID_SLUGS.length) {
    logger.error(
      `Project Slug: Expected ${INVALID_SLUGS.length} errors, but got ${pass}`,
    );
    process.exit(1);
  }

  logger.info(`Tests Passed: ${testsPassed}`);
  logger.success("✓ All tests passed");
  await fs.remove(test);
}

main();
