import React, { useCallback, useEffect } from "react";
import { useComputed } from "rxui-t";
import { Locker, Toolbar } from "@mybricks/sdk-for-app/ui";
import { pageModel, versionModel } from "@/stores";
import { message, Tooltip } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import css from "./web.less";
import help from "./icons/help"
import { showHarmonyDownloadConfig } from "./model/downloadModel"
import { CompileType } from "@/types";

interface WebToolbarProps {
  operable: boolean;
  globalOperable: boolean;
  statusChange: any;
  isModify?: boolean;
  designerRef: any;
  onSave: any;
  onCompile: any;
  onPreview: any;
  onPublish: () => void;
  onH5Publish?: any;
  onH5Preview?: any;
}

export const WebToolbar: React.FC<WebToolbarProps> = ({
  operable,
  globalOperable,
  statusChange,
  isModify = false,
  designerRef,
  onSave,
  onCompile,
  onPublish,
}) => {
  const handleSwitch2SaveVersion = useCallback(() => {
    designerRef.current?.switchActivity?.("@mybricks/plugins/version");
    setTimeout(() => {
      pageModel?.versionApi?.switchAciveTab?.("save");
    }, 0);
  }, []);

  const publishLoading = useComputed(() => {
    return pageModel.publishLoading;
  });

  useEffect(() => {
    if (publishLoading) {
      message.loading({
        content: "产物发布中，请稍等...",
        key: "loading",
        duration: 0,
      });
    } else {
      message.destroy("loading");
    }
  }, [publishLoading]);

  const publishHandle = () => {
    if (!globalOperable) {
      return;
    }
    onPublish()
  };

  return (
    <>
      <Toolbar
        title={pageModel.file?.name}
        updateInfo={<Toolbar.LastUpdate onClick={handleSwitch2SaveVersion} />}
      >
        <Locker
          statusChange={statusChange}
          compareVersion={false}
          // @ts-ignore 更新sdk类型定义
          getExtraFileIds={() => true}
          autoLock={true}
          beforeToggleLock={
            window.__type__ === "mpa"
              ? () => {
                if (versionModel.file.updated) {
                  message.info("当前应用版本落后，不允许上锁，请刷新后再试");
                  return false;
                }
                return true;
              }
              : null
          }
        />
        <Tooltip
          placement="bottom"
          title={"查看教程文档"}
        >
          <div
            className={css.help_btn}
            onClick={() => {
              window.open(
                "https://docs.mybricks.world/docs/miniprogram/basic/addComponent/"
              );
            }}
          >
            <img
              src={help}
              alt=""
            />
          </div>
        </Tooltip>

        {pageModel.isNew &&
          window.__type__ === "mpa" &&
          (globalOperable || operable) ? (
          <Tooltip
            placement="bottom"
            title={
              globalOperable
                ? "当前保存包含应用内容以及上锁画布"
                : "当前保存仅包含上锁画布"
            }
          >
            <ExclamationCircleOutlined
              style={{ color: isModify ? "#FA6400" : "inherit", opacity: 0.5 }}
            />
          </Tooltip>
        ) : null}
        <Toolbar.Save disabled={!operable} onClick={onSave} dotTip={isModify} />
        <Toolbar.Button disabled={!operable} onClick={publishHandle}>发布</Toolbar.Button>
        <Toolbar.Button onClick={() => showHarmonyDownloadConfig({ onCompile, type: CompileType.harmonyModule })}>下载源码(模块)</Toolbar.Button>
        <Toolbar.Button onClick={() => showHarmonyDownloadConfig({ onCompile, type: CompileType.harmonyApplication })}>下载源码(应用)</Toolbar.Button>
      </Toolbar>
    </>
  );
};
