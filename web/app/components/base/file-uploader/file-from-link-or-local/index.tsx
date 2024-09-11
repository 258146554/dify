import {
  memo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { RiUploadCloud2Line } from '@remixicon/react'
import FileInput from '../file-input'
import { useFile } from '../hooks'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/app/components/base/portal-to-follow-elem'
import Button from '@/app/components/base/button'

type FileFromLinkOrLocalProps = {
  showFromLink?: boolean
  showFromLocal?: boolean
  trigger: (open: boolean) => React.ReactNode
}
const FileFromLinkOrLocal = ({
  showFromLink = true,
  showFromLocal = true,
  trigger,
}: FileFromLinkOrLocalProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const { handleLoadFileFromLink } = useFile()

  return (
    <PortalToFollowElem
      placement='top'
      offset={4}
      open={open}
      onOpenChange={setOpen}
    >
      <PortalToFollowElemTrigger onClick={() => setOpen(v => !v)} asChild>
        {trigger(open)}
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className='z-10'>
        <div className='p-3 w-[280px] bg-components-panel-bg-blur border-[0.5px] border-components-panel-border rounded-xl shadow-lg'>
          {
            showFromLink && (
              <div className='flex items-center p-1 h-8 bg-components-input-bg-active border border-components-input-border-active rounded-lg shadow-xs'>
                <input
                  className='grow block mr-0.5 px-1 bg-transparent system-sm-regular outline-none appearance-none'
                  placeholder={t('common.fileUploader.pasteFileLinkInputPlaceholder') || ''}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
                <Button
                  className='shrink-0'
                  size='small'
                  variant='primary'
                  disabled={!url}
                  onClick={() => handleLoadFileFromLink()}
                >
                  {t('common.operation.ok')}
                </Button>
              </div>
            )
          }
          {
            showFromLink && showFromLocal && (
              <div className='flex items-center p-2 h-7 system-2xs-medium-uppercase text-text-quaternary'>
                <div className='mr-2 w-[93px] h-[1px] bg-gradient-to-l from-[rgba(16,24,40,0.08)]' />
                OR
                <div className='ml-2 w-[93px] h-[1px] bg-gradient-to-r from-[rgba(16,24,40,0.08)]' />
              </div>
            )
          }
          {
            showFromLocal && (
              <Button
                className='relative w-full'
                variant='secondary-accent'
              >
                <RiUploadCloud2Line className='mr-1 w-4 h-4' />
                {t('common.fileUploader.uploadFromComputer')}
                <FileInput />
              </Button>
            )
          }
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default memo(FileFromLinkOrLocal)
