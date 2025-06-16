const getUsedComponent = (params) => {
  const { usedComponentsMap, componentMetaMap } = params
  let importComponentCode = "";
  let declaredComponentCode = "";

  Object.entries(usedComponentsMap).forEach(([namespace, config]: any) => {
    const namespaceSplit = namespace.split(".")

    const importName = namespaceSplit.join("_");
    const asImportName = (config.type === "ui" ? "Basic" : "basic") + namespaceSplit.map((text) => {
      if (text.toUpperCase() === "MYBRICKS") {
        return "MyBricks";
      }

      return text[0].toUpperCase() + text.slice(1);
    }).join("")

    importComponentCode += `${importName} as ${asImportName},`

    if (config.type === "ui") {
      const importData = importName + "_Data";
      importComponentCode += `${importData},`
      const componentName = asImportName.replace("Basic", "");
      const { hasSlots } = componentMetaMap[namespace]
      declaredComponentCode += `@Builder
      function ${componentName}Builder (params: MyBricksComponentBuilderParams) {
        ${asImportName}({
          uid: params.uid,
          data: new ${importData}(params.data as MyBricks.Any),
          inputs: createInputsHandle(params),
          outputs: createEventsHandle(params),
          styles: createStyles(params),
          ${hasSlots ? "slots: params.slots," : ""}
          ${hasSlots ? "slotsIO: params.slotsIO," : ""}
          parentSlot: params.parentSlot
        })
      }
      
      @ComponentV2
      export struct ${componentName} {
        @Param @Require uid: string;
        @Param controller: MyBricks.Controller = Controller();
        @Param @Require data: MyBricks.Data
        @Param events: MyBricks.Events = {}
        @Param styles: Styles = {};
        @Local columnVisibilityController: ColumnVisibilityController = new ColumnVisibilityController()
        ${hasSlots ? "@BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;" : ""}
        ${hasSlots ? "@Local slotsIO: MyBricks.Any = createSlotsIO();" : ""}
        @Param parentSlot?: MyBricks.SlotParams = undefined

        myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

        build() {
          Column() {
            if (this.parentSlot?.itemWrap) {
              this.parentSlot.itemWrap({
                id: this.uid,
                inputs: this.controller._inputEvents
              }).wrap.builder(wrapBuilder(${componentName}Builder), this, this.parentSlot.itemWrap({
                id: this.uid,
                inputs: this.controller._inputEvents
              }).params)
            } else {
              ${componentName}Builder(this)
            }
          }
          .attributeModifier(this.myBricksColumnModifier)
          .visibility(this.columnVisibilityController.visibility)
        }
      }\n`
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
