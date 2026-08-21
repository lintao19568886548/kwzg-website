import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import { siteConfig } from '../app/config/site.js'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(projectRoot, 'public/assets/contact/kwzg-phone-call-qr.png')

await mkdir(dirname(outputPath), { recursive: true })
await QRCode.toFile(outputPath, siteConfig.contact.callUrl, {
  type: 'png',
  width: 512,
  margin: 4,
  errorCorrectionLevel: 'M',
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
})

console.log(`Generated public/assets/contact/kwzg-phone-call-qr.png -> ${siteConfig.contact.callUrl}`)
