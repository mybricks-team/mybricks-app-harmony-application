import { RENDER_UTILS_PACKAGE_NAME } from "../constant";

const handleExtensionBusCode = (page, { params }) => {
  const { data } = params;
  const { download } = data;

  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../../../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("createVariable")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../../../utils/mybricks" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["createVariable"],
      importType: "named",
    });
  }
  if (page.content.includes("createFx")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../../../utils/mybricks" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["createFx"],
      importType: "named",
    });
  }
  if (page.content.includes("bus.")) {
    page.content = page.content.replace("bus.", "this.");
  }
  
  const code = `${page.importManager.toCode()}
  
  ${page.content}`

  const regex = /(\.\.\/\.\.\/[^/]+)\/api/g;

  return code.replace(regex, (str) => {
    return str.slice(3)
  })
}

export default handleExtensionBusCode;
