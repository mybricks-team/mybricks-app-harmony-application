import toHarmonyCode from "@mybricks/to-code-react/dist/cjs/toHarmonyCode"
import * as path from "path";
import * as fse from "fs-extra";
import { pinyin, cleanAndSplitString, firstCharToUpperCase } from "./utils";
import API from "@mybricks/sdk-for-app/api";
import {
  getPageCode,
  handleModuleCode,
  handlePageCode,
  handlePopupCode,
  getUsedComponent,
  handleEntryCode,
  handleGlobalCode,
  getModules
} from "./utils";

/** 组件、控制器等导出路径 */
const PROXY_PACKAGE_NAME = "../_proxy/Index"

const compilerHarmonyApp = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId } = params;
  const { Logger } = config;
  const { toJson, installedModules, componentMetaMap, allModules, pages, appConfig, tabBarJson } = data;

  // 目标项目路径
  const targetAppPath = path.join(projectPath, "Application");
  // 拷贝项目
  await fse.copy(path.join(__dirname, "./template/Application"), targetAppPath, { overwrite: true }) // [临时注释]

  // est路径
  const targetEtsPath = path.join(targetAppPath, "entry/src/main/ets");

  /** 记录场景ID的映射关系 */
  const sceneMap = {}

  // tabbar场景
  const tabbarScenes = []

  // 普通场景 - 
  const normalScenes = []

  // 安装模块数据
  const modulesData = await getModules(installedModules)
  

  const pageCode = await getPageCode({
    key: "app",
    moduleName: "app",
    data: {
      toJson,
      allModules,
      pages,
      appConfig,
      tabBarJson
    }
  }, modulesData)

  // fse.writeJson("tojson.json", pageCode, "utf-8") // 临时方便调试

  Object.entries(pageCode).forEach(([key, value]: any) => {
    const { pageCode, moduleName, usedComponentsMap, data } = value;
    const moduleNames = new Set<string>();
    let apiCode = fse.readFileSync(path.join(__dirname, "./template/api.ets"), "utf-8");
    pageCode.forEach((page) => {
      if (page.type === "extensionEvent") {
        // 业务模块
        apiCode = apiCode.replace("$r('app.api.import')", page.importManager.toCode()).replace("$r('app.api.open')", page.content)
        return
      }
  
      if (page.type === "global") {
        // 全局变量、全局Fx
        fse.outputFileSync(path.join(targetEtsPath, `modules/${moduleName}/_proxy/global.ets`), handleGlobalCode(page), { encoding: "utf8" })
        return
      }
  
      if (page.type === "module") {
        moduleNames.add(page.name);
        fse.outputFileSync(path.join(targetEtsPath, `modules/${moduleName}/sections/${page.name}.ets`), handleModuleCode(page), { encoding: "utf8" })
        return
      }
  
  
      if (page.meta) {
        // const pageFileName = firstCharToUpperCase(`${page.name}Page`);
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
            // id: page.meta.id,
            id: `${moduleName}_${page.meta.id}`,
            title: page.meta.title,
            pageName: firstCharToUpperCase(`${moduleName}${pageName}`),
            path: `modules/${moduleName}/pages/${pageName}`
          })
        }

        sceneMap[`${key}_${page.meta.id}`] = {
          // id: page.meta.id,
          id: `${moduleName}_${page.meta.id}`,
          title: page.meta.title,
          pageName: firstCharToUpperCase(`${moduleName}${pageName}`),
          path: `modules/${moduleName}/pages/${pageName}`
        }
        // sceneMap[page.meta.id] = page.meta;
      }
  
      let content = "";
      if (page.type === "normal") {
        const { pageConfig } = data.pages.find(p => p.id === page.meta?.id) ?? {}
        // 页面
        content = handlePageCode(page, pageConfig);
      } else if (page.type === "popup") {
        // 弹窗
        content = handlePopupCode(page);
      }
  
      fse.outputFileSync(path.join(targetEtsPath, `modules/${moduleName}/pages/${page.name}Page.ets`), content, { encoding: "utf8" })
    });

    if (moduleNames.size) {
      // 有区块，补充区块的入口文件
      fse.outputFileSync(
        path.join(targetEtsPath, `modules/${moduleName}/sections/index.ets`),
        Array.from(moduleNames).reduce((pre, cur) => {
          return pre + `export { default as ${cur} } from "./${cur}"\n`
        }, ""),
        { encoding: "utf8" })
    }

    const { importComponentCode, declaredComponentCode } = getUsedComponent({ usedComponentsMap, componentMetaMap })

    fse.writeFileSync(
      path.join(targetEtsPath, `modules/${moduleName}/_proxy/Index.ets`),
        fse.readFileSync(path.join(__dirname, "./template/_proxy/Index.ets"), "utf-8")
        .replace(
          "{ domain: undefined }",
          `{ domain: ${data.appConfig?.defaultCallServiceHost ? JSON.stringify(data.appConfig?.defaultCallServiceHost) : undefined}}`,
        )
        .replace("$r('app._proxy.component.import')", importComponentCode ? `import { ${importComponentCode} } from "../../../comlib/Index"` : "")
        .replace("$r('app._proxy.component.declared')", declaredComponentCode)
    );
    fse.writeFileSync(path.join(targetEtsPath, `modules/${moduleName}/api.ets`), apiCode)
  
    // 写入搭建Js
    const jsCodePath = path.join(targetEtsPath, `modules/${moduleName}/_proxy/codes.js`);
    fse.ensureFileSync(jsCodePath)
    fse.writeFileSync(jsCodePath, `export default (function(comModules) {
      ${decodeURIComponent(data.allModules?.all)};
      return comModules;
    })({})`, { encoding: "utf8" })
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

  // 普通场景 - 
  // normalScenes.unshift(...data.pages.filter(p => 
  //   !(data.tabBarJson || []).some(
  //     (b) => b?.id === p?.id
  //   )
  // ).map(p => {
  //   return sceneMap[`app_${p.id}`]
  // }))

  // 弹窗也写入普通场景判断中
  // data.toJson.scenes.forEach((scene) => {
  //   if (scene.type === "popup") {
  //     normalScenes.unshift(sceneMap[`app_${scene.id}`])
  //   }
  // })


  // 入口文件
  const entryPath = path.join(targetEtsPath, `./pages/Index.ets`);
  let entryFileContent = fse.readFileSync(entryPath, 'utf-8')

  entryFileContent = handleEntryCode(entryFileContent, {
    normalScenes,
    tabbarScenes,
    tabbarConfig,
    entryScene
  })
  fse.writeFileSync(entryPath, entryFileContent, 'utf-8')

  // const entryPath = path.join(targetEtsPath, "./pages/Index.ets");
  // await fse.copy(path.join(__dirname, "./hm/pages/Index.ets"), entryPath, { overwrite: true });
    
  


  // const res = getPageCode({ toJson })
  

  console.log("开始下载咯")
}

export default compilerHarmonyApp;
