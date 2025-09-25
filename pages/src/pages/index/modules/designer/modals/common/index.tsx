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

import { done,error } from '../../utils/icons'

import styles from './index.less'

import classNames from 'classnames'

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
      style: {borderRadius: 14},
      children: (
        <div className="fangzhou-theme">
          <div className={styles.saveValidates}>
            {Array.isArray(willSaves) && !!willSaves.length && (
              <div className={styles.willSaves}>
                <div className={styles.subTitle}>即将为您保存以下内容</div>
                {(willSaves ?? []).map(({ id, title }, index) => (
                  <div key={id} className={styles.item}>
                      <img src={done} alt="" style={{width:"14px",height:"14px",marginRight:"4px"}}/>
                      <div className={styles.name}>{title}</div>
                  </div>
                ))}
              </div>
            )}
            {Array.isArray(cannotSaves) && !!cannotSaves.length && (
              <div className={styles.cannotSaves}>
                <div className={styles.subTitle}>
                  以下内容无法保存，请上锁后再试
                </div>
                <div>
                  {(cannotSaves ?? []).map(({ id, title }, index) => (
                    <div key={id} className={styles.item}>
                      <img src={error} alt="" style={{width:"14px",height:"14px",marginRight:"4px"}} />
                      <div className={styles.name}>{title}</div>
                      <span className={styles.reason}>
                        {id === 'app'
                          ? '请点击右上角头像上锁'
                          : '请点击左侧画布和区块菜单上锁'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.footer}>
              {willSaves.length > 0 ? (
                <>
                <div className={styles.button} onClick={_reject} style={{marginRight:12}}>取消</div>
                <div className={classNames(styles.button,styles.main_button)} onClick={_resolve}>好的，仅保存已上锁内容</div>
                  {/* <Button size='small' onClick={_reject}>取消</Button>
                  <Button size='small' type="primary" style={{ marginLeft: 12 }} onClick={_resolve}>
                    好的，仅保存已上锁内容
                  </Button> */}
                </>
              ) : (
                // <Button size='small' onClick={_reject}>好的</Button>
                <div className={styles.button} onClick={_reject} style={{marginRight:12}}>好的</div>
              )}
            </div>
          </div>
        </div>
      ),
    })
  })
}
