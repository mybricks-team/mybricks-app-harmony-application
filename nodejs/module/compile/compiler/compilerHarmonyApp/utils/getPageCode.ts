import toHarmonyCode from "@mybricks/to-code-react/dist/cjs/toHarmonyCode"
import convertNamespaceToComponentName from "./convertNamespaceToComponentName"
import getModuleInfoByNamespace from "./getModuleInfoByNamespace"
import { COMPONENT_PACKAGE_NAME } from "./constant"
import { firstCharToUpperCase } from "./string"

const getPageCode = async (params, modulesData, result = { }) => {
  const { key, moduleName, data } = params;
  const usedComponentsMap = {};
  const usedModuleIds = new Set();
  const pageCode = toHarmonyCode(data.toJson, {
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
              dependencyNames: [componentName],
              importType: "default",
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
          packageName: COMPONENT_PACKAGE_NAME,
          dependencyNames,
          importType: "named",
        },
        componentName: componentName,
      };
    },
    getComponentPackageName() {
      return COMPONENT_PACKAGE_NAME
    },
    getPageId(id) {
      if (key === "app") {
        return `app_${id}`
      }

      return `${modulesData[key].moduleName}_${id}`;
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
        data: module.data
      }, modulesData, result)
    }))
  }

  return result;
}

export default getPageCode
