import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Popover,
  Spin,
  Divider,
  Modal,
  Steps,
  Button,
  Form,
  Input,
  message,
} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { globalModal } from '@/components'
import { pageModel, userModel } from '@/stores'

import styles from './index.less'

export const showPublishLoading = ({ text }) => {
  globalModal.show({
    // title: '🎉 ',
    footer: null,
    width: 380,
    closable: false,
    maskClosable: false,
    children: (
      <div className="fangzhou-theme">
        <div className={styles.publishLoading}>
          <LoadingOutlined style={{ fontSize: 18 }} spin />
          <div className={styles.text}>{text}</div>
        </div>
      </div>
    ),
  })
}

export const hidePublishLoading = () => {
  globalModal.hide()
}

/** 校验是否 */
export const showSavesValidateConfirm = ({
  willSaves = [],
  cannotSaves = [],
}) => {
  return new Promise((resolve, reject) => {

    const _resolve = () => {
      globalModal.hide();
      resolve({
        code: 1
      })
    }

    const _reject = () => {
      globalModal.hide();
      reject(new Error('取消保存'))
    }

    globalModal.show({
      // title: '请注意',
      footer: null,
      width: 420,
      closable: true,
      maskClosable: true,
      children: (
        <div className="fangzhou-theme">
          <div className={styles.saveValidates}>
            <h2>请注意</h2>
            {Array.isArray(willSaves) && !!willSaves.length && (
              <div className={styles.willSaves}>
                <div className={styles.subTitle}>即将为您保存以下内容</div>
                {(willSaves ?? []).map(({ id, title }, index) => (
                  <div key={id} className={styles.name}>
                    - {title}
                  </div>
                ))}
              </div>
            )}
            {Array.isArray(cannotSaves) && !!cannotSaves.length && (
              <div className={styles.cannotSaves}>
                <div className={styles.subTitle}>
                  检测到以下内容无法保存，请上锁后再点击保存
                </div>
                <div>
                  {(cannotSaves ?? []).map(({ id, title }, index) => (
                    <div key={id} className={styles.name}>
                      - {title}
                      <span className={styles.reason}>
                        {id === 'app'
                          ? '请点击右上角头像上锁'
                          : '请点击左上角画布和区块申请权限'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.footer}>
              {willSaves.length > 0 ? (
                <>
                  <Button size='small' onClick={_reject}>取消</Button>
                  <Button size='small' type="primary" style={{ marginLeft: 12 }} onClick={_resolve}>
                    好的，仅保存已上锁内容
                  </Button>
                </>
              ) : (
                <Button size='small' onClick={_reject}>好的</Button>
              )}
            </div>
          </div>
        </div>
      ),
    })
  })
}
