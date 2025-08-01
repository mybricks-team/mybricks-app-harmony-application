
import { checkValueType, getValidSlotStyle, getValidSizeValue, transformToValidBackground, transformToValidStyleAry, fixCompileErrorStyle, uuid } from './helper'
export { getDSLPrompts, getSystemPrompts, getExamplePromptsAtFirst } from './prompt'

/**
 * @description Json遍历器，支持对不同类型的节点注册修改函数
 */
class DslJsonTraversal {
  /** 不同节点的修改器函数 */
  modifiers = new Map()

  // 注册修改器函数
  registerModifier(namespace, modifier) {
    this.modifiers.set(namespace, modifier);
  }

  // 遍历处理函数
  traverse(node) {
    if (!node) return;

    const modifier = this.modifiers.get('root');
    modifier?.(node);

    // 处理根节点的comAry
    if (node.comAry) {
      node.comAry.forEach(component => this.traverseComponent(component));
    }
  }

  // 遍历组件节点
  private traverseComponent(component) {
    if (!component) return;

    const modifierBefore = this.modifiers.get('component:before');
    modifierBefore?.(component);

    const namespace = component.namespace

    // 检查是否有对应的修改器
    if (namespace && this.modifiers.has(namespace)) {
      const modifier = this.modifiers.get(namespace);
      // 执行修改
      modifier?.(component);
    }

    const modifierAfter = this.modifiers.get('component:after');
    modifierAfter?.(component);

    // 继续遍历slots
    if (component.slots) {
      Object.values(component.slots).forEach(slot => this.traverseSlot(slot));
    }

    if (component.comAry) {
      component.comAry.forEach(com => this.traverseComponent(com));
    }

    const modifierComponentAfter = this.modifiers.get(`${namespace}:after`);
    modifierComponentAfter?.(component)
  }

  // 遍历slot节点
  private traverseSlot(slot) {
    if (!slot) return;

    // 处理slot中的comAry
    if (slot.comAry) {
      slot.comAry.forEach(component => this.traverseComponent(component));
    }

    const modifier = this.modifiers.get('slot');
    modifier?.(slot);
  }
}

/** 处理所有组件的通用CSS样式 */
function polyfillComponentStyAry(styleAry) {
  if (!Array.isArray(styleAry)) {
    return
  }
  styleAry.forEach(item => {
    const css = item.css
    Object.keys(css).forEach(key => {
      if (['borderRadius', 'fontSize', 'padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'border-width'].includes(key) && checkValueType(css[key]) === 'number') {
        css[key] = css[key] + 'px'
      }
    })

  })
}

/** 处理所有组件的搭建样式 */
function polyfillComponentStyle(style) {
  if (!style) {
    return
  }

  if (style?.width === '100%') {
    style.widthFull = true
    style.widthAuto = false
  }
  if (checkValueType(style.width) === 'number') {
    style.widthFull = false
    style.widthAuto = false
    style.widthFact = style.width
  }
  if (style.width === 'fit-content') {
    style.widthFull = false
    style.widthAuto = true
  }


  if (!style.height) {
    style.height = 'fit-content'
  }
  if (style?.height === '100%') {
    style.heightFull = true;
    style.heightAuto = false
  }
  if (checkValueType(style.height) === 'number') {
    style.heightFull = false
    style.heightAuto = false
    style.heightFact = style.height
  }
  if (style.height === 'fit-content') {
    style.heightFull = false
    style.heightAuto = true
  }


  delete style.layout;
  delete style.justifyContent;
  delete style.flexDirection;
  delete style.alignItems;
  return style
}

/** 当组件出现幻觉使用了flex1时 */
function polyfillWhenComponentUseFlex(component) {
  if (Array.isArray(component?.comAry)) {
    const findIndex = component?.comAry.findIndex(com => com.namespace !== 'flex' && com?.style?.flex !== undefined);
    if (findIndex > -1) {
      const targerComp = component.comAry[findIndex];

      component.comAry = component.comAry.map(com => {
        if (com === targerComp) {
          return {
            id: uuid(),
            title: '占满剩余宽度',
            namespace: 'flex',
            style: {
              flex: 1,
              flexDirection: 'row',
              height: targerComp.style?.height
            },
            comAry: [targerComp]
          }
        }
        return com
      })
      delete targerComp.style.flex
      targerComp.style.width = '100%'
    }
  }
}

const traversal = new DslJsonTraversal();

// 添加对根结点的处理
traversal.registerModifier('root', (root) => {
  if (!root.style) {
    root.style = {}
  }
  root.style = {
    ...root.style,
    layout: root.style?.flexDirection === 'row' ? 'flex-row' : 'flex-column',
    flexDirection: root.style?.flexDirection === 'row' ? 'row' : 'column'
  }
})

// 添加对插槽的处理
traversal.registerModifier('slot', (slot) => {
  if (!slot.style) {
    slot.style = {}
  }
  if (slot.style.layout === "smart") {
    slot.style = {
      ...slot.style,
      layout: "smart",
      width: slot.style?.width,
      height: slot.style?.height
    }
  } else {
    slot.style = {
      ...slot.style,
      layout: slot.style?.flexDirection === 'row' ? 'flex-row' : 'flex-column',
      flexDirection: slot.style?.flexDirection === 'row' ? 'row' : 'column',
      width: slot.style?.width,
      height: slot.style?.height
    }
  }
})

// 添加对所有组件的样式兼容
traversal.registerModifier('component:before', (component) => {
  if (component.namespace === 'group') {
    // 幻觉处理，没有配置display的情况
    if (!component?.style?.display) {
      // 判断comAry的component.style是不是全部都是绝对定位，是则设置 component?.style?.display = 'relative'
      if (Array.isArray(component.comAry) && component.comAry.every(comp => {
        const style = comp?.style || {};
        const pairs = [
          ['left', 'top'],
          ['left', 'right'],
          ['left', 'bottom'],
          ['top', 'right'],
          ['top', 'bottom'],
          ['right', 'bottom']
        ];
        return pairs.some(([prop1, prop2]) => 
          typeof style[prop1] !== 'undefined' && 
          typeof style[prop2] !== 'undefined'
        );
      })) {
        delete component.style.display
      } else {
        component.namespace = 'flex'
        component.style.flexDirection = 'column'
        delete component.style.display
      }
    } else if (component.style.display === 'relative') {
      delete component.style.display
    } else if (component.style.display === 'column') {
      delete component.style.display
      component.namespace = 'flex'
      component.style.flexDirection = 'column'
    } else if (component.style.display === 'row') {
      delete component.style.display
      component.namespace = 'flex'
      component.style.flexDirection = 'row'
    }
  }

  fixCompileErrorStyle(component.style ?? {})
  polyfillWhenComponentUseFlex(component)
  transformToValidStyleAry(component?.style?.styleAry)
})

// 添加对所有组件的通用处理
traversal.registerModifier('component:after', (component) => {
  polyfillComponentStyle(component.style)
  polyfillComponentStyAry(component.style?.styleAry)
})

// 添加对flex节点的处理
traversal.registerModifier('flex', (component) => {
  if (component.style?.smart) {
    component.namespace = 'mybricks.harmony.containerBasic'
    if (!component.data) {
      component.data = {}
    }

    // 转换成containerBasic的类名
    if (component.style?.styleAry) {
      component.style?.styleAry.forEach(s => {
        if (s.selector === ':root') {
          s.selector = '> .mybricks-container'
        }
      })
    }

    // component.data.layout = 'smart'
    component.slots = {
      content: {
        id: 'content',
        title: component.title ? `${component.title}插槽` : '内容',
        style: {
          width: '100%',
          height: '100%',
          layout: `smart`,
        },
        comAry: component?.comAry
      }
    }
    component.comAry = undefined
    return
  }


  // 兼容把样式写到 layout 的情况
  if (component.style) {
    const {
      width,
      height,
      justifyContent,
      alignItems,
      flex,
      flexDirection,
      columnGap,
      styleAry,
      margin,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      position,
      left,
      right,
      top,
      bottom,
      ...extra
    } = component.style

    if (!component?.style?.styleAry) {
      component.style.styleAry = [
        {
          selector: ':root',
          css: {}
        }
      ]
    }
    component.style.styleAry[0].css = {
      ...(component.style.styleAry[0]?.css ?? {}),
      ...(extra ?? {})
    }
    // 清理多余的属性，特别是padding容易导致双重padding
    Object.keys(extra ?? {}).forEach((key) => {
      if (key.includes('padding')) {
        delete component.style[key]
      }
    })
  }

  if (component?.style?.styleAry) {
    component?.style?.styleAry?.forEach?.(item => {
      if (!item.css) {
        item.css = {}
      }
      // [TODO] 幻觉处理
      if (item.css.margin) {
        delete item.css.margin
      }
    })
  }

  // // 处理幻觉
  // if (component.style?.paddingLeft) {
  //   component.style.marginLeft = component.style?.paddingLeft
  //   delete component.style?.paddingLeft
  // }
  // if (component.style?.paddingRight) {
  //   component.style.marginRight = component.style?.paddingRight
  //   delete component.style?.paddingRight
  // }

  // 处理绝对定位兼容
  const rootStyle = component?.style?.styleAry?.find?.(s => s.selector === ':root')?.css
  if (rootStyle?.position === 'relative') {
    component.style.position = rootStyle.position;

    if (rootStyle.left) {
      component.style.left = rootStyle.left
      delete rootStyle.left
    }
    if (rootStyle.right) {
      component.style.right = rootStyle.right
      delete rootStyle.right
    }
    if (rootStyle.top) {
      component.style.top = rootStyle.top
      delete rootStyle.top
    }
    if (rootStyle.bottom) {
      component.style.bottom = rootStyle.bottom
      delete rootStyle.bottom
    }

    delete rootStyle.position
  }

  // 兼容布局写到rootStyle的情况
  if (rootStyle?.flexDirection) {
    if (!component.style) {
      component.style = {}
    }
    component.style.flexDirection = rootStyle.flexDirection
  }
  if (rootStyle?.alignItems) {
    if (!component.style) {
      component.style = {}
    }
    component.style.alignItems = rootStyle.alignItems
  }
  if (rootStyle?.justifyContent) {
    if (!component.style) {
      component.style = {}
    }
    component.style.justifyContent = rootStyle.justifyContent
  }

  // // 兼容一些样式加到了layout上的情况
  // if (component.style) {
  //   if (component.style?.backgroundColor) {
  //     if (!component?.style?.styleAry?.[0]) {
  //       component.style.styleAry = [
  //         {
  //           selector: ':root',
  //           css: {}
  //         }
  //       ]
  //     }
  //     component.style.styleAry[0].css = {
  //       backgroundColor: component.style?.backgroundColor
  //     }
  //     delete component.style?.backgroundColor
  //   }
  // }

  const shouldTransformToGrid = component.style?.flexDirection === 'row' && component?.comAry?.some(com => {
    return !!com.style.flex || (checkValueType(com.style?.width) === 'percentage' && com.style?.width !== '100%')
  })

  if (shouldTransformToGrid) {
    const { justifyContent = 'flex-start', alignItems = 'flex-start', columnGap = 0 } = component.style ?? {};
    component.namespace = 'mybricks.harmony.containerRow'

    const sizeProps = {
      height: component.style?.height ?? 'auto',
      width: component.style?.width ?? '100%'
    }

    if (checkValueType(sizeProps?.height) === 'number') {
      sizeProps.height = '100%'
    } else if (checkValueType(sizeProps?.height) === 'percentage') {
      sizeProps.height = sizeProps?.height === '100%' ? '100%' : 'auto';
    }

    if (checkValueType(sizeProps?.width) === 'number' || checkValueType(sizeProps?.width) === 'number') {
      sizeProps.width = '100%'
    }

    component.data = {
      slotStyle: {
        flexDirection: 'row',
        justifyContent,
        alignItems,
        columnGap,
        flexWrap: component.style?.flexWrap,
        ...sizeProps
      },
      items: component?.comAry?.map((com, index) => {
        const comStyle = com.layout ?? com.style

        const base: any = {
          id: `slot${index + 1}`,
          slotStyle: getValidSlotStyle(),
        }

        const widthType = checkValueType(getValidSizeValue(comStyle?.width))

        switch (true) {
          case comStyle?.flex === 1: {
            base.widthMode = 'auto'
            break
          }
          case comStyle?.width === undefined || comStyle.width === null: {
            base.widthMode = 'fit-content'
            break
          }
          case comStyle?.width === 'fit-content': {
            base.widthMode = 'fit-content'
            break
          }
          case widthType === 'percentage': {
            base.widthMode = 'percent'
            base.width = parseFloat(comStyle?.width)

            // 比如30%，走组件配置了，那么底层组件就直接100%即可
            if (base.width !== 100) {
              comStyle.width = '100%'
            }
            break
          }
          case widthType === 'number': {
            base.widthMode = 'number'
            base.width = parseFloat(comStyle?.width)
            break
          }
        }

        base.slotStyle.height = comStyle?.height

        return base
      })
    }

    component?.comAry?.forEach((com, index) => {
      if (!component.slots) {
        component.slots = {}
      }

      component.slots[`slot${index + 1}`] = {
        id: `slot${index + 1}`,
        title: `插槽${index + 1}`,
        comAry: [com],
        style: {
          ...(com?.style?.height === '100%' ? {
            height: '100%'
          } : {})
        }
      }
    })
    component.comAry = undefined
    delete component.comAry

    if (component?.style?.flex) {
      delete component.style.flex
    }

    return
  }

  // 处理textAlign幻觉
  if (rootStyle?.textAlign) {
    if (component.style?.flexDirection === 'column') {
      component.style.alignItems = 'center'
    }
    if (component.style?.flexDirection === 'row') {
      component.style.justifyContent = 'center'
    }
  }


  component.namespace = 'mybricks.harmony.containerBasic'
  if (!component.data) {
    component.data = {}
  }

  let slotWidth = getValidSizeValue(component.style?.width, '100%')
  if (checkValueType(slotWidth) === 'number') {
    slotWidth = '100%'
  }

  let slotHeight = getValidSizeValue(component.style?.height, 'auto')
  if (checkValueType(slotHeight) === 'number') {
    slotHeight = '100%'
  }

  component.data.layout = getValidSlotStyle(component.style)
  component.slots = {
    content: {
      id: 'content',
      title: component.title ? `${component.title}插槽` : '内容',
      style: {
        width: slotWidth,
        height: slotHeight,
        flexDirection: component.style.flexDirection,
        layout: `flex-${component.style.flexDirection}`,
        justifyContent: component.data.layout.justifyContent,
        alignItems: component.data.layout.alignItems,
      },
      comAry: component?.comAry
    }
  }
  component.comAry = undefined
  component.style = {
    ...(component.style ?? {}),
    width: component.style?.flex === 1 ? '100%' : getValidSizeValue(component.style?.width, 'fit-content'),
    height: getValidSizeValue(component.style?.height, 'auto'),
  }

  // 转换成containerBasic的类名
  if (component.style?.styleAry) {
    component.style?.styleAry.forEach(s => {
      if (s.selector === ':root') {
        s.selector = '> .mybricks-container'
      }
    })
  }

  delete component.comAry

  if (component?.style?.flex) {
    delete component.style.flex
  }
})

traversal.registerModifier('group', (component) => {
  component.namespace = 'mybricks.harmony.containerBasic'
  if (!component.data) {
    component.data = {}
  }

  // 转换成containerBasic的类名
  if (component.style?.styleAry) {
    component.style?.styleAry.forEach(s => {
      if (s.selector === ':root') {
        s.selector = '> .mybricks-container'
      }
    })
  }

  // component.data.layout = 'smart'
  component.slots = {
    content: {
      id: 'content',
      title: component.title ? `${component.title}插槽` : '内容',
      style: {
        width: '100%',
        height: '100%',
        layout: `smart`,
      },
      comAry: component?.comAry
    }
  }
  component.comAry = undefined
  // delete component.comAry
})

// 添加对根结点的处理
traversal.registerModifier('system.page', (component) => {
  console.log("[system.page]", window._.clone(component))
  component.namespace = 'mybricks.harmony.systemPage'
  component.data = component.slots?.content?.style?.layout === "smart" ? {
    layout: {
      position: "smart"
    }
  } : {
    layout: getValidSlotStyle(component.style)
  }

  component.data.navigationBarTitleText = component.title
  component.data.useTabBar = false

  if (component?.style?.styleAry?.[0]) {
    transformToValidBackground(component?.style?.styleAry?.[0]?.css ?? {})
    const cssProperties = component?.style?.styleAry?.[0]?.css
    if (cssProperties?.backgroundColor) {
      component.data.backgroundColor = cssProperties?.backgroundColor
    }
    if (cssProperties?.backgroundImage) {
      component.data.backgroundImage = cssProperties?.backgroundImage
    }
    delete component?.style?.styleAry
  }
  component.asRoot = true
})

// 添加对根结点的处理
traversal.registerModifier('system.page:after', (component) => {
  if (component?.slots?.content.style) {
    component.slots.content.style.height = '100%'
  }
})

/** 是否注册组件的modifiers */
let isComlibsModifiersRegisted = false
/** 第一次的时候，注册下所有组件的modifiers */
const registerComliibsModifiers = () => {
  if (!window.__comlibs_edit_) {
    return
  }

  const forEachComponent = (com, callback) => {
    if (com?.namespace) {
      callback?.(com)
    }
    if (Array.isArray(com?.comAray)) {
      com?.comAray.forEach(child => {
        forEachComponent(child, callback)
      })
    }
  }

  window.__comlibs_edit_.forEach(comlib => {
    forEachComponent(comlib, (com) => {
      if (com?.ai?.modifyTptJson) {
        traversal.registerModifier(com.namespace, com?.ai?.modifyTptJson)
      }
    })
  })

}

export const getNewDSL = (type, dslJson) => {
  if (!isComlibsModifiersRegisted) {
    registerComliibsModifiers();
    isComlibsModifiersRegisted = true
  }

  if (type === 'geo' && dslJson?.ui) {
    try {
      const copyDslJson = JSON.parse(JSON.stringify(dslJson));

      console.log(JSON.parse(JSON.stringify(copyDslJson)))

      traversal.traverse(copyDslJson?.ui)

      console.log(JSON.parse(JSON.stringify(copyDslJson)))

      return copyDslJson
    } catch (error) {
      console.warn('解析失败')
      console.error(error)
    }
  }
  
  return dslJson
}

export const getExamplePrompts = () => {
  return `
  <example>
    <user_query>搭建两个竖排水平居中的按钮，按钮宽度固定 + 铺满</user_query>
    <assistant_response>
    \`\`\`dsl file="page.dsl"
      <page title="测试页面">
        <system.page title="你好世界" styleAry={[{selector:":root",css:{background:"#FFFFFF"}}]}>
          <slots.content title="页面内容" layout={{ alignItems: 'center' }}>
            <mybricks.harmony.button
              title="按钮1"
              layout={{width: 50, height: 36}}
              styleAry={[{selector:".mybricks-button",css:{"backgroundColor":"red"}}]}
              data={{text:"按钮1"}}/>
            <mybricks.harmony.button
              title="按钮2"
              layout={{width: '100%', height: 36}}
              styleAry={[{selector:".mybricks-button",css:{"backgroundColor":"blue"}}]}
              data={{text:"按钮2"}}/>
          </slots.content>
        </system.page>
      </page>
    \`\`\`
    </assistant_response>

    <user_query>搭建一个详情卡片</user_query>
    <assistant_response>
    卡片内容为了优化搭建一般使用绝对定位布局，需要实现一个外边距12 + 内边距12的卡片。
    \`\`\`dsl file="page.dsl"
      <page title="详情卡片页面">
        <system.page title="详情卡片" styleAry={[{selector:":root",css:{background:"#FFFFFF"}}]}>
          <slots.content title="内容" layout={{ alignItems: 'center' }}>
            <group title="卡片" layout={{display: 'relative', width: '100%', height: 70, marginLeft: 12, marginRight: 12 }} styleAry={[{ selector: ':root', css: { backgroundColor: '#eeeeee' } }]}>
              <mybricks.harmony.text title="居上大标题" layout={{ width: 'fit-content', top: 12, left: 12 }} styleAry={[{selector:".mybricks-text",css:{fontSize:'20px',lineHeight:'20px',fontWeight: 500}}]} data={{text:"Hello world"}} />
              <mybricks.harmony.text title="居左小标题" layout={{ width: 26, top: 26, left: 12 }} styleAry={[{selector:".mybricks-text",css:{fontSize:'13px'}}]} data={{text:"标题"}} />
              <mybricks.harmony.text title="居右占满剩余宽度" layout={{ width: 301, widthFull: true, top: 26, right: 12 }} styleAry={[{selector:".mybricks-text",css:{color:'#999999',fontSize:'12px'}}]} data={{text:"内容信息"}} />
            </group>
          </slots.content>
        </system.page>
      </page>
    \`\`\`
    </assistant_response>
    <attention>
      页面插槽中为流式布局，所以使用width=100% + margin来配置卡片；

      卡片内为绝对定位，绝对定位的计算思路如下：
      1. 内边距通过绝对定位布局配置内容的尺寸和位置决定；
      2. 卡片高度 = 12*2（上下间距） + 20（标题行高）+ 10（小标题和标题的间距）+ 16（文本的默认行高，取这一行文本中最高值） = 70；
      3. 大标题的top = 12（卡片内间距）；
      4. 小标题的top = 12（标题的top）+ 20（标题的行高）+ 10（与标题间距）= 42；
      5. 小标题（居左对齐）的宽度 = 内容长度*fontSize = 26 # 这里建议根据经验值来计算；
      6. 占满剩余宽度（居右对齐）的宽度 = 351（卡片宽度） - 12*2（左右间距） - 26（小标题的宽度）。

      绝对定位的标记也要记得添加：
      - 居右占满剩余宽度的内容添加 widthFull 标记；
    </attention>

    <user_query>搭建一个天气页面</user_query>
    <assistant_response>
    天气界面从上到下包含「位置展示」「天气信息区域」「七日天气列表」「固定公告」四个模块。我们用flex布局 + 绝对定位布局的混合使用来搭建此页面。
    \`\`\`dsl file="page.dsl"
      <page title="天气页面">
        <system.page title="天气" styleAry={[{selector:":root",css:{background:"#FFFFFF"}}]}>
          <slots.content title="内容" layout={{ alignItems: 'flex-start' }}>
            <mybricks.harmony.text title="位置展示" layout={{ width: '100%', marginLeft: 12, marginRight: 12 }} styleAry={[{selector:".mybricks-text",css:{fontSize:'16px',lineHeight:'16px',fontWeight: 500}}]} data={{text:"杭州市余杭区"}} />
            <group title="天气信息" layout={{display: 'relative', width: '100%', height: 200, marginTop: 12, marginLeft: 12, marginRight: 12}}>
              <mybricks.harmony.text title="温度大标题" layout={{ width: 'fit-content', top: 12, left: 0 }} styleAry={[{selector:".mybricks-text",css:{fontSize:'46px',lineHeight:'46px',fontWeight: 500}}]} data={{text:"33度"}} />
              <mybricks.harmony.text title="天气" layout={{ width: 'fit-content', top: 70, left: 0 }} styleAry={[{selector:".mybricks-text",css:{fontSize:'13px'}}]} data={{text:"阴 最高33度 最低25度"}} />
            </group>
            <group title="最近七日天气" layout={{display: 'column', width: '100%', height: 'fit-content', marginTop: 12, marginLeft: 12, marginRight: 12 }} styleAry={[{selector:":root",css:{backgroundColor:"#F0F0F0", borderRadius: 24}}]}>
              <mybricks.harmony.containerWaterfall title="天气列表" layout={{ width: '100%', height: 'fit-content' }}>
                <slots.item title="天气项">
                  <group title="天气信息" layout={{display: 'relative', width: '100%', height: 44, marginLeft: 12, marginRight: 12}}>
                    <mybricks.harmony.text title="天气" layout={{ width: 'fit-content', top: 15, left: 0 }} styleAry={[{selector:".mybricks-text",css:{fontSize:'14px', ellipsis: true, maxLines: 1}}]} data={{text:"周一 阴"}} />
                  </group>
                </slots.item>
              </mybricks.harmony.containerWaterfall>
            </group>
            <group title="固定公告" layout={{display: 'relative', position: 'fixed', width: '100%', height: 32, left: 0, bottom: 0}}>
              <mybricks.harmony.text title="公告内容" layout={{ width: 'fit-content', top: 6, left: 0 }} styleAry={[{selector:".mybricks-text",css:{fontSize:'20px', textAlign: 'center'}}]} data={{text:"注意雷雨大风天气"}} />
            </group>
          </slots.content>
        </system.page>
      </page>
    \`\`\`
    </assistant_response>
    <attention>
      页面插槽中为流式布局，直接使用 flex-start 居左对齐即可
      - 「位置展示」只是一个文本，使用文本组件设置走有间距，也方便内容动态增长；
      - 「天气信息区域」为复合的内容展示，计算内部的高度，使用绝对定位搭建内容；
        - 天气可能是动态的，但是高度只够一行文本，所以配置了省略相关信息；
      - 「七日天气列表」为不确定高度的动态列表；
        - 首先使用fit-content的flex布局嵌套瀑布流组件，保证动态高度（瀑布流卡片有高度），同时提供一个圆角和背景的样式支持；
        - 其次内部卡片为复合的内容展示，使用绝对定位；
          - 内部卡片中的公告内容判断为动态内容，所以width配置fit-content；
      - 「固定公告」是固定定位，使用left和bottom居下定位，使用width=100%紧贴视口，同时文本垂直居中；
      
      > 特别注意，fixed定位只能放置在system.page的slots.content中；
    </attention>
  </example>
  `
}