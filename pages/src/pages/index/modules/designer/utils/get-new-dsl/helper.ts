const isPercentage = value => String(value).endsWith('%');

/** 判断是否是数字和字符串形式的数字 */
const isNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && /^-?\d*\.?\d*$/.test(value);
}

export function checkValueType(value) {
  if (isPercentage(value)) {
    return 'percentage';
  } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
    return 'number';
  }
  return 'invalid';
}

/** 获取tptJson中合法的slot中的style */
export function getValidSlotStyle(style = undefined) {
  return {
    display: 'flex',
    position: 'inherit',
    flexDirection: style?.flexDirection ?? 'column',
    alignItems: style?.alignItems ?? 'flex-start',
    justifyContent: style?.justifyContent ?? 'flex-start',
    flexWrap: style?.flexWrap ?? 'no-wrap',
    columnGap: style?.columnGap ?? 0,
    rowGap: style?.rowGap ?? 0,
  }
}

/** 获取合法的宽高，返回值仅能为数字、百分比、auto、fit-content，否则为defaultValue */
export function getValidSizeValue(value, defaultValue: string | number = 0) {
  // 处理 null、undefined 或空字符串
  if (value === null || value === undefined || String(value).trim() === '') {
    return defaultValue;
  }

  // 将输入转换为字符串并去除空格
  const strValue = String(value).trim();

  // 处理特殊关键字
  if (['auto', 'fit-content'].includes(strValue)) {
    return strValue;
  }

  // 处理百分比
  if (isPercentage(strValue)) {
    return strValue
  }

  // 处理纯数字和带px的值
  const numStr = strValue.endsWith('px') ? strValue.slice(0, -2) : strValue;
  return isNumber(numStr) ? parseFloat(numStr) : defaultValue;
}


interface BackgroundResult {
  backgroundColor?: string;
  backgroundImage?: string;
}

/** 提取有效的背景色 */
export function getValidBackground(styles: any): BackgroundResult {
  const result: BackgroundResult = {};

  // 处理单独的backgroundColor
  if (styles.backgroundColor) {
    result.backgroundColor = styles.backgroundColor;
  }

  // 处理单独的backgroundImage
  if (styles.backgroundImage) {
    result.backgroundImage = styles.backgroundImage;
  }

  // 处理复合的background属性
  if (styles.background) {
    const background = styles.background.toString();

    // 提取颜色值
    // 匹配颜色格式: #XXX, #XXXXXX, rgb(), rgba(), hsl(), hsla(), 颜色关键字
    const colorRegex = /(#[0-9A-Fa-f]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+)/;
    const colorMatch = background.match(colorRegex);
    if (colorMatch && !result.backgroundColor) {
      result.backgroundColor = colorMatch[0];
    }

    // 提取图片url或渐变
    // 匹配url()或各种渐变函数
    const imageRegex = /(url\([^)]+\)|linear-gradient\([^)]+\)|radial-gradient\([^)]+\)|conic-gradient\([^)]+\))/;
    const imageMatch = background.match(imageRegex);
    if (imageMatch && !result.backgroundImage) {
      result.backgroundImage = imageMatch[0];
    }
  }

  return result;
}