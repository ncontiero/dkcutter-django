export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type FrontendPipeline = "None" | "Rspack" | "Webpack";
export type FrontendPipelineLang = "js" | "ts";
export type AdditionalTool = "reactEmail" | "tailwindcss" | "eslint";
export type AdditionalTools = AdditionalTool[];
export type AutomatedDepsUpdater = "none" | "renovate" | "dependabot";

export type Context = {
  projectSlug: string;
  pkgManager: PackageManager;
  pkgRun: string;
  cloudProvider: string;
  restFramework: string;
  frontendPipeline: FrontendPipeline;
  frontendPipelineLang: FrontendPipelineLang;
  additionalTools: AdditionalTools;
  useTailwindInReactEmail: boolean;
  useCelery: boolean;
  automatedDepsUpdater: AutomatedDepsUpdater;
  installFrontendDeps: boolean;
};

export type SetFlagProps = {
  filePath: string;
  flag: string;
  length?: number;
  value?: string;
  formatted?: string;
};
