import { useEffect, useId, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Field({
  label,
  hint,
  children,
  className = '',
  right,
}: {
  label?: string
  hint?: string
  children: ReactNode
  className?: string
  right?: ReactNode
}) {
  return (
    <div className={className}>
      {(label || right) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</span>}
          {right}
        </div>
      )}
      {children}
      {hint && <p className="mt-1 text-[11px] leading-snug text-ink-500">{hint}</p>}
    </div>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className = '',
  mono,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  mono?: boolean
}) {
  return (
    <input
      className={`${mono ? 'font-mono text-xs' : ''} field ${className}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
    />
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  mono,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
  mono?: boolean
}) {
  return (
    <textarea
      className={`${mono ? 'font-mono text-xs leading-relaxed' : ''} field resize-y ${className}`}
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
    />
  )
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  className = '',
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        className="field cursor-pointer appearance-none pr-8"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-900">
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode; title?: string }[]
  size?: 'sm' | 'md'
}) {
  return (
    <div className="inline-flex rounded-lg border border-ink-700 bg-ink-900 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`rounded-md font-medium transition ${
            size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
          } ${
            value === o.value
              ? 'bg-ink-750 text-white shadow-sm'
              : 'text-ink-400 hover:text-ink-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 shrink-0 rounded-full border p-0.5 transition ${
          checked ? 'border-mc-emerald/50 bg-mc-emerald/30' : 'border-ink-600 bg-ink-800'
        }`}
        style={{ height: 18, width: 32 }}
      >
        <span
          className={`block h-3.5 w-3.5 rounded-full transition ${
            checked ? 'translate-x-3.5 bg-mc-emerald' : 'translate-x-0 bg-ink-500'
          }`}
          style={{ height: 14, width: 14 }}
        />
      </button>
      <span>
        <span className="block text-xs font-medium text-ink-200">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">{hint}</span>}
      </span>
    </label>
  )
}

export function ColorField({
  value,
  onChange,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 ${className}`}>
      <input
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#1bd96a'}
        onChange={(e) => onChange(e.target.value)}
        className="h-5 w-6 shrink-0 rounded"
        aria-label="Colour"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent font-mono text-xs text-ink-200 outline-none"
        spellCheck={false}
      />
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-3xl',
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  width?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 flex max-h-[88vh] w-full ${width} animate-fade-up flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink-850 shadow-panel`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-700 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-ink-700 bg-ink-900/50 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-ink-600 border-b-2 bg-ink-800 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-ink-300">
      {children}
    </kbd>
  )
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-ink-700 bg-ink-900/40 px-3 py-4 text-center text-[11px] leading-relaxed text-ink-500">
      {children}
    </div>
  )
}
