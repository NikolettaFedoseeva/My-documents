const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const { ModuleFederationPlugin } = require("webpack").container;
const remotes = require("./config.remotes");
const exposes = require("./config.exposes");

module.exports = defineConfig({
  publicPath: "auto",
  devServer: {
    port: 2061,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  pages: {
    index: {
      entry: "./src/index.ts",
    },
  },
  configureWebpack: {
    plugins: [
      new ModuleFederationPlugin({
        name: "lern_landing",
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