import type { Platform, PreviewTheme, Project, StoredState } from './types'
import { TEMPLATES } from './templates'

const KEY = 'mcdl.studio.v1'

export interface LoadResult {
  project: Project
  previewTheme: PreviewTheme
  platform: Platform
  templateId: string
  restored: boolean
}

export function loadState(): LoadResult {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>
      if (parsed?.project?.blocks?.length && parsed.project.meta) {
        return {
          project: parsed.project,
          previewTheme: parsed.previewTheme ?? 'modrinth-dark',
          platform: parsed.platform ?? 'modrinth',
          templateId: parsed.templateId ?? 'modern',
          restored: true,
        }
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return {
    project: TEMPLATES[0].build(),
    previewTheme: 'modrinth-dark',
    platform: 'modrinth',
    templateId: TEMPLATES[0].id,
    restored: false,
  }
}

export function saveState(state: StoredState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* quota / private mode */
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}

export function download(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}
