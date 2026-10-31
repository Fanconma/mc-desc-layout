import type { Project } from './types'
import { mdToHtml, projectToMarkdown } from './markdown'

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const PAGE_CSS = `
:root { color-scheme: dark; }
* { box-sizing: border-box; }
body {
  margin: 0; background: #16181c; color: #b0b7c3;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.65; -webkit-font-smoothing: antialiased;
}
.wrap { max-width: 1000px; margin: 0 auto; padding: 48px 24px 96px; }
header.project { display: flex; gap: 20px; align-items: center; padding-bottom: 24px; border-bottom: 1px solid #2a2e36; margin-bottom: 32px; }
.icon { width: 96px; height: 96px; border-radius: 20px; object-fit: cover; background: linear-gradient(135deg, #1bd96a, #4ce3d0); display: grid; place-items: center; color: #0b0d10; font-weight: 800; font-size: 36px; flex: none; }
h1 { margin: 0 0 6px; font-size: 32px; line-height: 1.15; color: #eef2f7; letter-spacing: -0.02em; }
.summary { margin: 0; font-size: 17px; color: #98a2b3; max-width: 62ch; }
.meta { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; font-size: 13px; color: #7c8798; }
.meta span { border: 1px solid #2a2e36; border-radius: 999px; padding: 3px 10px; }
article { font-size: 16px; }
article h2 { color: #eef2f7; font-size: 24px; margin: 44px 0 12px; letter-spacing: -0.01em; }
article h3 { color: #e6eaf0; font-size: 19px; margin: 30px 0 8px; }
article a { color: #1bd96a; text-decoration: none; }
article a:hover { text-decoration: underline; }
article img { max-width: 100%; height: auto; border-radius: 10px; display: inline-block; vertical-align: middle; }
article p > img { display: block; margin: 12px 0; }
article p[style*="text-align: center"], article p[style*="text-align:center"] { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; align-items: center; }
article p[style*="text-align: center"] img, article p[style*="text-align:center"] img { display: inline-block; margin: 0; border-radius: 4px; }
article table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14.5px; border: 1px solid #2a2e36; border-radius: 10px; overflow: hidden; }
article th, article td { padding: 10px 14px; border-bottom: 1px solid #24282f; text-align: left; vertical-align: top; }
article th { background: #1c2026; color: #e6eaf0; font-weight: 600; }
article tr:last-child td { border-bottom: 0; }
article blockquote { margin: 20px 0; padding: 14px 18px; border-left: 3px solid #f9c846; background: #1c2026; border-radius: 0 10px 10px 0; color: #c3cad6; }
article blockquote p { margin: 0; }
article code { background: #1c2026; border: 1px solid #2a2e36; padding: 1px 6px; border-radius: 5px; font-size: 0.9em; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #e6eaf0; }
article pre { background: #101318; border: 1px solid #2a2e36; border-radius: 10px; padding: 16px; overflow: auto; }
article pre code { background: none; border: 0; padding: 0; }
article details { border: 1px solid #2a2e36; background: #1a1d23; border-radius: 10px; padding: 12px 16px; margin: 12px 0; }
article summary { cursor: pointer; color: #e6eaf0; font-weight: 600; }
article summary::marker { color: #1bd96a; }
article hr { border: 0; border-top: 1px solid #2a2e36; margin: 36px 0; }
article ul, article ol { padding-left: 24px; }
article li { margin: 4px 0; }
footer.export { margin-top: 64px; padding-top: 20px; border-top: 1px solid #2a2e36; font-size: 12px; color: #5b6576; }
@media (max-width: 640px) { .wrap { padding: 28px 16px 64px; } header.project { gap: 14px; } .icon { width: 64px; height: 64px; border-radius: 14px; font-size: 24px; } h1 { font-size: 24px; } }
`

export function projectToHtmlPage(project: Project): string {
  const md = projectToMarkdown(project)
  const body = mdToHtml(md)
  const { meta } = project
  const icon = meta.iconUrl
    ? `<img class="icon" src="${esc(meta.iconUrl)}" alt="${esc(meta.name)} icon" />`
    : `<div class="icon" aria-hidden="true">${esc(meta.name.slice(0, 2).toUpperCase())}</div>`
  const chips = [meta.version && `v${meta.version}`, ...meta.loaders, ...meta.mcVersions, meta.license]
    .filter(Boolean)
    .map((c) => `<span>${esc(String(c))}</span>`)
    .join('')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(meta.name)} — description</title>
<style>${PAGE_CSS}</style>
</head>
<body>
<div class="wrap">
  <header class="project">
    ${icon}
    <div>
      <h1>${esc(meta.name)}</h1>
      <p class="summary">${esc(meta.summary)}</p>
      <div class="meta">${chips}</div>
    </div>
  </header>
  <article>
${body}
  </article>
  <footer class="export">Exported from MCDL Studio · ${new Date().toISOString().slice(0, 10)} · ${esc(meta.author || 'unknown author')}</footer>
</div>
</body>
</html>
`
}

export { PAGE_CSS }
