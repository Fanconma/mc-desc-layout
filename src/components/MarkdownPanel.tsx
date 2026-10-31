import { useEffect, useState } from 'react'
import { Check, ClipboardCopy, Download, FileWarning, PencilLine, RefreshCw } from 'lucide-react'
import { Modal } from './ui'
import { copyText, download, slugify } from '../lib/storage'

export function MarkdownPanel({
  open,
  onClose,
  markdown,
  projectName,
  onApplyRaw,
  notify,
}: {
  open: boolean
  onClose: () => void
  markdown: string
  projectName: string
  onApplyRaw: (md: string) => void
  notify: (m: string) => void
}) {
  const [draft, setDraft] = useState(markdown)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(markdown)
      setEditing(false)
    }
  }, [open, markdown])

  const value = editing ? draft : markdown
  const changed = editing && draft !== markdown

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generated Markdown"
      subtitle="This is exactly what the copy button puts on your clipboard."
      width="max-w-4xl"
      footer={
        <>
          {editing ? (
            <>
              <button className="btn" onClick={() => setEditing(false)}>
                <RefreshCw size={13} /> Discard edits
              </button>
              <button
                className="btn btn-primary"
                disabled={!changed}
                onClick={() => {
                  onApplyRaw(draft)
                  setEditing(false)
                  onClose()
                }}
              >
                <Check size={13} /> Apply as raw block
              </button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setEditing(true)}>
                <PencilLine size={13} /> Edit raw
              </button>
              <button
                className="btn"
                onClick={() => download(`${slugify(projectName) || 'project'}-description.md`, markdown, 'text/markdown;charset=utf-8')}
              >
                <Download size={13} /> Download
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  const ok = await copyText(markdown)
                  notify(ok ? 'Markdown copied' : 'Could not access the clipboard')
                }}
              >
                <ClipboardCopy size={13} /> Copy
              </button>
            </>
          )}
        </>
      }
    >
      {editing && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-mc-gold/30 bg-mc-gold/10 px-3 py-2.5">
          <FileWarning size={14} className="mt-0.5 shrink-0 text-mc-gold" />
          <p className="text-[11px] leading-relaxed text-mc-gold/90">
            Raw editing replaces the whole block structure with a single <span className="font-semibold">Raw markdown</span> block. Handy for pasting an
            existing description, but you lose the form editors until you rebuild the blocks.
          </p>
        </div>
      )}
      <div className="relative overflow-hidden rounded-lg border border-ink-700 bg-ink-950">
        <div className="flex items-center justify-between border-b border-ink-800 px-3 py-1.5">
          <span className="font-mono text-[10px] text-ink-500">{value.split('\n').length} lines · {value.length.toLocaleString()} chars</span>
          <span className="font-mono text-[10px] text-ink-600">markdown</span>
        </div>
        {editing ? (
          <textarea
            className="block h-[52vh] w-full resize-none bg-transparent px-3.5 py-3 font-mono text-[12px] leading-relaxed text-ink-200 outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <pre className="h-[52vh] overflow-auto whitespace-pre-wrap break-words px-3.5 py-3 font-mono text-[12px] leading-relaxed text-ink-300">
            {value}
          </pre>
        )}
      </div>
    </Modal>
  )
}
