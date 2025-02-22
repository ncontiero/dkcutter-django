import { merge } from "webpack-merge";
import { commonConfig } from "./common.config";

// This variable should mirror the one from config/settings/production.py
{%- if not dkcutter.useWhitenoise %}
{%- if dkcutter.cloudProvider == "AWS" %}
const s3BucketName = process.env.DJANGO_AWS_STORAGE_BUCKET_NAME;
const awsS3Domain =
  process.env.DJANGO_AWS_S3_CUSTOM_DOMAIN || `${s3BucketName}.s3.amazonaws.com`;
const staticUrl = `https://${awsS3Domain}/static/`;
{%- elif dkcutter.cloudProvider == "GCP" %}
const staticUrl = `https://storage.googleapis.com/${process.env.DJANGO_GCP_STORAGE_BUCKET_NAME}/static/`;
{%- endif %}
{%- else %}
const staticUrl = "/static/";
{%- endif %}

export default merge(commonConfig, {
  mode: "production",
  devtool: "source-map",
  bail: true,
  output: {
    publicPath: `${staticUrl}bundles/`,
  },
});
