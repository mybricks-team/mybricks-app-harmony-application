import { COMPONENT_PACKAGE_NAME } from "../constant"

const handleModuleCode = (page) => {
  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: "../../../utils/types",
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("controller:")) {
    page.importManager.addImport({
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }
  return `${page.importManager.toCode()}

      ${page.content}
      `;
}

export default handleModuleCode;