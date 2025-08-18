import { appRouter } from "../../../utils/Index"
import jsModulesGenerator from "./JSModules";
import {
  MyBricks,
  genCallConnector,
  createJSHandle,
  Page,
  createVars,
  context,
} from "@mybricks/render-utils";
import { globalVars, globalFxs } from "./global";

/** 场景打开、输出 */
const page: MyBricks.Any = new Page(appRouter);
const jsModules: MyBricks.Codes = jsModulesGenerator({ createJSHandle, context });
const vars: ESObject = createVars(globalVars);
const _env: MyBricks._Env = {
  currentScenes: {
    close: () => {
      appRouter.pop()
    }
  }
}
const env: MyBricks.Env = {
  callConnector: genCallConnector(jsModules, { domain: undefined }, { globalVars: vars }),
  appRouter,
  globalVars: vars
};

context.env = env;
context._env = _env;

export { jsModules, page, globalVars, globalFxs }
