'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Collection } from './types'
import Marketplace from './marketplace'
import cn from '@/utils/classnames'
import { useTabSearchParams } from '@/hooks/use-tab-searchparams'
import TabSliderNew from '@/app/components/base/tab-slider-new'
import LabelFilter from '@/app/components/tools/labels/filter'
import SearchInput from '@/app/components/base/search-input'
import ProviderDetail from '@/app/components/tools/provider/detail'
import Empty from '@/app/components/tools/add-tool-modal/empty'
import { fetchCollectionList } from '@/service/tools'
import Card from '@/app/components/plugins/card'
import CardMoreInfo from '@/app/components/plugins/card/card-more-info'
import { useSelector as useAppContextSelector } from '@/context/app-context'

const ProviderList = () => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const { enable_marketplace } = useAppContextSelector(s => s.systemFeatures)

  const [activeTab, setActiveTab] = useTabSearchParams({
    defaultTab: 'builtin',
  })
  const options = [
    { value: 'builtin', text: t('tools.type.builtIn') },
    { value: 'api', text: t('tools.type.custom') },
    { value: 'workflow', text: t('tools.type.workflow') },
  ]
  const [tagFilterValue, setTagFilterValue] = useState<string[]>([])
  const handleTagsChange = (value: string[]) => {
    setTagFilterValue(value)
  }
  const [keywords, setKeywords] = useState<string>('')
  const handleKeywordsChange = (value: string) => {
    setKeywords(value)
  }

  const [collectionList, setCollectionList] = useState<Collection[]>([])
  const filteredCollectionList = useMemo(() => {
    return collectionList.filter((collection) => {
      if (collection.type !== activeTab)
        return false
      if (tagFilterValue.length > 0 && (!collection.labels || collection.labels.every(label => !tagFilterValue.includes(label))))
        return false
      if (keywords)
        return collection.name.toLowerCase().includes(keywords.toLowerCase())
      return true
    })
  }, [activeTab, tagFilterValue, keywords, collectionList])
  const getProviderList = async () => {
    const list = await fetchCollectionList()
    setCollectionList([...list])
  }
  useEffect(() => {
    getProviderList()
  }, [])

  const [currentProvider, setCurrentProvider] = useState<Collection | undefined>()
  useEffect(() => {
    if (currentProvider && collectionList.length > 0) {
      const newCurrentProvider = collectionList.find(collection => collection.id === currentProvider.id)
      setCurrentProvider(newCurrentProvider)
    }
  }, [collectionList, currentProvider])

  return (
    <div className='relative flex overflow-hidden bg-gray-100 shrink-0 h-0 grow'>
      <div
        ref={containerRef}
        className='relative flex flex-col overflow-y-auto bg-gray-100 grow'
      >
        <div className={cn(
          'sticky top-0 flex justify-between items-center pt-4 px-12 pb-2 leading-[56px] bg-gray-100 z-20 flex-wrap gap-y-2',
          currentProvider && 'pr-6',
        )}>
          <TabSliderNew
            value={activeTab}
            onChange={(state) => {
              setActiveTab(state)
              if (state !== activeTab)
                setCurrentProvider(undefined)
            }}
            options={options}
          />
          <div className='flex items-center gap-2'>
            <LabelFilter value={tagFilterValue} onChange={handleTagsChange} />
            <SearchInput className='w-[200px]' value={keywords} onChange={handleKeywordsChange} />
          </div>
        </div>
        <div className={cn(
          'relative grid content-start grid-cols-1 gap-4 px-12 pt-2 pb-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grow shrink-0',
        )}>
          {filteredCollectionList.map(collection => (
            <div
              key={collection.id}
              onClick={() => setCurrentProvider(collection)}
            >
              <Card
                className={cn(
                  'border-[1.5px] border-transparent',
                  currentProvider?.id === collection.id && 'border-components-option-card-option-selected-border',
                )}
                hideCornerMark
                payload={{
                  ...collection,
                  brief: collection.description,
                } as any}
                footer={
                  <CardMoreInfo
                    tags={collection.labels}
                  />
                }
              />
            </div>
          ))}
          {!filteredCollectionList.length && <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'><Empty /></div>}
        </div>
        {
          !enable_marketplace && (
            <Marketplace onMarketplaceScroll={() => {
              containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
            }} />
          )
        }
      </div>
      {currentProvider && (
        <ProviderDetail
          collection={currentProvider}
          onHide={() => setCurrentProvider(undefined)}
          onRefreshData={getProviderList}
        />
      )}
    </div>
  )
}
ProviderList.displayName = 'ToolProviderList'
export default ProviderList
