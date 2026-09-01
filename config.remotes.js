const remoteNames = [
  "lern_landing",
  "lern_auth",
  "lern_cabinet",
  "lern_admin",
];

const getPromise = () => {
  new Promise((resolve) => {
    const localAppName = "LOCAL_APP_NAME";
    const remoteName = "REMOTE_NAME";
    const mode = "APP_MODE";

    let remoteUrl;

    if (!window.appName) window.appName = localAppName;
    if (remoteName == window.appName) {
      remoteUrl = "/remoteEntry.js";
    }

    const init = () => {
      let script;

      const headChildren = document.head.children;
      for (let headChild of headChildren) {
        if (headChild.src == remoteUrl) {
          script = headChild;
          break;
        }
      }

      if (!script) {
        script = document.createElement("script");
        script.src = remoteUrl;
        
        script.onerror = () => {
          console.log('[Module Federation] Remote ' + remoteName + ' not active at ' + remoteUrl + '. Using fallback.');
          resolve({
            get: () => Promise.reject(new Error('Remote unavailable')),
            init: () => {}
          });
        };
        
        document.head.appendChild(script);
      }

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

      if (script.readyState === "complete") {
        resolveProxy();
      } else {
        script.addEventListener("load", resolveProxy);
      }
    };

    if (remoteUrl) {
      init();
    } else {
      const initWithExternalRemoteUrl = () => {
        window.appWebSettings.then((res) => {
          const appWebSettingsRemotes = res[mode].remotes;
          const url = appWebSettingsRemotes[remoteName];
          remoteUrl = url + '/remoteEntry.js';
          init();
        });
      };

      if (window.appWebSettings) initWithExternalRemoteUrl();
      else {
        window.appWebSettings = fetch("/appWebSettings.json")
          .then(async (appWebSettingsData) => {
            return await appWebSettingsData.text().then((appWebSettingsStr) => {
              const appWebSettings = JSON.parse(appWebSettingsStr);
              return appWebSettings;
            });
          })
          .catch(() => {
            console.warn("appWebSettings.json check");
          });
        initWithExternalRemoteUrl();
      }
    }
  });
};

const getRemoteModule = (name, localAppName) => {
  return `promise ${getFuncBody(getPromise)
    .replace("REMOTE_NAME", name)
    .replace("LOCAL_APP_NAME", localAppName)
    .replace("APP_MODE", process.env.NODE_ENV || 'development')}`;
};

const getFuncBody = (func) => {
  let funcString = func.toString();
  funcString = funcString.substring(funcString.indexOf("{") + 1);
  funcString = funcString.substring(0, funcString.length - 1);
  return funcString.trim();
};

const getProductionRemoteModules = (names) => {
  return names.reduce((object, name) => {
    const remoteName = name.split("-").join("_");
    return {
      ...object,
      [remoteName]: getRemoteModule(remoteName, process.env.npm_package_name),
    };
  }, {});
};

module.exports = {
  production: getProductionRemoteModules(remoteNames),
  development: getProductionRemoteModules(remoteNames),
};