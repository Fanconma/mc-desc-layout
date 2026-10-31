import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import type {
  Badge,
  Block,
  ChangelogEntry,
  CompatRow,
  ConfigItem,
  CreditItem,
  DependencyItem,
  FaqItem,
  FeatureItem,
  FooterLink,
  GalleryItem,
  ProjectMeta,
} from '../../lib/types'
import { BADGE_PRESETS, badgeUrl } from '../../lib/badges'
import { uid } from '../../lib/defaults'
import { ColorField, EmptyHint, Field, Segmented, Select, TextArea, TextInput, Toggle } from '../ui'

type Patch = Record<string, unknown>

interface EditorProps {
  block: Block
  onChange: (next: Block) => void
  meta: ProjectMeta
}

function Section({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{title}</h4>
        {actions}
      </div>
      {children}
    </div>
  )
}

function Repeater<T extends { id: string }>({
  items,
  onChange,
  create,
  render,
  addLabel,
  emptyHint,
}: {
  items: T[]
  onChange: (items: T[]) => void
  create: () => T
  render: (item: T, patch: (p: Partial<T>) => void, index: number) => ReactNode
  addLabel: string
  emptyHint?: string
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="space-y-2">
      {items.length === 0 && emptyHint && <EmptyHint>{emptyHint}</EmptyHint>}
      {items.map((item, i) => (
        <div key={item.id} className="group/row rounded-lg border border-ink-700 bg-ink-850 p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] text-ink-500">#{String(i + 1).padStart(2, '0')}</span>
            <div className="flex items-center gap-0.5 opacity-60 transition group-hover/row:opacity-100">
              <button className="icon-btn h-6 w-6" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <ArrowUp size={12} />
              </button>
              <button className="icon-btn h-6 w-6" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
                <ArrowDown size={12} />
              </button>
              <button
                className="icon-btn h-6 w-6 hover:bg-mc-redstone/15 hover:text-mc-redstone"
                onClick={() => onChange(items.filter((x) => x.id !== item.id))}
                aria-label="Delete row"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {render(item, (p) => onChange(items.map((x) => (x.id === item.id ? { ...x, ...p } : x))), i)}
        </div>
      ))}
      <button className="btn w-full border-dashed py-1.5 text-xs" onClick={() => onChange([...items, create()])}>
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  )
}

function HeadingFields({
  heading,
  emoji,
  level,
  onPatch,
  showLevel = true,
}: {
  heading: string
  emoji: string
  level: 2 | 3
  onPatch: (p: Patch) => void
  showLevel?: boolean
}) {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-2.5">
      <Field label="Icon">
        <TextInput value={emoji} onChange={(v) => onPatch({ emoji: v })} placeholder="✨" className="text-center" />
      </Field>
      <Field label="Section heading">
        <TextInput value={heading} onChange={(v) => onPatch({ heading: v })} placeholder="Features" />
      </Field>
      {showLevel && (
        <Field label="Heading level" className="col-span-2">
          <Segmented
            size="sm"
            value={String(level)}
            onChange={(v) => onPatch({ level: Number(v) as 2 | 3 })}
            options={[
              { value: '2', label: 'H2 — section' },
              { value: '3', label: 'H3 — subsection' },
            ]}
          />
        </Field>
      )}
    </div>
  )
}

function BadgeRow({
  badge,
  patch,
  meta,
  onDelete,
}: {
  badge: Badge
  patch: (p: Partial<Badge>) => void
  meta: ProjectMeta
  onDelete: () => void
}) {
  const url = badgeUrl(badge, meta)
  const dynamic = badge.kind.startsWith('modrinth') || badge.kind === 'curseforge-downloads' || badge.kind === 'github-stars'
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          value={badge.kind}
          onChange={(kind) => {
            const preset = BADGE_PRESETS.find((p) => p.kind === kind)
            patch({ kind, label: preset?.label ?? badge.label })
          }}
          options={BADGE_PRESETS.map((p) => ({ value: p.kind, label: p.label }))}
          className="flex-1"
        />
        <button className="icon-btn hover:bg-mc-redstone/15 hover:text-mc-redstone" onClick={onDelete} aria-label="Remove badge">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label={dynamic ? 'Label (optional)' : 'Label'}>
          <TextInput value={badge.label} onChange={(v) => patch({ label: v })} placeholder="downloads" />
        </Field>
        <Field label="Message">
          <TextInput
            value={badge.value}
            onChange={(v) => patch({ value: v })}
            placeholder={dynamic ? 'auto from project' : 'value'}
          />
        </Field>
      </div>
      <div className="grid grid-cols-[1fr_88px] gap-2">
        <Field label="Logo (simple-icons slug)">
          <TextInput value={badge.logo} onChange={(v) => patch({ logo: v })} placeholder="modrinth" />
        </Field>
        <Field label="Colour">
          <ColorField value={`#${badge.color.replace('#', '')}`} onChange={(v) => patch({ color: v.replace('#', '') })} />
        </Field>
      </div>
      <Field label="Link (optional)">
        <TextInput value={badge.link} onChange={(v) => patch({ link: v })} placeholder="https://…" />
      </Field>
      <div className="flex items-center gap-2 overflow-hidden rounded-md border border-ink-700 bg-ink-950/60 px-2 py-1.5">
        <img src={url} alt="" className="h-5" loading="lazy" />
        <span className="truncate font-mono text-[10px] text-ink-500">{url}</span>
      </div>
    </div>
  )
}

export function BlockEditor({ block, onChange, meta }: EditorProps) {
  const patch = (p: Patch) => onChange({ ...block, ...p } as Block)

  switch (block.type) {
    case 'hero':
      return (
        <div className="space-y-3">
          <Field label="Title" hint="Optional. The page already shows your project name — leave this blank unless you want a second headline.">
            <TextInput value={block.title} onChange={(v) => patch({ title: v })} placeholder="Leave blank to skip" />
          </Field>
          <Field label="Tagline" hint="One short line under the banner. Keep it under ~110 characters.">
            <TextArea value={block.tagline} onChange={(v) => patch({ tagline: v })} rows={2} />
          </Field>
          <Field
            label="Banner image URL"
            hint="Wide image, roughly 1280×400. Modrinth needs a publicly reachable https URL — build one in Banner Studio and host it on GitHub or Imgur, then paste it here."
          >
            <TextInput value={block.bannerUrl} onChange={(v) => patch({ bannerUrl: v })} placeholder="https://raw.githubusercontent.com/…/banner.png" />
          </Field>
          {block.bannerUrl ? (
            <img src={block.bannerUrl} alt="" className="max-h-40 w-full rounded-lg border border-ink-700 object-cover" />
          ) : (
            <EmptyHint>No banner yet — the hero will render as a text introduction. That is fine, but a banner is the biggest visual upgrade you can make.</EmptyHint>
          )}
        </div>
      )

    case 'badges':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_auto] items-end gap-2">
            <Field label="Badge style" hint="Set globally in Project settings.">
              <div className="chip">{meta.badgeStyle}</div>
            </Field>
            <Toggle checked={block.center} onChange={(v) => patch({ center: v })} label="Centre" />
          </div>
          <div className="space-y-2">
            {block.badges.map((b) => (
              <div key={b.id} className="rounded-lg border border-ink-700 bg-ink-850 p-2.5">
                <BadgeRow
                  badge={b}
                  meta={meta}
                  patch={(p) => patch({ badges: block.badges.map((x) => (x.id === b.id ? { ...x, ...p } : x)) })}
                  onDelete={() => patch({ badges: block.badges.filter((x) => x.id !== b.id) })}
                />
              </div>
            ))}
          </div>
          <button
            className="btn w-full border-dashed py-1.5 text-xs"
            onClick={() =>
              patch({
                badges: [...block.badges, { id: uid('badge'), kind: 'static', label: 'label', value: 'value', color: '1bd96a', logo: '', link: '' }],
              })
            }
          >
            <Plus size={13} /> Add badge
          </button>
        </div>
      )

    case 'text':
      return (
        <div className="space-y-3">
          <HeadingFields heading={block.heading} emoji={block.emoji} level={block.level} onPatch={patch} />
          <Field label="Body" hint="Markdown: **bold**, *italic*, `code`, [link](https://…), lists and > quotes.">
            <TextArea value={block.body} onChange={(v) => patch({ body: v })} rows={7} />
          </Field>
        </div>
      )

    case 'features':
      return (
        <div className="space-y-3">
          <HeadingFields heading={block.heading} emoji={block.emoji} level={2} onPatch={patch} showLevel={false} />
          <Field label="Layout">
            <Segmented
              size="sm"
              value={block.layout}
              onChange={(v) => patch({ layout: v })}
              options={[
                { value: 'grid', label: 'Two-column cards' },
                { value: 'list', label: 'Bulleted list' },
              ]}
            />
          </Field>
          <Repeater<FeatureItem>
            items={block.items}
            onChange={(items) => patch({ items })}
            create={() => ({ id: uid('f'), icon: '✦', title: 'New feature', body: 'Describe it in one sentence.' })}
            addLabel="Add feature"
            render={(item, p) => (
              <div className="space-y-2">
                <div className="grid grid-cols-[56px_1fr] gap-2">
                  <Field label="Icon">
                    <TextInput value={item.icon} onChange={(v) => p({ icon: v })} className="text-center" />
                  </Field>
                  <Field label="Title">
                    <TextInput value={item.title} onChange={(v) => p({ title: v })} />
                  </Field>
                </div>
                <Field label="Description">
                  <TextArea value={item.body} onChange={(v) => p({ body: v })} rows={2} />
                </Field>
              </div>
            )}
          />
        </div>
      )

    case 'gallery':
      return (
        <div className="space-y-3">
          <HeadingFields heading={block.heading} emoji={block.emoji} level={2} onPatch={patch} showLevel={false} />
          <Field label="Layout">
            <Segmented
              size="sm"
              value={block.layout}
              onChange={(v) => patch({ layout: v })}
              options={[
                { value: 'stack', label: 'Full width stack' },
                { value: 'grid', label: 'Two columns' },
              ]}
            />
          </Field>
          <Repeater<GalleryItem>
            items={block.items}
            onChange={(items) => patch({ items })}
            create={() => ({ id: uid('g'), url: '', caption: 'Screenshot caption' })}
            addLabel="Add screenshot"
            render={(item, p) => (
              <div className="space-y-2">
                <Field label="Image URL">
                  <TextInput value={item.url} onChange={(v) => p({ url: v })} placeholder="https://…" />
                </Field>
                <Field label="Caption" hint="Also used as the alt text — required by Modrinth.">
                  <TextInput value={item.caption} onChange={(v) => p({ caption: v })} />
                </Field>
                {item.url && <img src={item.url} alt="" className="max-h-32 rounded-md border border-ink-700 object-cover" />}
              </div>
            )}
          />
        </div>
      )

    case 'callout':
      return (
        <div className="space-y-3">
          <Field label="Tone">
            <Segmented
              size="sm"
              value={block.kind}
              onChange={(v) => patch({ kind: v })}
              options={[
                { value: 'note', label: '📝 Note' },
                { value: 'tip', label: '💡 Tip' },
                { value: 'info', label: 'ℹ️ Info' },
                { value: 'warning', label: '⚠️ Warning' },
                { value: 'danger', label: '⛔ Important' },
              ]}
            />
          </Field>
          <Field label="Title">
            <TextInput value={block.title} onChange={(v) => patch({ title: v })} />
          </Field>
          <Field label="Body">
            <TextArea value={block.body} onChange={(v) => patch({ body: v })} rows={3} />
          </Field>
        </div>
      )

    case 'faq':
      return (
        <div className="space-y-3">
          <HeadingFields heading={block.heading} emoji={block.emoji} level={2} onPatch={patch} showLevel={false} />
          <Repeater<FaqItem>
            items={block.items}
            onChange={(items) => patch({ items })}
            create={() => ({ id: uid('q'), q: 'New question?', a: 'The answer.' })}
            addLabel="Add question"
            render={(item, p) => (
              <div className="space-y-2">
                <Field label="Question">
                  <TextInput value={item.q} onChange={(v) => p({ q: v })} />
                </Field>
                <Field label="Answer">
                  <TextArea value={item.a} onChange={(v) => p({ a: v })} rows={2} />
                </Field>
              </div>
            )}
          />
        </div>
      )

    case 'dependencies':
      return (
        <div className="space-y-3">
          <HeadingFields heading={block.heading} emoji={block.emoji} level={2} onPatch={patch} showLevel={false} />
          <Field label="Intro line">
            <TextInput value={block.intro} onChange={(v) => patch({ intro: v })} />
          </Field>
          <Repeater<DependencyItem>
            items={block.items}
            onChange={(items) => patch({ items })}
            create={() => ({ id: uid('d'), name: 'New dependency', url: '', version: '', required: true, note: '' })}
            addLabel="Add dependency"
            render={(item, p) => (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Name">
                    <TextInput value={item.name} onChange={(v) => p({ name: v })} />
                  </Field>
                  <Field label="Version">
                    <TextInput value={item.version} onChange={(v) => p({ version: v })} placeholder="0.100+" />
                  </Field>
                </div>
                <Field label="Link">
                  <TextInput value={item.url} onChange={(v) => p({ url: v })} placeholder="https://modrinth.com/mod/…" />
                </Field>
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <Field label="Note">
                    <TextInput value={item.note} onChange={(v) => p({ note: v })} />
                  </Field>
                  <Toggle checked={item.required} onChange={(v) => p({ required: v })} label="Required" />
                </div>
              </div>
            )}
          />
        </div>
      )

    case 'install':
      return (
        <div className="space-y-3">
          <HeadingFields heading={block.heading} emoji={block.emoji} level={2} onPatch={patch} showLevel={false} />
          <Field label="Intro">
            <TextInput value={block.intro} onChange={(v) => patch({ intro: v })} placeholder="Optional lead-in sentence" />
          </Field>
          <Section title="Steps">
            <div className="space-y-2">
              {block.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-750 font-mono text-[10px] text-ink-300">
                    {i + 1}
                  </span>
                  <TextArea
                    value={s}
                    onChange={(v) => patch({ steps: block.steps.map((x, j) => (j === i ? v : x)) })}
                    rows={1}
                    className="text-xs"
                  />
                  <button
                    className="icon-btn mt-1 hover:bg-mc-redstone/15 hover:text-mc-redstone"
                    onClick={() => patch({ steps: block.steps.filter((_, j) => j !== i) })}
                    aria-label="Remove step"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button className="btn w-full border-dashed py-1 text-xs" onClick={() => patch({ steps: [...block.steps, ''] })}>
                <Plus size={12} /> Add step
              </button>
            </div>
          </Section>
          <Field label="Code block" hint="Optional — commands or snippets. Leave empty to hide.">
            <TextArea value={block.code} onChange={(v) => patch({ code: v })} rows={3} mono />
          </Field>
          <Field label="Code language">
            <TextInput value={block.codeLang} onChange={(v) => patch({ codeLang: v })} placeholder="bash / java / groovy" />
          </Field>
          <Field label="Outro">
            <TextArea value={block.outro} onChange={(v) => patch({ outro: v })} rows={2} />
          </Field>
        </div>
      )

    case 'compatibility':
      return (
        <div className="space-y-3">
          <HeadingFields heading={block.heading} emoji={block.emoji} level={2} onPatch={patch} showLevel={false} />
          <Field label="First column title">
            <TextInput value={block.loaderColumn} onChange={(v) => patch({ loaderColumn: v })} placeholder="Loader" />
          </Field>
          <Repeater<CompatRow>
            items={block.rows}
            onChange={(rows) => patch({ rows })}
            create={() => ({ id: uid('c'), loader: 'Fabric 1.21.x', status: 'yes', note: '' })}
            addLabel="Add row"
            render={(item, p) => (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Row">
                    <TextInput value={item.loader} onChange={(v) => p({ loader: v })} />
                  </Field>
                  <Field label="Status">
                    <Select
                      value={item.status}
                      onChange={(v) => p({ status: v })}
                      options={[
                        { value: 'yes', label: '✅ Supported' },
                        { value: 'partial', label: '🟡 Partial' },
                        { value: 'no', label: '❌ Not supported' },
                      ]}
                    />
                  </Field>
                </div>
                <Field label="Note">
                  <TextInput value={item.note} onChange={(v) => p({ note: v })} />
                </Field>
              </div>
            )}
          />
        </div>
      )

    case 'changelog':
      return (
        <div className="space-y-3">
          <HeadingFields heading={block.heading} emoji={block.emoji} level={2} onPatch={patch} showLevel={false} />
          <Toggle checked={block.collapsed} onChange={(v) => patch({ collapsed: v })} label="Collapse each version" hint="Uses <details> so old versions stay tucked away." />
          <Repeater<ChangelogEntry>
            items={block.entries}
            onChange={(entries) => patch({ entries })}
            create={() => ({ id: uid('cl'), version: '1.0.0', date: new Date().toISOString().slice(0, 10), changes: ['Something changed'] })}
            addLabel="Add version"
            render={(item, p) => (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Version">
                    <TextInput value={item.version} onChange={(v) => p({ version: v })} />
                  </Field>
                  <Field label="Date">
                    <TextInput value={item.date} onChange={(v) => p({ date: v })} placeholder="2025-06-01" />
                  </Field>
                </div>
                <Field label="Changes">
                  <TextArea
                    value={item.changes.join('\n')}
                    onChange={(v) => p({ changes: v.split('\n') })}
                    rows={3}
                    className="text-xs"
                  />
                </Field>
                <p className="-mt-2 text-[10px] text-ink-500">One change per line.</p>
              </div>
            )}
          />
        </div>
      )

    case 'config':
      return (
        <div className="space-y-3">
          <HeadingFields heading={block.heading} emoji={block.emoji} level={2} onPatch={patch} showLevel={false} />
          <Repeater<ConfigItem>
            items={block.items}
            onChange={(items) => patch({ items })}
            create={() => ({ id: uid('cf'), option: 'option', def: 'value', desc: '' })}
            addLabel="Add option"
            render={(item, p) => (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Option">
                    <TextInput value={item.option} onChange={(v) => p({ option: v })} mono />
                  </Field>
                  <Field label="Default">
                    <TextInput value={item.def} onChange={(v) => p({ def: v })} mono />
                  </Field>
                </div>
                <Field label="Description">
                  <TextArea value={item.desc} onChange={(v) => p({ desc: v })} rows={2} />
                </Field>
              </div>
            )}
          />
        </div>
      )

    case 'credits':
      return (
        <div className="space-y-3">
          <HeadingFields heading={block.heading} emoji={block.emoji} level={2} onPatch={patch} showLevel={false} />
          <Repeater<CreditItem>
            items={block.items}
            onChange={(items) => patch({ items })}
            create={() => ({ id: uid('cr'), name: 'Name', role: 'Role', url: '' })}
            addLabel="Add credit"
            render={(item, p) => (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Name">
                  <TextInput value={item.name} onChange={(v) => p({ name: v })} />
                </Field>
                <Field label="Role">
                  <TextInput value={item.role} onChange={(v) => p({ role: v })} />
                </Field>
                <Field label="Link" className="col-span-2">
                  <TextInput value={item.url} onChange={(v) => p({ url: v })} placeholder="https://…" />
                </Field>
              </div>
            )}
          />
        </div>
      )

    case 'footer':
      return (
        <div className="space-y-3">
          <Field label="Closing note">
            <TextArea value={block.note} onChange={(v) => patch({ note: v })} rows={2} />
          </Field>
          <Repeater<FooterLink>
            items={block.links}
            onChange={(links) => patch({ links })}
            create={() => ({ id: uid('l'), label: 'Link', url: 'https://' })}
            addLabel="Add link"
            render={(item, p) => (
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <Field label="Label">
                  <TextInput value={item.label} onChange={(v) => p({ label: v })} />
                </Field>
                <Field label="URL">
                  <TextInput value={item.url} onChange={(v) => p({ url: v })} />
                </Field>
              </div>
            )}
          />
          <Toggle checked={block.showLine} onChange={(v) => patch({ showLine: v })} label="Divider above" />
        </div>
      )

    case 'divider':
      return (
        <div>
          <p className="mb-3 text-xs text-ink-400">A horizontal rule. Useful between major sections.</p>
          <div className="h-px w-full bg-ink-700" />
        </div>
      )

    case 'raw':
      return (
        <Field label="Markdown / HTML" hint="Passed through untouched. Great for embeds, spoilers and custom tables.">
          <TextArea value={block.body} onChange={(v) => patch({ body: v })} rows={10} mono />
        </Field>
      )

    default:
      return null
  }
}
