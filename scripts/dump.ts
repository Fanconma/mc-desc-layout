import { TEMPLATES } from '../src/lib/templates'
import { projectToMarkdown } from '../src/lib/markdown'
import { lintProject, lintScore } from '../src/lib/lint'

for (const t of TEMPLATES) {
  const p = t.build()
  const md = projectToMarkdown(p)
  console.log('\n\n================ ' + t.name + ' ================')
  console.log(md)
  const issues = lintProject(p, 'modrinth')
  console.log('--- score', lintScore(issues), JSON.stringify(issues.map(i => [i.level, i.title])))
}
