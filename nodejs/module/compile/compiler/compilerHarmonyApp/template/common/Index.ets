import { AttributeUpdater } from '@ohos.arkui.modifier'
import { appRouter } from "../../../utils/Index"
import jsModulesGenerator from "./JSModules";
import {
  MyBricks,
  createJSHandle,
  createInputsHandle,
  createEventsHandle,
  Page,
  createVars,
  createStyles,
  createModifier,
  createData,
  genCallConnector,
  context,
  MyBricksComponentBuilderParams,
  CommonModifier,
  createSlotsIO
} from "@mybricks/render-utils"
import { globalVars, globalFxs } from "./global"
$r('app.common.component.import')

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
const env: MyBricks.Any = {
  callConnector: genCallConnector(jsModules, { domain: undefined }, { globalVars: vars }),
  appRouter,
  globalVars: vars
};

context.env = env;
context._env = _env;

$r('app.common.component.declared')

export { jsModules, page, globalVars, globalFxs }
