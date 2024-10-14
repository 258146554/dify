'use client'
import type { FC } from 'react'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiMoreFill } from '@remixicon/react'
import ActionButton from '@/app/components/base/action-button'
// import Button from '@/app/components/base/button'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/app/components/base/portal-to-follow-elem'
import cn from '@/utils/classnames'

type Props = {
}

const OperationDropdown: FC<Props> = () => {
  const { t } = useTranslation()
  const [open, doSetOpen] = useState(false)
  const openRef = useRef(open)
  const setOpen = useCallback((v: boolean) => {
    doSetOpen(v)
    openRef.current = v
  }, [doSetOpen])

  const handleTrigger = useCallback(() => {
    setOpen(!openRef.current)
  }, [setOpen])

  return (
    <PortalToFollowElem
      open={open}
      onOpenChange={setOpen}
      placement='bottom-end'
      offset={{
        mainAxis: 0,
        crossAxis: 0,
      }}
    >
      <PortalToFollowElemTrigger onClick={handleTrigger}>
        <ActionButton className={cn(open && 'bg-state-base-hover')}>
          <RiMoreFill className='w-4 h-4 text-components-button-secondary-accent-text' />
        </ActionButton>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className='z-50'>
        <div className='w-[112px] p-1 bg-components-panel-bg-blur rounded-xl border-[0.5px] border-components-panel-border shadow-lg'>
          <div className='px-3 py-1.5 rounded-lg text-text-secondary system-md-regular cursor-pointer hover:bg-state-base-hover'>{t('common.operation.download')}</div>
          {/* Wait marketplace */}
          {/* <div className='px-3 py-1.5 rounded-lg text-text-secondary system-md-regular cursor-pointer hover:bg-state-base-hover'>{t('common.operation.viewDetail')}</div> */}
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}
export default React.memo(OperationDropdown)
