import { useState } from 'react'
import {
  RiArrowRightSLine,
  RiListView,
} from '@remixicon/react'
import cn from '@/utils/classnames'
import Button from '@/app/components/base/button'
import type { AgentLogItemWithChildren } from '@/types/workflow'
import NodeStatusIcon from '@/app/components/workflow/nodes/_base/components/node-status-icon'
import CodeEditor from '@/app/components/workflow/nodes/_base/components/editor/code-editor'
import { CodeLanguage } from '@/app/components/workflow/nodes/code/types'

type AgentLogItemProps = {
  item: AgentLogItemWithChildren
  onShowAgentOrToolLog: (detail: AgentLogItemWithChildren) => void
}
const AgentLogItem = ({
  item,
  onShowAgentOrToolLog,
}: AgentLogItemProps) => {
  const {
    label,
    status,
    children,
    data,
  } = item
  const [expanded, setExpanded] = useState(false)

  return (
    <div className='bg-background-default border-[0.5px] border-components-panel-border rounded-[10px]'>
      <div
        className={cn(
          'flex items-center pl-1.5 pt-2 pr-3 pb-2 cursor-pointer',
          expanded && 'pb-1',
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {
          expanded
            ? <RiArrowRightSLine className='shrink-0 w-4 h-4 rotate-90 text-text-quaternary' />
            : <RiArrowRightSLine className='shrink-0 w-4 h-4 text-text-quaternary' />
        }
        <div className='shrink-0 mr-1.5 w-5 h-5'></div>
        <div className='grow system-sm-semibold-uppercase text-text-secondary truncate'>{label}</div>
        {/* <div className='shrink-0 mr-2 system-xs-regular text-text-tertiary'>0.02s</div> */}
        <NodeStatusIcon status={status} />
      </div>
      {
        expanded && (
          <div className='p-1 pt-0'>
            {
              !!children?.length && (
                <Button
                  className='flex items-center justify-between mb-1 w-full'
                  variant='tertiary'
                  onClick={() => onShowAgentOrToolLog(item)}
                >
                  <div className='flex items-center'>
                    <RiListView className='mr-1 w-4 h-4 text-components-button-tertiary-text shrink-0' />
                    {`${children.length} Action Logs`}
                  </div>
                  <div className='flex'>
                    <RiArrowRightSLine className='w-4 h-4 text-components-button-tertiary-text shrink-0' />
                  </div>
                </Button>
              )
            }
            {
              data && (
                <CodeEditor
                  readOnly
                  title={<div>{'data'.toLocaleUpperCase()}</div>}
                  language={CodeLanguage.json}
                  value={data}
                  isJSONStringifyBeauty
                />
              )
            }
          </div>
        )
      }
    </div>
  )
}

export default AgentLogItem
