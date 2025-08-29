const getUsedComponent = (params) => {
  const { usedComponentsMap, componentMetaMap, verbose } = params
  let importComponentCode = "";
  let declaredComponentCode = "";

  Object.entries(usedComponentsMap).forEach(([namespace, com]: any) => {
    const namespaceSplit = namespace.split(".")

    const importName = namespaceSplit.join("_");
    const isUI = !com.def.rtType;
    
    const asImportName = (isUI ? "Basic" : "basic") + namespaceSplit.map((text) => {
      if (text.toUpperCase() === "MYBRICKS") {
        return "MyBricks";
      }

      return text[0].toUpperCase() + text.slice(1);
    }).join("")

    importComponentCode += `${importName} as ${asImportName},`
    if (isUI) {
      const importData = importName + "_Data";
      importComponentCode += `${importData},`
      const componentName = asImportName.replace("Basic", "");
      const { hasSlots } = componentMetaMap[namespace]
      declaredComponentCode += `@Builder
      function ${componentName}Builder (params: MyBricksComponentBuilderParams) {
        ${asImportName}({
          uid: params.uid,
          data: createData(params, ${importData}),
          inputs: createInputsHandle(params),
          outputs: createEventsHandle(params),
          styles: createStyles(params),
          ${hasSlots ? "slots: params.slots," : ""}
          ${hasSlots ? "slotsIO: createSlotsIO(params)," : ""}
          parentSlot: params.parentSlot,
          env,
          _env,
          modifier: createModifier(params, CommonModifier)
        })
      }

      @Builder
      export function ${componentName} (params: MyBricksComponentBuilderParams) {
        if (params.parentSlot?.itemWrap) {
          params.parentSlot.itemWrap({
            id: params.uid,
            inputs: params.controller?._inputEvents
          }).wrap.builder(wrapBuilder(${componentName}Builder), params, params.parentSlot.itemWrap({
            id: params.uid,
            inputs: params.controller?._inputEvents
          }).params)
        } else {
          ${componentName}Builder(params)
        }
      }
      \n`
    } else {
      let componentName = asImportName.replace("basic", "");
      componentName = componentName[0].toLowerCase() + componentName.slice(1);
      declaredComponentCode += `export const ${componentName} = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
        return createJSHandle(${asImportName}, { props, env });
      }\n`
    }
  })

  return {
    importComponentCode,
    declaredComponentCode
  }
}

export default getUsedComponent
