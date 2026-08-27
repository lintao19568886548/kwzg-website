import process from 'node:process'
import { randomUUID } from 'node:crypto'
import knexFactory from 'knex'
import { hash } from '@node-rs/argon2'

function normalizeUsername(value) {
  const username = String(value || '').normalize('NFKC').trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9._-]{2,63}$/.test(username)) throw new Error('管理员账号须为 3-64 位小写字母、数字、点、横线或下划线。')
  return username
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length === 0 || password.length > 128) {
    throw new Error('密码不能为空，且不能超过 128 个字符。')
  }
  return password
}

function question(prompt, { hidden = false } = {}) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin
    const stdout = process.stdout
    let value = ''
    const cleanup = () => {
      stdin.off('data', onData)
      stdin.setRawMode?.(false)
      stdin.pause()
    }
    const onData = (buffer) => {
      const text = buffer.toString('utf8')
      if (text === '\u0003') {
        cleanup()
        stdout.write('\n')
        reject(new Error('操作已取消。'))
        return
      }
      if (text === '\r' || text === '\n') {
        cleanup()
        stdout.write('\n')
        resolve(value)
        return
      }
      if (text === '\u007f' || text === '\b') {
        if (value) {
          value = value.slice(0, -1)
          if (!hidden) stdout.write('\b \b')
        }
        return
      }
      if ([...text].every((character) => {
        const code = character.charCodeAt(0)
        return code > 31 && code !== 127
      })) {
        value += text
        if (!hidden) stdout.write(text)
      }
    }
    stdout.write(prompt)
    stdin.resume()
    stdin.setEncoding(null)
    stdin.setRawMode?.(true)
    stdin.on('data', onData)
  })
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('为防止密码进入终端历史，创建管理员必须在交互式终端中执行。')
  const databaseUrl = process.env.NUXT_DATABASE_URL
  if (!databaseUrl) throw new Error('缺少 NUXT_DATABASE_URL。')
  const parsed = new URL(databaseUrl)
  if (!['mysql:', 'mariadb:'].includes(parsed.protocol) || parsed.username.toLowerCase() === 'root') throw new Error('数据库连接配置不安全。')

  const username = normalizeUsername(await question('管理员账号：'))
  const password = validatePassword(await question('管理员密码（输入不回显）：', { hidden: true }), username)
  const confirmation = await question('再次输入密码（输入不回显）：', { hidden: true })
  if (password !== confirmation) throw new Error('两次输入的密码不一致。')
  const passwordHash = await hash(password, { algorithm: 2, memoryCost: 19456, timeCost: 3, parallelism: 1, outputLen: 32 })
  const db = knexFactory({ client: 'mysql2', connection: databaseUrl })
  const id = randomUUID()
  const now = new Date()
  try {
    await db.transaction(async (trx) => {
      await trx('admin_users').insert({ id, username, password_hash: passwordHash, enabled: true, credential_version: 1, created_at: now, updated_at: now })
      await trx('lead_audit').insert({ lead_id: null, admin_user_id: id, operation_type: 'ADMIN_CREATED', old_status: null, new_status: null, remark_changed: false, before_summary: '', after_summary: `管理员 ${username} 已创建`, note_summary: '', request_id: 'admin-cli', source_ip: null, operated_at: now })
    })
    process.stdout.write(`管理员已创建：${username}（ID: ${id}）\n`)
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') throw new Error('该管理员账号已存在。', { cause: error })
    throw error
  } finally {
    await db.destroy()
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message || '创建管理员失败。'}\n`)
  process.exitCode = 1
})
