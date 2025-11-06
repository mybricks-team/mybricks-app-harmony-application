import { appRouter } from "../../../utils/Index"
import jsModulesGenerator from "./JSModules";
import {
  MyBricks,
  genCallConnector,
  createJSHandle,
  Page,
  createVars,
} from "@mybricks/render-utils";
import { globalVars, globalFxs } from "./global";

/** 场景打开、输出 */
const page: MyBricks.Any = new Page(appRouter);
const jsModules: MyBricks.Codes = jsModulesGenerator({ createJSHandle });
const vars: ESObject = createVars(globalVars);
const appContext: MyBricks.AppContext = {
  _env: {
    currentScenes: {
      close: () => {
        appRouter.pop()
      }
    }
  },
  env: {
    callConnector: genCallConnector(jsModules, { domain: undefined }, { globalVars: vars }),
    appRouter,
    globalVars: vars
  },
  page,
  comEvent: {},
  globalVars
}

const onComEvent = (comEvent: MyBricks.Any): void => {
  appContext.comEvent = comEvent
}

globalVars.init()

export { jsModules, page, globalVars, globalFxs, appContext, onComEvent }
