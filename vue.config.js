const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const { ModuleFederationPlugin } = require("webpack").container;
const remotes = require("./config.remotes");
const exposes = require("./config.exposes");

const version = "1.0.0";
const name = "learning_platform";

module.exports = defineConfig({
  outputDir: path.resolve(__dirname, `./dist/${name}_${version}`),
  publicPath: "/",
  devServer: {
    port: 1000,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
  pages: {
    index: {
      entry: "./src/index.ts",
    },
  },
  configureWebpack: {
    devServer: {
      hot: false,
      historyApiFallback: true,
    },
    optimization: {
      splitChunks: false,
      runtimeChunk: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "learning_platform_shell",
        filename: "remoteEntry.js",
        exposes,
        remotes:
          process.env.NODE_ENV === "production"
            ? remotes.production
            : remotes.development,
        shared: {
          vue: { singleton: true, eager: true },
          "vue-router": { singleton: true, eager: true },
          pinia: { singleton: true, eager: true },
        },
      }),
    ],
  },
  transpileDependencies: false,
});
