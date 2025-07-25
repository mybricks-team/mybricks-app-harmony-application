import React, { useCallback, useEffect, useState } from "react";
import { useComputed } from "rxui-t";
import { Locker, Toolbar } from "@mybricks/sdk-for-app/ui";
import { pageModel, versionModel, contentModel } from "@/stores";
import { message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import css from "./web.less";
import help from "./icons/help"
import { Export } from "./icons/export";
import { publish } from "./icons/publish";
import { ExportPanel } from "./components";

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
  setBeforeunload: (bool: boolean) => void
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
  setBeforeunload,
}) => {
  const [showExportPanel, setShowExportPanel] = useState(false);

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
    // if (!globalOperable) {
    //   return;
    // }
    onPublish()
  };

  // const closeExportPanel = useCallback((e) => {
  //   setShowExportPanel(false);
  // }, [])

  // useEffect(() => {

  //   if (showExportPanel) {
  //     window.addEventListener('click', closeExportPanel, true);
  //   } else {
  //     window.removeEventListener('click', closeExportPanel, true);
  //   }
  // }, [showExportPanel])

  return (
    <>
      <Toolbar
        title={pageModel.file?.name}
        updateInfo={<Toolbar.LastUpdate onClick={handleSwitch2SaveVersion} isModify={isModify} />}
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
        {/* <Tooltip
          placement="bottom"
          title={"查看教程文档"}
        > */}
          <div
            className={css.help_btn}
            onClick={() => {
              window.open(
                "https://docs.mybricks.world/docs/miniprogram/basic/addComponent/"
              );
            }}
            data-mybricks-tip={`{content:'查看教程文档',position:'bottom'}`}
          >
            <img
              src={help}
              alt=""
            />
          </div>
        {/* </Tooltip> */}

        {pageModel.isNew &&
          window.__type__ === "mpa" &&
          (globalOperable || operable) ? (
          // <Tooltip
          //   placement="bottom"
          //   title={
          //     globalOperable
          //       ? "当前保存包含应用内容以及上锁画布"
          //       : "当前保存仅包含上锁画布"
          //   }
          // >
            <ExclamationCircleOutlined
              style={{ color: isModify ? "#FA6400" : "inherit", opacity: 0.5 }}
              data-mybricks-tip={`{content:'${globalOperable
                ? "当前保存包含应用内容以及上锁画布"
                : "当前保存仅包含上锁画布"}',position:'bottom'}`}
            />
          // </Tooltip>
        ) : null}
        <Toolbar.Save disabled={!operable} onClick={onSave} dotTip={isModify} />


        {/* <Toolbar.Button disabled={!operable} onClick={publishHandle}>发布</Toolbar.Button> */}
        {/* <Tooltip
          style={{
              borderRadius:12
          }
          }
          placement="bottom"
          title={"发布到物料中心"}
        > */}
          {/* <div className={css.publish_btn} onClick={publishHandle} data-mybricks-tip={`{content:'发布到物料中心',position:'bottom'}`}>
            {publish}
          </div> */}
        {/* </Tooltip> */}

        {/* <Tooltip
          placement="bottomLeft"
          title={"导出模块源码"}
        > */}
          <div
            className={`${css.export_btn} ${showExportPanel ? css.active_btn : ""}`}
            onClick={() => setShowExportPanel(true)}
            data-mybricks-tip={`{content:'导出模块源码',position:'left'}`}
          >
            {Export}
          </div>
        {/* </Tooltip> */}
      </Toolbar>
      <ExportPanel
        visible={showExportPanel}
        onOk={(values) => {
          let isEdited = false
          if (pageModel.appConfig.download.fileName !== values.fileName) {
            pageModel.appConfig.download.fileName = values.fileName;
            isEdited = true;
          }
          if (pageModel.appConfig.download.source !== values.source) {
            pageModel.appConfig.download.source = values.source;
            isEdited = true;
          }
          onCompile(values);
          setShowExportPanel(false);
          if (isEdited) {
            contentModel.editRecord.global = true;
            setBeforeunload(true);
          }
        }}
        onCancel={() => {
          setShowExportPanel(false);
        }}
      />
    </>
  );
};
