import React, { useEffect } from 'react';
import { Button, Form, Input, Card } from 'antd';
import dayjs from 'dayjs';
import { TConfigProps } from '../useConfig';
import { DESIGNER_STATIC_PATH } from '../../../../constants'

const { Meta } = Card;
export default (props: TConfigProps) => {
  const { config, mergeUpdateConfig, user } = props
  const [form] = Form.useForm();

  const comlibConfig = config?.comlibs || {}
  useEffect(() => {
    form.setFieldsValue(comlibConfig)
  }, [comlibConfig])

  const onSubmit = (values) => {
    const updateTime = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    mergeUpdateConfig({ comlibs: { ...values, updateTime, user: user?.email } });
  }

  return (
    <Form form={form} onFinish={onSubmit} style={{ marginTop: 12 }}>
      <Form.Item
        name="url"
        label="链接"
        tooltip="组件库edit.js地址"
      >
        <Input placeholder={"组件库edit.js地址"} />
      </Form.Item>
      <Form.Item style={{ textAlign: 'right' }}>
        {Object.keys(comlibConfig).length > 0 && <Meta description={`${comlibConfig.user} 更新于 ${comlibConfig.updateTime}`} />}
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </Form.Item>
    </Form>
  );
}