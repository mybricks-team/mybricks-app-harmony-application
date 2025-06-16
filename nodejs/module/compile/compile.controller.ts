import {
  Body,
  Controller,
  Get,
  Res,
  Post,
  Req,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { Response } from "express";
import LimitInterceptor from "./../../common/interceptor/limitInterceptor";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import {
  downloadAssetsFromPath,
  getComboFilesStringFromPath,
  localizeFile,
} from "./utils";
import { Logger } from "@mybricks/rocker-commons";
import { compilerHarmony2, compilerHarmonyApp } from "./compiler";
import publish from "./publish";
import getModule from "./getModule";
import loadPage from "./loadPage";

const tempFolderPath = path.resolve(__dirname, "../../.tmp"); //临时目录

const DEP_MODULES = [
  {
    name: "F2",
    version: "3.8.12",
    library: "F2",
    urls: [
      path.resolve(__dirname, "./lib_modules/antv-f2/3.8.12/f2-all.min.js"),
    ],
  },
];

const getDepModules = (depModules) => {
  let modules = [];
  if (!Array.isArray(depModules)) {
    return modules;
  }

  depModules.forEach((dep) => {
    const findRes = DEP_MODULES.find(
      (module) => module.name === dep.name && module.version === dep.version
    );
    if (findRes) {
      modules.push(findRes);
    }
  });

  return modules;
};

if (!fs.existsSync(tempFolderPath)) {
  fs.mkdirSync(tempFolderPath);
}

@Controller("api/harmony-module")
export default class CompileController {
  @Get("/health")
  async health() {
    return "success";
  }

  /**
   * compile
   */
  @Post("harmony/compile")
  @UseInterceptors(LimitInterceptor)
  async harmonyCompile(
    @Body("fileId") fileId: number,
    @Body("fileName") fileName: string,
    @Body("data") data: any,
    @Body("type") type: string,
    @Req() req: any
  ) {
    try {
      fse.ensureDirSync(tempFolderPath);

      const projectName = `project-${fileId}-build-${type}`;
      const projectPath = path.resolve(tempFolderPath, `./${projectName}`);

      await fse.ensureDir(projectPath);
      await fse.emptyDir(projectPath);

      Logger.info("[compile] init harmony template start");

      await (type === "harmonyApplication" ? compilerHarmonyApp : compilerHarmony2)(
        {
          data,
          projectPath,
          projectName,
          fileName,
          depModules: getDepModules(data.depModules),
          origin: req.headers.origin,
          type,
          fileId,
        },
        { Logger }
      );

      Logger.info("[compile] init harmony template success");

      return {
        code: 1,
        message: "构建成功",
        data: {},
      };
    } catch (error) {
      console.log(error)
      Logger.info("[compile] compile harmony fail " + error.message, error);
      return {
        code: -1,
        errCode: error.errCode,
        message:
          error?.message ||
          (error.code ? `构建失败，错误码：${error.code}` : "构建失败"),
        stack: error?.stack,
      };
    }
  }

  @Get("download")
  async download(
    @Query("fileId") fileId: number,
    @Query("type") type: string = "weapp",
    @Query("backend") backend: string = "",
    @Query("localize") localize: 0 | 1 = 0,
    @Res() response: Response
  ) {
    fse.ensureDirSync(tempFolderPath);
    const projectName = `project-${fileId}-build-${type}`;
    const projectPath = path.resolve(tempFolderPath, `./${projectName}`);
    const localizePath = path.resolve(
      tempFolderPath,
      `./project-${fileId}-localize-${type}`
    );

    if (backend) {
      // 如果存在后端项目路径，则创建一个 project-${fileId}-all-build-${type} 的文件夹
      // 然后将小程序项目和后端项目合并复制到这个文件夹下
      // 小程序的文件夹名字为 weapp，原路径为 projectPath
      // 后端的文件夹名字为 backend，原路径为 backend
      // 然后将这个文件夹打包

      const allProjectPath = path.resolve(
        tempFolderPath,
        `./project-${fileId}-all-build-${type}`
      );

      await fse.ensureDir(allProjectPath);

      await fse.emptyDir(allProjectPath);

      await fse.copy(projectPath, path.resolve(allProjectPath, "./weapp"));
      await fse.copy(backend, path.resolve(allProjectPath, "./backend"));

      const zipFilePath = await downloadAssetsFromPath(
        allProjectPath,
        projectName
      );

      Logger.info(
        `[download] zip ${projectPath} success，zip file ==> ${zipFilePath}`
      );

      response.sendFile(zipFilePath);
      return;
    }

    try {
      let downloadPath = projectPath;

      if (!(await fse.pathExists(projectPath))) {
        Logger.info(`[download] ${projectPath} is not Exist`);
        throw new Error("下载失败，文件不存在，请重新构建");
      }

      // H5才支持资源本地化，将所有图片资源下载到本地之后再打包，TODO，目前有点粗暴
      if (!!localize && type === "h5") {
        // 复制一份，防止修改后，每次下载都是修改后的版本
        await fse.ensureDir(localizePath);
        await fse.copy(projectPath, localizePath, { overwrite: true });
        downloadPath = localizePath;

        Logger.info(`[download] ${projectPath} localize start`);
        try {
          const meta = await fse.readJSON(
            path.resolve(downloadPath, "./.meta.json")
          );
          await localizeFile(downloadPath, [
            {
              filePath: path.resolve(
                downloadPath,
                `./js/${meta.configFileName}`
              ),
              assetRelativePath: "./assets/",
            },
            {
              filePath: path.resolve(
                downloadPath,
                `./css/${meta.projectCssFileName}`
              ),
              assetRelativePath: "./../assets/",
            },
          ]);
          Logger.info(`[download] ${projectPath} localize success`);
        } catch (error) {
          Logger.error(
            `[download] zip ${projectPath} error, 资源本地化失败 ${JSON.stringify(
              error
            )}`,
            error
          );
        }
      }

      const zipFilePath = await downloadAssetsFromPath(
        downloadPath,
        projectName
      );

      Logger.info(
        `[download] zip ${projectPath} success，zip file ==> ${zipFilePath}`
      );

      response.sendFile(zipFilePath);
    } catch (error) {
      Logger.error(
        `[download] zip ${projectPath} error, ${error.message}`,
        error
      );
      response.send({
        code: -1,
        message: error.message || "下载失败",
        stack: error?.stack,
      });
    }
  }

  @Get("queryFiles")
  async queryFiles(
    @Query("fileId") fileId: number,
    @Query("type") type: string = "weapp"
  ) {
    fse.ensureDirSync(tempFolderPath);
    const projectName = `project-${fileId}-build-${type}`;
    const projectPath = path.resolve(tempFolderPath, `./${projectName}`);

    try {
      if (!(await fse.pathExists(projectPath))) {
        Logger.info(`[download] ${projectPath} is not Exist`);
        throw new Error("下载失败，文件不存在，请重新构建");
      }

      const result = await getComboFilesStringFromPath(projectPath);

      Logger.info(`[download] zip ${projectPath} success`);

      return {
        code: 1,
        data: result,
      };
    } catch (error) {
      Logger.error(
        `[download] zip ${projectPath} error, ${error.message}`,
        error
      );
      return {
        code: -1,
        errCode: error.errCode,
        message:
          error?.message ||
          (error.code ? `构建失败，错误码：${error.code}` : "构建失败"),
        stack: error?.stack,
      };
    }
  }

  @Post("publish")
  async publish(
    @Body("userId") userId: string,
    @Body("fileId") fileId: number,
    @Body("fileName") fileName: string,
    @Body("type") type: string,
    @Body("data") data: any,
  ) {
    try {
      await publish({
        userId,
        fileId,
        fileName,
        type,
        data,
      })
      return {
        code: 1,
        message: "发布成功",
        data: {},
      };
    } catch (error) {
      Logger.info("[publish] fail " + error.message, error);
      return {
        code: -1,
        errCode: error.errCode,
        message:
          error?.message ||
          (error.code ? `发布失败，错误码：${error.code}` : "发布失败"),
        stack: error?.stack,
      };
    }
  }

  @Get("getModule")
  async getModule(
    @Query("moduleId") moduleId: number,
    @Query("version") version: string,
    @Query("origin") origin: string,
    @Res() res: Response
  ) {
    const result = await getModule({ moduleId, version, origin });

    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.status(200).send(result.code).end();
  }

  @Get("loadPage")
  async loadPage(
    @Query("moduleId") moduleId: number,
    @Query("version") version: string,
    @Query("pageId") pageId: number,
  ) {
    try {
      const page = await loadPage({ moduleId, version, pageId });

      return {
        code: 1,
        message: "获取页面成功",
        data: page,
      };
    } catch (error) {
      Logger.info("[loadPage] fail " + error.message, error);
      return {
        code: -1,
        errCode: error.errCode,
        message:
          error?.message ||
          (error.code ? `获取页面失败，错误码：${error.code}` : "获取页面失败"),
        stack: error?.stack,
      };
    }
  }
}
