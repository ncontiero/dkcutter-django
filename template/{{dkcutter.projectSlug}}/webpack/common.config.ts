import type { JsMinifyOptions, Options as SwcLoaderOptions } from "@swc/core";
import type {
  CustomAtRules as LightningCssCustomAtRules,
  TransformOptions as LightningCssTransformOptions,
} from "lightningcss";
import type { Configuration } from "webpack";
import path from "node:path";
import MinimizerPlugin from "minimizer-webpack-plugin";
import BundleTracker from "webpack-bundle-tracker";

const BASE_PATH = path.join(import.meta.dirname, "../");
const PROJECT_PATH = path.join(BASE_PATH, "{{ dkcutter.projectSlug }}");

interface LightningCssMinifierOptions extends Omit<
  LightningCssTransformOptions<LightningCssCustomAtRules>,
  "code" | "filename"
> {}

export const commonConfig: Configuration = {
  target: "web",
  context: BASE_PATH,
  entry: {
    main: path.resolve(PROJECT_PATH, "src/index.ts"),
    vendors: path.resolve(PROJECT_PATH, "src/vendors.ts"),
  },
  output: {
    path: path.resolve(PROJECT_PATH, "static/bundles/"),
    publicPath: "/static/bundles/",
    filename: "js/[name].js",
    cssFilename: "css/[name].[contenthash].css",
    chunkFilename: "js/[name].js",
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
        test: /\.(?:js|jsx)$/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "ecmascript",
                jsx: true,
              },
            },
          } satisfies SwcLoaderOptions,
        },
      },
      {
        test: /\.(?:ts|tsx)$/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
              },
            },
          } satisfies SwcLoaderOptions,
        },
      },
      {
        test: /\.css$/,
        use: ["postcss-loader"],
        type: "css/auto",
      },
    ],
  },
  optimization: {
    minimizer: [
      new MinimizerPlugin({
        minify: MinimizerPlugin.swcMinify,
        minimizerOptions: {} satisfies JsMinifyOptions,
      }),
      new MinimizerPlugin({
        test: /\.css(\?.*)?$/i,
        minify: MinimizerPlugin.lightningCssMinify,
        minimizerOptions: {} satisfies LightningCssMinifierOptions,
      }),
    ],
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".wasm"],
    alias: {
      "@": path.resolve(PROJECT_PATH, "src"),
    },
  },
  experiments: {
    css: true,
  },
};
