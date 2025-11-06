const indentation = (level: number) => {
  return " ".repeat(level);
};

const getUsedComponent = (params) => {
  const { usedComponentsMap, componentMetaMap, verbose } = params
  let importComponentCode = "";
  let declaredComponentCode = "";

  const initialIndent = 0;
  const indentSize = 2;

  const indent1 = indentation(indentSize * 1);
  const indent2 = indentation(indentSize * 2);
  const indent3 = indentation(indentSize * 3);

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

    importComponentCode += `${indent1}${importName} as ${asImportName},\n`
    if (isUI) {
      const importData = importName + "_Data";
      importComponentCode += `${indent1}${importData},\n`
      const componentName = asImportName.replace("Basic", "");
      const { hasSlots } = componentMetaMap[namespace]

      declaredComponentCode += `@Builder` + 
      `\nfunction ${componentName}Builder(params: MyBricksComponentBuilderParams) {` + 
      `\n${indent1}${asImportName}({` +
      `\n${indent2}uid: params.uid,` + 
      `\n${indent2}data: createData(params, ${importData}),` +
      `\n${indent2}inputs: createInputsHandle(params),` + 
      `\n${indent2}outputs: createEventsHandle(params),` + 
      `\n${indent2}styles: createStyles(params),` + 
      (hasSlots ? `\n${indent2}slots: params.slots,` : "") +
      (hasSlots ? `\n${indent2}slotsIO: createSlotsIO(params),` : "") +
      `\n${indent2}parentSlot: params.parentSlot,` +
      `\n${indent2}env: createEnv(params),` +
      `\n${indent2}_env: _createEnv(params),` +
      `\n${indent2}modifier: createModifier(params, CommonModifier)` +
      `\n${indent1}})` + 
      `\n}` +

      `\n\n@Builder` +
      `\nexport function ${componentName}(params: MyBricksComponentBuilderParams) {` +
      `\n${indent1}if (params.parentSlot?.itemWrap) {` +
      `\n${indent2}params.parentSlot.itemWrap({` + 
      `\n${indent3}id: params.uid,` +
      `\n${indent3}inputs: params.controller?._inputEvents,`+
      `\n${indent2}}).wrap.builder(wrapBuilder(${componentName}Builder), params, params.parentSlot.itemWrap({` +
      `\n${indent3}id: params.uid,` +
      `\n${indent3}inputs: params.controller?._inputEvents,` +
      `\n${indent2}}).params)` + 
      `\n${indent1}} else {` + 
      `\n${indent2}${componentName}Builder(params)` +
      `\n${indent1}}` +
      `\n}\n\n`
    } else {
      let componentName = asImportName.replace("basic", "");
      componentName = componentName[0].toLowerCase() + componentName.slice(1);
      declaredComponentCode += `export const ${componentName} =` +
      `\n${indent1}(props: MyBricks.JSParams, appContext: MyBricks.AppContext): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {` +
      `\n${indent2}return createJSHandle(${asImportName}, { props, appContext });` +
      `\n${indent1}}\n\n`
    }
  })

  return {
    importComponentCode,
    declaredComponentCode
  }
}

export default getUsedComponent
