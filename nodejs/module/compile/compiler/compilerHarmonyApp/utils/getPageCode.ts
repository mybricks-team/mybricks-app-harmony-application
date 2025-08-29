import toHarmonyCode from "@mybricks/to-code-react/dist/cjs/toHarmonyCode"
import convertNamespaceToComponentName from "./convertNamespaceToComponentName"
import getModuleInfoByNamespace from "./getModuleInfoByNamespace"
import { COMPONENT_PACKAGE_NAME } from "./constant"
import { firstCharToUpperCase } from "./string"

const getPageCode = async (params, modulesData, result = { }) => {
  const { key, moduleName, data, useLog, download, getBus, getApi } = params;
  const { toJson } = data;
  const verbose = useLog;
  const usedComponentsMap = {};
  const usedModuleIds = new Set();
  const pageCode = toHarmonyCode(toJson, {
    getComponentMeta(com, config) {
      const { namespace, rtType } = com.def;
      if (namespace.startsWith("mybricks.harmony.module")) {
        const { moduleId, pageId } = getModuleInfoByNamespace(namespace);
        usedModuleIds.add(moduleId);
        const { moduleName, sceneIdToName } = modulesData[moduleId];

        if (rtType?.match(/^js/gi)) {
          const componentName = `${moduleName}Api`

          return {
            importInfo: {
              from: `../../${moduleName}/api`,
              name: `api as ${componentName}`,
              type: "named",
            },
            name: componentName,
            callName: componentName,
          }
        }

        const sectionName = firstCharToUpperCase(sceneIdToName[pageId])
        const componentName = `${firstCharToUpperCase(moduleName)}${sectionName}`

        return {
          importInfo: {
            from: `../../${moduleName}/sections/Index`,
            name: `${sectionName} as ${componentName}`,
            type: "named",
          },
          name: componentName,
          callName: componentName,
        }
      }

      if (["mybricks.core-comlib.js-ai", "mybricks.harmony._muilt-inputJs"].includes(namespace)) {
        return {
          importInfo: {
            name: "jsModules",
            from: ["extension-config", "extension-api", "extension-bus", "extension-event"].includes(config?.json?.type) ? 
              "./common/Index" :
              COMPONENT_PACKAGE_NAME,
            type: "named",
          },
          name: "jsModules",
          callName: `jsModules.${com.id}`
        }
      }

      if (!usedComponentsMap[namespace]) {
        usedComponentsMap[namespace] = com;
      }

      let componentName = convertNamespaceToComponentName(namespace);

      if (rtType?.match(/^js/gi)) {
        componentName = componentName[0].toLowerCase() + componentName.slice(1);
      }

      return {
        importInfo: {
          from: download.source === "sourceCode" ? 
            (
              ["extension-config", "extension-api", "extension-bus", "extension-event"].includes(config?.json?.type) ? 
                "./common/Index" :
                COMPONENT_PACKAGE_NAME
            ) : 
            "@mybricks/comlib-harmony-normal",
          name: componentName,
          type: "named",
        },
        name: componentName,
        callName: componentName,
      };
    },
    getComponentPackageName(params) {
      if (params?.type === "extensionEvent") {
        return "./common/Index"
        // return download.source === "sourceCode" ? "./common/Index" : "./common/Index"
      }
      return "../common/Index"
      // return download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : "../common/Index"
    },
    getUtilsPackageName() {
      return "@mybricks/render-utils"
      // return download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : "@mybricks/render-utils"
    },
    getPageId(id) {
      if (key === "app") {
        return `app_${id}`
      }

      return `${modulesData[key].moduleName}_${id}`;
    },
    getBus,
    getApi,
    verbose,
    getModuleApi(type) {
      if (type === "event") {
        const componentName = "events";
        return {
          dependencyImport: {
            packageName: "../api",
            dependencyNames: [componentName],
            importType: "named",
          },
          componentName,
        };
      }
    }
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
        getBus,
        getApi
      }, modulesData, result)
    }))
  }

  return result;
}

export default getPageCode
