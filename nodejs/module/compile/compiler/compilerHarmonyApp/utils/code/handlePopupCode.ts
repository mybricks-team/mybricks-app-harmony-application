import { COMPONENT_PACKAGE_NAME, RENDER_UTILS_PACKAGE_NAME } from "../constant"

const handlePopupCode = (page, { params, key }) => {
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

      /** ${page.meta.title} */
      @ComponentV2
      export default struct Page {
        build() {
          NavDestination() {
            Index()
          }
          .hideTitleBar(true)
          .mode(NavDestinationMode.DIALOG)
          .systemTransition(NavigationSystemTransitionType.NONE)
        }
      }
  
      ${page.content}
      `;
}

export default handlePopupCode
