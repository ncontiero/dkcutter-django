import { merge } from "{{ 'rspack-merge' if dkcutter.frontendPipeline == 'Rspack' else 'webpack-merge' }}";
import { commonConfig } from "./common.config{{ '.ts' if dkcutter.frontendPipeline == 'Webpack' }}";

export default merge(commonConfig, {
  mode: "production",
  devtool: "source-map",
  bail: true,
  output: {
    publicPath: "auto",
    filename: "js/[name]-[fullhash].js",
    chunkFilename: "js/[name]-[hash].js",
    {%- if dkcutter.frontendPipeline == "Rspack" %}
    cssFilename: "css/[name]-[contenthash].css",
    {%- endif %}
    assetModuleFilename: "assets/[name]-[hash][ext]",
  },
});
