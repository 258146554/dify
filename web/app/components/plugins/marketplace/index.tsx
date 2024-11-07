import { MarketplaceContextProvider } from './context'
import Description from './description'
import IntersectionLine from './intersection-line'
import SearchBoxWrapper from './search-box/search-box-wrapper'
import PluginTypeSwitch from './plugin-type-switch'
import ListWrapper from './list/list-wrapper'
import { getMarketplaceCollectionsAndPlugins } from './utils'

type MarketplaceProps = {
  locale?: string
  showInstallButton?: boolean
}
const Marketplace = async ({
  locale,
  showInstallButton = true,
}: MarketplaceProps) => {
  const { marketplaceCollections, marketplaceCollectionPluginsMap } = await getMarketplaceCollectionsAndPlugins()

  return (
    <MarketplaceContextProvider>
      <Description locale={locale} />
      <IntersectionLine />
      <SearchBoxWrapper locale={locale} />
      <PluginTypeSwitch locale={locale} />
      <ListWrapper
        locale={locale}
        marketplaceCollections={marketplaceCollections}
        marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap}
        showInstallButton={showInstallButton}
      />
      <ListWrapper
        locale={locale}
        marketplaceCollections={marketplaceCollections}
        marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap}
        showInstallButton={showInstallButton}
      />
      <ListWrapper
        locale={locale}
        marketplaceCollections={marketplaceCollections}
        marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap}
        showInstallButton={showInstallButton}
      />
      <ListWrapper
        locale={locale}
        marketplaceCollections={marketplaceCollections}
        marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap}
        showInstallButton={showInstallButton}
      />
      <ListWrapper
        locale={locale}
        marketplaceCollections={marketplaceCollections}
        marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap}
        showInstallButton={showInstallButton}
      />
      <ListWrapper
        locale={locale}
        marketplaceCollections={marketplaceCollections}
        marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap}
        showInstallButton={showInstallButton}
      />
      <ListWrapper
        locale={locale}
        marketplaceCollections={marketplaceCollections}
        marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap}
        showInstallButton={showInstallButton}
      />
      <ListWrapper
        locale={locale}
        marketplaceCollections={marketplaceCollections}
        marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap}
        showInstallButton={showInstallButton}
      />
      <ListWrapper
        locale={locale}
        marketplaceCollections={marketplaceCollections}
        marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap}
        showInstallButton={showInstallButton}
      />
      <ListWrapper
        locale={locale}
        marketplaceCollections={marketplaceCollections}
        marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap}
        showInstallButton={showInstallButton}
      />
    </MarketplaceContextProvider>
  )
}

export default Marketplace
