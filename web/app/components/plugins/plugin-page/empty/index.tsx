import React, { useMemo, useRef, useState } from 'react'
import { MagicBox } from '@/app/components/base/icons/src/vender/solid/mediaAndDevices'
import { FileZip } from '@/app/components/base/icons/src/vender/solid/files'
import { Github } from '@/app/components/base/icons/src/vender/solid/general'
import InstallFromGitHub from '@/app/components/plugins/install-plugin/install-from-github'
import InstallFromLocalPackage from '@/app/components/plugins/install-plugin/install-from-local-package'
import { usePluginPageContext } from '../context'
import { Group } from '@/app/components/base/icons/src/vender/other'
import { useSelector as useAppContextSelector } from '@/context/app-context'
import Line from '../../marketplace/empty/line'
import { useInstalledPluginList, useInvalidateInstalledPluginList } from '@/service/use-plugins'

const Empty = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { enable_marketplace } = useAppContextSelector(s => s.systemFeatures)
  const setActiveTab = usePluginPageContext(v => v.setActiveTab)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setSelectedAction('local')
    }
  }
  const filters = usePluginPageContext(v => v.filters)
  const { data: pluginList } = useInstalledPluginList()
  const invalidateInstalledPluginList = useInvalidateInstalledPluginList()

  const text = useMemo(() => {
    if (pluginList?.plugins.length === 0)
      return 'No plugins installed'
    if (filters.categories.length > 0 || filters.tags.length > 0 || filters.searchQuery)
      return 'No plugins found'
  }, [pluginList, filters])

  return (
    <div className='grow w-full relative z-0'>
      {/* skeleton */}
      <div className='h-full w-full px-12 absolute top-0 grid grid-cols-2 gap-2 overflow-hidden z-10'>
        {Array.from({ length: 20 }).fill(0).map((_, i) => (
          <div key={i} className='h-[100px] bg-components-card-bg rounded-xl'/>
        ))}
      </div>
      {/* mask */}
      <div className='h-full w-full absolute z-20 bg-gradient-to-b from-background-gradient-mask-transparent to-white'/>
      <div className='flex items-center justify-center h-full relative z-30'>
        <div className='flex flex-col items-center gap-y-3'>
          <div className='relative -z-10 flex items-center justify-center w-[52px] h-[52px] rounded-xl
          bg-components-card-bg border-[1px] border-dashed border-divider-deep shadow-xl shadow-shadow-shadow-5'>
            <Group className='text-text-tertiary w-5 h-5' />
            <Line className='absolute -right-[1px] top-1/2 -translate-y-1/2' />
            <Line className='absolute -left-[1px] top-1/2 -translate-y-1/2' />
            <Line className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90' />
            <Line className='absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90' />
          </div>
          <div className='text-text-tertiary text-sm font-normal'>
            {text}
          </div>
          <div className='flex flex-col w-[240px]'>
            <input
              type='file'
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept='.difypkg'
            />
            <div className='w-full flex flex-col gap-y-1'>
              {[
                ...(
                  (enable_marketplace || true)
                    ? [{ icon: MagicBox, text: 'Marketplace', action: 'marketplace' }]
                    : []
                ),
                { icon: Github, text: 'GitHub', action: 'github' },
                { icon: FileZip, text: 'Local Package File', action: 'local' },
              ].map(({ icon: Icon, text, action }) => (
                <div
                  key={action}
                  className='flex items-center px-3 py-2 gap-x-1 rounded-lg bg-components-button-secondary-bg
                  hover:bg-state-base-hover cursor-pointer border-[0.5px] shadow-shadow-shadow-3 shadow-xs'
                  onClick={() => {
                    if (action === 'local')
                      fileInputRef.current?.click()
                    else if (action === 'marketplace')
                      setActiveTab('discover')
                    else
                      setSelectedAction(action)
                  }}
                >
                  <Icon className="w-4 h-4 text-text-tertiary" />
                  <span className='text-text-secondary system-md-regular'>{`Install from ${text}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {selectedAction === 'github' && <InstallFromGitHub
          onSuccess={() => { invalidateInstalledPluginList() }}
          onClose={() => setSelectedAction(null)}
        />}
        {selectedAction === 'local' && selectedFile
          && (<InstallFromLocalPackage
            file={selectedFile}
            onClose={() => setSelectedAction(null)}
            onSuccess={() => { }}
          />
          )
        }
      </div>
    </div>
  )
}

Empty.displayName = 'Empty'

export default React.memo(Empty)
