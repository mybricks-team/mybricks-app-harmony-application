import * as path from "path";
import * as fse from "fs-extra";
import {
  getPageCode,
  handleModuleCode,
  handlePageCode,
  handlePopupCode,
  getUsedComponent,
  handleEntryCode,
  handleGlobalCode,
  handleExtensionBusCode,
  getModules,
  downloadZip,
  firstCharToUpperCase,
  AdmZip
} from "./utils";

const copyOhPackage = async (params, config) => {
  const { data } = params;
  const { download } = data;
  const { targetPath } = config;

  const ohPackagePath = path.join(targetPath, "../../../oh-package.json5");

  const ohPackage = await fse.readFile(ohPackagePath, 'utf-8')

  await fse.writeFile(
    ohPackagePath, 
    ohPackage.replace(
      "$r('app.oh.package.dependencies')", 
      download.source === "ohpmLibrary" ? (
        ",\n" + 
        '    "@mybricks/render-utils": "latest",\n' +
        '    "@mybricks/comlib-harmony-normal": "latest"'
      ) : (
        ",\n" + 
        '    "@mybricks/render-utils": "latest",\n'
      )
    ))
}

const copyUtils = async (params, config) => {
  const { data } = params;
  const { download } = data;
  const { targetPath } = config;

  if (download.source !== "ohpmLibrary" && false) {
    // 拷贝utils
    await fse.copy(path.join(__dirname, "./template/utils"), path.join(targetPath, "utils"), { overwrite: true })
  } else {
    await fse.copy(path.join(__dirname, "./template/utils/AppRouter.ets"), path.join(targetPath, "utils/AppRouter.ets"), { overwrite: true })
    await fse.copy(path.join(__dirname, "./template/utils/AppWindow.ets"), path.join(targetPath, "utils/AppWindow.ets"), { overwrite: true })
    await fse.copy(path.join(__dirname, "./template/utils/Index.ets"), path.join(targetPath, "utils/Index.ets"), { overwrite: true })
  }
}

const copyComlib = async (params, config) => {
  const { data, domainName } = params;
  const { download } = data;
  const { targetPath } = config;

  if (download.source !== "ohpmLibrary") {
    // 拷贝comlib
    if (data.comlibs?.[0]?.hmCode) {
      // 配置组件库，使用远程组件库源码
      const comlibZipPath = path.join(targetPath, "comlib.zip");
      await downloadZip({
        url: `${domainName}${data.comlibs?.[0].hmCode}`,
        targetPath: comlibZipPath
      })
      const zip = new AdmZip(comlibZipPath);
      const comlibPath = path.join(targetPath, "comlib");
      zip.extractAllTo(comlibPath, true);
      // 删除下载的zip包
      fse.removeSync(comlibZipPath);
    } else {
      await fse.copy(path.join(__dirname, "./template/comlib"), path.join(targetPath, "comlib"), { overwrite: true })
    }
  }
}

const copyCommon = (params, config) => {
  const { data } = params;
  const { download } = data;
  const { targetPath, importComponentCode, declaredComponentCode, appConfig } = config;

  // 拷贝common
  if (download.source === "ohpmLibrary") {
    fse.copySync(path.join(__dirname, "./template/common/IndexOhpmLibrary.ets"), path.join(targetPath, "common/Index.ets"), { overwrite: true })
    fse.writeFileSync(
      path.join(targetPath, "common/Index.ets"),
      (fse.readFileSync(path.join(__dirname, "./template/common/IndexOhpmLibrary.ets"), 'utf-8'))
        .replace(
          "{ domain: undefined }",
          `{ domain: ${appConfig?.defaultCallServiceHost ? JSON.stringify(appConfig?.defaultCallServiceHost) : undefined}}`,
        )
    );
  } else {
    fse.copySync(path.join(__dirname, "./template/common/Index.ets"), path.join(targetPath, "common/Index.ets"), { overwrite: true })
    fse.writeFileSync(
      path.join(targetPath, "common/Index.ets"),
      (fse.readFileSync(path.join(__dirname, "./template/common/Index.ets"), 'utf-8'))
        .replace(
          "{ domain: undefined }",
          `{ domain: ${appConfig?.defaultCallServiceHost ? JSON.stringify(appConfig?.defaultCallServiceHost) : undefined}}`,
        )
        .replace("$r('app.common.component.import')", importComponentCode ? `import { ${importComponentCode} } from "../../../comlib/Index"` : "")
        .replace("$r('app.common.component.declared')", declaredComponentCode)
    );
  }
}

const copyJs = (params, config) => {
  const { data } = params;
  const { download } = data;
  const { targetPath, code } = config;

  const jsModulesPath = path.join(targetPath, "common/JSModules.ts");
  fse.ensureFileSync(jsModulesPath)
  fse.writeFileSync(jsModulesPath, `export default function({ createJSHandle, context }) {
    const comModules = {};
    ${code};
    return comModules;
  }`, { encoding: "utf8" })
}

const handleApiCode = (params, config) => {
  const { data } = params;
  const { download } = data;
  const { code } = config;
  const hasBus = code.includes("bus.")
  return code
    .replace("$r('app.api.import.utils')",
      `import { MyBricks, transformApi } from "@mybricks/render-utils";${hasBus ? '\nimport { bus } from "../app/bus";' : ""}`
      // download.source === "sourceCode" ?
      //   `import { MyBricks } from "../../utils/types";\nimport { transformApi } from "../../utils/mybricks"\n;${hasBus ? 'import { bus } from "../app/bus";' : ""}` :
      //   `import { MyBricks, transformApi } from "@mybricks/render-utils";${hasBus ? '\nimport { bus } from "../app/bus";' : ""}`
    );
}

const compilerHarmonyApp = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId, domainName, useLog = true } = params;
  const { Logger } = config;
  const { toJson, installedModules, componentMetaMap, allModules, pages, appConfig, tabBarJson, comlibs, download } = data;

  // 目标项目路径
  const targetAppPath = path.join(projectPath, download.fileName || "Application");

  // 拷贝项目
  await fse.copy(path.join(__dirname, "./template/Application"), targetAppPath, { overwrite: true })

  // est路径
  const targetEtsPath = path.join(targetAppPath, "entry/src/main/ets");

  // 拷贝oh-package
  await copyOhPackage(params, {
    targetPath: targetEtsPath
  })

  // 拷贝utils
  await copyUtils(params, {
    targetPath: targetEtsPath
  })

  // 拷贝组件库
  await copyComlib(params, {
    targetPath: targetEtsPath
  })

  /** 记录场景ID的映射关系 */
  const sceneMap = {}

  // tabbar场景
  const tabbarScenes = []

  // 普通场景 - 
  const normalScenes = []

  // 安装模块数据
  const modulesData = await getModules(installedModules)

  const busMap: any = {};
  toJson.global.fxFrames.forEach((fxFrame) => {
    const { name, type, title } = fxFrame;
    if (type === "extension-bus") {
      if (name === "bus-getUser") {
        busMap["mybricks.core-comlib.bus-getUser"] = {
          title,
          name: title
        };
      }
    }
  });
  const getBus = (namespace: string) => {
    return busMap[namespace];
  };
  const getApi = (namespace: string) => {
    return componentMetaMap[namespace];
  };

  const pageCode = await getPageCode({
    key: "app",
    moduleName: "app",
    data: {
      toJson,
      allModules,
      pages,
      appConfig,
      tabBarJson
    },
    getBus,
    getApi,
    download,
    useLog
  }, modulesData)

  const usedModuleNames = new Set();

  Object.entries(pageCode).forEach(([key, value]: any) => {
    const { pageCode, moduleName, usedComponentsMap, data } = value;
    usedModuleNames.add(moduleName);
    const moduleNames = new Set<string>();
    let apiCode = fse.readFileSync(path.join(__dirname, "./template/api.ets"), "utf-8");

    let extensionApiCode = "";

    pageCode.forEach((page) => {
      // 正常也只有app会有extension-bus(系统总线)
      if (page.type === "extension-bus") {
        // 有脏数据，需要兼容下，正常只有app下才会有extension-bus
        if (key === "app") {
          fse.outputFileSync(path.join(targetEtsPath, `modules/${moduleName}/bus.ets`), handleExtensionBusCode(page, { params }), { encoding: "utf8" })
        }
        return;
      }

      if (page.type === "extension-config") {
        // 配置
        apiCode = apiCode.replace("$r('app.api.import')", page.importManager.toCode()).replace("$r('app.api.config')", `(value: MyBricks.Any) => {
          ${page.content}
        }`);
        return
      }

      if (page.type === "extension-api") {
        // API
        extensionApiCode = extensionApiCode + page.content
        return
      }

      if (page.type === "global") {
        // 全局变量、全局Fx
        fse.outputFileSync(path.join(targetEtsPath, `modules/${moduleName}/common/global.ets`), handleGlobalCode(page, { params, key }), { encoding: "utf8" })
        return
      }

      if (page.type === "module") {
        moduleNames.add(page.name);
        fse.outputFileSync(path.join(targetEtsPath, `modules/${moduleName}/sections/${page.name}.ets`), handleModuleCode(page, { params, key }), { encoding: "utf8" })
        return
      }


      if (page.meta) {
        const pageName = page.name + "Page";

        let pushNormalScenes = true

        if (moduleName === "app") {
          // 目前仅处理app
          const tabBar = data.pages.filter(p =>
            (data.tabBarJson || []).some(
              (b) => b?.id === p?.id
            )
          )
          const isTabBar = tabBar.find((tab) => tab.id === page.meta.id)
          if (isTabBar) {
            pushNormalScenes = false
          }
        }

        if (pushNormalScenes) {
          normalScenes.push({
            id: `${moduleName}_${page.meta.id}`,
            title: page.meta.title,
            pageName: firstCharToUpperCase(`${moduleName}${pageName}`),
            path: `modules/${moduleName}/pages/${pageName}`
          })
        }

        sceneMap[`${key}_${page.meta.id}`] = {
          id: `${moduleName}_${page.meta.id}`,
          title: page.meta.title,
          pageName: firstCharToUpperCase(`${moduleName}${pageName}`),
          path: `modules/${moduleName}/pages/${pageName}`
        }
      }

      let content = "";
      if (page.type === "normal") {
        const { pageConfig } = data.pages.find(p => p.id === page.meta?.id) ?? {}
        // 页面
        content = handlePageCode(page, { pageConfig, params, key });
      } else if (page.type === "popup") {
        // 弹窗
        content = handlePopupCode(page, { params, key });
      }

      fse.outputFileSync(path.join(targetEtsPath, `modules/${moduleName}/pages/${page.name}Page.ets`), content, { encoding: "utf8" })
    });

    apiCode = apiCode.replace("$r('app.api.apis')", extensionApiCode).replace("$r('app.api.import')", "").replace("$r('app.api.config')", "() => {}");

    if (moduleNames.size) {
      // 有区块，补充区块的入口文件
      fse.outputFileSync(
        path.join(targetEtsPath, `modules/${moduleName}/sections/Index.ets`),
        Array.from(moduleNames).reduce((pre, cur) => {
          return pre + `export { default as ${cur} } from "./${cur}"\n`
        }, ""),
        { encoding: "utf8" })
    }

    const { importComponentCode, declaredComponentCode } = getUsedComponent({ usedComponentsMap, componentMetaMap, verbose: useLog })

    copyCommon(params, {
      targetPath: path.join(targetEtsPath, `modules/${moduleName}`),
      importComponentCode,
      declaredComponentCode,
      appConfig: Object.assign(appConfig, data.appConfig)
    })

    if (key !== "app") {
      // app不需要api
      fse.writeFileSync(path.join(targetEtsPath, `modules/${moduleName}/api.ets`), handleApiCode(params, { code: apiCode }))
    }

    // 写入搭建Js
    copyJs(params, {
      targetPath: path.join(targetEtsPath, `modules/${moduleName}`),
      code: decodeURIComponent(data.allModules?.all)
    });
  })

  // 默认只有主应用中才会有标签页，所以对tabbar的判断仅针对app
  // tabbar配置
  const tabbarConfig = (data.tabBarJson ?? []).map(item => {
    const { pagePath, ...others } = item
    return {
      id: item.pagePath.split('/')[1],
      ...others,
    }
  })

  // 入口场景
  const entryScene = sceneMap[`app_${data.entryPageId}`]

  // tabbar场景
  tabbarScenes.push(...data.pages.filter(p =>
    (data.tabBarJson || []).some(
      (b) => b?.id === p?.id
    )
  ).map(p => {
    return sceneMap[`app_${p.id}`]
  }))

  // 入口文件
  const entryPath = path.join(targetEtsPath, `./pages/Index.ets`);
  let entryFileContent = fse.readFileSync(entryPath, 'utf-8')

  entryFileContent = handleEntryCode(entryFileContent, {
    normalScenes,
    tabbarScenes,
    tabbarConfig,
    entryScene,
    modulesData,
    usedModuleNames
  })
  fse.writeFileSync(entryPath, entryFileContent, 'utf-8')
}

export default compilerHarmonyApp;
