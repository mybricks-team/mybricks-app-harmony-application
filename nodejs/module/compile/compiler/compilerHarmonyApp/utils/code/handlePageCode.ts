import { COMPONENT_PACKAGE_NAME, RENDER_UTILS_PACKAGE_NAME } from "../constant"

const handlePageCode = (page, {
  pageConfig: {
    disableScroll = false,
    statusBarStyle,
    navigationBarStyle,
    navigationBarTitleText,
    navigationStyle = 'default',
    showBackIcon = false
  },
  params,
  key
}) => {
  const { data } = params;
  const { download } = data;

  if (page.content.includes("MyBricks.")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? "../../../utils/types" : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["MyBricks"],
      importType: "named",
    });
  }
  if (page.content.includes("Controller()")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["Controller"],
      importType: "named",
    });
  }
  if (page.content.includes("ModuleController()")) {
    page.importManager.addImport({
      packageName: download.source === "sourceCode" ? COMPONENT_PACKAGE_NAME : RENDER_UTILS_PACKAGE_NAME,
      dependencyNames: ["ModuleController"],
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
