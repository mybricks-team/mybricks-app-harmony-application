import { pinyin, cleanAndSplitString, firstCharToUpperCase } from "./string";

const generateFileName = (text: string) => {
  const splits = cleanAndSplitString(text)
  
  return splits.reduce((pre, cur) => {
    return pre + firstCharToUpperCase(pinyin.convertToPinyin(cur, "", true))
  }, "")
}

export default generateFileName
