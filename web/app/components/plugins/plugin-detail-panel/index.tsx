'use client'
import React from 'react'
import type { FC } from 'react'
import DetailHeader from './detail-header'
import EndpointList from './endpoint-list'
import ActionList from './action-list'
import ModelList from './model-list'
import Drawer from '@/app/components/base/drawer'
import { usePluginPageContext } from '@/app/components/plugins/plugin-page/context'
import cn from '@/utils/classnames'

type Props = {
  onDelete: () => void
}

const PluginDetailPanel: FC<Props> = ({
  onDelete,
}) => {
  const pluginDetail = usePluginPageContext(v => v.currentPluginDetail)
  const setCurrentPluginDetail = usePluginPageContext(v => v.setCurrentPluginDetail)

  const handleHide = () => setCurrentPluginDetail(undefined)

  if (!pluginDetail)
    return null

  return (
    <Drawer
      isOpen={!!pluginDetail}
      clickOutsideNotOpen={false}
      onClose={handleHide}
      footer={null}
      mask={false}
      positionCenter={false}
      panelClassname={cn('justify-start mt-[64px] mr-2 mb-2 !w-[420px] !max-w-[420px] !p-0 !bg-components-panel-bg rounded-2xl border-[0.5px] border-components-panel-border shadow-xl')}
    >
      {pluginDetail && (
        <>
          <DetailHeader
            detail={pluginDetail}
            onHide={handleHide}
            onDelete={onDelete}
          />
          <div className='grow overflow-y-auto'>
            {!!pluginDetail.declaration.endpoint && <EndpointList />}
            {!!pluginDetail.declaration.tool && <ActionList />}
            {!!pluginDetail.declaration.model && <ModelList />}
          </div>
        </>
      )}
    </Drawer>
  )
}

export default PluginDetailPanel
