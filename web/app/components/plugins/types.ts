import type { CredentialFormSchemaBase } from '../header/account-setting/model-provider-page/declarations'
import type { ToolCredential } from '@/app/components/tools/types'
import type { Locale } from '@/i18n'

export enum PluginType {
  tool = 'tools',
  model = 'models',
  extension = 'endpoints',
}

export enum PluginSource {
  marketplace = 'marketplace',
  github = 'github',
  local = 'package',
  debugging = 'remote',
}

export type PluginToolDeclaration = {
  identity: {
    author: string
    name: string
    description: Record<Locale, string>
    icon: string
    label: Record<Locale, string>
    tags: string[]
  }
  credentials_schema: ToolCredential[] // TODO
}

export type PluginEndpointDeclaration = {
  settings: ToolCredential[]
  endpoints: EndpointItem[]
}

export type EndpointItem = {
  path: string
  method: string
}

export type EndpointListItem = {
  id: string
  created_at: string
  updated_at: string
  settings: Record<string, any>
  tenant_id: string
  plugin_id: string
  expired_at: string
  declaration: PluginEndpointDeclaration
  name: string
  enabled: boolean
  url: string
  hook_id: string
}

// Plugin manifest
export type PluginDeclaration = {
  plugin_unique_identifier: string
  version: string
  author: string
  icon: string
  name: string
  category: PluginType
  label: Record<Locale, string>
  description: Record<Locale, string>
  created_at: string
  resource: any // useless in frontend
  plugins: any // useless in frontend
  verified: boolean
  endpoint: PluginEndpointDeclaration
  tool: PluginToolDeclaration
  model: any // TODO
  tags: string[]
}

export type PluginManifestInMarket = {
  plugin_unique_identifier: string
  name: string
  org: string
  icon: string
  label: Record<Locale, string>
  category: PluginType
  latest_version: string
  brief: Record<Locale, string>
  introduction: string
  verified: boolean
  install_count: number
}

export type PluginDetail = {
  id: string
  created_at: string
  updated_at: string
  name: string
  plugin_id: string
  plugin_unique_identifier: string
  declaration: PluginDeclaration
  installation_id: string
  tenant_id: string
  endpoints_setups: number
  endpoints_active: number
  version: string
  latest_version: string
  source: PluginSource
  meta?: MetaData
}

export type Plugin = {
  type: PluginType
  org: string
  name: string
  plugin_id: string
  version: string
  latest_version: string
  latest_package_identifier: string
  icon: string
  verified: boolean
  label: Record<Locale, string>
  brief: Record<Locale, string>
  // Repo readme.md content
  introduction: string
  repository: string
  category: PluginType
  install_count: number
  endpoint: {
    settings: CredentialFormSchemaBase[]
  }
  tags: { name: string }[]
}

export enum PermissionType {
  everyone = 'everyone',
  admin = 'admins',
  noOne = 'noone',
}

export type Permissions = {
  install_permission: PermissionType
  debug_permission: PermissionType
}

export type UpdateFromMarketPlacePayload = {
  originalPackageInfo: {
    id: string
    payload: PluginDeclaration
  },
  targetPackageInfo: {
    id: string
    version: string
  }
}

export type UpdateFromGitHubPayload = {
  originalPackageInfo: {
    id: string
    repo: string
    version: string
    package: string
    releases: GitHubRepoReleaseResponse[]
  }
}

export type UpdatePluginPayload = {
  type: PluginSource
  marketPlace?: UpdateFromMarketPlacePayload
  github?: UpdateFromGitHubPayload
}

export type UpdatePluginModalType = UpdatePluginPayload & {
  onCancel: () => void
  onSave: () => void
}

export enum InstallStepFromGitHub {
  setUrl = 'url',
  selectPackage = 'selecting',
  readyToInstall = 'readyToInstall',
  uploadFailed = 'uploadFailed',
  installed = 'installed',
  installFailed = 'failed',
}

export type InstallState = {
  step: InstallStepFromGitHub
  repoUrl: string
  selectedVersion: string
  selectedPackage: string
  releases: GitHubRepoReleaseResponse[]
}

export type GitHubUrlInfo = {
  isValid: boolean
  owner?: string
  repo?: string
}

// endpoint
export type CreateEndpointRequest = {
  plugin_unique_identifier: string
  settings: Record<string, any>
  name: string
}
export type EndpointOperationResponse = {
  result: 'success' | 'error'
}
export type EndpointsRequest = {
  page_size: number
  page: number
  plugin_id: string
}
export type EndpointsResponse = {
  endpoints: EndpointListItem[]
  has_more: boolean
  limit: number
  total: number
  page: number
}
export type UpdateEndpointRequest = {
  endpoint_id: string
  settings: Record<string, any>
  name: string
}

export enum InstallStep {
  uploading = 'uploading',
  uploadFailed = 'uploadFailed',
  readyToInstall = 'readyToInstall',
  installing = 'installing',
  installed = 'installed',
  installFailed = 'failed',
}

export type GitHubAsset = {
  id: number
  name: string
  browser_download_url: string
}

export type GitHubRepoReleaseResponse = {
  tag_name: string
  assets: GitHubAsset[]
}

export type InstallPackageResponse = {
  plugin_unique_identifier: string
  all_installed: boolean
  task_id: string
}

export type uploadGitHubResponse = {
  unique_identifier: string
  manifest: PluginDeclaration
}

export type DebugInfo = {
  key: string
  host: string
  port: number
}

export enum TaskStatus {
  running = 'running',
  success = 'success',
  failed = 'failed',
}

export type PluginStatus = {
  plugin_unique_identifier: string
  plugin_id: string
  status: TaskStatus
  message: string
}

export type PluginTask = {
  id: string
  created_at: string
  updated_at: string
  status: string
  total_plugins: number
  completed_plugins: number
  plugins: PluginStatus[]
}

export type TaskStatusResponse = {
  task: PluginTask
}

export type PluginTasksResponse = {
  tasks: PluginTask[]
}

export type MetaData = {
  repo: string
  version: string
  package: string
}

export type InstalledPluginListResponse = {
  plugins: PluginDetail[]
}

export type UninstallPluginResponse = {
  success: boolean
}
