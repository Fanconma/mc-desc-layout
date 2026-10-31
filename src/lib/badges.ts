import type { Badge, BadgeStyle, ProjectMeta } from './types'

const SHIELDS = 'https://img.shields.io'

/** shields.io static badge escaping: `--` = dash, `__` = underscore, `_` = space */
function esc(text: string): string {
  return encodeURIComponent(
    (text || '')
      .replace(/-/g, '--')
      .replace(/_/g, '__')
      .replace(/ /g, '_'),
  ).replace(/%2F/g, '/')
}

function cleanColor(color: string): string {
  return (color || '1bd96a').replace('#', '')
}

export function badgeUrl(badge: Badge, meta: ProjectMeta): string {
  const style = meta.badgeStyle || 'flat-square'
  const color = cleanColor(badge.color)
  const params: string[] = [`style=${style}`]
  if (badge.logo) params.push(`logo=${encodeURIComponent(badge.logo)}`)
  if (badge.logo) params.push('logoColor=white')

  switch (badge.kind) {
    case 'modrinth-downloads':
      return `${SHIELDS}/modrinth/dt/${encodeURIComponent(meta.slug)}?${params.join('&')}`
    case 'modrinth-version':
      return `${SHIELDS}/modrinth/v/${encodeURIComponent(meta.slug)}?${params.join('&')}`
    case 'modrinth-followers':
      return `${SHIELDS}/modrinth/followers/${encodeURIComponent(meta.slug)}?${params.join('&')}`
    case 'modrinth-game-versions':
      return `${SHIELDS}/modrinth/game-versions/${encodeURIComponent(meta.slug)}?${params.join('&')}`
    case 'curseforge-downloads': {
      const id = meta.curseforgeId || '000000'
      return `${SHIELDS}/curseforge/dt/${encodeURIComponent(id)}?${params.join('&')}&label=${encodeURIComponent(badge.label || 'CurseForge')}`
    }
    case 'loader':
      return `${SHIELDS}/badge/${esc(badge.label || 'Loader')}-${esc(badge.value || meta.loaders[0] || 'Fabric')}-${color}?${params.join('&')}`
    case 'mc-version':
      return `${SHIELDS}/badge/${esc(badge.label || 'Minecraft')}-${esc(badge.value || meta.mcVersions[0] || '1.21.x')}-${color}?${params.join('&')}`
    case 'license':
      return `${SHIELDS}/badge/${esc(badge.label || 'License')}-${esc(badge.value || meta.license || 'MIT')}-${color}?${params.join('&')}`
    case 'discord':
      return `${SHIELDS}/badge/${esc(badge.label || 'Discord')}-${esc(badge.value || 'Join')}-${color}?${params.join('&')}`
    case 'github-stars': {
      const repo = repoPath(badge.value || meta.links.github)
      if (!repo) return `${SHIELDS}/badge/GitHub-stars-${color}?${params.join('&')}`
      return `${SHIELDS}/github/stars/${repo}?${params.join('&')}`
    }
    case 'static':
    default:
      return `${SHIELDS}/badge/${esc(badge.label)}-${esc(badge.value)}-${color}?${params.join('&')}`
  }
}

export function repoPath(url: string): string {
  const m = /github\.com\/([^/\s]+)\/([^/\s#?]+)/i.exec(url || '')
  if (!m) return ''
  return `${m[1]}/${m[2].replace(/\.git$/, '')}`
}

export function badgeTarget(badge: Badge, meta: ProjectMeta): string {
  if (badge.link) return badge.link
  if (badge.kind.startsWith('modrinth') && meta.links.modrinth) return meta.links.modrinth
  if (badge.kind.startsWith('curseforge') && meta.links.curseforge) return meta.links.curseforge
  if (badge.kind === 'discord' && meta.links.discord) return meta.links.discord
  if (badge.kind === 'github-stars' && meta.links.github) return meta.links.github
  return ''
}

export function badgeAlt(badge: Badge, meta: ProjectMeta): string {
  const label = (badge.label || '').trim()
  const value = (badge.value || '').trim()
  if (value) return `${label} ${value}`.trim()
  switch (badge.kind) {
    case 'modrinth-downloads':
      return 'Modrinth downloads'
    case 'modrinth-version':
      return 'Modrinth version'
    case 'modrinth-followers':
      return 'Modrinth followers'
    case 'modrinth-game-versions':
      return 'Supported Minecraft versions'
    case 'curseforge-downloads':
      return 'CurseForge downloads'
    default:
      return label || meta.name
  }
}

export function badgeMarkdown(badge: Badge, meta: ProjectMeta): string {
  const img = `![${badgeAlt(badge, meta).replace(/[\[\]]/g, '')}](${badgeUrl(badge, meta)})`
  const target = badgeTarget(badge, meta)
  return target ? `[${img}](${target})` : img
}

export const BADGE_PRESETS: { kind: Badge['kind']; label: string; hint: string }[] = [
  { kind: 'modrinth-downloads', label: 'Modrinth downloads', hint: 'Live count from your Modrinth slug' },
  { kind: 'modrinth-version', label: 'Modrinth version', hint: 'Latest published version' },
  { kind: 'modrinth-followers', label: 'Modrinth followers', hint: 'Follower count' },
  { kind: 'modrinth-game-versions', label: 'Modrinth game versions', hint: 'Minecraft versions of latest release' },
  { kind: 'curseforge-downloads', label: 'CurseForge downloads', hint: 'Needs your CurseForge project ID' },
  { kind: 'loader', label: 'Static: loader', hint: 'Fabric / NeoForge / Forge' },
  { kind: 'mc-version', label: 'Static: Minecraft', hint: 'Minecraft version range' },
  { kind: 'license', label: 'Static: license', hint: 'MIT / GPL-3.0 / ARR' },
  { kind: 'discord', label: 'Discord invite', hint: 'Community link badge' },
  { kind: 'github-stars', label: 'GitHub stars', hint: 'Reads the owner/repo from the URL' },
  { kind: 'static', label: 'Custom badge', hint: 'Any label + message + colour' },
]

export const BADGE_STYLES: { value: BadgeStyle; label: string }[] = [
  { value: 'flat', label: 'Flat' },
  { value: 'flat-square', label: 'Flat square' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'for-the-badge', label: 'For the badge' },
  { value: 'social', label: 'Social' },
]
