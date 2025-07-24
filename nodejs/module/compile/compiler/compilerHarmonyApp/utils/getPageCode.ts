import toHarmonyCode from "@mybricks/to-code-react/dist/cjs/toHarmonyCode"
import convertNamespaceToComponentName from "./convertNamespaceToComponentName"
import getModuleInfoByNamespace from "./getModuleInfoByNamespace"
import { COMPONENT_PACKAGE_NAME } from "./constant"
import { firstCharToUpperCase } from "./string"

const getPageCode = async (params, modulesData, result = { }) => {
  const { key, moduleName, data, useLog, download } = params;
  const { toJson } = data;
  const verbose = useLog;
  const usedComponentsMap = {};
  const usedModuleIds = new Set();
  const pageCode = toHarmonyCode(toJson, {
    getComponentMetaByNamespace(namespace, config) {
      if (namespace.startsWith("mybricks.harmony.module")) {
        const { moduleId, pageId } = getModuleInfoByNamespace(namespace);
        usedModuleIds.add(moduleId);
        const { moduleName, sceneIdToName } = modulesData[moduleId];

        if (config.type === "js") {
          const componentName = `${moduleName}Api`

          return {
            dependencyImport: {
              packageName: `../../${moduleName}/api`,
              dependencyNames: [`api as ${componentName}`],
              importType: "named",
            },
            componentName,
          }
        }

        const sectionName = firstCharToUpperCase(sceneIdToName[pageId])
        const componentName = `${firstCharToUpperCase(moduleName)}${sectionName}`

        return {
          dependencyImport: {
            packageName: `../../${moduleName}/sections`,
            dependencyNames: [`${sectionName} as ${componentName}`],
            importType: "named",
          },
          componentName,
        }
      }

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
          packageName: download.source === "sourceCode" ? (config.source === "extensionEvent" ? "./components/Index" : COMPONENT_PACKAGE_NAME) : "@mybricks/comlib-harmony-normal",
          dependencyNames,
          importType: "named",
        },
        componentName: componentName,
      };
    },
    getComponentPackageName(params) {
      if (params?.type === "extensionEvent") {
        return download.source === "sourceCode" ? "./components/Index" : "./components"
      }
      return download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : "../components"
    },
    getUtilsPackageName() {
      return download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : "@mybricks/render-utils"
    },
    getPageId(id) {
      if (key === "app") {
        return `app_${id}`
      }

      return `${modulesData[key].moduleName}_${id}`;
    },
    verbose,
  });

  result[key] = {
    moduleName,
    pageCode,
    usedComponentsMap,
    data
  }

  if (usedModuleIds.size) {
    await Promise.all(Array.from(usedModuleIds).map(async (moduleId: any) => {
      const module = modulesData[moduleId]
      await getPageCode({
        key: moduleId,
        moduleName: module.moduleName,
        data: module.data,
        download,
        useLog,
      }, modulesData, result)
    }))
  }

  return result;
}

export default getPageCode
