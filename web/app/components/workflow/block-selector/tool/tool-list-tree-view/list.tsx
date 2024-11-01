'use client'
import type { FC } from 'react'
import React, { useCallback } from 'react'
import type { ToolWithProvider } from '../../../types'
import type { BlockEnum } from '../../../types'
import type { ToolDefaultValue } from '../../types'
import Item from './item'
import { useTranslation } from 'react-i18next'
import { CUSTOM_GROUP_NAME, WORKFLOW_GROUP_NAME } from '../../index-bar'

type Props = {
  payload: Record<string, ToolWithProvider[]>
  onSelect: (type: BlockEnum, tool?: ToolDefaultValue) => void
}

const ToolListTreeView: FC<Props> = ({
  payload,
  onSelect,
}) => {
  const { t } = useTranslation()
  const getI18nGroupName = useCallback((name: string) => {
    if (name === CUSTOM_GROUP_NAME)
      return t('workflow.tabs.customTool')

    if (name === WORKFLOW_GROUP_NAME)
      return t('workflow.tabs.workflowTool')

    return name
  }, [t])

  if (!payload) return null

  return (
    <div>
      {Object.keys(payload).map(groupName => (
        <Item
          key={groupName}
          groupName={getI18nGroupName(groupName)}
          toolList={payload[groupName]}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default React.memo(ToolListTreeView)
