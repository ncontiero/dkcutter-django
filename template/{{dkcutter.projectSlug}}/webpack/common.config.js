import path from "node:path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import MinimizerPlugin from "minimizer-webpack-plugin";
import BundleTracker from "webpack-bundle-tracker";

const BASE_PATH = path.join(import.meta.dirname, "../");
const PROJECT_PATH = path.join(BASE_PATH, "{{ dkcutter.projectSlug }}");

/** @type {import('webpack').Configuration} */
export const commonConfig = {
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
    assetModuleFilename: "assets/[name][ext]",
    clean: true,
  },
  plugins: [
    new BundleTracker({
      path: path.resolve(BASE_PATH),
      filename: "webpack-stats.json",
    }),
    new MiniCssExtractPlugin({ filename: "css/[name].[contenthash].css" }),
  ],
  module: {
    rules: [
      {
        test: /\.(?:js|jsx)$/,
        use: {
          loader: "swc-loader",
          /** @type {import('@swc/core').Options} */
          options: {
            jsc: {
              parser: {
                syntax: "ecmascript",
                jsx: true,
              },
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
    ],
  },
  optimization: {
    minimizer: [
      new MinimizerPlugin({
        minify: MinimizerPlugin.swcMinify,
        /** @type {import('@swc/core').JsMinifyOptions} */
        minimizerOptions: {},
      }),
      new MinimizerPlugin({
        test: /\.css(\?.*)?$/i,
        minify: MinimizerPlugin.lightningCssMinify,
        /** @type {import('lightningcss').TransformOptions} */
        minimizerOptions: {},
      }),
    ],
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".jsx", ".json", ".wasm"],
    alias: {
      "@": path.resolve(PROJECT_PATH, "src"),
    },
  },
};
