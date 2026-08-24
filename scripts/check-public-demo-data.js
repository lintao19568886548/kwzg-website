import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { publicSystemDemoData, publicSystemModuleIds } from '../app/data/public-system-demo-data.js'

const root = process.cwd()
const failures = []
const pass = condition => condition === true
const assert = (condition, message) => { if (!condition) failures.push(message) }
const closeTo = (actual, expected, tolerance = 0.001) => Math.abs(actual - expected) <= tolerance

function collectStrings(value, bucket = []) {
  if (typeof value === 'string') bucket.push(value)
  else if (Array.isArray(value)) value.forEach(item => collectStrings(item, bucket))
  else if (value && typeof value === 'object') Object.values(value).forEach(item => collectStrings(item, bucket))
  return bucket
}
async function listFiles(directory) {
  if (!existsSync(directory)) return []
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(entry => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? listFiles(target) : [target]
  }))
  return nested.flat()
}

const demo = publicSystemDemoData
assert(publicSystemModuleIds.length === 9, 'system module count is not 9')
assert(demo.overview.leasedArea + demo.overview.vacantArea === demo.overview.rentableArea, 'park area formula failed')
assert(closeTo((demo.overview.leasedArea / demo.overview.rentableArea) * 100, demo.overview.occupancyRate), 'occupancy formula failed')
assert(closeTo(demo.overview.received + demo.overview.outstanding, demo.overview.receivable), 'receivable formula failed')
assert(closeTo((demo.overview.received / demo.overview.receivable) * 100, demo.overview.collectionRate, 0.05), 'collection formula failed')

const buildingTotals = demo.buildings.reduce((total, building) => ({
  rentable: total.rentable + building.rentableArea,
  leased: total.leased + building.leasedArea,
  vacant: total.vacant + building.vacantArea,
}), { rentable: 0, leased: 0, vacant: 0 })
assert(buildingTotals.rentable === demo.overview.rentableArea, 'building rentable area formula failed')
assert(buildingTotals.leased === demo.overview.leasedArea, 'building leased area formula failed')
assert(buildingTotals.vacant === demo.overview.vacantArea, 'building vacant area formula failed')

const billTotals = demo.finance.bills.reduce((total, bill) => ({
  receivable: total.receivable + bill.receivable,
  received: total.received + bill.received,
  outstanding: total.outstanding + bill.outstanding,
}), { receivable: 0, received: 0, outstanding: 0 })
assert(closeTo(billTotals.receivable, demo.overview.receivable), 'bill receivable total failed')
assert(closeTo(billTotals.received, demo.overview.received), 'bill received total failed')
assert(closeTo(billTotals.outstanding, demo.overview.outstanding), 'bill outstanding total failed')
for (const bill of demo.finance.bills) assert(closeTo(bill.received + bill.outstanding, bill.receivable), `bill formula failed: ${bill.billCode}`)

const leased = demo.leasing.find(record => record.id === 'leased')
assert(demo.finance.bills.some(bill => bill.contractCode === leased.contractCode && bill.tenant === leased.tenant), 'lease-contract-bill linkage failed')
assert(demo.access.employeeRecord.tenant === leased.tenant, 'lease-access linkage failed')
assert(demo.maintenance.order.propertyCode === leased.propertyCode, 'lease-maintenance property linkage failed')
assert(demo.investment.lead.signed === false, 'investment lead must remain unsigned')

const submitted = Date.parse(demo.maintenance.order.submittedAt.replace(' ', 'T'))
const responded = Date.parse(demo.maintenance.order.respondedAt.replace(' ', 'T'))
const planned = Date.parse(demo.maintenance.order.plannedCompletion.replace(' ', 'T'))
assert(submitted < responded && responded < planned, 'maintenance timeline failed')

const demoText = collectStrings(demo).join('\n')
const privacyPatterns = [
  ['11-digit phone', /(?<!\*)1[3-9]\d{9}(?!\d)/],
  ['identity number', /\b\d{17}[\dXx]\b/],
  ['bank account', /\b(?:\d[ -]?){16,19}\b/],
  ['email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ['IP address', /\b(?:\d{1,3}\.){3}\d{1,3}\b/],
  ['MAC address', /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/],
  ['full license plate', /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-Z][· ]?[A-Z0-9]{5}/],
]
for (const [name, pattern] of privacyPatterns) assert(!pattern.test(demoText), `${name} found in demo data`)
assert(!demoText.includes('yizuw.cn'), 'production system URL found in demo data')

const publicShowcaseDir = path.join(root, 'public', 'assets', 'system-showcase')
const publicShowcaseFiles = await listFiles(publicShowcaseDir)
assert(publicShowcaseFiles.length === 0, `public system screenshot files remain: ${publicShowcaseFiles.length}`)

const homeSourceFiles = await listFiles(path.join(root, 'app', 'components', 'home'))
const homeSources = (await Promise.all(homeSourceFiles.filter(file => /\.(vue|js)$/.test(file)).map(file => readFile(file, 'utf8')))).join('\n')
assert(!/(?:\$fetch|fetch|axios)[\s\S]{0,120}yizuw\.cn/i.test(homeSources), 'runtime production request found in homepage source')
assert(!homeSources.includes('/assets/system-showcase/'), 'legacy screenshot reference found in homepage source')

const trackedPrivate = execFileSync('git', ['ls-files', 'private-reference'], { cwd: root, encoding: 'utf8' }).trim()
assert(trackedPrivate === '', 'private-reference contains tracked files')
const ignoreRules = await readFile(path.join(root, '.gitignore'), 'utf8')
assert(ignoreRules.split(/\r?\n/).includes('private-reference/'), 'private-reference ignore rule missing')

if (failures.length) {
  console.error(failures.map(message => `FAIL\t${message}`).join('\n'))
  process.exitCode = 1
} else {
  console.log(`PASS\tPUBLIC_DEMO_DATA\tmodules=${publicSystemModuleIds.length}`)
  console.log('PASS\tAREA_FORMULA')
  console.log('PASS\tRECEIVABLE_FORMULA')
  console.log('PASS\tSTATUS_TIMELINE')
  console.log('PASS\tREGEX_PRIVACY_SCAN')
  console.log(`PASS\tOCR_PRIVACY_SCAN\tsystem-showcase-images=${publicShowcaseFiles.length} (Vue/CSS only)`)
  console.log(`PASS\tTRACKED_PRIVATE_FILES\t${pass(trackedPrivate === '') ? 0 : 1}`)
  console.log('PASS\tYIZUW_CN_RUNTIME_REQUESTS\t0')
}
