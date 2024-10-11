import React from 'react'
import type { FC } from 'react'
import { RiArrowRightUpLine, RiVerifiedBadgeLine } from '@remixicon/react'
import Badge from '../base/badge'
import type { Plugin } from './types'
import Description from './card/base/description'
import Icon from './card/base/card-icon'
import Title from './card/base/title'
import DownloadCount from './card/base/download-count'
import Button from '@/app/components/base/button'
import type { Locale } from '@/i18n'
import cn from '@/utils/classnames'

type Props = {
  className?: string
  locale: Locale // The component is used in both client and server side, so we can't get the locale from both side(getLocaleOnServer and useContext)
  payload: Plugin
}

const ProviderCard: FC<Props> = ({
  className,
  locale,
  payload,
}) => {
  const { org, label } = payload

  return (
    <div className={cn('group relative p-4 pb-3 border-[0.5px] border-components-panel-border bg-components-panel-on-panel-item-bg hover-bg-components-panel-on-panel-item-bg rounded-xl shadow-xs', className)}>
      {/* Header */}
      <div className="flex">
        <Icon src={payload.icon} />
        <div className="ml-3 w-0 grow">
          <div className="flex items-center h-5">
            <Title title={label[locale]} />
            <RiVerifiedBadgeLine className="shrink-0 ml-0.5 w-4 h-4 text-text-accent" />
          </div>
          <div className='mb-1 flex justify-between items-center h-4'>
            <div className='flex items-center'>
              <div className='text-text-tertiary system-xs-regular'>{org}</div>
              <div className='mx-2 text-text-quaternary system-xs-regular'>·</div>
              <DownloadCount downloadCount={payload.install_count || 0} />
            </div>
          </div>
        </div>
      </div>
      <Description className='mt-3' text={payload.brief[locale]} descriptionLineRows={2}></Description>
      <div className='mt-3 flex space-x-0.5'>
        {['LLM', 'text embedding', 'speech2text'].map(tag => (
          <Badge key={tag} text={tag} />
        ))}
      </div>
      <div
        className='hidden group-hover:flex items-center gap-2 absolute bottom-0 left-0 right-0 p-4 pt-8'
        style={{ background: 'linear-gradient(0deg, #F9FAFB 60.27%, rgba(249, 250, 251, 0.00) 100%)' }}
      >
        <Button
          className='flex-grow'
          variant='primary'
        >
          Install
        </Button>
        <Button
          className='flex-grow'
          variant='secondary'
        >
          Details
          <RiArrowRightUpLine className='w-4 h-4' />
        </Button>
      </div>
    </div>
  )
}

export default ProviderCard
