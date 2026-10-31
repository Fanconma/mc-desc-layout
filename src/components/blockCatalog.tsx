import {
  AlertTriangle,
  BadgeCheck,
  Code2,
  Flag,
  HeartHandshake,
  History,
  Images,
  LayoutGrid,
  Link2,
  ListOrdered,
  MessageCircleQuestion,
  Minus,
  Package,
  Puzzle,
  SlidersHorizontal,
  Type,
  type LucideIcon,
} from 'lucide-react'
import type { Block, BlockType } from '../lib/types'

export interface CatalogEntry {
  type: BlockType
  name: string
  description: string
  icon: LucideIcon
  category: 'Intro' | 'Content' | 'Media' | 'Info' | 'Closing'
  accent: string
}

export const BLOCK_CATALOG: CatalogEntry[] = [
  {
    type: 'hero',
    name: 'Hero',
    description: 'Banner image, title and tagline.',
    icon: Flag,
    category: 'Intro',
    accent: '#1bd96a',
  },
  {
    type: 'badges',
    name: 'Badge strip',
    description: 'Live download and version badges.',
    icon: BadgeCheck,
    category: 'Intro',
    accent: '#4ce3d0',
  },
  {
    type: 'text',
    name: 'Text section',
    description: 'Heading plus a markdown paragraph.',
    icon: Type,
    category: 'Content',
    accent: '#98a2b3',
  },
  {
    type: 'features',
    name: 'Feature list',
    description: 'Two-column cards or a bullet list.',
    icon: LayoutGrid,
    category: 'Content',
    accent: '#b47cff',
  },
  {
    type: 'gallery',
    name: 'Gallery',
    description: 'Screenshots with captions.',
    icon: Images,
    category: 'Media',
    accent: '#f9c846',
  },
  {
    type: 'callout',
    name: 'Callout',
    description: 'Note, tip or warning box.',
    icon: AlertTriangle,
    category: 'Content',
    accent: '#ff5b5b',
  },
  {
    type: 'dependencies',
    name: 'Dependencies',
    description: 'Table of required and optional mods.',
    icon: Package,
    category: 'Info',
    accent: '#4d7cff',
  },
  {
    type: 'install',
    name: 'Installation',
    description: 'Numbered steps and a code block.',
    icon: ListOrdered,
    category: 'Info',
    accent: '#1bd96a',
  },
  {
    type: 'compatibility',
    name: 'Compatibility',
    description: 'Loader and version support table.',
    icon: Puzzle,
    category: 'Info',
    accent: '#4ce3d0',
  },
  {
    type: 'config',
    name: 'Config / API table',
    description: 'Option, default and description.',
    icon: SlidersHorizontal,
    category: 'Info',
    accent: '#b47cff',
  },
  {
    type: 'changelog',
    name: 'Changelog',
    description: 'Collapsible versions and changes.',
    icon: History,
    category: 'Info',
    accent: '#98a2b3',
  },
  {
    type: 'faq',
    name: 'FAQ',
    description: 'Collapsible questions and answers.',
    icon: MessageCircleQuestion,
    category: 'Content',
    accent: '#f9c846',
  },
  {
    type: 'credits',
    name: 'Credits',
    description: 'People and what they did.',
    icon: HeartHandshake,
    category: 'Closing',
    accent: '#ff5b5b',
  },
  {
    type: 'footer',
    name: 'Footer links',
    description: 'Discord, GitHub, issue tracker.',
    icon: Link2,
    category: 'Closing',
    accent: '#4d7cff',
  },
  {
    type: 'divider',
    name: 'Divider',
    description: 'A horizontal rule.',
    icon: Minus,
    category: 'Closing',
    accent: '#6b7689',
  },
  {
    type: 'raw',
    name: 'Raw markdown',
    description: 'Anything else, including HTML.',
    icon: Code2,
    category: 'Content',
    accent: '#6b7689',
  },
]

export function catalogEntry(type: BlockType): CatalogEntry {
  return BLOCK_CATALOG.find((c) => c.type === type) ?? BLOCK_CATALOG[0]
}

export function blockSummary(block: Block): string {
  switch (block.type) {
    case 'hero':
      return block.title || block.tagline || 'Untitled hero'
    case 'badges':
      return `${block.badges.length} badge${block.badges.length === 1 ? '' : 's'}`
    case 'text':
      return [block.emoji, block.heading].filter(Boolean).join(' ') || 'Empty section'
    case 'features':
      return `[${block.emoji}] ${block.heading || 'Features'} · ${block.items.length} items · ${block.layout}`
    case 'gallery':
      return `[${block.emoji}] ${block.heading || 'Gallery'} · ${block.items.filter((i) => i.url).length}/${block.items.length} images`
    case 'callout':
      return `${block.title || 'Callout'} · ${block.kind}`
    case 'faq':
      return `[${block.emoji}] ${block.heading || 'FAQ'} · ${block.items.length} questions`
    case 'dependencies':
      return `[${block.emoji}] ${block.heading || 'Dependencies'} · ${block.items.length} entries`
    case 'install':
      return `[${block.emoji}] ${block.heading || 'Installation'} · ${block.steps.length} steps`
    case 'compatibility':
      return `[${block.emoji}] ${block.heading || 'Compatibility'} · ${block.rows.length} rows`
    case 'changelog':
      return `[${block.emoji}] ${block.heading || 'Changelog'} · ${block.entries.length} versions`
    case 'config':
      return `[${block.emoji}] ${block.heading || 'Config'} · ${block.items.length} options`
    case 'credits':
      return `[${block.emoji}] ${block.heading || 'Credits'} · ${block.items.length} people`
    case 'footer':
      return `Footer · ${block.links.length} links`
    case 'divider':
      return 'Horizontal rule'
    case 'raw':
      return block.body.slice(0, 60) || 'Empty raw block'
    default:
      return ''
  }
}
