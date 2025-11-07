import API from "@mybricks/sdk-for-app/api";

const addDownloadRecord = async (params: any) => {
  const {
    fileId,
    userId,
    content
  } = params;

  // @ts-ignore
  await API.File.publish({
    userId,
    fileId,
    extName: "harmony-module",
    content: JSON.stringify(content),
    type: "download",
    commitInfo: JSON.stringify(content),
  })
}

export default addDownloadRecord
