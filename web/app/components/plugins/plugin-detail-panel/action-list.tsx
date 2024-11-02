import React, { useState } from 'react'
import useSWR from 'swr'
import { useTranslation } from 'react-i18next'
import { usePluginPageContext } from '@/app/components/plugins/plugin-page/context'
import { useAppContext } from '@/context/app-context'
import Button from '@/app/components/base/button'
import Toast from '@/app/components/base/toast'
import Indicator from '@/app/components/header/indicator'
import ToolItem from '@/app/components/tools/provider/tool-item'
import ConfigCredential from '@/app/components/tools/setting/build-in/config-credentials'
import {
  fetchBuiltInToolList,
  removeBuiltInToolCredential,
  updateBuiltInToolCredential,
} from '@/service/tools'

const ActionList = () => {
  const { t } = useTranslation()
  const { isCurrentWorkspaceManager } = useAppContext()
  const currentPluginDetail = usePluginPageContext(v => v.currentPluginDetail)
  const providerDeclaration = currentPluginDetail.declaration.tool.identity
  const { data } = useSWR(
    `/workspaces/current/tool-provider/builtin/${currentPluginDetail.plugin_id}/${currentPluginDetail.name}/tools`,
    fetchBuiltInToolList,
  )

  const [showSettingAuth, setShowSettingAuth] = useState(false)

  const handleCredentialSettingUpdate = () => {}

  if (!data)
    return null

  return (
    <div className='px-4 pt-2 pb-4'>
      <div className='mb-1 py-1'>
        <div className='mb-1 h-6 flex items-center justify-between text-text-secondary system-sm-semibold-uppercase'>
          {t('plugin.detailPanel.actionNum', { num: data.length })}
          {providerDeclaration.is_team_authorization && providerDeclaration.allow_delete && (
            <Button
              variant='secondary'
              size='small'
              onClick={() => setShowSettingAuth(true)}
              disabled={!isCurrentWorkspaceManager}
            >
              <Indicator className='mr-2' color={'green'} />
              {t('tools.auth.authorized')}
            </Button>
          )}
        </div>
        {!providerDeclaration.is_team_authorization && providerDeclaration.allow_delete && (
          <Button
            variant='primary'
            className='w-full'
            onClick={() => setShowSettingAuth(true)}
            disabled={!isCurrentWorkspaceManager}
          >{t('tools.auth.unauthorized')}</Button>
        )}
      </div>
      <div className='flex flex-col gap-2'>
        {data.map(tool => (
          <ToolItem
            key={`${currentPluginDetail.plugin_id}${tool.name}`}
            disabled={false}
            collection={providerDeclaration}
            tool={tool}
            isBuiltIn={true}
            isModel={false}
          />
        ))}
      </div>
      {showSettingAuth && (
        <ConfigCredential
          collection={providerDeclaration}
          onCancel={() => setShowSettingAuth(false)}
          onSaved={async (value) => {
            await updateBuiltInToolCredential(providerDeclaration.name, value)
            Toast.notify({
              type: 'success',
              message: t('common.api.actionSuccess'),
            })
            handleCredentialSettingUpdate()
            setShowSettingAuth(false)
          }}
          onRemove={async () => {
            await removeBuiltInToolCredential(providerDeclaration.name)
            Toast.notify({
              type: 'success',
              message: t('common.api.actionSuccess'),
            })
            handleCredentialSettingUpdate()
            setShowSettingAuth(false)
          }}
        />
      )}
    </div>
  )
}

export default ActionList
