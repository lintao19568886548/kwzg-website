import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import sharp from 'sharp'

const sourcePath = resolve('assets/raw/certifications/tech-sme-2026-original.jpg')
const coverPath = resolve('public/assets/certifications/tech-sme-2026-cover.webp')
const detailPath = resolve('public/assets/certifications/tech-sme-2026-detail.webp')

const clamp = (value, max) => Math.max(0, Math.min(max, value))

async function createPerspectiveCover() {
  const { data, info } = await sharp(sourcePath)
    .rotate()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const outputWidth = 1500
  const outputHeight = 1000
  const channels = info.channels
  const output = Buffer.alloc(outputWidth * outputHeight * channels)
  const corners = {
    topLeft: [725, 70],
    topRight: [3065, 78],
    bottomRight: [2875, 1605],
    bottomLeft: [885, 1605],
  }

  for (let y = 0; y < outputHeight; y += 1) {
    const v = y / (outputHeight - 1)
    for (let x = 0; x < outputWidth; x += 1) {
      const u = x / (outputWidth - 1)
      const topX = corners.topLeft[0] * (1 - u) + corners.topRight[0] * u
      const topY = corners.topLeft[1] * (1 - u) + corners.topRight[1] * u
      const bottomX = corners.bottomLeft[0] * (1 - u) + corners.bottomRight[0] * u
      const bottomY = corners.bottomLeft[1] * (1 - u) + corners.bottomRight[1] * u
      const sourceX = clamp(topX * (1 - v) + bottomX * v, info.width - 1)
      const sourceY = clamp(topY * (1 - v) + bottomY * v, info.height - 1)
      const x0 = Math.floor(sourceX)
      const y0 = Math.floor(sourceY)
      const x1 = Math.min(x0 + 1, info.width - 1)
      const y1 = Math.min(y0 + 1, info.height - 1)
      const dx = sourceX - x0
      const dy = sourceY - y0

      for (let channel = 0; channel < channels; channel += 1) {
        const p00 = data[(y0 * info.width + x0) * channels + channel]
        const p10 = data[(y0 * info.width + x1) * channels + channel]
        const p01 = data[(y1 * info.width + x0) * channels + channel]
        const p11 = data[(y1 * info.width + x1) * channels + channel]
        const top = p00 * (1 - dx) + p10 * dx
        const bottom = p01 * (1 - dx) + p11 * dx
        output[(y * outputWidth + x) * channels + channel] = Math.round(top * (1 - dy) + bottom * dy)
      }
    }
  }

  await sharp(output, { raw: { width: outputWidth, height: outputHeight, channels } })
    .modulate({ brightness: 1.035, saturation: 0.94 })
    .linear(1.025, -2)
    .sharpen({ sigma: 0.55, m1: 0.55, m2: 1.4 })
    .webp({ quality: 86, smartSubsample: true })
    .toFile(coverPath)
}

async function createDetailImage() {
  await sharp(sourcePath)
    .rotate()
    .extract({ left: 550, top: 0, width: 2850, height: 2992 })
    .resize({ width: 1800, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 1.025, saturation: 0.96 })
    .linear(1.015, -1)
    .sharpen({ sigma: 0.45, m1: 0.45, m2: 1.25 })
    .webp({ quality: 87, smartSubsample: true })
    .toFile(detailPath)
}

await mkdir(dirname(coverPath), { recursive: true })
await Promise.all([createPerspectiveCover(), createDetailImage()])

for (const outputPath of [coverPath, detailPath]) {
  const metadata = await sharp(outputPath).metadata()
  console.log(`${outputPath}: ${metadata.width}x${metadata.height} ${metadata.format}`)
}
