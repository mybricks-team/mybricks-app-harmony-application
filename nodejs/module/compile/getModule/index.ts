import API from "@mybricks/sdk-for-app/api";
import { runtime, editors, runtimeJs } from './template';

function calculateUiComponent({tojson, version, origin, module, sectionsMap}) {
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
    version: "0.0.1",
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
      .replace('"--replace-tojson--"', JSON.stringify(mainScene))
      .replace('"--replace-moduleId--"', module.id)
      .replace('--replace-moduleVersion--', version)
      .replace('"--replace-inputsRelOutputsMap--"', JSON.stringify(inputsRelOutputsMap))}
  }`
}

function calculateJsComponent({tojson, version, origin, module}) {
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

  // outputs: ${JSON.stringify(outputs)},
  // [TODO] version
  return `{
    namespace: "mybricks.harmony.module.${module.id}.${tojson.id}",
    version: "0.0.1",
    title: "${mainScene.title}",
    description: "${mainScene.title}",
    rtType: "js",
    data: ${JSON.stringify({ config })},
    inputs: ${JSON.stringify(inputs)},
    outputs: [],
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
      .replace('--replace-moduleVersion--', version)}
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

  const baseToJson = {
    ...toJson,
    scenes: [],
    modules: {}
  }
  let comArayCode = "";
  toJson.scenes.forEach((scene) => {
    if (scene.type === "module") {
      comArayCode += `${calculateUiComponent({tojson: scene, version, origin, module, sectionsMap})},`
    }
    Object.entries(scene.pinProxies).forEach(([_, pinProxy]: any) => {
      if (pinProxy.type === "extension") {
        // 用于渲染器调用callExtension，获取主应用的extension(fx)
        pinProxy.moduleId = module.id
      }
    })
  })

  const callback = []

  toJson.global.fxFrames.forEach((fxFrame) => {
    if (fxFrame.type === "extension") {
      comArayCode += `${calculateJsComponent({tojson: fxFrame, version, origin, module})},`
      fxFrame.outputs.forEach((output) => {
        callback.push({
          id: output.id,
          title: output.title,
          schema: {
            type: "any",
          }
        })
      })
    }
  })

  return {
    code: `(() => {
  const baseToJson = ${JSON.stringify(baseToJson)}
  window.module_${module.id} = {
    id: ${module.id},
    comAray: [],
    title: "${module.title}",
    version: "${harmonyModule.version}",
    comAray: [${comArayCode}],
    callback: ${JSON.stringify(callback)}
  }
})()`
  }
}

export default getModule;
