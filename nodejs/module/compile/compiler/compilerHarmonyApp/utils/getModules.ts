import API from "@mybricks/sdk-for-app/api"
import generateFileName from "./generateFileName"
import { firstCharToLowerCase } from "./string"

const transformComs = (coms) => {
  Object.entries(coms).forEach(([key, com]: any) => {
    if (["mybricks.core-comlib.js-ai", "mybricks.harmony._muilt-inputJs"].includes(com.def.namespace)) {
      if (!("runImmediate" in com.model.data)) {
        com.model.data = {
          runImmediate: false,
        }
      } else {
        com.model.data = {
          runImmediate: com.model.data.runImmediate
        }
      }
    }
  })
}

const getModules = async (installedModules) => {
  const modulesData = {};

  await Promise.all(installedModules.map(async ({ id: moduleId, data }) => {
    const harmonyModule = await API.Material.getMaterialContent({ namespace: `mybricks.harmony.module.${moduleId}` })
    const { publishId } = harmonyModule.content
    const publishContent = await API.File.getPublishContent({ pubId: publishId })
    const module = publishContent.content
    const sceneIdToName = {}

    module.data.toJson.scenes.forEach((scene) => {
      if (scene.type === "module") {
        // 区块将被作为组件使用
        sceneIdToName[scene.id] = firstCharToLowerCase(generateFileName(scene.title))
      }

      transformComs(scene.coms);
    })

    transformComs(module.data.toJson.global.comsReg || {})

    module.data.toJson.global.fxFrames.forEach((fxFrame) => {
      transformComs(fxFrame.coms);
    })

    const extensionConfigFrame = module.data.toJson.global.fxFrames.find((frame) => {
      return frame.type === "extension-config";
    })

    const configs = {};

    if (extensionConfigFrame) {
       extensionConfigFrame.inputs.forEach((input) => {
        const { id, title, type, editor, extValues } = input;
        if (id in data) {
          configs[id] = data[id]
        } else {
          configs[id] = extValues?.config?.defaultValue
        }
      })
    }

    modulesData[moduleId] = {
      ...module,
      moduleName: firstCharToLowerCase(generateFileName(module.title)),
      sceneIdToName,
      configs
    }
  }))

  return modulesData;
}

export default getModules
