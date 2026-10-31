import { useState } from 'react'
import { ArrowRight, Layers } from 'lucide-react'
import { TEMPLATES } from '../lib/templates'
import { Modal } from './ui'

export function TemplatesPanel({ onApply }: { onApply: (id: string) => void }) {
  const [pending, setPending] = useState<string | null>(null)
  const template = TEMPLATES.find((t) => t.id === pending)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-ink-800 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <Layers size={14} className="text-mc-amethyst" /> Templates
        </h2>
        <p className="mt-0.5 text-[11px] leading-snug text-ink-500">Complete, editable layouts with realistic copy. Start here, then make it yours.</p>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {TEMPLATES.map((t) => {
          const count = t.build().blocks.length
          return (
            <button
              key={t.id}
              onClick={() => setPending(t.id)}
              className="group w-full overflow-hidden rounded-xl border border-ink-750 bg-ink-850 text-left transition hover:border-ink-600 hover:shadow-panel"
            >
              <div
                className="relative flex h-20 items-center gap-3 px-4"
                style={{ background: `linear-gradient(120deg, ${t.accent}2e, ${t.accent}08 60%, transparent)` }}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl font-black"
                  style={{ background: `${t.accent}26`, color: t.accent }}
                >
                  {t.glyph}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{t.name}</div>
                  <div className="truncate text-[11px] text-ink-400">{t.tagline}</div>
                </div>
                <ArrowRight size={15} className="ml-auto shrink-0 text-ink-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
              <div className="border-t border-ink-750 px-4 py-2.5">
                <p className="text-[11px] leading-relaxed text-ink-500">{t.description}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="chip">{count} blocks</span>
                  <span className="chip" style={{ borderColor: `${t.accent}55`, color: t.accent }}>
                    {t.id}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <Modal
        open={!!template}
        onClose={() => setPending(null)}
        title={`Use “${template?.name ?? ''}”?`}
        subtitle="This replaces the current description. You can undo nothing, so export a backup first if you are unsure."
        width="max-w-md"
        footer={
          <>
            <button className="btn" onClick={() => setPending(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (pending) onApply(pending)
                setPending(null)
              }}
            >
              Load template
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink-300">
          Loading <span className="font-semibold text-white">{template?.name}</span> will overwrite your project name, summary and every block. Save a
          backup from the Export tab if you want to keep the current version.
        </p>
      </Modal>
    </div>
  )
}
