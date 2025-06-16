import { appRouter } from "../utils"
import basicCodes from "./codes";
import { createJSHandle, createInputsHandle, createEventsHandle, Page, createVariable, createVars, createFx, createSlotsIO, createModuleInputsHandle, createStyles } from "../utils/mybricks"
import { genCallConnector } from "../utils/CallConnector"
import { MyBricks } from "../utils/types"
import { globalVars, globalFxs } from "./global"
$r('app._proxy.component.import')

type Style = Record<string, string | number>;
type Styles = Record<string, Style>;
interface MyBricksComponentBuilderParams {
  uid: string
  controller: MyBricks.Controller
  data: MyBricks.Data
  events: MyBricks.Events
  styles: Styles
  columnVisibilityController: ColumnVisibilityController
  myBricksColumnModifier: MyBricksColumnModifier
  slots?: (params: MyBricks.SlotParams) => void
  slotsIO?: MyBricks.Any
  parentSlot?: MyBricks.SlotParams
}

class MyBricksColumnModifier implements AttributeModifier<ColumnAttribute> {
  style: Style;

  constructor(style: Style) {
    this.style = style;
  }

  applyNormalAttribute(instance: ColumnAttribute): void {
    const style = this.style;
    // width
    instance.width(style.width);
    // height
    instance.height(style.height);
    // zIndex
    instance.zIndex(style.zIndex as number);
    // marginTop
    // marginBottom
    // marginLeft
    // marginRight
    instance.margin({
      top: style.marginTop,
      right: style.marginRight,
      bottom: style.marginBottom,
      left: style.marginLeft
    })
    // paddingTop
    // paddingRight
    // paddingBottom
    // paddingLeft
    instance.padding({
      top: style.paddingTop,
      right: style.paddingRight,
      bottom: style.paddingBottom,
      left: style.paddingLeft
    })
    // flex
    if (typeof style.flex === "number") {
      instance.flexGrow(style.flex as number)
      instance.flexShrink(1)
      instance.flexBasis("0%")
    } else {
      instance.flexShrink(0)
    }
    // position
    if (["absolute", "fixed"].includes(style.position as string)) {
      instance.position({
        top: style.top as number,
        left: style.left as number,
        right: style.right as number,
        bottom: style.bottom as number,
      })
    }
  }
}

@ObservedV2
class ColumnVisibilityController {
  @Trace visibility = Visibility.Visible;

  setVisibility = (visibility: Visibility) => {
    this.visibility = visibility
  }
}

@Builder function Slot(params: MyBricks.SlotParams) {}

const _env: MyBricks._Env = {
  currentScenes: {
    close: () => {
      appRouter.pop()
    }
  }
}

const vars: ESObject = createVars(globalVars)

const env: MyBricks.Env = {
  callConnector: genCallConnector(basicCodes, { domain: undefined}, { globalVars: vars }),
  appRouter,
  globalVars: vars
}

export const Controller = () => {
  return createInputsHandle({}, true) as MyBricks.Controller
}

export const ModuleController = () => {
  return createModuleInputsHandle() as MyBricks.ModuleController
}

/** 场景打开、输出 */
export const page = new Page(appRouter);

$r('app._proxy.component.declared')

/** JS计算 */
const codes: MyBricks.Codes = Object.keys(basicCodes).reduce((pre, key) => {
  pre[key] = (props: MyBricks.JSParams): MyBricks.JSReturn => {
    return createJSHandle(basicCodes[key], { props });
  }
  return pre
}, {} as MyBricks.Codes)

export {
  codes,
  globalFxs,
  globalVars,
  createVariable,
  createFx
}