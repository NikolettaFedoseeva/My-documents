/** Файл нужен для получения d.ts файлов моделей других приложений
 * Запуск - npm run srt
 * НА ОШИБКИ ВНИМАНИЯ НЕ ОБРАЩАТЬ, ФАЙЛ НЕ ВЛИЯЕТ НА СБОРКУ ПРОЕКТА
 * НА СБОРКУ ВЛИЯЕТ ТОЛЬКО vue.config.js
 */
const WebpackRemoteTypesPlugin = require("webpack-remote-types-plugin").default;
const remotes = require("./config.remotes").development;
module.exports = {
  name: "srt",
  entry: "./src",
  mode: "development",
  output: {
    publicPath: "auto",
  },
  plugins: [
    new WebpackRemoteTypesPlugin({
      name: "learning_platform",
      remotes: remotes,
      outputDir: ".remotes-types",
      remoteFileName: "[name]-dts.tgz", // default filename is [name]-dts.tgz where [name] is the remote name, for example, `app` with the above setup
    }),
  ],
  stats: {
    entrypoints: false,
    warnings: false,
    errors: false,
  },
};
