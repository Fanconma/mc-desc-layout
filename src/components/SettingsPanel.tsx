import { Settings2, Wand2 } from 'lucide-react'
import type { BadgeStyle, Project, ProjectMeta } from '../lib/types'
import { BADGE_STYLES } from '../lib/badges'
import { slugify } from '../lib/storage'
import { ColorField, Field, Select, TextArea, TextInput } from './ui'

interface Props {
  project: Project
  onChange: (meta: ProjectMeta) => void
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink-800 px-4 py-3.5 last:border-b-0">
      <h3 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-600">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

const LINK_FIELDS: { key: keyof ProjectMeta['links']; label: string; placeholder: string }[] = [
  { key: 'modrinth', label: 'Modrinth', placeholder: 'https://modrinth.com/mod/…' },
  { key: 'curseforge', label: 'CurseForge', placeholder: 'https://www.curseforge.com/minecraft/…' },
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/owner/repo' },
  { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/…' },
  { key: 'issues', label: 'Issue tracker', placeholder: 'https://github.com/owner/repo/issues' },
  { key: 'wiki', label: 'Wiki / docs', placeholder: 'https://…' },
  { key: 'kofi', label: 'Donations', placeholder: 'https://ko-fi.com/…' },
]

export function SettingsPanel({ project, onChange }: Props) {
  const { meta } = project
  const set = (patch: Partial<ProjectMeta>) => onChange({ ...meta, ...patch })
  const setLink = (key: keyof ProjectMeta['links'], value: string) => onChange({ ...meta, links: { ...meta.links, [key]: value } })

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-ink-800 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <Settings2 size={14} className="text-mc-lapis" /> Project settings
        </h2>
        <p className="mt-0.5 text-[11px] leading-snug text-ink-500">These power the page header, dynamic badges and links. None of it is sent anywhere.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Group title="Identity">
          <Field label="Project name">
            <TextInput value={meta.name} onChange={(v) => set({ name: v })} />
          </Field>
          <Field label="Summary" hint="One or two sentences. Shown under the title and in search results.">
            <TextArea value={meta.summary} onChange={(v) => set({ summary: v })} rows={2} />
          </Field>
          <Field
            label="Modrinth slug / ID"
            right={
              <button
                className="inline-flex items-center gap-1 text-[10px] font-medium text-mc-emerald hover:underline"
                onClick={() => set({ slug: slugify(meta.name) })}
              >
                <Wand2 size={10} /> from name
              </button>
            }
            hint="Needed for live download and version badges."
          >
            <TextInput value={meta.slug} onChange={(v) => set({ slug: v })} placeholder="your-mod" mono />
          </Field>
          <Field label="CurseForge project ID" hint="The numeric ID from your project URL.">
            <TextInput value={meta.curseforgeId} onChange={(v) => set({ curseforgeId: v })} placeholder="123456" mono />
          </Field>
          <Field label="Icon URL" hint="Square image, 512×512 or larger.">
            <TextInput value={meta.iconUrl} onChange={(v) => set({ iconUrl: v })} placeholder="https://…" />
          </Field>
        </Group>

        <Group title="Release">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Version">
              <TextInput value={meta.version} onChange={(v) => set({ version: v })} placeholder="1.0.0" />
            </Field>
            <Field label="License">
              <TextInput value={meta.license} onChange={(v) => set({ license: v })} placeholder="MIT" />
            </Field>
          </div>
          <Field label="Loaders" hint="Comma separated: Fabric, NeoForge, Forge, Quilt">
            <TextInput
              value={meta.loaders.join(', ')}
              onChange={(v) => set({ loaders: v.split(',').map((x) => x.trim()).filter(Boolean) })}
              placeholder="Fabric, NeoForge"
            />
          </Field>
          <Field label="Minecraft versions" hint="Comma separated: 1.21.x, 1.20.6">
            <TextInput
              value={meta.mcVersions.join(', ')}
              onChange={(v) => set({ mcVersions: v.split(',').map((x) => x.trim()).filter(Boolean) })}
              placeholder="1.21.x"
            />
          </Field>
          <Field label="Author">
            <TextInput value={meta.author} onChange={(v) => set({ author: v })} />
          </Field>
        </Group>

        <Group title="Style">
          <Field label="Accent colour" hint="Used by the preview and the export page.">
            <ColorField value={meta.accent} onChange={(v) => set({ accent: v })} />
          </Field>
          <Field label="Badge style">
            <Select<BadgeStyle>
              value={meta.badgeStyle}
              onChange={(v) => set({ badgeStyle: v })}
              options={BADGE_STYLES.map((s) => ({ value: s.value, label: s.label }))}
            />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {['#1bd96a', '#4ce3d0', '#4d7cff', '#b47cff', '#f9c846', '#ff5b5b', '#f16436'].map((c) => (
              <button
                key={c}
                onClick={() => set({ accent: c })}
                className={`h-6 w-6 rounded-md border transition hover:scale-110 ${meta.accent.toLowerCase() === c ? 'border-white' : 'border-transparent'}`}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </Group>

        <Group title="Links">
          {LINK_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <TextInput value={meta.links[f.key]} onChange={(v) => setLink(f.key, v)} placeholder={f.placeholder} />
            </Field>
          ))}
        </Group>

        <div className="px-4 py-4">
          <p className="text-[11px] leading-relaxed text-ink-500">
            Everything is saved in your browser as you type. Use <span className="font-semibold text-ink-300">Export → Project file</span> to move a project between machines.
          </p>
        </div>
      </div>
    </div>
  )
}
