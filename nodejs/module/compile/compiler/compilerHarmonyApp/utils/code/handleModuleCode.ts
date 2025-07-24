import { COMPONENT_PACKAGE_NAME, RENDER_UTILS_PACKAGE_NAME } from "../constant"

const handleModuleCode = (page, { params }) => {
  const { data } = params;
  const { download } = data;

  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../../../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("controller:")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["Controller", "ModuleController"],
      importType: "named",
    });
  }
  return `${page.importManager.toCode()}

      ${page.content}
      `;
}

export default handleModuleCode;