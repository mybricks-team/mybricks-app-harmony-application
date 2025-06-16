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