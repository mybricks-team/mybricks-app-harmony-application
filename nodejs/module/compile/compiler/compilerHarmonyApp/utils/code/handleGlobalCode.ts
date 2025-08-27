import { RENDER_UTILS_PACKAGE_NAME } from "../constant";

const handleGlobalCode = (page, { params, key }) => {
  const { data } = params;
  const { download } = data;

  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../../../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("join")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../../../utils/mybricks" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["join"],
      importType: "named",
    });
  }
  if (page.content.includes("createVariable")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../../../utils/mybricks" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["createVariable"],
      importType: "named",
    });
  }
  if (page.content.includes("createFx")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../../../utils/mybricks" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["createFx"],
      importType: "named",
    });
  }
  if (page.content.includes("merge(")) {
    page.importManager.addImport({
      // packageName: download.source === "sourceCode" ? "../../../utils/mybricks" : RENDER_UTILS_PACKAGE_NAME,
      packageName: RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["merge"],
      importType: "named",
    });
  }
  if (page.content.includes("bus.")) {
    if (key === "app") {
      page.importManager.addImport({
        packageName: "../bus",
        dependencyNames: ["bus"],
        importType: "named",
      });
    } else {
      page.importManager.addImport({
        packageName: "../../app/bus",
        dependencyNames: ["bus"],
        importType: "named",
      });
    }
  }

  return `${page.importManager.toCode()}
  
  ${page.content}`
}

export default handleGlobalCode;
