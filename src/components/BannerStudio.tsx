import { useEffect, useRef, useState } from 'react'
import { Download, ImagePlus, Shuffle, Upload, X } from 'lucide-react'
import type { Project } from '../lib/types'
import { Field, Modal, Segmented, Select, TextInput } from './ui'

const PALETTES = [
  { id: 'aurora', name: 'Aurora', colors: ['#0a1f17', '#123b2c', '#1bd96a'], accent: '#1bd96a' },
  { id: 'nether', name: 'Nether', colors: ['#1a0808', '#43130c', '#f16436'], accent: '#f9c846' },
  { id: 'end', name: 'End', colors: ['#0a0814', '#231a3d', '#b47cff'], accent: '#b47cff' },
  { id: 'ocean', name: 'Ocean', colors: ['#04131f', '#0a3a52', '#4ce3d0'], accent: '#4ce3d0' },
  { id: 'amethyst', name: 'Amethyst', colors: ['#120a1c', '#2c1745', '#e0aaff'], accent: '#e0aaff' },
  { id: 'slate', name: 'Slate', colors: ['#0b0d10', '#1b2029', '#98a2b3'], accent: '#1bd96a' },
]

const SIZES = [
  { id: 'wide', label: '1280 × 400', w: 1280, h: 400 },
  { id: 'wide2', label: '1600 × 500', w: 1600, h: 500 },
  { id: 'hero', label: '1920 × 600', w: 1920, h: 600 },
  { id: 'slim', label: '1200 × 300', w: 1200, h: 300 },
]

type Pattern = 'grid' | 'pixels' | 'glow' | 'none'

function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function BannerStudio({
  open,
  onClose,
  project,
  notify,
}: {
  open: boolean
  onClose: () => void
  project: Project
  notify: (m: string) => void
}) {
  const [title, setTitle] = useState(project.meta.name)
  const [subtitle, setSubtitle] = useState(project.meta.summary)
  const [chip, setChip] = useState([project.meta.version && `v${project.meta.version}`, project.meta.loaders[0], project.meta.mcVersions[0]].filter(Boolean).join('  ·  '))
  const [paletteId, setPaletteId] = useState('aurora')
  const [sizeId, setSizeId] = useState('wide')
  const [pattern, setPattern] = useState<Pattern>('pixels')
  const [seed, setSeed] = useState(7)
  const [icon, setIcon] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTitle(project.meta.name)
      setSubtitle(project.meta.summary)
      setChip([project.meta.version && `v${project.meta.version}`, project.meta.loaders[0], project.meta.mcVersions[0]].filter(Boolean).join('  ·  '))
      if (project.meta.iconUrl) setIcon(project.meta.iconUrl)
    }
  }, [open, project.meta.name, project.meta.summary, project.meta.version, project.meta.loaders, project.meta.mcVersions, project.meta.iconUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !open) return
    const size = SIZES.find((s) => s.id === sizeId) ?? SIZES[0]
    const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0]
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { w, h } = size
    const pad = Math.round(h * 0.13)
    const iconSize = Math.round(h * 0.4)
    const textX = icon ? pad + iconSize + Math.round(h * 0.09) : pad
    const maxWidth = w - textX - pad

    const withAlpha = (hex: string, alpha: number) => {
      const clean = hex.replace('#', '')
      const r = parseInt(clean.slice(0, 2), 16)
      const g = parseInt(clean.slice(2, 4), 16)
      const b = parseInt(clean.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    const paint = () => {
      const rand = mulberry32(seed)

      // base gradient
      const base = ctx.createLinearGradient(0, 0, w, h)
      base.addColorStop(0, palette.colors[0])
      base.addColorStop(0.58, palette.colors[1])
      base.addColorStop(1, palette.colors[0])
      ctx.fillStyle = base
      ctx.fillRect(0, 0, w, h)

      // soft light pools
      const glow = (cx: number, cy: number, radius: number, color: string, alpha: number) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        g.addColorStop(0, withAlpha(color, alpha))
        g.addColorStop(0.55, withAlpha(color, alpha * 0.35))
        g.addColorStop(1, withAlpha(color, 0))
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }
      glow(w * 0.82, -h * 0.15, h * 1.25, palette.accent, 0.42)
      glow(w * 0.06, h * 1.12, h * 0.95, palette.colors[2], 0.24)

      // pattern
      if (pattern === 'grid') {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.lineWidth = 1
        const step = Math.round(h / 10)
        for (let x = step; x < w; x += step) {
          ctx.beginPath()
          ctx.moveTo(x + 0.5, 0)
          ctx.lineTo(x + 0.5, h)
          ctx.stroke()
        }
        for (let y = step; y < h; y += step) {
          ctx.beginPath()
          ctx.moveTo(0, y + 0.5)
          ctx.lineTo(w, y + 0.5)
          ctx.stroke()
        }
      } else if (pattern === 'pixels') {
        for (let i = 0; i < 80; i++) {
          const s = h * (0.012 + rand() * 0.03)
          const x = Math.round((rand() * w) / 4) * 4
          const y = Math.round((rand() * h) / 4) * 4
          ctx.globalAlpha = 0.04 + rand() * 0.09
          ctx.fillStyle = rand() > 0.5 ? palette.accent : '#ffffff'
          ctx.fillRect(x, y, s, s)
        }
        ctx.globalAlpha = 1
      } else if (pattern === 'glow') {
        for (let i = 0; i < 4; i++) {
          const cx = w * (0.45 + rand() * 0.5)
          const cy = h * (0.2 + rand() * 0.6)
          const r = h * (0.1 + rand() * 0.22)
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
          g.addColorStop(0, withAlpha(i % 2 ? '#ffffff' : palette.accent, 0.12))
          g.addColorStop(1, withAlpha(palette.accent, 0))
          ctx.fillStyle = g
          ctx.fillRect(0, 0, w, h)
        }
      }

      // icon
      if (icon) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const iy = (h - iconSize) / 2
          ctx.save()
          roundRect(ctx, pad, iy, iconSize, iconSize, iconSize * 0.2)
          ctx.clip()
          ctx.drawImage(img, pad, iy, iconSize, iconSize)
          ctx.restore()
          ctx.strokeStyle = 'rgba(255,255,255,0.22)'
          ctx.lineWidth = Math.max(1, h * 0.005)
          roundRect(ctx, pad, iy, iconSize, iconSize, iconSize * 0.2)
          ctx.stroke()
        }
        img.src = icon
      }

      // layout metrics
      const titleSize = Math.round(h * 0.19)
      const subtitleSize = Math.round(h * 0.062)
      const chipSize = Math.round(h * 0.048)
      const chipH = Math.round(chipSize * 2.05)
      const gapA = Math.round(h * 0.055)
      const gapB = Math.round(h * 0.06)
      const hasSub = !!subtitle.trim()
      const hasChip = !!chip.trim()
      const total =
        titleSize + (hasSub ? gapA + subtitleSize : 0) + (hasChip ? gapB + chipH : 0)
      let y = (h - total) / 2

      // title: fit to width
      let tSize = titleSize
      ctx.font = `800 ${tSize}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`
      const titleText = title.trim() || project.meta.name || 'Your project'
      while (ctx.measureText(titleText).width > maxWidth && tSize > 18) {
        tSize -= 2
        ctx.font = `800 ${tSize}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`
      }
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fillText(titleText, textX + Math.max(1, h * 0.008), y + tSize * 0.82 + Math.max(2, h * 0.012))
      ctx.fillStyle = '#ffffff'
      ctx.fillText(titleText, textX, y + tSize * 0.82)
      y += titleSize

      if (hasSub) {
        y += gapA
        let sSize = subtitleSize
        ctx.font = `500 ${sSize}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`
        let sub = subtitle.trim()
        while (ctx.measureText(sub).width > maxWidth && sub.length > 8) sub = sub.slice(0, -2)
        if (sub !== subtitle.trim()) sub = sub.trimEnd() + '…'
        while (ctx.measureText(sub).width > maxWidth && sSize > 12) {
          sSize -= 1
          ctx.font = `500 ${sSize}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`
        }
        ctx.fillStyle = 'rgba(255,255,255,0.78)'
        ctx.fillText(sub, textX, y + sSize * 0.85)
        y += subtitleSize
      }

      if (hasChip) {
        y += gapB
        ctx.font = `600 ${chipSize}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`
        const label = chip.trim()
        const dotR = chipSize * 0.22
        const textW = ctx.measureText(label).width
        const chipW = Math.min(maxWidth, textW + chipSize * 3.2)
        ctx.fillStyle = 'rgba(255,255,255,0.09)'
        roundRect(ctx, textX, y, chipW, chipH, chipH / 2)
        ctx.fill()
        ctx.strokeStyle = withAlpha(palette.accent, 0.55)
        ctx.lineWidth = Math.max(1, h * 0.004)
        roundRect(ctx, textX, y, chipW, chipH, chipH / 2)
        ctx.stroke()
        ctx.fillStyle = palette.accent
        ctx.beginPath()
        ctx.arc(textX + chipSize * 1.15, y + chipH / 2, dotR, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, textX + chipSize * 1.15 + dotR + chipSize * 0.55, y + chipH / 2 + 1)
        ctx.textBaseline = 'alphabetic'
      }

      // vignette
      const vig = ctx.createLinearGradient(0, h, 0, h * 0.25)
      vig.addColorStop(0, 'rgba(0,0,0,0.45)')
      vig.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)
    }

    paint()
  }, [open, title, subtitle, chip, paletteId, sizeId, pattern, seed, icon, project.meta.name])

  const downloadPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(title || 'banner').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-banner.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
      notify('Banner downloaded — host it, then paste the URL into your Hero block')
    }, 'image/png')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Banner studio"
      subtitle="Generate a wide header image for the top of your description. Everything is drawn locally in your browser."
      width="max-w-5xl"
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={downloadPng}>
            <Download size={14} /> Download PNG
          </button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950">
            <canvas ref={canvasRef} className="block h-auto w-full" />
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2.5">
            <ImagePlus size={14} className="mt-0.5 shrink-0 text-mc-emerald" />
            <p className="text-[11px] leading-relaxed text-ink-400">
              Modrinth and CurseForge need a public image URL. Upload the PNG to a GitHub release, your repository, or an image host, then paste the raw URL
              into the <span className="text-ink-200">Hero</span> block. Never link to a local file.
            </p>
          </div>
          <div className="mt-2 flex gap-2">
            <button className="btn text-xs" onClick={() => fileRef.current?.click()}>
              <Upload size={13} /> Project icon
            </button>
            {icon && (
              <button className="btn text-xs" onClick={() => setIcon(null)}>
                <X size={13} /> Remove icon
              </button>
            )}
            <button className="btn ml-auto text-xs" onClick={() => setSeed((s) => s + 1)}>
              <Shuffle size={13} /> Shuffle pattern
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const reader = new FileReader()
                reader.onload = () => setIcon(String(reader.result))
                reader.readAsDataURL(f)
                e.target.value = ''
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Field label="Title">
            <TextInput value={title} onChange={setTitle} placeholder="Project name" />
          </Field>
          <Field label="Subtitle">
            <TextInput value={subtitle} onChange={setSubtitle} placeholder="One sentence" />
          </Field>
          <Field label="Chip text">
            <TextInput value={chip} onChange={setChip} placeholder="v1.0.0 · Fabric · 1.21.x" />
          </Field>
          <Field label="Size">
            <Select value={sizeId} onChange={setSizeId} options={SIZES.map((s) => ({ value: s.id, label: s.label }))} />
          </Field>
          <Field label="Pattern">
            <Segmented<Pattern>
              size="sm"
              value={pattern}
              onChange={setPattern}
              options={[
                { value: 'pixels', label: 'Pixels' },
                { value: 'grid', label: 'Grid' },
                { value: 'glow', label: 'Orbs' },
                { value: 'none', label: 'None' },
              ]}
            />
          </Field>
          <Field label="Palette">
            <div className="grid grid-cols-2 gap-1.5">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPaletteId(p.id)}
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition ${
                    paletteId === p.id ? 'border-white/40 bg-ink-750' : 'border-ink-700 bg-ink-850 hover:border-ink-600'
                  }`}
                >
                  <span className="h-4 w-4 shrink-0 rounded" style={{ background: `linear-gradient(135deg, ${p.colors[1]}, ${p.accent})` }} />
                  <span className="text-[11px] text-ink-200">{p.name}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>
      </div>
    </Modal>
  )
}
