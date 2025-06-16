import API from "@mybricks/sdk-for-app/api"
import generateFileName from "./generateFileName"
import { firstCharToLowerCase } from "./string"

const getModules = async (installedModules) => {
  // const harmonyModule = await API.Material.getMaterialContent({ namespace: `mybricks.harmony.module.${moduleId}` })
  // const { publishId } = harmonyModule.content
  // const publishContent = await API.File.getPublishContent({ pubId: publishId })
  // const module = publishContent.content

  const modulesData = {};

  await Promise.all(installedModules.map(async ({ id: moduleId }) => {
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
    })

    modulesData[moduleId] = {
      ...module,
      moduleName: firstCharToLowerCase(generateFileName(module.title)),
      sceneIdToName
    }
  }))

  return modulesData;
}

export default getModules
