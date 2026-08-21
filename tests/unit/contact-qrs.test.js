import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import { describe, expect, it } from 'vitest'
import { siteConfig } from '~/config/site'

const projectRoot = resolve(import.meta.dirname, '../..')
const phoneQrPath = resolve(projectRoot, 'public/assets/contact/kwzg-phone-call-qr.png')
const wecomQrPath = resolve(projectRoot, 'public/assets/wecom-qrcode/kwzg-wecom-qr.png')

async function loadPng(path) {
  return PNG.sync.read(await readFile(path))
}

function resizeNearest(source, width, height) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    const sourceY = Math.min(source.height - 1, Math.floor(y * source.height / height))
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(source.width - 1, Math.floor(x * source.width / width))
      const sourceOffset = (sourceY * source.width + sourceX) * 4
      const targetOffset = (y * width + x) * 4
      data[targetOffset] = source.data[sourceOffset]
      data[targetOffset + 1] = source.data[sourceOffset + 1]
      data[targetOffset + 2] = source.data[sourceOffset + 2]
      data[targetOffset + 3] = source.data[sourceOffset + 3]
    }
  }
  return { data, width, height }
}

function decode(image) {
  return jsQR(new Uint8ClampedArray(image.data), image.width, image.height, {
    inversionAttempts: 'attemptBoth',
  })?.data
}

function pngChunkTypes(buffer) {
  const chunks = []
  let offset = 8
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset)
    chunks.push(buffer.toString('ascii', offset + 4, offset + 8))
    offset += length + 12
  }
  return chunks
}

describe('contact QR assets', () => {
  it('recognizes the verified WeCom QR asset', async () => {
    const image = await loadPng(wecomQrPath)
    expect(decode(image)).toBeTruthy()
  })

  it('encodes the public HTTPS call page in the original PNG', async () => {
    const image = await loadPng(phoneQrPath)
    expect(image.width).toBe(512)
    expect(image.height).toBe(512)
    expect(decode(image)).toBe(siteConfig.contact.callUrl)
    expect(decode(resizeNearest(image, 168, 168))).toBe(siteConfig.contact.callUrl)
  })

  it('keeps the HTTPS destination and telephone fallback in shared configuration', async () => {
    const callPage = await readFile(resolve(projectRoot, 'app/pages/call.vue'), 'utf8')
    const destination = new URL(siteConfig.contact.callUrl)
    expect(siteConfig.contact.callUrl).toBe(new URL(siteConfig.contact.callPage, siteConfig.siteUrl).toString())
    expect(destination.protocol).toBe('https:')
    expect(destination.search).toBe('')
    expect(destination.hash).toBe('')
    expect(siteConfig.contact.phoneHref).toBe(`tel:${siteConfig.contact.phone}`)
    expect(siteConfig.contact.phoneQr).toBe('/assets/contact/kwzg-phone-call-qr.png')
    expect(callPage).toContain(':href="siteConfig.contact.phoneHref"')
    expect(callPage).toContain('立即拨打')
  })

  it.each([160, 128])('remains recognizable when resized to %d pixels', async (size) => {
    const image = await loadPng(phoneQrPath)
    expect(decode(resizeNearest(image, size, size))).toBe(siteConfig.contact.callUrl)
  })

  it('contains no text or EXIF metadata chunks', async () => {
    const chunks = pngChunkTypes(await readFile(phoneQrPath))
    expect(chunks).not.toContain('eXIf')
    expect(chunks).not.toContain('tEXt')
    expect(chunks).not.toContain('iTXt')
    expect(chunks).not.toContain('zTXt')
  })
})
