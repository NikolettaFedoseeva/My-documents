const remoteNames = [
  "lern_landing",
  "lern_auth",
  "lern_cabinet",
  "lern_admin",
];

/**
 * * Загрузка дочернего модуля с динамическим адресом
 */
const getPromise = () => {
  new Promise((resolve) => {
    // Название host приложения
    const localAppName = "LOCAL_APP_NAME";
    // Название получаемого приложения
    const remoteName = "REMOTE_NAME";

    // Название host приложения
    const mode = "APP_MODE";

    // Ссылка на точку входа в получаемое приложение
    let remoteUrl;

    // Установка название host приложения
    if (!window.appName) window.appName = localAppName;
    if (remoteName == window.appName) {
      remoteUrl = "/remoteEntry.js";
    }

    // Инит скрипта
    const init = () => {
      // Тег скрипта с ссылкой на remote приложение
      let script;

      // Проверяем если ри уже скрипт с ссылкой src == remoteUrl
      const headChildren = document.head.children;
      for (let headChild of headChildren) {
        if (headChild.src == remoteUrl) {
          script = headChild;
          break;
        }
      }
      // Если не нашли скрипт, то создаем
      if (!script) {
        script = document.createElement("script");
        script.src = remoteUrl;
        document.head.appendChild(script);
      }

      // Прокси который необходимо вернуть, когда подключится скрипт
      const proxy = {
        get: (request) => {
          return window[remoteName].get(request);
        },
        init: (arg) => {
          try {
            return window[remoteName].init(arg);
          } catch (e) {
            console.log("remote container already initialized");
          }
        },
      };

      const resolveProxy = () => {
        if (remoteName == window.appName) resolve();
        script.readyState = "complete";
        resolve(proxy);
      };

      // Проверка сработал ли скрипт
      if (script.readyState === "complete") {
        resolveProxy();
      } else {
        script.addEventListener("load", resolveProxy);
      }
    };

    // Если имя текущего хост приложения совпадает с remote приложением
    if (remoteUrl) {
      init();
    }
    // Получение json с конфигурацией remotes
    else {
      const initWithExternalRemoteUrl = () => {
        window.appWebSettings.then((res) => {
          const appWebSettingsRemotes = res[mode].remotes;
          // Ссылка на получаемое приложение
          const url = appWebSettingsRemotes[remoteName];
          // Ссылка на точку входа в получаемое приложение
          remoteUrl = `${url}/remoteEntry.js`;
          init();
        });
      };

      if (window.appWebSettings) initWithExternalRemoteUrl();
      else {
        window.appWebSettings = fetch("/appWebSettings.json")
          .then(async (appWebSettingsData) => {
            // Чтение текста json
            return await appWebSettingsData.text().then((appWebSettingsStr) => {
              const appWebSettings = JSON.parse(appWebSettingsStr);
              return appWebSettings;
            });
          })
          .catch(() => {
            console.error("Добавьте appWebSettings.json файл в public папку");
          });
        initWithExternalRemoteUrl();
      }
    }
  });
};

/**
 * * Возвращает значение remote путь в зависимости от NODE_ENV
 * @param name - название приложения
 * @param devPort - порт разработки приложения
 * @returns Возвращает строку с содержимым телом функции.
 */
const getRemoteModule = (name, localAppName) => {
  return `promise ${getFuncBody(getPromise)
    .replace("REMOTE_NAME", name)
    .replace("LOCAL_APP_NAME", localAppName)
    .replace("APP_MODE", process.env.NODE_ENV)}`;
};

/**
 * * Получить функцию в формате строки
 */
const getFuncBody = (func) => {
  let funcString = func.toString();
  funcString = funcString.substring(funcString.indexOf("{") + 1);
  funcString = funcString.substring(0, funcString.length - 1);
  return funcString.trim();
};

/**
 * * Получить remotes для конфигурации (Production)
 * @param names массив имен удаленных приложений
 */
const getProductionRemoteModules = (names) => {
  return names.reduce((object, name) => {
    const remoteName = name.split("-").join("_");
    return {
      ...object,
      [remoteName]: getRemoteModule(remoteName, process.env.npm_package_name),
    };
  }, {});
};

const developmentAppWebSettings = require("./public/appWebSettings.json");
/**
 * * Получить remotes для конфигурации (Development)
 * @param names массив имен удаленных приложений
 */
const getDevelopmentRemoteModules = (names) => {
  return names.reduce((object, name) => {
    const remoteName = name.split("-").join("_");
    return {
      ...object,
      [remoteName]: `${remoteName}@${developmentAppWebSettings.development.remotes[remoteName]}/remoteEntry.js`,
    };
  }, {});
};

module.exports = {
  production: getProductionRemoteModules(remoteNames),
  development: getDevelopmentRemoteModules(remoteNames),
};
