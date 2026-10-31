import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Blocks,
  Check,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  EyeOff,
  Keyboard,
  LayoutTemplate,
  Menu,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Undo2,
  X,
} from 'lucide-react'
import type { Block, BlockType, Platform, PreviewTheme, Project } from './lib/types'
import { createBlock, uid } from './lib/defaults'
import { clearState, loadState, saveState } from './lib/storage'
import { projectToMarkdown } from './lib/markdown'
import { lintProject, lintScore } from './lib/lint'
import { TEMPLATES, templateById } from './lib/templates'
import { BLOCK_CATALOG } from './components/blockCatalog'
import { Canvas } from './components/Canvas'
import { Preview } from './components/Preview'
import { LibraryPanel } from './components/LibraryPanel'
import { TemplatesPanel } from './components/TemplatesPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { CheckPanel } from './components/CheckPanel'
import { ExportPanel } from './components/ExportPanel'
import { BannerStudio } from './components/BannerStudio'
import { MarkdownPanel } from './components/MarkdownPanel'
import { Kbd, Modal } from './components/ui'

type RailTab = 'library' | 'templates' | 'settings' | 'check' | 'export'

const RAIL: { id: RailTab; icon: typeof Blocks; label: string }[] = [
  { id: 'library', icon: Blocks, label: 'Blocks' },
  { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
  { id: 'settings', icon: Settings2, label: 'Project' },
  { id: 'check', icon: ShieldCheck, label: 'Check' },
  { id: 'export', icon: Download, label: 'Export' },
]

interface Toast {
  id: number
  msg: string
  action?: { label: string; run: () => void }
}

export default function App() {
  const initial = useMemo(() => loadState(), [])
  const [project, setProject] = useState<Project>(initial.project)
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>(initial.previewTheme)
  const [platform, setPlatform] = useState<Platform>(initial.platform)
  const [templateId, setTemplateId] = useState(initial.templateId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rail, setRail] = useState<RailTab>('library')
  const [panelOpen, setPanelOpen] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 1024))
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [showPreview, setShowPreview] = useState(true)
  const [previewPct, setPreviewPct] = useState(46)
  const mainRef = useRef<HTMLDivElement>(null)
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
  const [addOpen, setAddOpen] = useState(false)
  const [mdOpen, setMdOpen] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(!initial.restored)
  const [toast, setToast] = useState<Toast | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')
  const toastTimer = useRef<number | undefined>(undefined)

  const notify = useCallback((msg: string, action?: Toast['action']) => {
    window.clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), msg, action })
    toastTimer.current = window.setTimeout(() => setToast(null), 4600)
  }, [])

  // autosave
  useEffect(() => {
    setSaveStatus('saving')
    const t = window.setTimeout(() => {
      saveState({ project, previewTheme, platform, templateId, updatedAt: Date.now() })
      setSaveStatus('saved')
    }, 450)
    return () => window.clearTimeout(t)
  }, [project, previewTheme, platform, templateId])

  useEffect(() => {
    document.title = `${project.meta.name || 'Untitled project'} — MCDL Studio`
  }, [project.meta.name])

  const issues = useMemo(() => lintProject(project, platform), [project, platform])
  const score = lintScore(issues)
  const markdown = useMemo(() => projectToMarkdown(project), [project])
  const errorCount = issues.filter((i) => i.level === 'error').length

  const updateBlocks = useCallback((blocks: Block[]) => setProject((p) => ({ ...p, blocks })), [])

  const addBlock = useCallback(
    (type: BlockType) => {
      const block = createBlock(type)
      setProject((p) => {
        const index = selectedId ? p.blocks.findIndex((b) => b.id === selectedId) : -1
        const blocks = [...p.blocks]
        blocks.splice(index >= 0 ? index + 1 : blocks.length, 0, block)
        return { ...p, blocks }
      })
      setSelectedId(block.id)
      setAddOpen(false)
      setMobileView('edit')
      notify('Block added')
    },
    [selectedId, notify],
  )

  const deleteBlock = useCallback(
    (id: string) => {
      const index = project.blocks.findIndex((b) => b.id === id)
      if (index < 0) return
      const block = project.blocks[index]
      setProject((p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== id) }))
      setSelectedId(null)
      notify('Block deleted', {
        label: 'Undo',
        run: () =>
          setProject((p) => {
            const blocks = [...p.blocks]
            blocks.splice(Math.min(index, blocks.length), 0, block)
            return { ...p, blocks }
          }),
      })
    },
    [project.blocks, notify],
  )

  const applyTemplate = useCallback(
    (id: string) => {
      const tpl = templateById(id)
      setProject(tpl.build())
      setTemplateId(id)
      setSelectedId(null)
      setRail('library')
      setMobileView('edit')
      notify(`Loaded the “${tpl.name}” template`, {
        label: 'Undo',
        run: () => {
          setProject(project)
          setTemplateId(templateId)
        },
      })
    },
    [notify, project, templateId],
  )

  const changePlatform = useCallback((p: Platform) => {
    setPlatform(p)
    setPreviewTheme((t) => (p === 'curseforge' ? 'curseforge' : t === 'curseforge' ? 'modrinth-dark' : t))
  }, [])

  const openRail = (tab: RailTab) => {
    setRail(tab)
    setPanelOpen(true)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setAddOpen(true)
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault()
        navigator.clipboard?.writeText(markdown).then(
          () => notify('Markdown copied to clipboard'),
          () => notify('Could not access the clipboard'),
        )
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault()
        openRail('export')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [markdown, notify])

  return (
    <div className="flex h-full flex-col bg-ink-950 text-ink-200">
      {/* top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-ink-800 bg-ink-900 px-3 lg:gap-3 lg:px-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 grid-cols-2 gap-[2px] rounded-lg bg-ink-850 p-[5px] ring-1 ring-inset ring-white/5">
            <span className="rounded-[2px] bg-mc-emerald" />
            <span className="rounded-[2px] bg-mc-diamond" />
            <span className="rounded-[2px] bg-mc-gold" />
            <span className="rounded-[2px] bg-mc-amethyst" />
          </div>
          <div className="leading-none">
            <div className="text-[13px] font-bold tracking-tight text-white">
              MCDL<span className="font-medium text-ink-500"> Studio</span>
            </div>
            <div className="mt-1 hidden text-[10px] text-ink-500 sm:block">Modrinth &amp; CurseForge description builder</div>
          </div>
        </div>

        <div className="mx-1 hidden h-6 w-px bg-ink-800 sm:block" />

        <div className="hidden min-w-0 items-center gap-2 sm:flex">
          <button
            className="max-w-[110px] truncate text-[12.5px] font-medium text-ink-200 transition hover:text-white xl:max-w-[180px]"
            onClick={() => openRail('settings')}
            title="Edit project settings"
          >
            {project.meta.name || 'Untitled project'}
          </button>
          <span className="chip hidden xl:inline-flex">
            {templateId === 'custom' ? 'Custom' : `Template · ${TEMPLATES.find((t) => t.id === templateId)?.name ?? 'Custom'}`}
          </span>
          <span className={`flex shrink-0 items-center gap-1 text-[10.5px] ${saveStatus === 'saved' ? 'text-ink-500' : 'text-mc-gold'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-mc-emerald' : 'bg-mc-gold'}`} />
            <span className="hidden xl:inline">{saveStatus === 'saved' ? 'Saved locally' : 'Saving'}</span>
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden items-center gap-0.5 rounded-lg border border-ink-700 bg-ink-900 p-0.5 md:flex">
            {(
              [
                { id: 'modrinth', label: 'Modrinth' },
                { id: 'curseforge', label: 'CurseForge' },
              ] as { id: Platform; label: string }[]
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => changePlatform(p.id)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                  platform === p.id ? 'bg-ink-750 text-white' : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => openRail('check')}
            className={`hidden h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11.5px] font-medium transition sm:flex ${
              errorCount > 0
                ? 'border-mc-redstone/40 bg-mc-redstone/10 text-mc-redstone hover:bg-mc-redstone/15'
                : score >= 85
                  ? 'border-mc-emerald/30 bg-mc-emerald/10 text-mc-emerald hover:bg-mc-emerald/15'
                  : 'border-mc-gold/30 bg-mc-gold/10 text-mc-gold hover:bg-mc-gold/15'
            }`}
            title="Open publish check"
          >
            <ShieldCheck size={13} />
            Score {score}
          </button>

          <button className="btn btn-ghost h-8 w-8 p-0 lg:hidden" onClick={() => setPanelOpen(true)} title="Open panels" aria-label="Open panels">
            <Menu size={16} />
          </button>
          <button
            className="btn h-8 px-2 xl:hidden"
            onClick={() => setMobileView((v) => (v === 'edit' ? 'preview' : 'edit'))}
            title="Toggle preview"
          >
            {mobileView === 'edit' ? <Eye size={15} /> : <Blocks size={15} />}
          </button>
          <button
            className={`btn hidden h-8 px-2 xl:flex ${showPreview ? 'text-ink-100' : 'text-ink-400'}`}
            onClick={() => setShowPreview((v) => !v)}
            title={showPreview ? 'Hide preview' : 'Show preview'}
          >
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-700 text-[13px] font-bold text-ink-400 transition hover:border-ink-600 hover:text-white"
            onClick={() => setHelpOpen(true)}
            title="How it works"
            aria-label="How it works"
          >
            ?
          </button>
          <button className="btn btn-primary h-8" onClick={() => openRail('export')}>
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* rail */}
        <nav className="hidden w-[62px] shrink-0 flex-col items-center gap-1 border-r border-ink-800 bg-ink-900 py-3 lg:flex">
          {RAIL.map((item) => {
            const Icon = item.icon
            const active = rail === item.id && panelOpen
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (rail === item.id && panelOpen) setPanelOpen(false)
                  else openRail(item.id)
                }}
                aria-expanded={active}
                className={`group relative flex w-[48px] flex-col items-center gap-1 rounded-lg py-2 transition ${
                  active ? 'bg-ink-800 text-white' : 'text-ink-500 hover:bg-ink-850 hover:text-ink-200'
                }`}
                title={item.label}
              >
                <Icon size={17} />
                <span className="text-[9.5px] font-medium">{item.label}</span>
                {item.id === 'check' && errorCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-mc-redstone" />
                )}
              </button>
            )
          })}
          <div className="mt-auto flex flex-col items-center gap-2 px-2">
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-850 hover:text-white"
              title={panelOpen ? 'Hide panels' : 'Show panels'}
              aria-label={panelOpen ? 'Hide panels' : 'Show panels'}
            >
              {panelOpen ? <ChevronsLeft size={15} /> : <ChevronsRight size={15} />}
            </button>
            <span className="block text-center text-[8.5px] leading-tight text-ink-700">
              local
              <br />
              only
            </span>
          </div>
        </nav>

        {/* panel */}
        {panelOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setPanelOpen(false)} />}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[86vw] max-w-[320px] flex-col border-r border-ink-800 bg-ink-900 transition-transform duration-200 lg:static lg:z-auto lg:w-[300px] lg:translate-x-0 ${
            panelOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
          }`}
        >
          <div className="flex items-center gap-1 border-b border-ink-800 px-2 py-2 lg:hidden">
            {RAIL.map((item) => (
              <button
                key={item.id}
                onClick={() => setRail(item.id)}
                className={`flex-1 rounded-md py-1.5 text-[10.5px] font-medium transition ${
                  rail === item.id ? 'bg-ink-750 text-white' : 'text-ink-400'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button className="icon-btn ml-0.5" onClick={() => setPanelOpen(false)} aria-label="Close panel">
              <X size={14} />
            </button>
          </div>

          <div className="min-h-0 flex-1">
            {rail === 'library' && <LibraryPanel onAdd={addBlock} />}
            {rail === 'templates' && <TemplatesPanel onApply={applyTemplate} />}
            {rail === 'settings' && <SettingsPanel project={project} onChange={(meta) => setProject((p) => ({ ...p, meta }))} />}
            {rail === 'check' && (
              <CheckPanel
                issues={issues}
                platform={platform}
                onSelectBlock={(id) => {
                  setSelectedId(id)
                  setMobileView('edit')
                  setPanelOpen(false)
                }}
              />
            )}
            {rail === 'export' && (
              <ExportPanel
                project={project}
                platform={platform}
                onPlatform={changePlatform}
                onImport={(p) => {
                  setProject(p)
                  setTemplateId('custom')
                  setSelectedId(null)
                  notify('Project imported')
                }}
                onReset={() => {
                  clearState()
                  const fresh = TEMPLATES[0].build()
                  setProject(fresh)
                  setTemplateId(TEMPLATES[0].id)
                  setSelectedId(null)
                  notify('Editor reset')
                }}
                notify={notify}
                errorCount={errorCount}
              />
            )}
          </div>
        </aside>

        {/* canvas */}
        <main ref={mainRef} className="flex min-w-0 flex-1">
          <div className={`min-w-0 flex-1 ${mobileView === 'preview' ? 'hidden xl:flex' : 'flex'}`}>
            <div className="min-w-0 flex-1">
              <Canvas
                project={project}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChange={updateBlocks}
                onAdd={() => setAddOpen(true)}
                onMarkdownMode={() => setMdOpen(true)}
                onOpenBannerStudio={() => setBannerOpen(true)}
                onDeleteBlock={deleteBlock}
              />
            </div>
          </div>

          {showPreview && (
            <div
              className="hidden w-2 cursor-col-resize items-center justify-center bg-ink-900 transition hover:bg-ink-800 xl:flex"
              onDoubleClick={() => setPreviewPct(46)}
              onPointerDown={(e) => {
                const main = mainRef.current
                if (!main) return
                e.preventDefault()
                const startX = e.clientX
                const startPct = previewPct
                const width = main.getBoundingClientRect().width
                const move = (ev: PointerEvent) => {
                  const next = startPct - ((ev.clientX - startX) / width) * 100
                  setPreviewPct(Math.min(68, Math.max(28, next)))
                }
                const up = () => {
                  window.removeEventListener('pointermove', move)
                  window.removeEventListener('pointerup', up)
                  document.body.style.cursor = ''
                }
                document.body.style.cursor = 'col-resize'
                window.addEventListener('pointermove', move)
                window.addEventListener('pointerup', up)
              }}
              title="Drag to resize · double-click to reset"
            >
              <span className="pointer-events-none h-10 w-[2px] rounded-full bg-ink-700" />
            </div>
          )}

          {showPreview && (
            <div
              style={{ ['--pw' as string]: `${previewPct}%` }}
              className={`min-w-0 border-l border-ink-800 xl:flex xl:w-[var(--pw)] xl:min-w-[380px] ${
                mobileView === 'preview' ? 'flex w-full' : 'hidden'
              }`}
            >
              <div className="min-w-0 flex-1">
                <Preview
                  project={project}
                  theme={previewTheme}
                  platform={platform}
                  device={device}
                  onTheme={setPreviewTheme}
                  onDevice={setDevice}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* add block modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a block"
        subtitle="Blocks are inserted after the selected one, or at the end."
        width="max-w-2xl"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {BLOCK_CATALOG.map((entry) => {
            const Icon = entry.icon
            return (
              <button
                key={entry.type}
                onClick={() => addBlock(entry.type)}
                className="group flex items-start gap-2.5 rounded-xl border border-ink-750 bg-ink-850 p-3 text-left transition hover:border-ink-600 hover:bg-ink-800"
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                  style={{ background: `${entry.accent}1a`, color: entry.accent }}
                >
                  <Icon size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold text-ink-100 group-hover:text-white">{entry.name}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">{entry.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      </Modal>

      <MarkdownPanel
        open={mdOpen}
        onClose={() => setMdOpen(false)}
        markdown={markdown}
        projectName={project.meta.name}
        notify={notify}
        onApplyRaw={(md) => {
          const id = uid('raw')
          setProject((p) => ({ ...p, blocks: [{ id, type: 'raw', body: md }] }))
          setSelectedId(id)
          notify('Description replaced with a raw markdown block', {
            label: 'Undo',
            run: () => setProject(project),
          })
        }}
      />

      <BannerStudio open={bannerOpen} onClose={() => setBannerOpen(false)} project={project} notify={notify} />

      <Modal
        open={welcomeOpen || helpOpen}
        onClose={() => {
          setWelcomeOpen(false)
          setHelpOpen(false)
        }}
        title="Build a description players actually read"
        subtitle="A local-first studio for Minecraft project pages. Nothing leaves your browser."
        width="max-w-xl"
        footer={
          <>
            <button
              className="btn"
              onClick={() => {
                setWelcomeOpen(false)
                setHelpOpen(false)
                setAddOpen(true)
              }}
            >
              <Plus size={14} /> Add a block
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setWelcomeOpen(false)
                setHelpOpen(false)
              }}
            >
              Start building
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {[
            {
              n: '01',
              title: 'Compose with blocks',
              body: 'Hero, badges, feature cards, dependency tables, FAQ, changelog — each block is a form, not a wall of markup. Drag to reorder.',
              color: '#1bd96a',
            },
            {
              n: '02',
              title: 'See it as Modrinth sees it',
              body: 'The live preview renders your real generated Markdown inside a Modrinth-style page, with light, dark and CurseForge themes.',
              color: '#4ce3d0',
            },
            {
              n: '03',
              title: 'Pass the publish check',
              body: 'Missing image alt text, unsupported HTML, relative links, headings that read like sentences — caught before a moderator sees them.',
              color: '#f9c846',
            },
            {
              n: '04',
              title: 'Copy, paste, publish',
              body: 'Export clean Markdown, a styled HTML page, or a project file you can re-import later. Autosave keeps your work in this browser.',
              color: '#b47cff',
            },
          ].map((s) => (
            <div key={s.n} className="flex gap-3 rounded-xl border border-ink-750 bg-ink-850 p-3">
              <span className="font-mono text-[11px] font-bold" style={{ color: s.color }}>
                {s.n}
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-ink-100">{s.title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-400">{s.body}</p>
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-ink-750 bg-ink-950/50 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              <Keyboard size={12} /> Shortcuts
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-ink-500">
              <span className="flex items-center gap-1.5"><Kbd>⌘K</Kbd> Add block</span>
              <span className="flex items-center gap-1.5"><Kbd>⌘S</Kbd> Copy markdown</span>
              <span className="flex items-center gap-1.5"><Kbd>⌘E</Kbd> Open export</span>
              <span className="flex items-center gap-1.5"><Kbd>Esc</Kbd> Close dialog</span>
            </div>
          </div>
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-500">
            <Sparkles size={12} className="mt-0.5 shrink-0 text-mc-emerald" />
            Rule of thumb: put the banner and a one-line summary at the top, features in the middle, installation and FAQ at the bottom. That is the order players
            scan in.
          </p>
        </div>
      </Modal>

      {/* toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-[60] -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-850/95 px-3.5 py-2.5 shadow-panel backdrop-blur">
            <Check size={14} className="text-mc-emerald" />
            <span className="text-[12.5px] text-ink-100">{toast.msg}</span>
            {toast.action && (
              <button
                className="flex items-center gap-1 rounded-md bg-ink-750 px-2 py-1 text-[11px] font-medium text-white transition hover:bg-ink-700"
                onClick={() => {
                  toast.action?.run()
                  setToast(null)
                }}
              >
                <Undo2 size={11} /> {toast.action.label}
              </button>
            )}
            <button className="text-ink-500 transition hover:text-ink-200" onClick={() => setToast(null)} aria-label="Dismiss">
              <X size={13} />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
