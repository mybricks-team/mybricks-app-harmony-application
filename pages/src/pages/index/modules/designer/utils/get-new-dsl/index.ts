
import { checkValueType, getValidSlotStyle, getValidSizeValue } from './helper'

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

    // 检查是否有对应的修改器
    if (component.namespace && this.modifiers.has(component.namespace)) {
      const modifier = this.modifiers.get(component.namespace);
      // 执行修改
      modifier?.(component);
    }

    const modifier = this.modifiers.get('component');
    modifier?.(component);

    // 继续遍历slots
    if (component.slots) {
      Object.values(component.slots).forEach(slot => this.traverseSlot(slot));
    }

    if (component.comAry) {
      component.comAry.forEach(com => this.traverseComponent(com));
    }
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

  const child0 = root.comAry?.[0];
  if (!root.style?.width && child0.namespace === 'mybricks.basic-comlib.antd5.popup') {
    const child0width = child0.style.width;
    if (checkValueType(child0width) === 'number') {
      root.style.width = getValidSizeValue(child0width)
    }
  }
  if (!root.style?.height && child0.namespace === 'mybricks.basic-comlib.antd5.popup') {
    const child0height = child0.style.height;
    root.style.height = child0height
  }
})

// 添加对插槽的处理
traversal.registerModifier('slot', (slot) => {
  if (!slot.style) {
    slot.style = {}
  }
  slot.style = {
    ...slot.style,
    layout: slot.style?.flexDirection === 'row' ? 'flex-row' : 'flex-column',
    flexDirection: slot.style?.flexDirection === 'row' ? 'row' : 'column',
    width: slot.style?.width ?? '100%',
    height: slot.style?.height ?? 'fit-content'
  }
})

// 添加对所有组件的通用处理
traversal.registerModifier('component', (component) => {
  polyfillComponentStyle(component.style)
  polyfillComponentStyAry(component.style?.styleAry)
})

// 添加对flex节点的处理
traversal.registerModifier('flex', (component) => {
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

  // 处理幻觉
  if (component.style?.paddingLeft) {
    component.style.marginLeft = component.style?.paddingLeft
    delete component.style?.paddingLeft
  }
  if (component.style?.paddingRight) {
    component.style.marginRight = component.style?.paddingRight
    delete component.style?.paddingRight
  }

  // 处理绝对定位兼容
  const rootStyle = component?.style?.styleAry?.find?.(s => s.selector === ':root')?.css
  if (rootStyle?.position === 'absolute') {
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
  delete component.comAry
})

export const getNewDSL = (type, dslJson) => {
  if (type === 'geo' && dslJson?.ui) {
    try {
      const copyDslJson = JSON.parse(JSON.stringify(dslJson));
      traversal.traverse(copyDslJson?.ui)
      return copyDslJson
    } catch (error) {
      console.warn('解析失败')
      console.error(error)
    }
  }
  return dslJson
}