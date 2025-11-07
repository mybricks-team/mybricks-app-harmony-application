import React, { useEffect, useState, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Form, Input, Select } from "antd";
import { pageModel } from "@/stores";
import css from "./ExportPanel.less";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import { DeleteOutlined } from "@ant-design/icons"
import classNames from "classnames";

// 是否可以使用该api
const canUseFSAccess = !!window.showDirectoryPicker;


// 检查目录是否正常。移动，重命名，删除，返回false
const verifyLife = async (handle: FileSystemDirectoryHandle) => {
  try {
    for await (const key of handle.entries()) {
      break;
    }
    return true;
  } catch {
    return false
  }
}

// 获取当前状态
const getTargetDirectoryStatus = async (key: string) => {
  let directoryHandle
  try {
    directoryHandle = await idbGet(key);
  } catch (e) {
    console.error("[idb-keyval - get]", e);
  }
  if (!directoryHandle) {
    // 没有选择目录
    return {
      handle: null,
      status: -1,
      key
    }
  }

  if (!await verifyLife(directoryHandle)) {
    // 目录已经失效
    return {
      handle: directoryHandle,
      status: 0,
      key
    }
  }

  return {
    handle: directoryHandle,
    status: 1,
    key
  }
}

// 选择目录
const showDirectoryPicker = async (key: string) => {
  try {
    const directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    try {
      await idbSet(key, directoryHandle);
    } catch (e) {
      console.error("[idb-keyval - set]", e);
    }
    return directoryHandle;
  } catch {
    return;
  }
}

interface ExportPanelProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: { fileName: string; source: "ohpmLibrary" | "sourceCode" }) => void;
}
const ExportPanel = (props: ExportPanelProps) => {
  const ref = useRef<HTMLDivElement>();
  const [show, setShow] = useState(false);

  const clickCancel = useCallback((e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      props.onCancel();
    }
  }, [])

  useEffect(() => {
    if (props.visible) {
      setShow(props.visible);
      window.addEventListener('click', clickCancel, true);
    } else {
      window.removeEventListener('click', clickCancel, true);
    }
  }, [props.visible])

  return show && createPortal(
    <div ref={ref} className={css.panel} style={{ display: props.visible ? "block" : "none" }}>
      <div className={css.title}>
        导出下载应用的源代码
      </div>
      <HarmonyRequireForm
        onCancel={props.onCancel}
        onOk={props.onOk}
        getPopupContainer={() => ref.current}
      />
    </div>,
    document.body
  )
}

const HarmonyRequireForm = ({ onCancel, onOk, getPopupContainer }) => {
  const [form] = Form.useForm();

  const [targetDirectoryStatus, setTargetDirectoryStatus] = useState(null);

  const genTargetDirectoryStatus = () => {
    return new Promise((resolve) => {
      getTargetDirectoryStatus(`${pageModel.file.id}_for_download_directoryhandle`)
        .then((status) => {
          setTargetDirectoryStatus(status);
          resolve(status);
        })
      })
  }

  useLayoutEffect(() => {
    form.setFieldsValue({
      fileName: pageModel.appConfig.download.fileName,
      source: pageModel.appConfig.download.source || "ohpmLibrary"
    })

    if (canUseFSAccess) {
      genTargetDirectoryStatus()
    }
  }, [])

  const showDirectoryPickerButtonClick = () => {
    showDirectoryPicker(targetDirectoryStatus.key)
      .then((handle) => {
        console.log(1, handle)
        if (handle) {
          setTargetDirectoryStatus((status) => {
            return {
              ...status,
              status: 1,
              handle,
            }
          })
        }
        
      })
      .catch(() => {

      })
  }

  return (
    <div className={`${css.require} fangzhou-theme`}>
      <Form form={form} layout="vertical" size="small">
        <div className={css.formItem}>
          <Form.Item
            name="fileName"
            label="应用名称"
          >
            <Input placeholder="请输入应用名称" />
          </Form.Item>
        </div>
        <div className={css.formItem}>
          <Form.Item
            name="source"
            label="应用依赖"
          >
            <Select
              placeholder="请选择应用依赖"
              options={[
                {
                  label: "ohpm三方库",
                  value: "ohpmLibrary"
                },
                {
                  label: "源码",
                  value: "sourceCode"
                }
              ]}
              getPopupContainer={getPopupContainer}
            />
          </Form.Item>
        </div>
        {targetDirectoryStatus && (
          <div className={css.formItem}>
            <Form.Item
              name="moduleExportDirectory"
              label="应用导出目录"
              tooltip="配置目录后，导出应用将使用写文件覆盖的形式，不再下载zip包"
            >
              {targetDirectoryStatus.status === -1 && (
                <button
                  className={css.button}
                  onClick={showDirectoryPickerButtonClick}
                >
                  配置目录
                </button>
              )}
              {(targetDirectoryStatus.status === 1 || targetDirectoryStatus.status === 0) && (
                <div className={css.targetDirectoryStatus1}>
                  <span className={classNames(css.span, {
                    [css.unlink]: targetDirectoryStatus.status === 0
                  })}
                    data-mybricks-tip="文件目录不存在，请点击重新选择"
                    onClick={showDirectoryPickerButtonClick}
                  >
                    {targetDirectoryStatus.handle.name}
                  </span>
                  <DeleteOutlined
                    width={12} 
                    height={12}
                    data-mybricks-tip="取消配置"
                    onClick={() => {
                      setTargetDirectoryStatus((status) => {
                        return {
                          ...status,
                          handle: null,
                          status: -1
                        }
                      })

                      try {
                        idbDel(targetDirectoryStatus.key)
                      } catch (e) {
                        console.error("[idb-keyval - del]", e);
                      }
                    }}
                  />
                </div>
              )}
            </Form.Item>
          </div>
        )}
      </Form>

      <div className={css.help}>
        <div className={css.tips}>使用步骤及注意事项</div>
        <div className={css.listItem}>1.导出当前应用；</div>
        <div className={css.listItem}>2.解压并拖入DevEco Studio，直接启动即可；</div>
      </div>

      <div className={css.footer}>
        <button className={css.button} onClick={onCancel}>取消</button>
        <button className={`${css.button} ${css.mainButton}`} onClick={() => {
          form
            .validateFields()
            .then((values) => {
              genTargetDirectoryStatus().then(({ status, handle }: any) => {
                onOk?.({
                  ...values,
                  fileName: (values.fileName).trim() || pageModel.appConfig.download.fileName,
                  fse: status === 1 ? handle : null
                });
              })
            })
        }}>确认</button>
      </div>
    </div>
  );
};

export default ExportPanel;
