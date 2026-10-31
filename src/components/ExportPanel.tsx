import { useRef } from 'react'
import {
  Braces,
  ClipboardCopy,
  Download,
  FileCode2,
  FileDown,
  Info,
  RotateCcw,
  Upload,
} from 'lucide-react'
import type { Platform, Project } from '../lib/types'
import { copyText, download, slugify } from '../lib/storage'
import { projectToHtmlPage } from '../lib/exporters'
import { projectToMarkdown } from '../lib/markdown'
import { Segmented } from './ui'

interface Props {
  project: Project
  platform: Platform
  onPlatform: (p: Platform) => void
  onImport: (p: Project) => void
  onReset: () => void
  notify: (msg: string) => void
  errorCount: number
}

export function ExportPanel({ project, platform, onPlatform, onImport, onReset, notify, errorCount }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const md = projectToMarkdown(project)
  const base = slugify(project.meta.name) || 'project'

  const copyMd = async () => {
    const ok = await copyText(md)
    notify(ok ? 'Markdown copied — paste it into the description editor' : 'Could not access the clipboard')
  }

  const importFile = async (file: File) => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as { project?: Project } & Partial<Project>
      const candidate = (parsed.project ?? parsed) as Project
      if (!candidate?.blocks || !candidate.meta) throw new Error('bad shape')
      onImport(candidate)
      notify(`Imported “${candidate.meta.name || 'project'}”`)
    } catch {
      notify('That file is not a valid MCDL project')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-ink-800 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <Download size={14} className="text-mc-emerald" /> Export
        </h2>
        <p className="mt-0.5 text-[11px] leading-snug text-ink-500">Your description is plain Markdown with only the HTML both platforms allow.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-4">
          <span className="label">Destination</span>
          <Segmented<Platform>
            value={platform}
            onChange={onPlatform}
            options={[
              { value: 'modrinth', label: 'Modrinth' },
              { value: 'curseforge', label: 'CurseForge' },
            ]}
          />
        </div>

        <button className="btn btn-primary mb-2 w-full justify-start py-2.5" onClick={copyMd}>
          <ClipboardCopy size={15} /> Copy Markdown
          <span className="ml-auto font-mono text-[10px] text-mc-emerald/60">{md.length.toLocaleString()} chars</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button className="btn justify-start" onClick={() => download(`${base}-description.md`, md, 'text/markdown;charset=utf-8')}>
            <FileDown size={14} /> .md file
          </button>
          <button
            className="btn justify-start"
            onClick={async () => {
              const ok = await copyText(projectToHtmlPage(project))
              notify(ok ? 'Standalone HTML page copied' : 'Could not access the clipboard')
            }}
          >
            <FileCode2 size={14} /> Copy HTML
          </button>
          <button
            className="btn col-span-2 justify-start"
            onClick={() => download(`${base}-description.html`, projectToHtmlPage(project), 'text/html;charset=utf-8')}
          >
            <Download size={14} /> Download styled HTML page
          </button>
        </div>

        {errorCount > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-mc-redstone/30 bg-mc-redstone/10 px-3 py-2.5">
            <Info size={13} className="mt-0.5 shrink-0 text-mc-redstone" />
            <p className="text-[11px] leading-relaxed text-mc-redstone/90">
              {errorCount} blocking issue{errorCount === 1 ? '' : 's'} in Publish check. Fix {errorCount === 1 ? 'it' : 'them'} before submitting — Modrinth
              moderators reject pages without image alt text.
            </p>
          </div>
        )}

        <div className="mt-5 rounded-xl border border-ink-750 bg-ink-850 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">
            <Braces size={12} /> Project file
          </h3>
          <p className="mb-2.5 text-[11px] leading-relaxed text-ink-500">
            Back up the whole editor state — blocks, settings and links — as JSON. Import it on another machine to continue.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="btn text-xs"
              onClick={() =>
                download(
                  `${base}-mcdl.json`,
                  JSON.stringify({ format: 'mcdl/1', exportedAt: new Date().toISOString(), project }, null, 2),
                  'application/json',
                )
              }
            >
              <Download size={13} /> Save .json
            </button>
            <button className="btn text-xs" onClick={() => fileRef.current?.click()}>
              <Upload size={13} /> Import
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importFile(f)
              e.target.value = ''
            }}
          />
        </div>

        <div className="mt-3 rounded-xl border border-ink-750 bg-ink-950/60 p-3">
          <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">
            {platform === 'modrinth' ? 'Publishing on Modrinth' : 'Publishing on CurseForge'}
          </h3>
          {platform === 'modrinth' ? (
            <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-ink-500">
              <li>Open your project → <span className="text-ink-300">Settings → Description</span>.</li>
              <li>Switch the editor to Markdown mode, then paste.</li>
              <li>Use the Gallery tab for screenshots instead of giant inline images where you can.</li>
              <li>Every image needs alt text — the check panel enforces this.</li>
            </ol>
          ) : (
            <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-ink-500">
              <li>Create the project, then open the <span className="text-ink-300">Description</span> tab.</li>
              <li>Use the Markdown editor; HTML support is narrower than Modrinth&apos;s.</li>
              <li>Upload screenshots under <span className="text-ink-300">Images</span> and reference their hosted URLs.</li>
              <li>Keep <code>&lt;details&gt;</code> and tables out of critical content — the editor can flatten them.</li>
            </ol>
          )}
        </div>

        <button
          className="btn btn-danger mt-5 w-full text-xs"
          onClick={() => {
            if (confirm('Reset the editor and clear the autosave in this browser? Export a project file first if you want a backup.')) {
              onReset()
            }
          }}
        >
          <RotateCcw size={13} /> Reset editor &amp; clear autosave
        </button>
      </div>
    </div>
  )
}
