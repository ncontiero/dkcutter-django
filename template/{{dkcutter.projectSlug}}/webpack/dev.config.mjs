import { merge } from "webpack-merge";
import { commonConfig } from "./common.config.mjs";

export default merge(commonConfig, {
  mode: "development",
  devtool: "inline-source-map",
  /** @type {import('webpack-dev-server').Configuration} */
  devServer: {
    devMiddleware: { writeToDisk: true },
    port: 3000,
    proxy: [
      {
        context: ["/"],
        target: "http://django:8000",
      },
    ],
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
    },
    // We need hot=false (Disable HMR) to set liveReload=true
    hot: false,
    liveReload: true,
  },
});
