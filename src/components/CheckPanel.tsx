import { useState } from 'react'
import { AlertCircle, ArrowUpRight, CheckCircle2, Info, ShieldCheck, TriangleAlert } from 'lucide-react'
import type { LintIssue, LintLevel, Platform } from '../lib/types'
import { lintScore } from '../lib/lint'

const LEVEL_STYLE: Record<LintLevel, { icon: typeof Info; color: string; bg: string; label: string }> = {
  error: { icon: AlertCircle, color: 'text-mc-redstone', bg: 'bg-mc-redstone/10', label: 'Error' },
  warning: { icon: TriangleAlert, color: 'text-mc-gold', bg: 'bg-mc-gold/10', label: 'Warning' },
  info: { icon: Info, color: 'text-mc-lapis', bg: 'bg-mc-lapis/10', label: 'Info' },
}

export function CheckPanel({
  issues,
  platform,
  onSelectBlock,
}: {
  issues: LintIssue[]
  platform: Platform
  onSelectBlock: (id: string) => void
}) {
  const [filter, setFilter] = useState<'all' | LintLevel>('all')
  const score = lintScore(issues)
  const counts = {
    error: issues.filter((i) => i.level === 'error').length,
    warning: issues.filter((i) => i.level === 'warning').length,
    info: issues.filter((i) => i.level === 'info').length,
  }
  const visible = filter === 'all' ? issues : issues.filter((i) => i.level === filter)
  const scoreColor = score >= 85 ? '#1bd96a' : score >= 60 ? '#f9c846' : '#ff5b5b'
  const circumference = 2 * Math.PI * 26

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-ink-800 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <ShieldCheck size={14} className="text-mc-emerald" /> Publish check
        </h2>
        <p className="mt-0.5 text-[11px] leading-snug text-ink-500">
          Rules from Modrinth&apos;s content guidelines{platform === 'curseforge' ? ' and CurseForge constraints' : ''}.
        </p>
      </div>

      <div className="shrink-0 border-b border-ink-800 px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="relative h-[68px] w-[68px] shrink-0">
            <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#262c38" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={scoreColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - score / 100)}
                style={{ transition: 'stroke-dashoffset .3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-lg font-bold text-white">{score}</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">
              {score >= 95 ? 'Ready to publish' : score >= 80 ? 'Almost there' : score >= 55 ? 'Needs a pass' : 'Not ready yet'}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-500">
              {counts.error} error{counts.error === 1 ? '' : 's'} · {counts.warning} warning{counts.warning === 1 ? '' : 's'} · {counts.info} tip
              {counts.info === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-ink-700 bg-ink-900 p-1">
          {[
            { id: 'all' as const, label: `All ${issues.length}` },
            { id: 'error' as const, label: `Errors ${counts.error}` },
            { id: 'warning' as const, label: `Warnings ${counts.warning}` },
            { id: 'info' as const, label: `Tips ${counts.info}` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                filter === t.id ? 'bg-ink-750 text-white' : 'text-ink-400 hover:text-ink-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {visible.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <CheckCircle2 className="mx-auto mb-2 text-mc-emerald" size={26} />
            <p className="text-sm font-medium text-ink-200">Nothing to fix here</p>
            <p className="mt-1 text-[11px] text-ink-500">
              {issues.length === 0 ? 'Your description passes every check we know about.' : 'No issues in this category.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((issue) => {
              const style = LEVEL_STYLE[issue.level]
              const Icon = style.icon
              return (
                <div key={issue.id} className="rounded-lg border border-ink-750 bg-ink-850 p-2.5">
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded ${style.bg} ${style.color}`}>
                      <Icon size={12} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold leading-snug text-ink-100">{issue.title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-400">{issue.detail}</p>
                      {issue.hint && (
                        <p className="mt-1 rounded border border-ink-700 bg-ink-900/70 px-2 py-1 text-[10.5px] leading-relaxed text-ink-400">
                          <span className="font-semibold text-mc-emerald">Fix: </span>
                          {issue.hint}
                        </p>
                      )}
                      {issue.blockId && (
                        <button
                          onClick={() => onSelectBlock(issue.blockId!)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-medium text-mc-emerald hover:underline"
                        >
                          Open block <ArrowUpRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
