import type { Configuration } from "webpack";
import path from "node:path";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";
import BundleTracker from "webpack-bundle-tracker";

const BASE_PATH = path.join(__dirname, "../");
const PROJECT_PATH = path.join(BASE_PATH, "{{ dkcutter.projectSlug }}");

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
        test: /\.tsx?$/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
    ],
  },
  optimization: {
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
  resolve: {
    modules: ["node_modules"],
    extensions: ["...", ".ts", "tsx"],
    alias: {
      "@": path.resolve(PROJECT_PATH, "src"),
    },
  },
};
