import type { LintIssue, Platform, Project } from './types'
import { blockToMarkdown, projectToMarkdown } from './markdown'

const UNSUPPORTED_TAGS = ['script', 'style', 'center', 'font', 'marquee', 'blink', 'object', 'embed', 'form', 'video', 'audio']
const CF_RISKY_TAGS = ['details', 'summary', 'kbd', 'iframe', 'table']

function issue(
  level: LintIssue['level'],
  title: string,
  detail: string,
  hint?: string,
  blockId?: string,
): LintIssue {
  return { id: `${level}-${title}-${blockId ?? ''}`, level, title, detail, hint, blockId }
}

export function lintProject(project: Project, platform: Platform): LintIssue[] {
  const md = projectToMarkdown(project)
  const issues: LintIssue[] = []
  const blocks = project.blocks.map((b) => ({ block: b, md: blockToMarkdown(b, project) }))

  // --- image alt text (Modrinth rejects projects without it) ---
  let m: RegExpExecArray | null
  const missingAlt = blocks.find(({ md: bmd }) => /!\[\s*\]\([^)]*\)/.test(bmd))
  if (missingAlt) {
    issues.push(
      issue(
        'error',
        'Image missing alt text',
        'One or more images have empty alt text such as `![](url)`. Modrinth can reject projects that embed images without alt text.',
        'Add a short description inside the brackets: `![Sunrise over the plains](url)`.',
        missingAlt.block.id,
      ),
    )
  }
  const missingHtmlAlt = blocks.find(({ md: bmd }) => /<img\b(?![^>]*\balt\s*=)[^>]*>/i.test(bmd))
  if (missingHtmlAlt) {
    issues.push(
      issue(
        'error',
        'HTML image missing alt',
        'An `<img>` tag has no `alt` attribute.',
        'Add `alt="..."` to the tag — every screenshot needs a description.',
        missingHtmlAlt.block.id,
      ),
    )
  }

  // --- links / images that point to nothing or to relative paths ---
  const badTarget = blocks.find(({ md: bmd }) => /\]\((?!https?:\/\/|mailto:|#|data:)[^)]+\)/i.test(bmd))
  if (badTarget) {
    const target = /\]\(((?!https?:\/\/|mailto:|#|data:)[^)]+)\)/i.exec(badTarget.md)?.[1] ?? ''
    issues.push(
      issue(
        'error',
        'Relative link will break',
        `\`${target}\` is a relative path. Published project pages cannot resolve files from your repository.`,
        'Use a full https:// URL, for example the raw file on GitHub.',
        badTarget.block.id,
      ),
    )
  }
  if (/\[[^\]]*\]\(\s*\)/.test(md)) {
    const emptyLink = blocks.find(({ md: bmd }) => /\[[^\]]*\]\(\s*\)/.test(bmd))
    issues.push(
      issue(
        'error',
        'Empty link target',
        'A markdown link is missing its URL: `[text]()`.',
        'Fill in the URL or remove the brackets.',
        emptyLink?.block.id,
      ),
    )
  }

  // --- heading hygiene ---
  const headings: string[] = []
  let inFence = false
  let h1 = false
  let longHeading = false
  let h2Count = 0
  const seen = new Set<string>()
  let duplicate = ''
  for (const line of md.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const hm = /^(#{1,6})\s+(.*)$/.exec(line)
    if (!hm) continue
    const level = hm[1].length
    const text = hm[2].replace(/[*_`]/g, '').trim()
    headings.push(text)
    if (level === 1) h1 = true
    if (level === 2) h2Count += 1
    if (text.length > 90 || /\.$/.test(text) || (text.length > 64 && /[!?]$/.test(text))) longHeading = true
    const key = text.toLowerCase()
    if (seen.has(key) && level <= 3) duplicate = text
    seen.add(key)
  }
  if (h1) {
    issues.push(
      issue('info', 'Avoid H1 headings', 'The project title is already rendered as the page heading. Start sections at `##`.', 'Change `#` headings to `##` in the section settings.'),
    )
  }
  if (longHeading) {
    issues.push(
      issue('warning', 'A heading reads like a sentence', 'Modrinth style guidance: headings should be short labels, not full sentences.', 'Move the detail into the paragraph below the heading.'),
    )
  }
  if (h2Count > 14) {
    issues.push(issue('info', 'Many top-level sections', `${h2Count} H2 sections can feel overwhelming.`, 'Merge related sections or demote some to `###`.'))
  }
  if (duplicate) {
    issues.push(issue('info', 'Duplicate heading', `"${duplicate}" appears more than once.`, 'Give each section a unique heading.'))
  }

  // --- html sanity ---
  for (const tag of UNSUPPORTED_TAGS) {
    const hit = blocks.find(({ md: bmd }) => new RegExp(`<${tag}[\\s>]`, 'i').test(bmd))
    if (hit) {
      issues.push(
        issue(platform === 'modrinth' ? 'warning' : 'error', `Unsupported <${tag}> tag`, `\`<${tag}>\` is stripped by the ${platform === 'modrinth' ? 'Modrinth' : 'CurseForge'} sanitizer, so the layout will collapse.`, 'Use Markdown or a supported element instead.', hit.block.id),
      )
    }
  }
  if (platform === 'curseforge') {
    for (const tag of CF_RISKY_TAGS) {
      if (new RegExp(`<${tag}[\\s>]`, 'i').test(md)) {
        issues.push(
          issue('warning', `<${tag}> may not render on CurseForge`, 'CurseForge only supports a subset of HTML inside descriptions, and editors sometimes flatten markup on save.', 'Consider switching this block to plain Markdown for CurseForge.'),
        )
        break
      }
    }
  }

  const styleRe = /style="([^"]*)"/gi
  while ((m = styleRe.exec(md))) {
    const decls = m[1]
      .split(';')
      .map((d) => d.split(':')[0]?.trim().toLowerCase())
      .filter(Boolean)
    const bad = decls.filter((d) => !['text-align', 'float', 'image-rendering'].includes(d))
    if (bad.length) {
      issues.push(
        issue('warning', 'Unsupported inline CSS', `Modrinth only keeps \`text-align\`, \`float\` and \`image-rendering\`. These will be removed: ${bad.join(', ')}.`, 'Use the alignment option instead of custom CSS.'),
      )
      break
    }
  }

  const iframes = md.match(/<iframe\b[^>]*>/gi) ?? []
  for (const frame of iframes) {
    const src = /src="([^"]*)"/i.exec(frame)?.[1] ?? ''
    if (!/^https?:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|discord\.com|discordapp\.com)\//i.test(src)) {
      issues.push(issue('error', 'Iframe source not allowed', 'Modrinth only allows YouTube and Discord embeds.', 'Remove the embed or use a plain link.'))
    }
  }

  // --- project metadata ---
  if (!project.meta.slug.trim() && project.blocks.some((b) => b.type === 'badges')) {
    issues.push(issue('warning', 'Modrinth slug is empty', 'Dynamic Modrinth badges need your project slug or ID.', 'Set it in Project settings.'))
  }
  if (!project.meta.summary.trim()) {
    issues.push(issue('error', 'Missing project summary', 'Both platforms show a one-line summary beside the title.', 'Add a summary in Project settings.'))
  }
  if (project.meta.summary.length > 160) {
    issues.push(issue('warning', 'Summary is long', `${project.meta.summary.length} characters. Keep the one-liner under ~160.`, 'Shorten the summary.'))
  }
  if (!project.meta.license.trim()) {
    issues.push(issue('info', 'License not set', 'A license helps modpacks and forks know what is allowed.', 'Pick a license in Project settings.'))
  }
  if (md.length < 400) {
    issues.push(issue('info', 'Description is very short', 'Short descriptions give players little to go on.', 'Add a features section, installation steps and an FAQ.'))
  }
  if (!project.meta.bannerUrl.trim() && !project.blocks.some((b) => b.type === 'hero' && b.bannerUrl.trim())) {
    issues.push(issue('info', 'No banner image', 'A wide banner at the top is the single biggest visual upgrade for a project page.', 'Create one in Banner Studio, host it, then paste the URL into the Hero block.'))
  }

  const badgeCount = project.blocks.reduce((n, b) => (b.type === 'badges' ? n + b.badges.length : n), 0)
  if (badgeCount > 8) {
    issues.push(issue('info', 'Lots of badges', `${badgeCount} badges in a row can wrap awkwardly on mobile.`, 'Keep 4–6 of the most useful ones.'))
  }

  const fences = (md.match(/^\s*(```|~~~)/gm) ?? []).length
  if (fences % 2 !== 0) {
    issues.push(issue('error', 'Unclosed code block', 'A fenced code block is never closed, which will swallow the rest of the page.', 'Add the closing backticks.'))
  }

  // de-duplicate by title
  const seenTitles = new Set<string>()
  return issues.filter((i) => {
    if (seenTitles.has(i.title)) return false
    seenTitles.add(i.title)
    return true
  })
}

export function lintScore(issues: LintIssue[]): number {
  const penalty = issues.reduce((sum, i) => sum + (i.level === 'error' ? 12 : i.level === 'warning' ? 4 : 1), 0)
  return Math.max(0, Math.min(100, 100 - penalty))
}
