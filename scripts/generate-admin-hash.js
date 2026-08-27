import process from 'node:process'
import readline from 'node:readline'
import { hash } from '@node-rs/argon2'

if (!process.stdin.isTTY || !process.stdin.setRawMode) {
  throw new Error('Run this command in an interactive terminal so the password is not echoed.')
}

readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdout.write('Admin password (input hidden): ')

let password = ''

process.stdin.on('keypress', async (character, key) => {
  if (key?.ctrl && key.name === 'c') {
    process.stdin.setRawMode(false)
    process.exit(130)
  }

  if (key?.name === 'backspace') {
    password = password.slice(0, -1)
    return
  }

  if (key?.name !== 'return') {
    password += character
    return
  }

  process.stdin.setRawMode(false)
  process.stdin.pause()
  process.stdout.write('\n')

  if (password.length === 0 || password.length > 256) {
    password = ''
    throw new Error('Password cannot be empty or exceed 256 characters.')
  }

  const encoded = await hash(password, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  })
  password = ''
  process.stdout.write(`${encoded}\n`)
})
