import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { extname } from 'node:path'
import process from 'node:process'

const listed = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .map(path => path.trim())
  .filter(path => path && existsSync(path))

const privateTracked = execFileSync('git', ['ls-files', 'private-reference', 'incoming'], { encoding: 'utf8' }).trim()
if (privateTracked) throw new Error('Private reference or incoming files are tracked by Git.')

const textExtensions = new Set(['.js', '.vue', '.css', '.md', '.json', '.yml', '.yaml', '.example', ''])
const secretPatterns = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
  /(?:ghp|github_pat)_[A-Za-z0-9_]{20,}/,
  /(?:mysql|mariadb):\/\/[^\s:$/{]+:[^\s@${}]+@/,
]

const findings = []
for (const path of listed) {
  if (!textExtensions.has(extname(path)) || path === '.env.example') continue
  let text
  try {
    text = readFileSync(path, 'utf8')
  } catch {
    continue
  }
  if (secretPatterns.some(pattern => pattern.test(text))) findings.push(path)
}

if (findings.length) throw new Error(`Potential secret material found in: ${findings.join(', ')}`)

const productionCalls = listed.filter(path => /\.(?:js|vue)$/.test(path)).filter((path) => {
  const text = readFileSync(path, 'utf8')
  return /(?:fetch|\$fetch|axios)[\s\S]{0,80}https:\/\/yizuw\.cn/.test(text)
})
if (productionCalls.length) throw new Error(`Production API connection found in: ${productionCalls.join(', ')}`)

const publicScreenshots = listed.filter(path => /^public\//.test(path) && /(?:operation-overview|leasing-customer|followup-detail|contract-list|bill-payment|inspection-list|mobile-workbench|menu-full)/i.test(path))
if (publicScreenshots.length) throw new Error(`Production UI screenshot found in public files: ${publicScreenshots.join(', ')}`)

const typeScriptSources = listed.filter(path => /\.(?:ts|tsx)$/.test(path) && !path.endsWith('.d.ts'))
if (typeScriptSources.length) throw new Error(`TypeScript source found: ${typeScriptSources.join(', ')}`)

process.stdout.write(`Security scan passed for ${listed.length} project file(s).\n`)
