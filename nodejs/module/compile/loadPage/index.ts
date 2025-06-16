import API from "@mybricks/sdk-for-app/api";

const loadPage = async (params) => {
  const { moduleId, version, pageId } = params;
  // [TEMP] 临时测试用，拉最新的版本
  const harmonyModule = await API.Material.getMaterialContent({ namespace: `mybricks.harmony.module.${moduleId}`, })
  const publishContent = await API.File.getPublishContent({ pubId: harmonyModule.content.publishId });
  
  const json = publishContent.content.data.toJson.scenes.find((scene) => scene.id === pageId);
  json.extra = {
    moduleId,
    moduleVersion: harmonyModule.version
  }

  return json;
}

export default loadPage
