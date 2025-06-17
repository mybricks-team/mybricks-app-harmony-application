import axios from "axios";
import * as fse from "fs-extra";

const downloadZip = (params) => {
  const { url, targetPath } = params;

  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      url,
      responseType: "stream"
    }).then((response) => {
      const writer = fse.createWriteStream(targetPath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        resolve(true)
      });

      writer.on('error', (error) => {
        fse.unlinkSync(targetPath);
        reject(error);
      });
    }).catch((error) => {
      reject(error);
    });
  })
}

export default downloadZip;
