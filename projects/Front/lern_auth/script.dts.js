/** Файл нужен для компилирования d.ts файлов моделей пакетов
 * Запуск - npm run dts
 * НА ОШИБКИ ВНИМАНИЯ НЕ ОБРАЩАТЬ, ФАЙЛ НЕ ВЛИЯЕТ НА СБОРКУ ПРОЕКТА
 * НА СБОРКУ ВЛИЯЕТ ТОЛЬКО vue.config.js
 */
const exposes = require("./config.exposes");

const localExposes = {};

Object.keys(exposes).forEach((key) => {
  localExposes[key] = exposes[key].replace("src", "dist");
});
module.exports = {
  name: "dts",
  entry: exposes,
  mode: "development",
  output: {
    publicPath: "auto",
  },
  resolve: {
    extensions: [".ts", ".vue"],
  },
  module: {
    rules: [
      {
        test: [/\.ts?$/],
        use: [
          {
            loader: "dts-loader",
            options: {
              name: "lern_auth", // Название приложение
              exposes: exposes,
              typesOutputDir: ".exposes-types", // Папка в которую собираются d.ts файлы
            },
          },
        ],
      },
      {
        test: [/\.vue?$/],
        use: [
          {
            loader: "vue-tsc",
          },
        ],
      },
    ],
  },
  stats: {
    entrypoints: false,
    warnings: false,
    errors: false,
  },
};
