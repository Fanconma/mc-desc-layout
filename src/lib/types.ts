export type Platform = 'modrinth' | 'curseforge'
export type PreviewTheme = 'modrinth-dark' | 'modrinth-light' | 'curseforge'

export interface ProjectLinks {
  modrinth: string
  curseforge: string
  github: string
  discord: string
  issues: string
  wiki: string
  kofi: string
}

export interface ProjectMeta {
  name: string
  summary: string
  slug: string
  curseforgeId: string
  iconUrl: string
  bannerUrl: string
  version: string
  loaders: string[]
  mcVersions: string[]
  license: string
  author: string
  links: ProjectLinks
  badgeStyle: BadgeStyle
  accent: string
}

export type BadgeStyle = 'flat' | 'flat-square' | 'plastic' | 'for-the-badge' | 'social'

export type BadgeKind =
  | 'modrinth-version'
  | 'modrinth-downloads'
  | 'modrinth-followers'
  | 'modrinth-game-versions'
  | 'curseforge-downloads'
  | 'loader'
  | 'mc-version'
  | 'license'
  | 'discord'
  | 'github-stars'
  | 'static'

export interface Badge {
  id: string
  kind: BadgeKind
  label: string
  value: string
  color: string
  logo: string
  link: string
}

export interface HeroBlock {
  id: string
  type: 'hero'
  title: string
  tagline: string
  bannerUrl: string
}

export interface BadgesBlock {
  id: string
  type: 'badges'
  badges: Badge[]
  center: boolean
}

export interface TextBlock {
  id: string
  type: 'text'
  heading: string
  emoji: string
  level: 2 | 3
  body: string
}

export interface FeatureItem {
  id: string
  icon: string
  title: string
  body: string
}

export interface FeaturesBlock {
  id: string
  type: 'features'
  heading: string
  emoji: string
  layout: 'grid' | 'list'
  items: FeatureItem[]
}

export interface GalleryItem {
  id: string
  url: string
  caption: string
}

export interface GalleryBlock {
  id: string
  type: 'gallery'
  heading: string
  emoji: string
  layout: 'stack' | 'grid' | 'carousel-note'
  columns: 1 | 2
  items: GalleryItem[]
}

export interface CalloutBlock {
  id: string
  type: 'callout'
  kind: 'note' | 'tip' | 'warning' | 'info' | 'danger'
  title: string
  body: string
}

export interface FaqItem {
  id: string
  q: string
  a: string
}

export interface FaqBlock {
  id: string
  type: 'faq'
  heading: string
  emoji: string
  items: FaqItem[]
}

export interface DependencyItem {
  id: string
  name: string
  url: string
  version: string
  required: boolean
  note: string
}

export interface DependenciesBlock {
  id: string
  type: 'dependencies'
  heading: string
  emoji: string
  intro: string
  items: DependencyItem[]
}

export interface InstallBlock {
  id: string
  type: 'install'
  heading: string
  emoji: string
  intro: string
  steps: string[]
  code: string
  codeLang: string
  outro: string
}

export interface CompatRow {
  id: string
  loader: string
  status: 'yes' | 'no' | 'partial'
  note: string
}

export interface CompatibilityBlock {
  id: string
  type: 'compatibility'
  heading: string
  emoji: string
  loaderColumn: string
  rows: CompatRow[]
}

export interface ChangelogEntry {
  id: string
  version: string
  date: string
  changes: string[]
}

export interface ChangelogBlock {
  id: string
  type: 'changelog'
  heading: string
  emoji: string
  collapsed: boolean
  entries: ChangelogEntry[]
}

export interface ConfigItem {
  id: string
  option: string
  def: string
  desc: string
}

export interface ConfigBlock {
  id: string
  type: 'config'
  heading: string
  emoji: string
  items: ConfigItem[]
}

export interface CreditItem {
  id: string
  name: string
  role: string
  url: string
}

export interface CreditsBlock {
  id: string
  type: 'credits'
  heading: string
  emoji: string
  items: CreditItem[]
}

export interface FooterLink {
  id: string
  label: string
  url: string
}

export interface FooterBlock {
  id: string
  type: 'footer'
  note: string
  links: FooterLink[]
  showLine: boolean
}

export interface DividerBlock {
  id: string
  type: 'divider'
}

export interface RawBlock {
  id: string
  type: 'raw'
  body: string
}

export type Block =
  | HeroBlock
  | BadgesBlock
  | TextBlock
  | FeaturesBlock
  | GalleryBlock
  | CalloutBlock
  | FaqBlock
  | DependenciesBlock
  | InstallBlock
  | CompatibilityBlock
  | ChangelogBlock
  | ConfigBlock
  | CreditsBlock
  | FooterBlock
  | DividerBlock
  | RawBlock

export type BlockType = Block['type']

export interface Project {
  meta: ProjectMeta
  blocks: Block[]
}

export interface StoredState {
  project: Project
  previewTheme: PreviewTheme
  platform: Platform
  templateId: string
  updatedAt: number
}

export type LintLevel = 'error' | 'warning' | 'info'

export interface LintIssue {
  id: string
  level: LintLevel
  title: string
  detail: string
  hint?: string
  blockId?: string
}
