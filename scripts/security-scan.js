import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { extname } from 'node:path'

function gitFiles(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).split(/\r?\n/).map(path => path.trim()).filter(Boolean)
}

const tracked = gitFiles(['ls-files'])
const listed = gitFiles(['ls-files', '--cached', '--others', '--exclude-standard']).filter(existsSync)
const normalized = path => path.replaceAll('\\', '/')

const forbiddenTracked = tracked.filter((path) => {
  const value = normalized(path)
  const basename = value.split('/').at(-1)
  return (
    (/^\.env(?:\..+)?$/.test(basename) && basename !== '.env.example')
    || /^(?:private-reference|incoming|node_modules|\.nuxt|\.output|\.audit-private|\.audit-backups|\.audit-databases|backups|database-data|mariadb-data)(?:\/|$)/.test(value)
    || /(?:^|\/)(?:.*\.(?:log|sql|dump|bak)|id_rsa|id_ed25519|.*\.pem|.*\.key)$/.test(value)
  )
})
if (forbiddenTracked.length) throw new Error(`Forbidden private, generated, credential or backup files are tracked: ${forbiddenTracked.join(', ')}`)

const textExtensions = new Set(['.js', '.mjs', '.cjs', '.vue', '.css', '.md', '.json', '.yml', '.yaml', '.example', ''])
const secretPatterns = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
  /(?:ghp|github_pat)_[A-Za-z0-9_]{20,}/,
  /(?:mysql|mariadb):\/\/[^\s:$/{]+:[^\s@${}]+@/,
]
const sourceSecretPattern = /(?:password|secret|token|api[_-]?key)\s*[:=]\s*['"][^'"${}\s][^'"]{11,}['"]/i

const findings = []
for (const path of listed) {
  if (!textExtensions.has(extname(path)) || path === '.env.example') continue
  let source
  try {
    source = readFileSync(path, 'utf8')
  } catch {
    continue
  }
  const applicationSource = /^(?:app|server|scripts)\//.test(normalized(path))
  if (secretPatterns.some(pattern => pattern.test(source)) || (applicationSource && sourceSecretPattern.test(source))) findings.push(path)
}
if (findings.length) throw new Error(`Potential secret material found in: ${findings.join(', ')}`)

const applicationSources = listed.filter(path => /^(?:app|server|scripts)\//.test(normalized(path)) && /\.(?:js|mjs|cjs|vue)$/.test(path))
const productionCalls = applicationSources.filter((path) => {
  const source = readFileSync(path, 'utf8')
  return /(?:fetch|\$fetch|axios)[\s\S]{0,120}https:\/\/yizuw\.cn/.test(source)
})
if (productionCalls.length) throw new Error(`Production API connection found in: ${productionCalls.join(', ')}`)

const remoteImages = applicationSources.filter(path => /(?:src|image|qrImage|coverImage|detailImage)\s*[:=][^\n]{0,40}https?:\/\//i.test(readFileSync(path, 'utf8')))
if (remoteImages.length) throw new Error(`Remote public image reference found in: ${remoteImages.join(', ')}`)

const publicFiles = listed.filter(path => /^public\//.test(normalized(path)))
const publicScreenshots = publicFiles.filter(path => /(?:operation-overview|leasing-customer|followup-detail|contract-list|bill-payment|inspection-list|mobile-workbench|menu-full)/i.test(path))
if (publicScreenshots.length) throw new Error(`Production UI screenshot found in public files: ${publicScreenshots.join(', ')}`)

const unsafePublicFiles = publicFiles.filter(path => /(?:^|\/)(?:raw|tmp|temp|uploads?|logs?|database)(?:\/|$)|watermark|do-not-publish|test-qr/i.test(normalized(path)))
if (unsafePublicFiles.length) throw new Error(`Private, temporary or disallowed file found in public: ${unsafePublicFiles.join(', ')}`)

const suspiciousLogging = applicationSources.filter(path => /console\.(?:log|info|debug)\s*\([^\n]*(?:\bbody\b|\bpassword\b|\.phone\b|\bcookie\b|\btoken\b|\bauthorization\b|\bdatabaseUrl\b)/i.test(readFileSync(path, 'utf8')))
if (suspiciousLogging.length) throw new Error(`Potential sensitive logging found in: ${suspiciousLogging.join(', ')}`)

const typeScriptSources = listed.filter(path => /\.(?:ts|tsx|mts|cts)$/.test(path) && !path.endsWith('.d.ts'))
if (typeScriptSources.length) throw new Error(`TypeScript source found: ${typeScriptSources.join(', ')}`)

process.stdout.write(`Security scan passed for ${listed.length} project file(s); ${tracked.length} tracked file(s) checked.\n`)
