import JSzip from "jszip";

interface DownloadFilesAsZipParams {
  content: Array<{
    content: string;
    path: string;
  }>
  name: string;
}
function downloadFilesAsZip (params: DownloadFilesAsZipParams) {
  const { content, name } = params;
  // 添加文件到 ZIP
  const jszip = new JSzip();
  content.forEach(({ content, path }: any) => {
    jszip.file(path, content);
  })

  // 生成 ZIP 文件并触发下载
  jszip.generateAsync({ type: "blob" })
    .then(function (content) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = name;
      link.click();
    });
}

export { downloadFilesAsZip }
