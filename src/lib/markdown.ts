import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type {
  Badge,
  Block,
  ChangelogBlock,
  CompatibilityBlock,
  ConfigBlock,
  CreditsBlock,
  DependenciesBlock,
  FaqBlock,
  FeaturesBlock,
  FooterBlock,
  GalleryBlock,
  HeroBlock,
  InstallBlock,
  Project,
  TextBlock,
} from './types'
import { badgeAlt, badgeUrl, badgeTarget } from './badges'

marked.use({
  gfm: true,
  breaks: false,
})

export function inline(text: string): string {
  return marked.parseInline(text ?? '') as string
}

export function cell(text: string): string {
  return (text ?? '')
    .replace(/\r?\n/g, '<br>')
    .replace(/\|/g, '\\|')
    .trim()
}

function stripMd(text: string): string {
  return (text ?? '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function heading(level: number, emoji: string, text: string): string {
  const title = [emoji, text].filter(Boolean).join(' ').trim()
  if (!title) return ''
  return `${'#'.repeat(level)} ${title}`
}

function table(headers: string[], aligns: string[], rows: string[][]): string {
  const head = `| ${headers.join(' | ')} |`
  const sep = `| ${aligns.join(' | ')} |`
  const body = rows.map((r) => `| ${r.map(cell).join(' | ')} |`).join('\n')
  return [head, sep, body].filter(Boolean).join('\n')
}

const CALLOUT_META: Record<string, { emoji: string; label: string }> = {
  note: { emoji: '📝', label: 'Note' },
  tip: { emoji: '💡', label: 'Tip' },
  info: { emoji: 'ℹ️', label: 'Info' },
  warning: { emoji: '⚠️', label: 'Warning' },
  danger: { emoji: '⛔', label: 'Important' },
}

const STATUS_META = {
  yes: '✅ Supported',
  partial: '🟡 Partial',
  no: '❌ Not supported',
} as const

export function badgesMarkdown(badges: Badge[], meta: Project['meta'], center: boolean): string {
  const items = badges
    .map((b) => {
      const img = `![${badgeAlt(b, meta).replace(/[\[\]]/g, '')}](${badgeUrl(b, meta)})`
      const target = badgeTarget(b, meta)
      return target ? `[${img}](${target})` : img
    })
    .filter(Boolean)
  if (!items.length) return ''
  if (!center) return items.join(' ')
  const htmlItems = badges
    .map((b) => {
      const target = badgeTarget(b, meta)
      const img = `<img src="${badgeUrl(b, meta)}" alt="${badgeAlt(b, meta).replace(/"/g, '&quot;')}" height="20" />`
      return target ? `<a href="${target}">${img}</a>` : img
    })
    .join('\n')
  return `<p style="text-align: center">\n${htmlItems}\n</p>`
}

function renderHero(b: HeroBlock, project: Project): string {
  const parts: string[] = []
  if (b.bannerUrl.trim()) {
    parts.push(`![${stripMd(project.meta.name) || 'Project'} banner](${b.bannerUrl.trim()})`)
  }
  if (b.title.trim()) parts.push(`## ${b.title.trim()}`)
  if (b.tagline.trim()) parts.push(`**${b.tagline.trim()}**`)
  return parts.join('\n\n')
}

function renderFeatures(b: FeaturesBlock): string {
  const items = b.items.filter((i) => i.title.trim() || i.body.trim())
  if (!items.length) return ''
  const head = heading(2, b.emoji, b.heading)
  if (b.layout === 'list') {
    const list = items
      .map((i) => `- **${[i.icon, i.title].filter(Boolean).join(' ').trim()}** — ${i.body.trim()}`)
      .join('\n')
    return `${head}\n\n${list}`
  }
  const cells = items.map((i) => {
    const title = [i.icon, i.title].filter(Boolean).join(' ').trim()
    return `<td width="50%" valign="top"><strong>${stripMd(title)}</strong><br><br>${inline(i.body.trim())}</td>`
  })
  const rows: string[] = []
  for (let i = 0; i < cells.length; i += 2) rows.push(`<tr>\n${cells.slice(i, i + 2).join('\n')}\n</tr>`)
  return `${head}\n\n<table>\n${rows.join('\n')}\n</table>`
}

function renderGallery(b: GalleryBlock): string {
  const items = b.items.filter((i) => i.url.trim())
  if (!items.length) return ''
  const head = heading(2, b.emoji, b.heading)
  if (b.layout === 'grid' && b.columns === 2) {
    const cells = items.map(
      (i) =>
        `<td width="50%" valign="top"><img src="${i.url.trim()}" alt="${stripMd(i.caption).replace(/"/g, '&quot;')}" /><br><em>${i.caption.trim()}</em></td>`,
    )
    const rows: string[] = []
    for (let i = 0; i < cells.length; i += 2) rows.push(`<tr>\n${cells.slice(i, i + 2).join('\n')}\n</tr>`)
    return `${head}\n\n<table>\n${rows.join('\n')}\n</table>`
  }
  const blocks = items.map((i) => {
    const caption = i.caption.trim() ? `\n\n*${i.caption.trim()}*` : ''
    return `![${stripMd(i.caption) || 'Screenshot'}](${i.url.trim()})${caption}`
  })
  return `${head}\n\n${blocks.join('\n\n')}`
}

function renderFaq(b: FaqBlock): string {
  const items = b.items.filter((i) => i.q.trim() || i.a.trim())
  if (!items.length) return ''
  const head = heading(2, b.emoji, b.heading)
  const details = items
    .map(
      (i) =>
        `<details>\n<summary><strong>${stripMd(i.q)}</strong></summary>\n\n${i.a.trim()}\n\n</details>`,
    )
    .join('\n\n')
  return `${head}\n\n${details}`
}

function renderDependencies(b: DependenciesBlock): string {
  const items = b.items.filter((i) => i.name.trim())
  if (!items.length) return ''
  const head = heading(2, b.emoji, b.heading)
  const rows = items.map((i) => [
    i.url.trim() ? `[${i.name.trim()}](${i.url.trim()})` : `**${i.name.trim()}**`,
    i.version.trim() || '—',
    i.required ? '✅ Required' : 'Optional',
    i.note.trim(),
  ])
  const tbl = table(['Mod', 'Version', 'Status', 'Notes'], [':---', ':---', ':---:', ':---'], rows)
  return `${head}\n\n${b.intro.trim()}\n\n${tbl}`.replace(/\n{3,}/g, '\n\n')
}

function renderInstall(b: InstallBlock): string {
  const steps = b.steps.filter((s) => s.trim())
  if (!steps.length && !b.code.trim()) return ''
  const head = heading(2, b.emoji, b.heading)
  const list = steps.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')
  const code = b.code.trim() ? `\`\`\`${b.codeLang || ''}\n${b.code.trim()}\n\`\`\`` : ''
  return [head, b.intro.trim(), list, code, b.outro.trim()].filter(Boolean).join('\n\n')
}

function renderCompatibility(b: CompatibilityBlock): string {
  if (!b.rows.length) return ''
  const head = heading(2, b.emoji, b.heading)
  const rows = b.rows.map((r) => [r.loader, STATUS_META[r.status], r.note.trim()])
  const tbl = table([b.loaderColumn.trim() || 'Loader', 'Status', 'Notes'], [':---', ':---:', ':---'], rows)
  return `${head}\n\n${tbl}`
}

function renderChangelog(b: ChangelogBlock): string {
  const entries = b.entries.filter((e) => e.version.trim() || e.changes.some((c) => c.trim()))
  if (!entries.length) return ''
  const head = heading(2, b.emoji, b.heading)
  const blocks = entries.map((e) => {
    const title = [e.version.trim(), e.date.trim()].filter(Boolean).join(' — ')
    const list = e.changes.filter((c) => c.trim()).map((c) => `- ${c.trim()}`).join('\n')
    if (!b.collapsed) return `### ${title}\n\n${list}`
    return `<details>\n<summary><strong>${title}</strong></summary>\n\n${list}\n\n</details>`
  })
  return `${head}\n\n${blocks.join('\n\n')}`
}

function renderConfig(b: ConfigBlock): string {
  if (!b.items.length) return ''
  const head = heading(2, b.emoji, b.heading)
  const rows = b.items.map((i) => [
    i.option.trim() ? `\`${i.option.trim()}\`` : '—',
    i.def.trim() ? `\`${i.def.trim()}\`` : '—',
    i.desc.trim(),
  ])
  return `${head}\n\n${table(['Option', 'Default', 'Description'], [':---', ':---', ':---'], rows)}`
}

function renderCredits(b: CreditsBlock): string {
  const items = b.items.filter((i) => i.name.trim())
  if (!items.length) return ''
  const head = heading(2, b.emoji, b.heading)
  const list = items
    .map((i) => {
      const name = i.url.trim() ? `[${i.name.trim()}](${i.url.trim()})` : i.name.trim()
      return `- **${name}**${i.role.trim() ? ` — ${i.role.trim()}` : ''}`
    })
    .join('\n')
  return `${head}\n\n${list}`
}

function renderFooter(b: FooterBlock, project: Project): string {
  const links = b.links.filter((l) => l.label.trim() || l.url.trim())
  const line = b.showLine ? '---' : ''
  const parts: string[] = []
  if (links.length) {
    const l = links
      .filter((x) => x.label.trim())
      .map((x) => (x.url.trim() ? `[${x.label.trim()}](${x.url.trim()})` : x.label.trim()))
      .join(' · ')
    parts.push(`**Links:** ${l}`)
  }
  if (b.note.trim()) parts.push(b.note.trim())
  else if (!links.length) parts.push(`*Made with ♥ by ${project.meta.author || 'the author'}*`)
  return [line, ...parts].filter(Boolean).join('\n\n')
}

export function blockToMarkdown(block: Block, project: Project): string {
  switch (block.type) {
    case 'hero':
      return renderHero(block, project)
    case 'badges':
      return badgesMarkdown(block.badges, project.meta, block.center)
    case 'text': {
      const t = block as TextBlock
      return [heading(t.level, t.emoji, t.heading), t.body.trim()].filter(Boolean).join('\n\n')
    }
    case 'features':
      return renderFeatures(block)
    case 'gallery':
      return renderGallery(block)
    case 'callout': {
      const meta = CALLOUT_META[block.kind] ?? CALLOUT_META.note
      const title = `${meta.emoji} **${block.title.trim() || meta.label}**`
      const body = block.body.trim().replace(/\n/g, '\n> ')
      return `> ${title}\n>\n> ${body}`
    }
    case 'faq':
      return renderFaq(block)
    case 'dependencies':
      return renderDependencies(block)
    case 'install':
      return renderInstall(block)
    case 'compatibility':
      return renderCompatibility(block)
    case 'changelog':
      return renderChangelog(block)
    case 'config':
      return renderConfig(block)
    case 'credits':
      return renderCredits(block)
    case 'footer':
      return renderFooter(block, project)
    case 'divider':
      return '---'
    case 'raw':
      return block.body.trim()
    default:
      return ''
  }
}

export function projectToMarkdown(project: Project): string {
  return project.blocks
    .map((b) => blockToMarkdown(b, project).trim())
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{4,}/g, '\n\n\n') + '\n'
}

/* ---------------- markdown → HTML for preview ---------------- */

let hooksInstalled = false
function installHooks() {
  if (hooksInstalled) return
  hooksInstalled = true
  const isSafeIframe = (src: string) =>
    /^https?:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|discord\.com|discordapp\.com)\//i.test(src)
  // Modrinth keeps only a few CSS declarations; mirror that in the preview so
  // what you see is what the platform will render.
  const ALLOWED_CSS = ['text-align', 'float', 'image-rendering']
  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    if (data.attrName !== 'style') return
    const kept = data.attrValue
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .filter((decl) => {
        const [prop, value] = decl.split(':').map((x) => x?.trim().toLowerCase() ?? '')
        if (!ALLOWED_CSS.includes(prop)) return false
        if (prop === 'image-rendering') return value === 'pixelated'
        return true
      })
    if (kept.length === 0) {
      data.keepAttr = false
    } else {
      data.attrValue = kept.join('; ')
    }
  })

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
      const el = node as HTMLIFrameElement
      const src = el.getAttribute?.('src') ?? ''
      if (!isSafeIframe(src)) el.remove()
      el.setAttribute('loading', 'lazy')
      el.setAttribute('allowfullscreen', 'true')
    }
  })
}

const SANITIZE_CONFIG = {
  ADD_TAGS: ['details', 'summary', 'kbd', 'iframe', 'picture', 'source', 'map', 'area', 'input'],
  ADD_ATTR: ['target', 'align', 'valign', 'width', 'height', 'loading', 'allowfullscreen', 'frameborder', 'style', 'colspan', 'rowspan', 'open'],
  ALLOW_UNKNOWN_PROTOCOLS: false,
}

export function mdToHtml(md: string): string {
  installHooks()
  const raw = marked.parse(md, { async: false }) as string
  return DOMPurify.sanitize(raw, SANITIZE_CONFIG)
}

export function addLinkTargets(root: HTMLElement | null) {
  if (!root) return
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') ?? ''
    if (/^https?:\/\//i.test(href)) {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener noreferrer nofollow')
    }
  })
}

export interface OutlineItem {
  level: number
  text: string
}

export function outline(md: string): OutlineItem[] {
  const items: OutlineItem[] = []
  let inFence = false
  for (const line of md.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const m = /^(#{2,4})\s+(.*)$/.exec(line)
    if (m) items.push({ level: m[1].length, text: m[2].replace(/[*_`]/g, '').trim() })
  }
  return items
}
