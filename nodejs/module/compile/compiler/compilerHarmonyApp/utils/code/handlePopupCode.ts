import { COMPONENT_PACKAGE_NAME } from "../constant"

const handlePopupCode = (page) => {
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

      /** ${page.meta.title} */
      @ComponentV2
      export default struct Page {
        build() {
          NavDestination() {
            Index()
          }
          .hideTitleBar(true)
          .hideBackButton(true)
          .mode(NavDestinationMode.DIALOG)
          .systemTransition(NavigationSystemTransitionType.NONE)
        }
      }
  
      ${page.content}
      `;
}

export default handlePopupCode
