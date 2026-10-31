# MCDL Studio

**A local-first description builder for Minecraft mods, modpacks, resource packs and shaders.**

Modrinth and CurseForge let you write long descriptions in Markdown — and most project pages end up as a wall of text. MCDL Studio turns that into a visual composer: pick blocks, fill in a form, watch a pixel-accurate Modrinth-style preview, run a publish check, then copy clean Markdown.

No account, no server, no lock-in. Everything runs in your browser and is saved to `localStorage`.

---

## Features

### Block composer
Sixteen building blocks, each with a real form instead of raw markup:

`Hero` · `Badge strip` · `Text section` · `Feature list` · `Gallery` · `Callout` · `Dependencies` · `Installation` · `Compatibility` · `Config table` · `Changelog` · `FAQ` · `Credits` · `Footer links` · `Divider` · `Raw markdown`

Drag to reorder, duplicate, delete with undo, or drop straight to raw Markdown when you need complete control.

### Live platform preview
The preview is the **actual generated Markdown** rendered inside a Modrinth-style project page — header, tabs, details sidebar and all. Switch between **Modrinth dark**, **Modrinth light** and **CurseForge**, and toggle a 400 px mobile viewport. Drag the divider to resize it.

### Shield.io badge builder
Live Modrinth download / version / follower / game-version badges, CurseForge downloads, GitHub stars, plus static loader, license and Discord badges. Alt text is generated for you, and every badge is linkable.

### Publish check
A linter built on Modrinth's content rules:

- missing image alt text (a common rejection reason)
- relative links and images that cannot resolve on a project page
- `#` H1 headings, oversized headings, duplicate sections
- unsupported HTML tags and inline CSS that the sanitizer strips
- iframes that are not YouTube / Discord
- empty link targets, unclosed code fences, 8+ badges
- CurseForge-specific warnings for `<details>`, `<kbd>` and tables

Each issue explains why it matters and how to fix it, and can jump you to the offending block.

### Banner studio
Draw a 1280×400 (or larger) header image in the browser: gradient palettes, pixel/grid/orb patterns, your project icon, and a version chip. Download the PNG, host it, paste the URL into the Hero block.

### Export
- **Markdown** — copy or download `.md`
- **Styled HTML page** — a standalone, responsive page for itch.io, GitHub Pages or your own site
- **Project file** — JSON backup you can re-import anywhere
- **Raw editor** — paste an existing description and keep editing it

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

Requires Node 18+.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘/Ctrl + K` | Add block |
| `⌘/Ctrl + S` | Copy generated Markdown |
| `⌘/Ctrl + E` | Open export panel |
| `Esc` | Close dialog |

---

## How the Markdown maps to the platforms

Modrinth renders GitHub-Flavored Markdown and a broad subset of HTML; CurseForge supports Markdown with narrower HTML handling. MCDL only emits things both platforms accept:

| Block | Output |
| --- | --- |
| Feature list | 2-column `<table>` with inline HTML cells, or a Markdown bullet list |
| FAQ / Changelog | `<details><summary>` accordions (blank lines kept so Markdown parses inside) |
| Callout | Blockquote with an emoji label |
| Dependencies / Compatibility / Config | Markdown tables |
| Badges | `<p style="text-align:center">` with linked `<img>` badges |
| Installation | Numbered list + fenced code block |
| Gallery | Markdown images with captions, or a 2-column `<img>` table |

Notes:
- Every image gets alt text, because Modrinth can reject pages without it.
- Modrinth only keeps `text-align`, `float` and `image-rendering` inline CSS — the check panel flags anything else.
- `<details>` and tables may be flattened by the CurseForge editor, so you get a warning when targeting CurseForge.

## Project structure

```
src/
  App.tsx                  layout, state, autosave, shortcuts
  lib/
    types.ts               block + project data model
    defaults.ts            block factories and starter project
    markdown.ts            block → Markdown/HTML generators
    badges.ts              shields.io URL builder
    templates.ts           four complete starter layouts
    lint.ts                publish checks
    exporters.ts           standalone HTML export
    storage.ts             localStorage, download, clipboard
  components/
    Canvas.tsx             sortable block list
    Preview.tsx            Modrinth/CurseForge page preview
    LibraryPanel.tsx       block library + search
    TemplatesPanel.tsx     template picker
    SettingsPanel.tsx      project metadata
    CheckPanel.tsx         publish check results
    ExportPanel.tsx        copy / download / import
    BannerStudio.tsx       canvas banner generator
    MarkdownPanel.tsx      generated Markdown viewer / raw editor
    editors/BlockEditor.tsx  per-block forms
```

Built with React 18, TypeScript, Vite, Tailwind CSS, `marked`, `dompurify` and `dnd-kit`.

## 中文简介

MCDL Studio 是一款给 Minecraft 开发者用的**简介排版工具**，专门为 Modrinth / CurseForge 的项目描述页设计：

1. 用「区块」拼装简介：头图、徽章、特性卡片、依赖表、安装步骤、兼容性、更新日志、FAQ、鸣谢、页脚链接等，全部是表单填写，不用背 Markdown。
2. 右侧实时预览真实的 Modrinth 页面效果，可切换深浅色、CurseForge 以及手机宽度，还能拖动分隔条调整大小。
3. 「发布检查」会按 Modrinth 内容规范挑出问题：图片缺少 alt、相对路径链接、不支持的 HTML、标题太长、CurseForge 不兼容的标签等，并直接跳到对应区块。
4. 内置头图生成器，直接导出 PNG 当作项目横幅。
5. 一键复制 Markdown、导出独立 HTML 页面，或保存 `.json` 工程文件。所有数据只存在浏览器本地。

---

## License

MIT — see [LICENSE](LICENSE).
