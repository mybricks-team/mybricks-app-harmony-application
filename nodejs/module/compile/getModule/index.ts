import API from "@mybricks/sdk-for-app/api";
import { runtime, editors, runtimeJs, upgrade } from './template';

function calculateUiComponent({ tojson, version, origin, module, sectionsMap }) {
  const mainScene = tojson;
  const { pinRels } = mainScene;
  const relsOutputsMap: { [key: string]: boolean } = {};
  const inputsRelOutputsMap: { [key: string]: string[] } = {};
  const noRelsOutputs: Array<{
    id: string;
    title: string;
    schema: any;
  }> = [];
  const config: { [key: string]: unknown } = {};
  const configs: {
    id: string;
    title: string;
    type: string;
    defaultValue?: string;
    description?: string;
  }[] = [];
  const inputs = mainScene.inputs
    .filter((input) => {
      const { id, type, title, editor, extValues } = input;
      if (type === "normal") {
        const outputIds = pinRels[`_rootFrame_-${id}`];
        inputsRelOutputsMap[id] = outputIds;
        if (outputIds) {
          outputIds.forEach((id) => {
            relsOutputsMap[id] = true;
          });
        }
        return true;
      } else if (type === "config" && editor?.type) {
        config[id] = extValues?.config?.defaultValue;
        configs.push({
          id,
          title: title,
          type: editor.type,
          defaultValue: extValues?.config?.defaultValue,
          description: extValues?.config?.description,
        });
      }

      return false;
    })
    .map(({ id, title, schema }) => {
      return {
        id,
        title,
        schema,
        rels: pinRels[`_rootFrame_-${id}`],
      };
    });

  const outputs = mainScene.outputs.map(({ id, title, schema }) => {
    if (!relsOutputsMap[id]) {
      noRelsOutputs.push({ id, title, schema });
    }

    return {
      id,
      title,
      schema,
    };
  });

  const slotStyle = mainScene.slot.style;

  let replaceWidth;
  if (slotStyle.widthAuto) {
    replaceWidth = `"fit-content"`;
  } else if (slotStyle.widthFull) {
    replaceWidth = `"100%"`;
  } else {
    replaceWidth = slotStyle.width;
  }
  let replaceHeight;
  if (slotStyle.heightAuto) {
    replaceHeight = `"auto"`;
  } else if (slotStyle.heightFull) {
    replaceHeight = `"100%"`;
  } else {
    replaceHeight = slotStyle.height;
  }
  Reflect.deleteProperty(slotStyle, "width");
  Reflect.deleteProperty(slotStyle, "height");
  Reflect.deleteProperty(slotStyle, "widthAuto");
  Reflect.deleteProperty(slotStyle, "heightAuto");
  slotStyle.widthFull = true;
  slotStyle.heightFull = true;

  // [TODO] version
  return `{
    namespace: "mybricks.harmony.module.${module.id}.${tojson.id}",
    version: "${version}",
    previewImageData: "${sectionsMap?.[tojson.id]?.previewImageData || ""}",
    title: "${mainScene.title}",
    description: "${mainScene.title}",
    data: ${JSON.stringify({ config })},
    inputs: ${JSON.stringify(inputs)},
    outputs: ${JSON.stringify(outputs)},
    isCloudComponent: true,
    editors: (${editors
      .replace('"--replace-init-width--"', replaceWidth)
      .replace('"--replace-init-height--"', replaceHeight)
      .replace('"--replace-title--"', `"${mainScene.title}"`)
      .replace('"--replace-configs--"', JSON.stringify(configs))
      .replace(
        '"--replace-events-visible--"',
        noRelsOutputs.length ? " true" : " false" // 前面补一个空格，防止和 return 贴上
      )
      .replace('"--replace-events--"', JSON.stringify(noRelsOutputs))
      .replace('"--replace-id--"', module.id)
      .replace('"--origin--"', `"${origin}"`)})(),
    runtime: ${runtime
      .replace('"--replace-moduleId--"', JSON.stringify(mainScene.id))
      .replace('"--replace-moduleId--"', module.id)
      .replace('--replace-moduleVersion--', version)
      .replace('"--replace-inputsRelOutputsMap--"', JSON.stringify(inputsRelOutputsMap))},
    upgrade: ${upgrade
      .replace(`"__inputs__"`, JSON.stringify(inputs))
      .replace(`"__outputs__"`, JSON.stringify(outputs))
      .replace(
        `"__data__"`,
        JSON.stringify({
          config,
        })
      )}
  }`
}

function calculateJsComponent({ tojson, version, origin, module }) {
  const mainScene = tojson;
  const { pinRels } = mainScene;
  const relsOutputsMap: { [key: string]: boolean } = {};
  const noRelsOutputs = [];
  const config: { [key: string]: unknown } = {};
  const configs: {
    id: string;
    title: string;
    type: string;
    defaultValue?: string;
    description?: string;
  }[] = [];

  const inputs = mainScene.inputs
    .filter((input) => {
      const { id, type, title, editor, extValues } = input;
      if (type === "normal") {
        const outputIds = pinRels[`_rootFrame_-${id}`];
        if (outputIds) {
          outputIds.forEach((id) => {
            relsOutputsMap[id] = true;
          });
        }
        return true;
      } else if (type === "config" && editor?.type) {
        config[id] = extValues?.config?.defaultValue;
        configs.push({
          id,
          title: title,
          type: editor.type,
          defaultValue: extValues?.config?.defaultValue,
          description: extValues?.config?.description,
        });
      }

      return false;
    })
    .map(({ id, title, schema }) => {
      return {
        id,
        title,
        schema,
        // rels: pinRels[`_rootFrame_-${id}`],
        rels: mainScene.outputs.map(({ id }) => id)
      };
    });

  // const outputs = mainScene.outputs.map(({ id, title, schema }) => {
  //   if (!relsOutputsMap[id]) {
  //     noRelsOutputs.push({ id, title, schema });
  //   }

  //   return {
  //     id,
  //     title,
  //     schema,
  //   };
  // });

  // outputs: ${JSON.stringify(outputs)},
  // [TODO] version
  return `{
    namespace: "mybricks.harmony.module.${module.id}.${tojson.id}",
    version: "${version}",
    title: "${mainScene.title}",
    description: "${mainScene.title}",
    rtType: "js",
    data: ${JSON.stringify({ config })},
    inputs: ${JSON.stringify(inputs)},
    outputs: ${JSON.stringify(mainScene.outputs)},
    isCloudComponent: true,
    editors: (${editors
      .replace('"--replace-title--"', `"${mainScene.title}"`)
      .replace('"--replace-configs--"', JSON.stringify(configs))
      .replace(
        '"--replace-events-visible--"',
        noRelsOutputs.length ? " true" : " false" // 前面补一个空格，防止和 return 贴上
      )
      .replace('"--replace-events--"', JSON.stringify(noRelsOutputs))
      .replace('"--replace-id--"', module.id)
      .replace('"--origin--"', `"${origin}"`)})(),
    runtime: ${runtimeJs
      .replace('"--replace-tojson--"', JSON.stringify(mainScene))
      .replace('"--replace-moduleId--"', module.id)
      .replace('--replace-moduleVersion--', version)},
    upgrade: ${upgrade
      .replace(`"__inputs__"`, JSON.stringify(inputs))
      .replace(`"__outputs__"`, JSON.stringify(mainScene.outputs))
      .replace(
        `"__data__"`,
        JSON.stringify({
          config,
        })
      )}
    }`
}

const getModule = async (params) => {
  const { moduleId, version, origin } = params;
  // const harmonyModule = await API.Material.getMaterialContent({
  //   namespace: `mybricks.harmony.module.${moduleId}`,
  //   version
  // })
  // [TEMP] 临时测试用，拉最新的版本
  const harmonyModule = await API.Material.getMaterialContent({ namespace: `mybricks.harmony.module.${moduleId}`, })

  const { publishId } = harmonyModule.content
  const publishContent = await API.File.getPublishContent({ pubId: publishId });
  const file: any = await API.File.getFile({ id: publishContent.fileId });

  // [TODO]
  const module = publishContent.content;
  const { toJson, sectionsMap } = module.data;
  toJson.global.fxFrames.forEach((fxFrame) => {
    Object.entries(fxFrame.pinProxies).forEach(([_, pinProxy]: any) => {
      if (pinProxy.type === "extension") {
        pinProxy.moduleId = module.id
      }
    })
  })

  const httpPlugin = toJson.plugins['@mybricks/plugins/service'];

  const baseToJson = {
    ...toJson,
    global: {
      ...toJson.global,
      fxFrames: toJson.global.fxFrames.filter((fxFrame) => {
        return fxFrame.type !== "extension-config"
      })
    },
    frames: [],
    scenes: [],
    modules: {}
  }
  const modules = {};
  let configFx = {};
  let comArayCode = "";
  toJson.scenes.forEach((scene) => {
    if (Array.isArray(httpPlugin?.connectors)) {
      // 模块内的服务接口插件数据
      Object.entries(scene.coms).forEach(([_, com]: any) => {
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
          }
        }
      })
    }
    if (scene.type === "module") {
      modules[scene.id] = scene
      comArayCode += `${calculateUiComponent({ tojson: scene, version: publishContent.version, origin, module, sectionsMap })},`
    }
    Object.entries(scene.pinProxies).forEach(([_, pinProxy]: any) => {
      if (pinProxy.type === "extension") {
        // 用于渲染器调用callExtension，获取主应用的extension(fx)
        pinProxy.moduleId = module.id
      }
    })
  })

  // const callback = []
  // callback: ${JSON.stringify(callback)}

  const configData: { [key: string]: unknown } = {};
  const configEditors: {
    id: string;
    title: string;
    type: string;
    defaultValue?: string;
    description?: string;
  }[] = [];

  toJson.global.fxFrames.forEach((fxFrame) => {
    if (fxFrame.type === "extension-api") {
      comArayCode += `${calculateJsComponent({ tojson: fxFrame, version: publishContent.version, origin, module })},`
    }

    if (fxFrame.type === "extension-config") {
      fxFrame.inputs.forEach((input) => {
        const { id, title, type, editor, extValues } = input;
        if (type === "config") {
          // 这里应该不需要判断，只能添加配置项
          configData[id] = extValues?.config?.defaultValue;
          configEditors.push({
            id,
            title: title,
            type: editor.type,
            defaultValue: extValues?.config?.defaultValue,
            description: extValues?.config?.description,
          });
        }
      })
      configFx = fxFrame
    }
  })

  return {
    code: `(() => {
  const baseToJson = ${JSON.stringify(baseToJson)}
  const modules = ${JSON.stringify(modules)}
  const configFx = ${JSON.stringify(configFx)}
  const reRenderSet = new Set()
  class Var {
    _varChangeCallBack = new Map();
    _valuesTitleMap = new Map();
    _valuesIdMap = new Map();

    regist(id, cb) {
      let callBack = this._varChangeCallBack.get(id);
      if (!callBack) {
        callBack = new Set();
        this._varChangeCallBack.set(id, callBack);
      }
      callBack.add(cb);
    }

    destroy(id, cb) {
      const callBack = this._varChangeCallBack.get(id);
      if (callBack) {
        callBack.delete(cb);
      }
    }

    changed(params) {
      const { com, value } = params;
      const id = com.id;
      this._valuesTitleMap.set(com.title, value);
      this._valuesIdMap.set(id, value);
      const callBack = this._varChangeCallBack.get(id);
      if (callBack) {
        callBack.forEach((cb) => {
          cb(value);
        });
      }
    }

    getValueByTitle(title) {
      return this._valuesTitleMap.get(title);
    }

    getValueById(id) {
      return this._valuesIdMap.get(id);
    }

    clone() {
      const { _valuesTitleMap, _valuesIdMap } = this;
      const clone = new Var();

      clone._valuesIdMap = new Map(_valuesIdMap);
      clone._valuesTitleMap = new Map(_valuesTitleMap);

      return clone;
    }
  }


  const globalVariables = new Var();

  const defaultData = ${JSON.stringify(configData)};

  let env;

  const excuteConfig = (params) => {
    const { env, data } = params;
    env.renderModule(configFx, {
        ref(_refs) {
          configFx.inputs.forEach(({ id }) => {
            _refs.inputs[id](data[id]);
          })
        },
        env: {
          scenesOperate: {
            getGlobalComProps(comId) {
              return {
                data: {
                  val: globalVariables.getValueById(comId)
                }
              }
            },
            exeGlobalCom({ com, value }) {
              globalVariables.changed({ com, value });
            },
            var: globalVariables
          }
        }
      })
  }

  window.module_${module.id} = {
    id: ${module.id},
    title: "${module.title}",
    version: "${harmonyModule.version}",
    comAray: [${comArayCode}],
    updateTime: "${publishContent.updateTime}",
    author: "${file.creatorName || "-"}",
    data: defaultData,
    config: (params) => {
      env = params.env;
      Object.entries(defaultData).forEach(([key, value]) => {
        if (!(key in params.data)) {
          params.data[key] = value;
        }
      })

      excuteConfig({ env, data: params.data });
    },
    editors: [${configEditors.reduce((pre, cur) => {
      return pre + `{
        title: "${cur.title}",
        type: "${cur.type}",
        description: "${cur.description || ""}",
        value: {
          get(params) {
            return params.data["${cur.id}"]
          },
          set(params, value) {
            params.data["${cur.id}"] = value

            excuteConfig({ env, data: params.data });

            reRenderSet.forEach((reRender) => {
              reRender()
            })
          }
        }
      },`;
    }, "")}],
    modules
  }
})()`
  }
}

export default getModule;
