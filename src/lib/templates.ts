import { createBlock, DEFAULT_LINKS, uid } from './defaults'
import type { Block, BlockType, Project } from './types'

export interface Template {
  id: string
  name: string
  tagline: string
  description: string
  accent: string
  glyph: string
  build: () => Project
}

function mk<T extends BlockType>(type: T, patch: Record<string, unknown> = {}): Block {
  const base = createBlock(type)
  return { ...base, ...patch } as Block
}

function project(name: string, summary: string, accent: string, blocks: Block[]): Project {
  return {
    meta: {
      name,
      summary,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      curseforgeId: '',
      iconUrl: '',
      bannerUrl: '',
      version: '1.0.0',
      loaders: ['Fabric', 'NeoForge'],
      mcVersions: ['1.21.x'],
      license: 'MIT',
      author: 'YourName',
      links: { ...DEFAULT_LINKS },
      badgeStyle: 'flat-square',
      accent,
    },
    blocks,
  }
}

export const TEMPLATES: Template[] = [
  {
    id: 'modern',
    name: 'Modern mod',
    tagline: 'Hero banner · feature cards · FAQ',
    description: 'The layout most popular Fabric and NeoForge mods use: punchy intro, scannable features, real installation steps.',
    accent: '#1bd96a',
    glyph: '✦',
    build: () =>
      project('Aurora', 'A soft, colourful lighting overhaul for the overworld.', '#1bd96a', [
        mk('hero', {
          title: '',
          tagline: 'Light that feels alive.',
        }),
        mk('badges'),
        mk('text', {
          heading: 'A different kind of pretty',
          emoji: '🌄',
          body:
            'Aurora replaces Minecraft\'s flat sky gradient with a hand-tuned colour grade that reacts to time, weather and biome. Dawns are cold and blue, storms go slate grey, and sunsets bleed into the horizon.\n\nEverything is data-driven, so resource packs can ship their own palettes without touching code.',
        }),
        mk('features', {
          heading: 'Features',
          emoji: '✨',
          layout: 'grid',
          items: [
            { id: uid('f'), icon: '🌅', title: 'Reactive skies', body: 'Colours shift through the day cycle, from cold dawns to warm dusk horizons.' },
            { id: uid('f'), icon: '⚡', title: 'Lightweight', body: 'Batched lighting updates keep the frame cost under one millisecond.' },
            { id: uid('f'), icon: '🎛️', title: 'Configurable', body: 'Every palette is data-driven and can be overridden by a resource pack.' },
            { id: uid('f'), icon: '🧩', title: 'Compatible', body: 'Works with Sodium, Iris and OptiFine out of the box.' },
          ],
        }),
        mk('gallery', {
          heading: 'Screenshots',
          emoji: '🖼️',
          layout: 'stack',
          columns: 2,
          items: [
            { id: uid('g'), url: '', caption: 'Sunrise over the plains' },
            { id: uid('g'), url: '', caption: 'A storm rolling in at dusk' },
          ],
        }),
        mk('callout', {
          kind: 'warning',
          title: 'Back up your world',
          body: 'Aurora changes world lighting data. Always make a backup before updating.',
        }),
        mk('install', {
          heading: 'Installation',
          emoji: '🧭',
          intro: 'Aurora takes about a minute to set up.',
          steps: [
            'Install **Fabric** (or **NeoForge**) for Minecraft 1.21.x.',
            'Drop `aurora-1.0.0.jar` into your `mods` folder.',
            'Launch the game — the default palette is applied automatically.',
          ],
          code: '',
          codeLang: 'bash',
          outro: 'No world reset required.',
        }),
        mk('dependencies', {
          heading: 'Dependencies',
          emoji: '📦',
          intro: 'Install these alongside the mod:',
          items: [
            { id: uid('d'), name: 'Fabric API', url: 'https://modrinth.com/mod/fabric-api', version: '0.100+', required: true, note: 'Required on Fabric.' },
            { id: uid('d'), name: 'Sodium', url: 'https://modrinth.com/mod/sodium', version: '0.6+', required: false, note: 'Recommended for performance.' },
          ],
        }),
        mk('compatibility', {
          heading: 'Compatibility',
          emoji: '🧩',
          loaderColumn: 'Loader',
          rows: [
            { id: uid('c'), loader: 'Fabric 1.21.x', status: 'yes', note: 'Fully supported' },
            { id: uid('c'), loader: 'NeoForge 1.21.x', status: 'yes', note: 'Fully supported' },
            { id: uid('c'), loader: 'Forge 1.20.x', status: 'partial', note: 'Best effort' },
            { id: uid('c'), loader: 'OptiFine', status: 'no', note: 'Conflicts with custom shaders' },
          ],
        }),
        mk('faq', {
          heading: 'FAQ',
          emoji: '❓',
          items: [
            { id: uid('q'), q: 'Can I use Aurora in a modpack?', a: 'Yes — no permission needed. A link back is appreciated.' },
            { id: uid('q'), q: 'Does it work on a server?', a: 'Aurora is client-side only. Servers do not need to install it.' },
            { id: uid('q'), q: 'Will it work with shaders?', a: 'Aurora steps aside when a shader pack is active. Your shader settings are untouched.' },
          ],
        }),
        mk('changelog', {
          heading: 'Changelog',
          emoji: '📜',
          collapsed: true,
          entries: [
            { id: uid('cl'), version: '1.1.0', date: '2025-06-01', changes: ['Added storm palettes', 'Fixed flicker on AMD GPUs', 'Reduced memory use by 18%'] },
            { id: uid('cl'), version: '1.0.0', date: '2025-04-12', changes: ['First stable release'] },
          ],
        }),
        mk('footer', {
          note: 'Made with ♥ by YourName. Aurora is open source under the MIT license.',
          links: [
            { id: uid('l'), label: 'GitHub', url: 'https://github.com/yourname/aurora' },
            { id: uid('l'), label: 'Discord', url: 'https://discord.gg/example' },
            { id: uid('l'), label: 'Report a bug', url: 'https://github.com/yourname/aurora/issues' },
          ],
          showLine: true,
        }),
      ]),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Text first · no clutter',
    description: 'For libraries, utilities and anyone who would rather let the changelog do the talking.',
    accent: '#4d7cff',
    glyph: '○',
    build: () =>
      project('Hollow', 'A tiny, dependency-free event bus for Fabric mods.', '#4d7cff', [
        mk('hero', { title: '', tagline: 'Twelve kilobytes. Zero magic.' }),
        mk('badges'),
        mk('text', {
          heading: 'What is Hollow?',
          emoji: '📘',
          body:
            'Hollow is a 12 kB event bus that stays out of your way. It gives you typed listeners, cancellation and phase ordering without reflection, annotations or mixins.\n\nIt is designed for mods that want a small, predictable API surface — and for developers who are tired of writing the same dispatch loop five times.',
        }),
        mk('features', {
          heading: 'Why use it',
          emoji: '✦',
          layout: 'list',
          items: [
            { id: uid('f'), icon: '🪶', title: 'Tiny', body: 'No dependencies, no runtime reflection, no generated code.' },
            { id: uid('f'), icon: '🔒', title: 'Typed', body: 'Listeners are typed callbacks, so your IDE does the remembering.' },
            { id: uid('f'), icon: '🧱', title: 'Stable', body: 'Semantic versioning, and the public API has not changed since 0.x.' },
          ],
        }),
        mk('install', {
          heading: 'Getting started',
          emoji: '🧭',
          intro: 'Add Hollow to your build and register a listener:',
          steps: [],
          code: `repositories {
    maven { url = "https://maven.example.com/releases" }
}

dependencies {
    modImplementation "dev.yourname:hollow:1.4.0"
}`,
          codeLang: 'groovy',
          outro: 'Full documentation lives on the [wiki](https://github.com/yourname/hollow/wiki).',
        }),
        mk('config', {
          heading: 'API overview',
          emoji: '🧠',
          items: [
            { id: uid('cf'), option: 'EventBus.create()', def: '—', desc: 'Creates an isolated bus. One per mod is usually enough.' },
            { id: uid('cf'), option: 'bus.subscribe(Event.class, listener)', def: '—', desc: 'Registers a typed listener and returns a handle you can close.' },
            { id: uid('cf'), option: 'event.cancel()', def: '—', desc: 'Stops later listeners when the event is cancellable.' },
          ],
        }),
        mk('footer', {
          note: 'Hollow is MIT licensed. Issues and PRs welcome.',
          links: [
            { id: uid('l'), label: 'Source', url: 'https://github.com/yourname/hollow' },
            { id: uid('l'), label: 'Javadoc', url: 'https://javadoc.io/doc/dev.yourname/hollow' },
          ],
          showLine: true,
        }),
      ]),
  },
  {
    id: 'modpack',
    name: 'Modpack',
    tagline: 'Included mods · requirements',
    description: 'Sells the experience, then lists exactly what is inside and what your machine needs.',
    accent: '#f9c846',
    glyph: '▣',
    build: () =>
      project('Skylark', 'A hand-picked 1.21 skyblock adventure for builders and tinkerers.', '#f9c846', [
        mk('hero', { title: '', tagline: 'Start small. End somewhere strange.' }),
        mk('badges', {
          badges: [
            { id: uid('b'), kind: 'modrinth-downloads', label: 'downloads', value: '', color: '1bd96a', logo: 'modrinth', link: '' },
            { id: uid('b'), kind: 'mc-version', label: 'Minecraft', value: '1.21.1', color: '62b47a', logo: 'minecraft', link: '' },
            { id: uid('b'), kind: 'loader', label: 'Loader', value: 'NeoForge', color: 'dbd0b4', logo: '', link: '' },
            { id: uid('b'), kind: 'static', label: 'mods', value: '186', color: 'f9c846', logo: '', link: '' },
          ],
        }),
        mk('text', {
          heading: 'A floating start, a strange endgame',
          emoji: '🏝️',
          body:
            'Skylark is a skyblock pack with a gentle early game and a deliberately weird late game. Automate your first cobblestone generator, then push into Create, Botania and a handful of custom dimensions.\n\nNo quest book to babysit you — just a curated set of mods that respect your time.',
        }),
        mk('features', {
          heading: 'What is inside',
          emoji: '🎒',
          layout: 'grid',
          items: [
            { id: uid('f'), icon: '⚙️', title: 'Automation first', body: 'Create, Mekanism and Applied Energistics, balanced against each other.' },
            { id: uid('f'), icon: '🗺️', title: 'Custom worldgen', body: 'Four hand-built dimensions with their own resources and weather.' },
            { id: uid('f'), icon: '🎨', title: 'Built for builders', body: 'Every decoration mod is included, plus 900 hand-picked building blocks.' },
            { id: uid('f'), icon: '🧘', title: 'No grind walls', body: 'Recipes tuned so progression stays fun past the first weekend.' },
          ],
        }),
        mk('dependencies', {
          heading: 'Included mods',
          emoji: '📚',
          intro: 'A few of the 186 mods you will find inside. The full list ships with the pack.',
          items: [
            { id: uid('d'), name: 'Create', url: 'https://modrinth.com/mod/create', version: '6.0+', required: true, note: 'Core automation' },
            { id: uid('d'), name: 'Mekanism', url: 'https://modrinth.com/mod/mekanism', version: '10.7+', required: true, note: 'Mid-game tech' },
            { id: uid('d'), name: 'Botania', url: 'https://modrinth.com/mod/botania', version: '448+', required: true, note: 'Magic branch' },
            { id: uid('d'), name: 'JourneyMap', url: 'https://modrinth.com/mod/journeymap', version: '5.10+', required: false, note: 'Optional, included by default' },
          ],
        }),
        mk('callout', {
          kind: 'info',
          title: 'Allocate 6 GB of RAM',
          body: 'Skylark needs at least 6 GB allocated to the instance. Below 5 GB you will see stuttering during chunk generation.',
        }),
        mk('install', {
          heading: 'How to play',
          emoji: '🕹️',
          intro: '',
          steps: [
            'Install **Prism Launcher** or the **Modrinth App**.',
            'Search for **Skylark** and install the latest version.',
            'Allocate 6 GB of RAM in the instance settings.',
            'Launch, create a world, and follow the starter island recipe book.',
          ],
          code: '',
          codeLang: 'bash',
          outro: 'Multiplayer is supported — the server pack is published alongside every release.',
        }),
        mk('config', {
          heading: 'System requirements',
          emoji: '🖥️',
          items: [
            { id: uid('cf'), option: 'Memory', def: '6 GB', desc: '8 GB recommended for shaders.' },
            { id: uid('cf'), option: 'Java', def: '21', desc: 'Bundled with all recommended launchers.' },
            { id: uid('cf'), option: 'Storage', def: '4.2 GB', desc: 'Instance size before worlds.' },
          ],
        }),
        mk('faq', {
          heading: 'FAQ',
          emoji: '❓',
          items: [
            { id: uid('q'), q: 'Can I add my own mods?', a: 'Yes. Client-side mods are safe. Check the pack Discord before adding tech mods, since recipes are tuned.' },
            { id: uid('q'), q: 'Is there a server pack?', a: 'Every release ships with a matching server pack on the Versions tab.' },
            { id: uid('q'), q: 'Why does my game crash on launch?', a: 'Almost always memory. Raise the allocation to 6 GB and try again.' },
          ],
        }),
        mk('footer', {
          note: 'Skylark is a community pack. Pack art by Skye.',
          links: [
            { id: uid('l'), label: 'Discord', url: 'https://discord.gg/example' },
            { id: uid('l'), label: 'Issue tracker', url: 'https://github.com/yourname/skylark/issues' },
          ],
          showLine: true,
        }),
      ]),
  },
  {
    id: 'resourcepack',
    name: 'Resource pack',
    tagline: 'Screenshot gallery · credits',
    description: 'Image-led layout for texture packs, shaders and datapacks.',
    accent: '#b47cff',
    glyph: '✿',
    build: () =>
      project('Meadow', 'A soft, painterly 32× texture pack for calm survival worlds.', '#b47cff', [
        mk('hero', { title: '', tagline: 'Hand-painted blocks for calmer worlds.' }),
        mk('badges', {
          badges: [
            { id: uid('b'), kind: 'modrinth-downloads', label: 'downloads', value: '', color: '1bd96a', logo: 'modrinth', link: '' },
            { id: uid('b'), kind: 'mc-version', label: 'Minecraft', value: '1.21.x', color: '62b47a', logo: 'minecraft', link: '' },
            { id: uid('b'), kind: 'static', label: 'resolution', value: '32x', color: 'b47cff', logo: '', link: '' },
            { id: uid('b'), kind: 'license', label: 'license', value: 'CC BY-NC 4.0', color: '4d7cff', logo: '', link: '' },
          ],
        }),
        mk('gallery', {
          heading: 'Gallery',
          emoji: '🌼',
          layout: 'grid',
          columns: 2,
          items: [
            { id: uid('g'), url: '', caption: 'Meadow village at noon' },
            { id: uid('g'), url: '', caption: 'Cave lighting' },
            { id: uid('g'), url: '', caption: 'Nether bricks' },
            { id: uid('g'), url: '', caption: 'Inventory and HUD' },
          ],
        }),
        mk('text', {
          heading: 'About the pack',
          emoji: '🖌️',
          body:
            'Meadow redraws every vanilla block by hand in a soft, painterly style that keeps the original silhouettes readable. Blocks stay recognisable at a glance, which matters more than fidelity when you are building at scale.\n\nIncludes 32× blocks, items, GUI, particles and sky, plus optional add-ons for **Sodium** and **Iris**.',
        }),
        mk('features', {
          heading: 'Details',
          emoji: '✦',
          layout: 'list',
          items: [
            { id: uid('f'), icon: '🖼️', title: '32× hand-painted', body: 'Every texture is drawn from scratch — no upscalers.' },
            { id: uid('f'), icon: '🌗', title: 'Lighting friendly', body: 'Neutral albedo so shaders keep the colours you expect.' },
            { id: uid('f'), icon: '🧩', title: 'Mod support', body: 'Optional patches for Farmers Delight, Create and Biomes O Plenty.' },
          ],
        }),
        mk('install', {
          heading: 'How to install',
          emoji: '🧭',
          intro: '',
          steps: [
            'Download the `.zip` for your Minecraft version — do not unzip it.',
            'Open **Options → Resource Packs → Open Pack Folder**.',
            'Drop the file in, then enable **Meadow** and move it to the top.',
          ],
          code: '',
          codeLang: 'bash',
          outro: 'Using Iris? Enable the matching shader patch from the add-on list.',
        }),
        mk('credits', {
          heading: 'Credits',
          emoji: '💜',
          items: [
            { id: uid('cr'), name: 'YourName', role: 'Textures & direction', url: '' },
            { id: uid('cr'), name: 'Skye', role: 'Additional blocks', url: '' },
            { id: uid('cr'), name: 'Meadow community', role: 'Playtesting', url: '' },
          ],
        }),
        mk('footer', {
          note: 'Meadow is licensed under CC BY-NC 4.0. Please do not reupload.',
          links: [
            { id: uid('l'), label: 'Discord', url: 'https://discord.gg/example' },
            { id: uid('l'), label: 'Support me', url: 'https://ko-fi.com/example' },
          ],
          showLine: true,
        }),
      ]),
  },
]

export function templateById(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}

export function makeStarterProject(): Project {
  const p = TEMPLATES[0].build()
  return p
}
