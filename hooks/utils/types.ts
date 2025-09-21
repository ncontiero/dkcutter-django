export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type FrontendPipeline = "None" | "Rspack" | "Webpack";
export type FrontendPipelineLang = "js" | "ts";
export type AdditionalTool = "tailwindcss" | "eslint";
export type AdditionalTools = AdditionalTool[];
export type AutomatedDepsUpdater = "none" | "renovate" | "dependabot";

export type Context = {
  projectSlug: string;
  pkgManager: PackageManager;
  cloudProvider: string;
  restFramework: string;
  frontendPipeline: FrontendPipeline;
  frontendPipelineLang: FrontendPipelineLang;
  additionalTools: AdditionalTools;
  useCelery: boolean;
  automatedDepsUpdater: AutomatedDepsUpdater;
  installFrontendDeps: boolean;
};
