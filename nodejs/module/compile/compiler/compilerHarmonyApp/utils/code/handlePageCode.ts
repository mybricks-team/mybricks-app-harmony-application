import { COMPONENT_PACKAGE_NAME } from "../constant"

const handlePageCode = (page, {
  disableScroll = false,
  statusBarStyle,
  navigationBarStyle,
  navigationBarTitleText,
  navigationStyle = 'default',
  showBackIcon = false
}) => {
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

  switch (navigationStyle) {
    case 'default': {
      page.importManager.addImport({
        packageName: "../../../utils",
        dependencyNames: ["AppCommonHeader"],
        importType: "named",
      });
      return `${page.importManager.toCode()}

/** ${page.meta.title} */
@ComponentV2
export default struct Page {
  build() {
    NavDestination() {
      AppCommonHeader({
        title: ${JSON.stringify(navigationBarTitleText)},
        titleColor: ${JSON.stringify(navigationBarStyle?.color)},
        barBackgroundColor: ${JSON.stringify(navigationBarStyle?.backgroundColor)},
        showBackIcon: ${Boolean(showBackIcon)}
      })
      Index()
    }
    .hideTitleBar(true)
  }
}

${page.content}
`;
    }
    case 'custom': {
      page.importManager.addImport({
        packageName: "../../../utils",
        dependencyNames: ["AppCustomHeader"],
        importType: "named",
      });
      return `${page.importManager.toCode()}

/** ${page.meta.title} */
@ComponentV2
export default struct Page {
  build() {
    NavDestination() {
      AppCustomHeader({
        titleColor: ${JSON.stringify(navigationBarStyle?.color)},
        barBackgroundColor: ${JSON.stringify(navigationBarStyle?.backgroundColor)},
      })
      Index()
    }
    .hideTitleBar(true)
  }
}

${page.content}
`;
    }
    case 'none': {
      return `${page.importManager.toCode()}

/** ${page.meta.title} */
@ComponentV2
export default struct Page {
  build() {
    NavDestination() {
      Index()
    }
    .hideTitleBar(true)
  }
}

${page.content}
`;
    }
  }
}

export default handlePageCode
