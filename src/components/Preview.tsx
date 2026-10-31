import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ExternalLink,
  FileText,
  Globe,
  Monitor,
  Package,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import type { Platform, PreviewTheme, Project } from '../lib/types'
import { addLinkTargets, mdToHtml, projectToMarkdown } from '../lib/markdown'

interface Props {
  project: Project
  theme: PreviewTheme
  platform: Platform
  device: 'desktop' | 'mobile'
  onTheme: (t: PreviewTheme) => void
  onDevice: (d: 'desktop' | 'mobile') => void
}

const THEMES: { value: PreviewTheme; label: string }[] = [
  { value: 'modrinth-dark', label: 'Modrinth dark' },
  { value: 'modrinth-light', label: 'Modrinth light' },
  { value: 'curseforge', label: 'CurseForge' },
]

function ProjectIcon({ project }: { project: Project }) {
  const { iconUrl, name, accent } = project.meta
  if (iconUrl) {
    return <img src={iconUrl} alt="" className="h-[88px] w-[88px] shrink-0 rounded-2xl object-cover shadow-lg" />
  }
  return (
    <div
      className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-2xl text-2xl font-black text-black/80 shadow-lg"
      style={{ background: `linear-gradient(140deg, ${accent}, #4ce3d0)` }}
    >
      {name.slice(0, 2).toUpperCase() || 'MC'}
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: 'var(--pv-panel-2)', color: 'var(--pv-muted)' }}
    >
      {children}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-[12px]" style={{ borderTop: '1px solid var(--pv-border)' }}>
      <span style={{ color: 'var(--pv-muted)' }}>{label}</span>
      <span className="text-right font-medium" style={{ color: 'var(--pv-head)' }}>
        {value}
      </span>
    </div>
  )
}

export function Preview({ project, theme, platform, device, onTheme, onDevice }: Props) {
  const md = useMemo(() => projectToMarkdown(project), [project])
  const html = useMemo(() => mdToHtml(md), [md])
  const bodyRef = useRef<HTMLDivElement>(null)
  const pvRef = useRef<HTMLDivElement>(null)
  const [wide, setWide] = useState(false)

  useEffect(() => {
    addLinkTargets(bodyRef.current)
  }, [html])

  useEffect(() => {
    const el = pvRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setWide(width >= 700)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isCurseforge = theme === 'curseforge'
  const mobile = device === 'mobile'
  const { meta } = project
  const empty = md.trim().length === 0

  return (
    <div className="flex h-full min-h-0 flex-col bg-ink-900">
      {/* toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-ink-800 px-3 py-2">
        <div className="flex items-center gap-1.5 pr-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          <Sparkles size={12} className="text-mc-emerald" /> Live preview
        </div>
        <div className="relative">
          <select
            value={theme}
            onChange={(e) => onTheme(e.target.value as PreviewTheme)}
            className="cursor-pointer appearance-none rounded-md border border-ink-700 bg-ink-800 py-1 pl-2 pr-6 text-[11px] text-ink-200 outline-none hover:border-ink-600"
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-500">▾</span>
        </div>
        <div className="ml-auto flex items-center gap-0.5 rounded-md border border-ink-700 bg-ink-800 p-0.5">
          <button
            className={`grid h-6 w-7 place-items-center rounded ${device === 'desktop' ? 'bg-ink-700 text-white' : 'text-ink-400 hover:text-ink-100'}`}
            onClick={() => onDevice('desktop')}
            title="Desktop"
          >
            <Monitor size={13} />
          </button>
          <button
            className={`grid h-6 w-7 place-items-center rounded ${device === 'mobile' ? 'bg-ink-700 text-white' : 'text-ink-400 hover:text-ink-100'}`}
            onClick={() => onDevice('mobile')}
            title="Mobile"
          >
            <Smartphone size={13} />
          </button>
        </div>
      </div>

      {/* scroll area */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-ink-950 p-3">
        <div
          ref={pvRef}
          className={`pv theme-${theme} mx-auto overflow-hidden rounded-xl border border-black/40 shadow-2xl transition-all ${
            mobile ? 'max-w-[400px]' : 'max-w-none'
          }`}
          style={{ minHeight: '100%' }}
        >
          {/* fake browser chrome for mobile frame */}
          {mobile && (
            <div className="flex items-center justify-between px-4 py-2 text-[10px]" style={{ background: 'var(--pv-panel)', color: 'var(--pv-muted)' }}>
              <span className="font-mono">{platform === 'curseforge' ? 'curseforge.com' : 'modrinth.com'}</span>
              <span className="flex gap-1">
                <i className="block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--pv-border)' }} />
                <i className="block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--pv-border)' }} />
                <i className="block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--pv-border)' }} />
              </span>
            </div>
          )}

          {/* project header */}
          <div
            className="px-5 pt-5 sm:px-7 sm:pt-7"
            style={
              isCurseforge
                ? { background: 'linear-gradient(180deg, rgba(241,100,54,0.09), transparent 80%)' }
                : { background: 'linear-gradient(180deg, var(--pv-accent-soft), transparent 85%)' }
            }
          >
            <div className="flex items-start gap-4">
              <ProjectIcon project={project} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-[24px] font-bold leading-tight sm:text-[28px]" style={{ color: 'var(--pv-head)' }}>
                    {meta.name || 'Untitled project'}
                  </h1>
                  {meta.version && <Chip>v{meta.version}</Chip>}
                </div>
                <p className="text-[15px] leading-snug" style={{ color: 'var(--pv-muted)' }}>
                  {meta.summary || 'Add a one-line summary in Project settings.'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {meta.version && <Chip>v{meta.version}</Chip>}
                  {meta.loaders.slice(0, 2).map((l) => (
                    <Chip key={l}>
                      <Package size={10} /> {l}
                    </Chip>
                  ))}
                  <Chip>
                    <Globe size={10} /> {meta.mcVersions.join(', ') || 'Minecraft version'}
                  </Chip>
                  {meta.license && <Chip>{meta.license}</Chip>}
                </div>
              </div>
            </div>

            {/* tabs */}
            <div className="mt-5 flex gap-5 text-[13px] font-medium" style={{ borderBottom: '1px solid var(--pv-border)' }}>
              {['Description', 'Versions', 'Gallery'].map((tab, i) => (
                <span
                  key={tab}
                  className="relative pb-2.5"
                  style={{
                    color: i === 0 ? 'var(--pv-head)' : 'var(--pv-muted)',
                    boxShadow: i === 0 ? 'inset 0 -2px 0 var(--pv-accent)' : undefined,
                  }}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>

          {/* body + sidebar */}
          <div className={`grid gap-6 px-5 py-5 sm:px-7 sm:py-6 ${mobile || !wide ? 'grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_196px]'}`}>
            <div className="min-w-0">
              {empty ? (
                <div className="pv-placeholder">Add a block to see your description come to life here.</div>
              ) : (
                <div ref={bodyRef} className="mcdl-prose" dangerouslySetInnerHTML={{ __html: html }} />
              )}
            </div>

            {!mobile && wide && (
              <aside className="space-y-3">
                <div className="rounded-lg p-3" style={{ background: 'var(--pv-panel)', border: '1px solid var(--pv-border)' }}>
                  <h3 className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--pv-head)' }}>
                    <FileText size={11} /> Details
                  </h3>
                  <DetailRow label="License" value={meta.license || '—'} />
                  <DetailRow label="Loaders" value={meta.loaders.join(', ') || '—'} />
                  <DetailRow label="Versions" value={meta.mcVersions.join(', ') || '—'} />
                  <DetailRow
                    label="Updated"
                    value={
                      <span className="inline-flex items-center gap-1">
                        <Check size={10} className="text-mc-emerald" /> today
                      </span>
                    }
                  />
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--pv-panel)', border: '1px solid var(--pv-border)' }}>
                  <h3 className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--pv-head)' }}>
                    <ExternalLink size={11} /> Links
                  </h3>
                  {(['github', 'discord', 'issues', 'wiki'] as const).map((key) =>
                    meta.links[key] ? (
                      <div key={key} className="flex items-center justify-between gap-2 py-1 text-[12px]" style={{ borderTop: '1px solid var(--pv-border)' }}>
                        <span className="capitalize" style={{ color: 'var(--pv-muted)' }}>
                          {key}
                        </span>
                        <span className="truncate" style={{ color: 'var(--pv-link)' }}>
                          {meta.links[key].replace(/^https?:\/\//, '').slice(0, 22)}
                        </span>
                      </div>
                    ) : null,
                  )}
                  {!meta.links.github && !meta.links.discord && !meta.links.issues && !meta.links.wiki && (
                    <p className="pt-1 text-[11px]" style={{ color: 'var(--pv-muted)' }}>
                      No links yet.
                    </p>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
