import path from "node:path";
import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import BundleTracker from "webpack-bundle-tracker";

// Target browsers, see: https://github.com/browserslist/browserslist
const BROWSER_TARGETS = [
  "chrome >= 87",
  "edge >= 88",
  "firefox >= 78",
  "safari >= 14",
];

const BASE_PATH = path.join(import.meta.dirname, "../");
const PROJECT_PATH = path.join(BASE_PATH, "{{ dkcutter.projectSlug }}");

export const commonConfig = defineConfig({
  target: "web",
  context: BASE_PATH,
  entry: {
    main: path.resolve(PROJECT_PATH, "src/index.js"),
    vendors: path.resolve(PROJECT_PATH, "src/vendors.js"),
  },
  output: {
    path: path.resolve(PROJECT_PATH, "static/bundles/"),
    publicPath: "/static/bundles/",
    filename: "js/[name].js",
    chunkFilename: "js/[name].js",
    cssFilename: "css/[name].css",
    assetModuleFilename: "assets/[name][ext]",
    clean: true,
  },
  plugins: [
    new BundleTracker({
      path: path.resolve(BASE_PATH),
      filename: "webpack-stats.json",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: { parser: { syntax: "ecmascript" } },
              env: { targets: BROWSER_TARGETS },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        type: "css",
        use: ["postcss-loader"],
      },
    ],
  },
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets: BROWSER_TARGETS },
      }),
    ],
  },
  resolve: {
    modules: ["node_modules"],
    extensions: ["...", ".js", ".jsx"],
    alias: {
      "@": path.resolve(PROJECT_PATH, "src"),
    },
  },
  experiments: {
    css: true,
  },
});
