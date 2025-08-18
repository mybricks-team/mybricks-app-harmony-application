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

  const httpPlugin = publishContent.content.data.toJson.plugins['@mybricks/plugins/service'];
  const module = publishContent.content;
  const { appConfig } = module.data;

  if (Array.isArray(httpPlugin?.connectors)) {
    Object.entries(json.coms).forEach(([_, com]: any) => {
      if (com.def.namespace === "mybricks.harmony._connector") {
        const comConnector = com.model.data.connector;
        const httpConnector = httpPlugin.connectors.find((connector) => connector.id === comConnector.id);

        if (httpConnector) {
          com.model.data.connector = {
            ...com.model.data.connector,
            ...httpConnector,
            content: {
              globalParamsFn: httpPlugin.config.paramsFn,
              globalResultFn: httpPlugin.config.resultFn,
              globalErrorResultFn: httpPlugin.config.errorResultFn,
            }
          }

          if (!/^(http|https):\/\/.*/.test(com.model.data.connector.path) && appConfig?.defaultCallServiceHost) {
            com.model.data.connector.path = `${appConfig.defaultCallServiceHost}${com.model.data.connector.path}`;
          }
        }
      }
    })
  }

  return json;
}

export default loadPage
