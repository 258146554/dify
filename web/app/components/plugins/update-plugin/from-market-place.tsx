'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RiInformation2Line } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import Card from '@/app/components/plugins/card'
import Modal from '@/app/components/base/modal'
import Button from '@/app/components/base/button'
import Badge, { BadgeState } from '@/app/components/base/badge/index'
import type { UpdateFromMarketPlacePayload } from '../types'
import { pluginManifestToCardPluginProps } from '@/app/components/plugins/install-plugin/utils'
import useGetIcon from '../install-plugin/base/use-get-icon'

const i18nPrefix = 'plugin.upgrade'

type Props = {
  payload: UpdateFromMarketPlacePayload
  onSave: () => void
  onCancel: () => void
}

enum UploadStep {
  notStarted = 'notStarted',
  upgrading = 'upgrading',
  installed = 'installed',
}

const UpdatePluginModal: FC<Props> = ({
  payload,
  onSave,
  onCancel,
}) => {
  const {
    originalPackageInfo,
    targetPackageInfo,
  } = payload
  const { t } = useTranslation()
  const { getIconUrl } = useGetIcon()
  const [icon, setIcon] = useState<string>(originalPackageInfo.payload.icon)
  useEffect(() => {
    (async () => {
      const icon = await getIconUrl(originalPackageInfo.payload.icon)
      setIcon(icon)
    })()
  }, [originalPackageInfo, getIconUrl])
  const [uploadStep, setUploadStep] = useState<UploadStep>(UploadStep.notStarted)
  const configBtnText = useMemo(() => {
    return ({
      [UploadStep.notStarted]: t(`${i18nPrefix}.upgrade`),
      [UploadStep.upgrading]: t(`${i18nPrefix}.upgrading`),
      [UploadStep.installed]: t(`${i18nPrefix}.close`),
    })[uploadStep]
  }, [t, uploadStep])

  const handleConfirm = useCallback(() => {
    if (uploadStep === UploadStep.notStarted) {
      setUploadStep(UploadStep.upgrading)
      setTimeout(() => {
        setUploadStep(UploadStep.installed)
      }, 1500)
      return
    }
    if (uploadStep === UploadStep.installed) {
      onSave()
      onCancel()
    }
  }, [onCancel, onSave, uploadStep])
  return (
    <Modal
      isShow={true}
      onClose={onCancel}
      className='min-w-[560px]'
      closable
      title={t(`${i18nPrefix}.${uploadStep === UploadStep.installed ? 'successfulTitle' : 'title'}`)}
    >
      <div className='mt-3 mb-2 text-text-secondary system-md-regular'>
        {t(`${i18nPrefix}.description`)}
      </div>
      <div className='flex p-2 items-start content-start gap-1 self-stretch flex-wrap rounded-2xl bg-background-section-burn'>
        <Card
          installed={uploadStep === UploadStep.installed}
          payload={pluginManifestToCardPluginProps({
            ...originalPackageInfo.payload,
            icon: icon!,
          })}
          className='w-full'
          titleLeft={
            <>
              <Badge className='mx-1' size="s" state={BadgeState.Warning}>
                {`${originalPackageInfo.payload.version} -> ${targetPackageInfo.version}`}
              </Badge>
              <div className='flex px-0.5 justify-center items-center gap-0.5'>
                <div className='text-text-warning system-xs-medium'>{t(`${i18nPrefix}.usedInApps`, { num: 3 })}</div>
                {/* show the used apps */}
                <RiInformation2Line className='w-4 h-4 text-text-tertiary' />
              </div>
            </>
          }
        />
      </div>
      <div className='flex pt-5 justify-end items-center gap-2 self-stretch'>
        {uploadStep === UploadStep.notStarted && (
          <Button
            onClick={onCancel}
          >
            {t('common.operation.cancel')}
          </Button>
        )}
        <Button
          variant='primary'
          loading={uploadStep === UploadStep.upgrading}
          onClick={handleConfirm}
          disabled={uploadStep === UploadStep.upgrading}
        >
          {configBtnText}
        </Button>
      </div>
    </Modal>
  )
}
export default React.memo(UpdatePluginModal)
