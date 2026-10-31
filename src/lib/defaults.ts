import type {
  Badge,
  Block,
  BlockType,
  Project,
  ProjectMeta,
} from './types'

let counter = 0
export function uid(prefix = 'b'): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter}_${Math.random().toString(36).slice(2, 6)}`
}

export const DEFAULT_LINKS = {
  modrinth: 'https://modrinth.com/mod/your-mod',
  curseforge: 'https://www.curseforge.com/minecraft/mc-mods/your-mod',
  github: '',
  discord: '',
  issues: '',
  wiki: '',
  kofi: '',
}

export const DEFAULT_META: ProjectMeta = {
  name: 'Aurora',
  summary: 'A soft, colourful lighting overhaul for the overworld.',
  slug: 'aurora',
  curseforgeId: '',
  iconUrl: '',
  bannerUrl: '',
  version: '1.0.0',
  loaders: ['Fabric', 'NeoForge'],
  mcVersions: ['1.21.x'],
  license: 'MIT',
  author: 'YourName',
  links: { ...DEFAULT_LINKS },
  badgeStyle: 'flat-square',
  accent: '#1bd96a',
}

export function makeBadge(kind: Badge['kind'], overrides: Partial<Badge> = {}): Badge {
  const base: Record<string, Partial<Badge>> = {
    'modrinth-version': { label: 'Modrinth', value: '', logo: 'modrinth', color: '1bd96a' },
    'modrinth-downloads': { label: 'downloads', value: '', logo: 'modrinth', color: '1bd96a' },
    'modrinth-followers': { label: 'followers', value: '', logo: 'modrinth', color: '1bd96a' },
    'modrinth-game-versions': { label: 'game versions', value: '', logo: 'modrinth', color: '1bd96a' },
    'curseforge-downloads': { label: 'CurseForge', value: '', logo: 'curseforge', color: 'f16436' },
    loader: { label: 'loader', value: 'Fabric', logo: '', color: 'dbd0b4' },
    'mc-version': { label: 'Minecraft', value: '1.21.x', logo: 'minecraft', color: '62b47a' },
    license: { label: 'license', value: 'MIT', logo: '', color: '4d7cff' },
    discord: { label: 'Discord', value: 'Join', logo: 'discord', color: '5865F2' },
    'github-stars': { label: 'GitHub', value: 'stars', logo: 'github', color: '181717' },
    static: { label: 'label', value: 'value', logo: '', color: '1bd96a' },
  }
  return {
    id: uid('badge'),
    kind,
    label: base[kind]?.label ?? 'label',
    value: base[kind]?.value ?? '',
    color: base[kind]?.color ?? '1bd96a',
    logo: base[kind]?.logo ?? '',
    link: '',
    ...overrides,
  }
}

export function defaultBadges(): Badge[] {
  return [
    makeBadge('modrinth-downloads'),
    makeBadge('modrinth-game-versions'),
    makeBadge('loader'),
    makeBadge('license'),
  ]
}

export function createBlock(type: BlockType): Block {
  const id = uid(type)
  switch (type) {
    case 'hero':
      return {
        id,
        type,
        title: '',
        tagline: 'A short, bold line that sells the project.',
        bannerUrl: '',
      }
    case 'badges':
      return { id, type, badges: defaultBadges(), center: true }
    case 'text':
      return {
        id,
        type,
        heading: 'About',
        emoji: '✨',
        level: 2,
        body: 'Write a short paragraph about what your project does, who it is for, and why it is different. **Bold**, *italic*, `code` and [links](https://example.com) all work here.',
      }
    case 'features':
      return {
        id,
        type,
        heading: 'Features',
        emoji: '🚀',
        layout: 'grid',
        items: [
          { id: uid('f'), icon: '🌅', title: 'Reactive skies', body: 'Colours shift through the day cycle, from cold dawns to warm dusk horizons.' },
          { id: uid('f'), icon: '⚡', title: 'Lightweight', body: 'Batched lighting updates keep the frame cost under one millisecond.' },
          { id: uid('f'), icon: '🎛️', title: 'Configurable', body: 'Every palette is data-driven and can be overridden by a resource pack.' },
          { id: uid('f'), icon: '🧩', title: 'Compatible', body: 'Works with Sodium, Iris and OptiFine out of the box.' },
        ],
      }
    case 'gallery':
      return {
        id,
        type,
        heading: 'Screenshots',
        emoji: '🖼️',
        layout: 'stack',
        columns: 2,
        items: [
          { id: uid('g'), url: '', caption: 'Sunrise over the plains' },
          { id: uid('g'), url: '', caption: 'A storm rolling in at dusk' },
        ],
      }
    case 'callout':
      return {
        id,
        type,
        kind: 'warning',
        title: 'Back up your world',
        body: 'Aurora changes world lighting data. Always make a backup before updating.',
      }
    case 'faq':
      return {
        id,
        type,
        heading: 'FAQ',
        emoji: '❓',
        items: [
          { id: uid('q'), q: 'Can I use this in a modpack?', a: 'Yes — no permission needed. A link back is appreciated.' },
          { id: uid('q'), q: 'Does it work on a server?', a: 'Aurora is client-side only. Servers do not need to install it.' },
        ],
      }
    case 'dependencies':
      return {
        id,
        type,
        heading: 'Dependencies',
        emoji: '📦',
        intro: 'Install these alongside the mod:',
        items: [
          { id: uid('d'), name: 'Fabric API', url: 'https://modrinth.com/mod/fabric-api', version: '0.100+', required: true, note: 'Required on Fabric.' },
          { id: uid('d'), name: 'Sodium', url: 'https://modrinth.com/mod/sodium', version: '0.5+', required: false, note: 'Recommended for performance.' },
        ],
      }
    case 'install':
      return {
        id,
        type,
        heading: 'Installation',
        emoji: '🧭',
        intro: 'Aurora takes about a minute to set up.',
        steps: [
          'Install **Fabric** (or **NeoForge**) for your Minecraft version.',
          'Drop the `.jar` into your `mods` folder.',
          'Launch the game — the default palette is applied automatically.',
        ],
        code: '',
        codeLang: 'bash',
        outro: 'That is it. No world reset required.',
      }
    case 'compatibility':
      return {
        id,
        type,
        heading: 'Compatibility',
        emoji: '🧩',
        loaderColumn: 'Loader',
        rows: [
          { id: uid('c'), loader: 'Fabric 1.21.x', status: 'yes', note: 'Fully supported' },
          { id: uid('c'), loader: 'NeoForge 1.21.x', status: 'yes', note: 'Fully supported' },
          { id: uid('c'), loader: 'Forge 1.20.x', status: 'partial', note: 'Best effort' },
          { id: uid('c'), loader: 'OptiFine', status: 'no', note: 'Conflicts with custom shaders' },
        ],
      }
    case 'changelog':
      return {
        id,
        type,
        heading: 'Changelog',
        emoji: '📜',
        collapsed: true,
        entries: [
          {
            id: uid('cl'),
            version: '1.1.0',
            date: '2025-06-01',
            changes: ['Added storm palettes', 'Fixed flicker on AMD GPUs', 'Reduced memory use by 18%'],
          },
          {
            id: uid('cl'),
            version: '1.0.0',
            date: '2025-04-12',
            changes: ['First stable release'],
          },
        ],
      }
    case 'config':
      return {
        id,
        type,
        heading: 'Configuration',
        emoji: '🎛️',
        items: [
          { id: uid('cf'), option: 'palette', def: 'aurora', desc: 'Name of the palette preset to load.' },
          { id: uid('cf'), option: 'intensity', def: '0.8', desc: 'Strength of the colour grade, 0.0 – 1.0.' },
        ],
      }
    case 'credits':
      return {
        id,
        type,
        heading: 'Credits',
        emoji: '💚',
        items: [
          { id: uid('cr'), name: 'YourName', role: 'Developer & artist', url: '' },
          { id: uid('cr'), name: 'Skye', role: 'Palette design', url: '' },
        ],
      }
    case 'footer':
      return {
        id,
        type,
        note: 'Made with ♥ for the Minecraft community.',
        links: [
          { id: uid('l'), label: 'GitHub', url: 'https://github.com/yourname/aurora' },
          { id: uid('l'), label: 'Discord', url: 'https://discord.gg/example' },
          { id: uid('l'), label: 'Report a bug', url: 'https://github.com/yourname/aurora/issues' },
        ],
        showLine: true,
      }
    case 'divider':
      return { id, type }
    case 'raw':
      return {
        id,
        type,
        body: '## Custom section\n\nAnything you can write in Markdown or supported HTML goes here.',
      }
  }
}

export function emptyProject(): Project {
  return {
    meta: { ...DEFAULT_META, links: { ...DEFAULT_LINKS } },
    blocks: [createBlock('hero'), createBlock('badges'), createBlock('text')],
  }
}
