const handleGlobalCode = (page) => {
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: "../../../utils/types",
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("createVariable")) {
    page.importManager.addImport({
      packageName: "../../../utils/mybricks",
      dependencyNames: ["createVariable"],
      importType: "named",
    });
  }
  if (page.content.includes("createFx")) {
    page.importManager.addImport({
      packageName: "../../../utils/mybricks",
      dependencyNames: ["createFx"],
      importType: "named",
    });
  }

  return `${page.importManager.toCode()}
  
  ${page.content}`
}

export default handleGlobalCode;
