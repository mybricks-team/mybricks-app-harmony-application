import toHarmonyCode from "@mybricks/to-code-react/dist/cjs/toHarmonyCode"
import * as path from "path";
import * as fse from "fs-extra";
import { COMPONENT_PACKAGE_NAME } from "./hm/constant";
import { pinyin, cleanAndSplitString, firstCharToUpperCase } from "../utils";

/**
 * [DISCUSS] 组件namespace命名规范，除了中文0-9a-zA-Z，只允许使用 . 和 _ 两个特殊字符
 */

function convertNamespaceToComponentName(namespace: string) {
  return namespace
    .split(".")
    .map((text) => {
      if (text.toUpperCase() === "MYBRICKS") {
        return "MyBricks";
      } else {
        return text[0].toUpperCase() + text.slice(1);
      }
    })
    .join("");
}

const handleEntryCode = (template: string, {
  tabbarScenes,
  normalScenes,
  entryScene,
  tabbarConfig
}) => {
  const allImports = Array.from(new Set([...tabbarScenes, ...normalScenes]))
    .map(scene => `// ${scene.title} \nimport ${generatePageFileName(scene.title)} from './${generatePageFileName(scene.title)}';`)
    .join('\n')
  const generateRoutes = (scenes) => scenes
    .map((scene, i) => `${i === 0 ? 'if' : '\t\telse if'} (path === '${scene.id}') {\n\t\t\t${generatePageFileName(scene.title)}()\n\t\t}`)
    .join('\n');
  const renderMainScenes = generateRoutes(Array.from(new Set([entryScene, ...tabbarScenes])))
  const renderScenes = generateRoutes(normalScenes)


  return template
    .replace("$r('app.config.imports')", allImports)
    .replace("$r('app.config.mainScenes')", renderMainScenes)
    .replace("$r('app.config.scenes')", renderScenes)
    .replace("$r('app.config.tabbar')", JSON.stringify(tabbarConfig, null, 2))
    .replace("$r('app.config.entry')", JSON.stringify(entryScene.id))
}

const handlePageCode = (page: ReturnType<typeof toHarmonyCode>[0], {
  disableScroll = false,
  statusBarStyle,
  navigationBarStyle,
  navigationBarTitleText,
  navigationStyle = 'default',
  showBackIcon = false
}) => {
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: "../utils/types",
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("controller:")) {
    page.importManager.addImport({
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }

  switch (navigationStyle) {
    case 'default': {
      page.importManager.addImport({
        packageName: "../utils",
        dependencyNames: ["AppCommonHeader"],
        importType: "named",
      });
      return `${page.importManager.toCode()}

/** ${page.meta.title} */
@ComponentV2
export default struct Page {
  build() {
    NavDestination() {
      AppCommonHeader({
        title: ${JSON.stringify(navigationBarTitleText)},
        titleColor: ${JSON.stringify(navigationBarStyle?.color)},
        barBackgroundColor: ${JSON.stringify(navigationBarStyle?.backgroundColor)},
        showBackIcon: ${Boolean(showBackIcon)}
      })
      Index()
    }
    .hideTitleBar(true)
  }
}

${page.content}
`;
    }
    case 'custom': {
      page.importManager.addImport({
        packageName: "../utils",
        dependencyNames: ["AppCustomHeader"],
        importType: "named",
      });
      return `${page.importManager.toCode()}

/** ${page.meta.title} */
@ComponentV2
export default struct Page {
  build() {
    NavDestination() {
      AppCustomHeader({
        titleColor: ${JSON.stringify(navigationBarStyle?.color)},
        barBackgroundColor: ${JSON.stringify(navigationBarStyle?.backgroundColor)},
      })
      Index()
    }
    .hideTitleBar(true)
  }
}

${page.content}
`;
    }
    case 'none': {
      return `${page.importManager.toCode()}

/** ${page.meta.title} */
@ComponentV2
export default struct Page {
  build() {
    NavDestination() {
      Index()
    }
    .hideTitleBar(true)
  }
}

${page.content}
`;
    }
  }
}

const handlePopupCode = (page: ReturnType<typeof toHarmonyCode>[0]) => {
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: "../utils/types",
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("controller:")) {
    page.importManager.addImport({
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }
  return `${page.importManager.toCode()}

      /** ${page.meta.title} */
      @ComponentV2
      export default struct Page {
        build() {
          NavDestination() {
            Index()
          }
          .hideTitleBar(true)
          .mode(NavDestinationMode.DIALOG)
        }
      }
  
      ${page.content}
      `;
}

const handleModuleCode = (page: ReturnType<typeof toHarmonyCode>[0]) => {
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: "../utils/types",
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("controller:")) {
    page.importManager.addImport({
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }
  return `${page.importManager.toCode()}

      ${page.content}
      `;
}

const handleGlobalCode = (page) => {
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: "../utils/types",
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("createVariable")) {
    page.importManager.addImport({
      packageName: "../utils/mybricks",
      dependencyNames: ["createVariable"],
      importType: "named",
    });
  }
  if (page.content.includes("createFx")) {
    page.importManager.addImport({
      packageName: "../utils/mybricks",
      dependencyNames: ["createFx"],
      importType: "named",
    });
  }

  return `${page.importManager.toCode()}
  
  ${page.content}`
}

export const compilerHarmony2 = async (params, config) => {
  await compilerHarmonyModule(params, config)
}

const generatePageFileName = (text: string) => {
  const splits = cleanAndSplitString(text);
  
  return splits.reduce((pre, cur) => {
    return pre + firstCharToUpperCase(pinyin.convertToPinyin(cur, "", true))
  }, "") + "Page"
}

const generatePageCodeWithMetadata = (params) => {
  const { toJson, componentMetaMap } = params;
  const usedComponentsMap = {};
  const pageCode = toHarmonyCode(toJson, {
    getComponentMetaByNamespace(namespace, config) {
      if (!usedComponentsMap[namespace]) {
        usedComponentsMap[namespace] = config;
      }

      let componentName = convertNamespaceToComponentName(namespace);
      const dependencyNames: string[] = [];

      if (config.type === "js") {
        componentName = componentName[0].toLowerCase() + componentName.slice(1);
      }

      dependencyNames.push(componentName);
  
      return {
        dependencyImport: {
          packageName: COMPONENT_PACKAGE_NAME,
          dependencyNames,
          importType: "named",
        },
        componentName: componentName,
      };
    },
    getComponentPackageName() {
      return COMPONENT_PACKAGE_NAME
    }
  });

  let importComponentCode = "";
  let declaredComponentCode = "";

  Object.entries(usedComponentsMap).forEach(([namespace, config]: any) => {
    const namespaceSplit = namespace.split(".")

    const importName = namespaceSplit.join("_");
    const asImportName = (config.type === "ui" ? "Basic" : "basic") + namespaceSplit.map((text) => {
      if (text.toUpperCase() === "MYBRICKS") {
        return "MyBricks";
      }

      return text[0].toUpperCase() + text.slice(1);
    }).join("")

    importComponentCode += `${importName} as ${asImportName},`

    if (config.type === "ui") {
      const importData = importName + "_Data";
      importComponentCode += `${importData},`
      const componentName = asImportName.replace("Basic", "");
      const { hasSlots } = componentMetaMap[namespace]
      declaredComponentCode += `@Builder
      function ${componentName}Builder (params: MyBricksComponentBuilderParams) {
        ${asImportName}({
          uid: params.uid,
          data: new ${importData}(params.data as MyBricks.Any),
          inputs: createInputsHandle(params),
          outputs: createEventsHandle(params),
          styles: createStyles(params),
          ${hasSlots ? "slots: params.slots," : ""}
          ${hasSlots ? "slotsIO: params.slotsIO," : ""}
          parentSlot: params.parentSlot
        })
      }
      
      @ComponentV2
      export struct ${componentName} {
        @Param @Require uid: string;
        @Param controller: MyBricks.Controller = Controller();
        @Param @Require data: MyBricks.Data
        @Param events: MyBricks.Events = {}
        @Param styles: Styles = {};
        @Local columnVisibilityController: ColumnVisibilityController = new ColumnVisibilityController()
        ${hasSlots ? "@BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;" : ""}
        ${hasSlots ? "@Local slotsIO: MyBricks.Any = createSlotsIO();" : ""}
        @Param parentSlot?: MyBricks.SlotParams = undefined

        myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

        build() {
          Column() {
            if (this.parentSlot?.itemWrap) {
              this.parentSlot.itemWrap({
                id: this.uid,
                inputs: this.controller._inputEvents
              }).wrap.builder(wrapBuilder(${componentName}Builder), this, this.parentSlot.itemWrap({
                id: this.uid,
                inputs: this.controller._inputEvents
              }).params)
            } else {
              ${componentName}Builder(this)
            }
          }
          .attributeModifier(this.myBricksColumnModifier)
          .visibility(this.columnVisibilityController.visibility)
        }
      }\n`
    } else {
      let componentName = asImportName.replace("basic", "");
      componentName = componentName[0].toLowerCase() + componentName.slice(1);
      declaredComponentCode += `export const ${componentName} = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
        return createJSHandle(${asImportName}, { props, env });
      }\n`
    }
  })

  return {
    pageCode,
    declaredComponentCode,
    importComponentCode
  }
}

/** 下载模块 */
const compilerHarmonyModule = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type, fileId } = params;
  const { Logger } = config;
  const { pageCode, importComponentCode, declaredComponentCode } = generatePageCodeWithMetadata({
    toJson: data.toJson,
    componentMetaMap: data.componentMetaMap
  });

  // 目标项目路径
  const targetPath = path.join(projectPath, "module");

  // 拷贝项目
  await fse.copy(path.join(__dirname, "./hm/Component"), targetPath, { overwrite: true })
  // 拷贝comlib
  await fse.copy(path.join(__dirname, "./hm/comlib"), path.join(targetPath, "comlib"), { overwrite: true })
  // 拷贝utils
  await fse.copy(path.join(__dirname, "./hm/utils"), path.join(targetPath, "utils"), { overwrite: true })
  // 拷贝_proxy
  await fse.copy(path.join(__dirname, "./hm/_proxy"), path.join(targetPath, "_proxy"), { overwrite: true })
  let _proxyIndexCode = await fse.readFile(path.join(__dirname, "./hm/_proxy/Index.ets"), 'utf-8')

  let apiCode = await fse.readFile(path.join(targetPath, "api.ets"), "utf-8");
  apiCode = apiCode.replace("$r('app.config.pageUrl')", `"myBricks${fileId}"`);

  const sceneMap = {};
  const moduleNames = new Set<string>();

  pageCode.forEach((page) => {
    if (page.type === "extensionEvent") {
      // 业务模块
      apiCode = apiCode.replace("$r('app.api.import')", page.importManager.toCode()).replace("$r('app.api.open')", page.content)
      return
    }

    if (page.type === "global") {
      // 全局变量、全局Fx
      fse.outputFileSync(path.join(targetPath, `_proxy/global.ets`), handleGlobalCode(page), { encoding: "utf8" })
      return
    }

    if (page.type === "module") {
      moduleNames.add(page.name);
      fse.outputFileSync(path.join(targetPath, `sections/${page.name}.ets`), handleModuleCode(page), { encoding: "utf8" })
      return
    }


    if (page.meta) {
      sceneMap[page.meta.id] = page.meta;
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

    fse.outputFileSync(path.join(targetPath, `pages/${page.name}Page.ets`), content, { encoding: "utf8" })
  });

  if (moduleNames.size) {
    // 有区块，补充区块的入口文件
    fse.outputFileSync(
      path.join(targetPath, `sections/index.ets`),
      Array.from(moduleNames).reduce((pre, cur) => {
        return pre + `export { default as ${cur} } from "./${cur}"\n`
      }, ""),
      { encoding: "utf8" })
  }

  await fse.writeFile(
    path.join(targetPath, "_proxy/Index.ets"),
    _proxyIndexCode
      .replace(
        "{ domain: undefined }",
        `{ domain: ${data.appConfig?.defaultCallServiceHost ? JSON.stringify(data.appConfig?.defaultCallServiceHost) : undefined}}`,
      )
      .replace(
        "{ domain: undefined}",
        `{ domain: ${data.appConfig?.defaultCallServiceHost ? JSON.stringify(data.appConfig?.defaultCallServiceHost) : undefined}}`,
      )
      .replace("$r('app._proxy.component.import')", importComponentCode ? `import { ${importComponentCode} } from "../comlib/Index"` : "")
      .replace("$r('app._proxy.component.declared')", declaredComponentCode)
  );
  await fse.writeFile(path.join(targetPath, "api.ets"), apiCode)

  // 写入搭建Js
  const jsCodePath = path.join(targetPath, "_proxy/codes.js");
  await fse.ensureFile(jsCodePath)
  await fse.writeFile(jsCodePath, `export default (function(comModules) {
    ${decodeURIComponent(data.allModules?.all)};
    return comModules;
  })({})`, { encoding: "utf8" })

  // tabbar配置
  const tabbarConfig = (data.tabBarJson ?? []).map(item => {
    const { pagePath, ...others } = item
    return {
      id: item.pagePath.split('/')[1],
      ...others,
    }
  })

  // 入口场景
  const entryScene = sceneMap[data.entryPageId]

  // tabbar场景
  const tabbarScenes: string[] = data.pages.filter(p => 
    (data.tabBarJson || []).some(
      (b) => b?.id === p?.id
    )
  ).map(p => {
    return sceneMap[p.id]
  })

  // 普通场景
  const normalScenes: string[] = data.pages.filter(p => 
    !(data.tabBarJson || []).some(
      (b) => b?.id === p?.id
    )
  ).map(p => {
    return sceneMap[p.id]
  })

  // 弹窗也写入普通场景判断中
  data.toJson.scenes.forEach((scene) => {
    if (scene.type === "popup") {
      normalScenes.push(sceneMap[scene.id])
    }
  })

  const entryPath = path.join(targetPath, "./pages/Index.ets");
  await fse.copy(path.join(__dirname, "./hm/pages/Index.ets"), entryPath, { overwrite: true });
  
  let entryFileContent = await fse.readFile(entryPath, 'utf-8')

  entryFileContent = handleEntryCode(entryFileContent, {
    normalScenes,
    tabbarScenes,
    tabbarConfig,
    entryScene
  })
  await fse.writeFile(entryPath, entryFileContent, 'utf-8')
}
