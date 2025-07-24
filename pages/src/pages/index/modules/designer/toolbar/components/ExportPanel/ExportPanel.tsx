import React, { useEffect, useState, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Form, Input, Select } from "antd";
import { pageModel } from "@/stores";
import css from "./ExportPanel.less";

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

  useLayoutEffect(() => {
    form.setFieldsValue({
      fileName: pageModel.appConfig.download.fileName,
      source: pageModel.appConfig.download.source || "ohpmLibrary"
    })
  }, [])

  return (
    <div className={`${css.require} fangzhou-theme`}>
      <Form form={form} layout="vertical" size="small">
        <Form.Item
          name="fileName"
          label="应用名称"
        >
          <Input placeholder="请输入应用名称" />
        </Form.Item>
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
              onOk?.({
                ...values,
                fileName: (values.fileName).trim() || pageModel.appConfig.download.fileName,
              });
            })
        }}>确认</button>
      </div>
    </div>
  );
};

export default ExportPanel;
