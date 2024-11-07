'use client'
import type { FC } from 'react'
import React, { useCallback } from 'react'
import { type MetaData, PluginSource } from '../types'
import { RiDeleteBinLine, RiInformation2Line, RiLoopLeftLine } from '@remixicon/react'
import { useBoolean } from 'ahooks'
import { useTranslation } from 'react-i18next'
import PluginInfo from '../plugin-page/plugin-info'
import ActionButton from '../../base/action-button'
import Tooltip from '../../base/tooltip'
import Confirm from '../../base/confirm'
import { uninstallPlugin } from '@/service/plugins'
import { useGitHubReleases } from '../install-plugin/hooks'
import { compareVersion, getLatestVersion } from '@/utils/semver'
import Toast from '@/app/components/base/toast'
import { useModalContext } from '@/context/modal-context'
import { usePluginPageContext } from '../plugin-page/context'

const i18nPrefix = 'plugin.action'

type Props = {
  author: string
  installationId: string
  pluginName: string
  version: string
  usedInApps: number
  isShowFetchNewVersion: boolean
  isShowInfo: boolean
  isShowDelete: boolean
  onDelete: () => void
  meta?: MetaData
}
const Action: FC<Props> = ({
  author,
  installationId,
  pluginName,
  version,
  isShowFetchNewVersion,
  isShowInfo,
  isShowDelete,
  onDelete,
  meta,
}) => {
  const { t } = useTranslation()
  const [isShowPluginInfo, {
    setTrue: showPluginInfo,
    setFalse: hidePluginInfo,
  }] = useBoolean(false)
  const [deleting, {
    setTrue: showDeleting,
    setFalse: hideDeleting,
  }] = useBoolean(false)
  const { fetchReleases } = useGitHubReleases()
  const { setShowUpdatePluginModal } = useModalContext()
  const mutateInstalledPluginList = usePluginPageContext(v => v.mutateInstalledPluginList)

  const handleFetchNewVersion = async () => {
    try {
      const fetchedReleases = await fetchReleases(author, pluginName)
      if (fetchedReleases.length === 0)
        return
      const versions = fetchedReleases.map(release => release.tag_name)
      const latestVersion = getLatestVersion(versions)
      if (compareVersion(latestVersion, version) === 1) {
        setShowUpdatePluginModal({
          onSaveCallback: () => {
            mutateInstalledPluginList()
          },
          payload: {
            type: PluginSource.github,
            github: {
              originalPackageInfo: {
                id: installationId,
                repo: `https://github.com/${meta!.repo}`,
                version: meta!.version,
                package: meta!.package,
              },
            },
          },
        })
      }
      else {
        Toast.notify({
          type: 'info',
          message: 'No new version available',
        })
      }
    }
    catch {
      Toast.notify({
        type: 'error',
        message: 'Failed to compare versions',
      })
    }
  }

  const [isShowDeleteConfirm, {
    setTrue: showDeleteConfirm,
    setFalse: hideDeleteConfirm,
  }] = useBoolean(false)

  const handleDelete = useCallback(async () => {
    showDeleting()
    const res = await uninstallPlugin(installationId)
    hideDeleting()
    if (res.success) {
      hideDeleteConfirm()
      onDelete()
    }
  }, [installationId, onDelete])
  return (
    <div className='flex space-x-1'>
      {/* Only plugin installed from GitHub need to check if it's the new version  */}
      {isShowFetchNewVersion
        && (
          <Tooltip popupContent={t(`${i18nPrefix}.checkForUpdates`)}>
            <ActionButton onClick={handleFetchNewVersion}>
              <RiLoopLeftLine className='w-4 h-4 text-text-tertiary' />
            </ActionButton>
          </Tooltip>
        )
      }
      {
        isShowInfo
        && (
          <Tooltip popupContent={t(`${i18nPrefix}.pluginInfo`)}>
            <ActionButton onClick={showPluginInfo}>
              <RiInformation2Line className='w-4 h-4 text-text-tertiary' />
            </ActionButton>
          </Tooltip>
        )
      }
      {
        isShowDelete
        && (
          <Tooltip popupContent={t(`${i18nPrefix}.delete`)}>
            <ActionButton
              className='hover:bg-state-destructive-hover text-text-tertiary hover:text-text-destructive'
              onClick={showDeleteConfirm}
            >
              <RiDeleteBinLine className='w-4 h-4' />
            </ActionButton>
          </Tooltip>
        )
      }

      {isShowPluginInfo && (
        <PluginInfo
          repository={meta!.repo}
          release={meta!.version}
          packageName={meta!.package}
          onHide={hidePluginInfo}
        />
      )}
      <Confirm
        isShow={isShowDeleteConfirm}
        title={t(`${i18nPrefix}.delete`)}
        content={
          <div>
            {t(`${i18nPrefix}.deleteContentLeft`)}<span className='system-md-semibold'>{pluginName}</span>{t(`${i18nPrefix}.deleteContentRight`)}<br />
            {/* // todo: add usedInApps */}
            {/* {usedInApps > 0 && t(`${i18nPrefix}.usedInApps`, { num: usedInApps })} */}
          </div>
        }
        onCancel={hideDeleteConfirm}
        onConfirm={handleDelete}
        isLoading={deleting}
        isDisabled={deleting}
      />
    </div>
  )
}
export default React.memo(Action)
