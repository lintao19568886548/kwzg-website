import process from 'node:process'
import knexFactory from 'knex'
import { hashAdminPassword, normalizeAdminUsername, validateAdminPassword, verifyAdminPassword } from '../server/utils/admin-credentials.js'

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
      if ([...text].every(character => character.charCodeAt(0) > 31 && character.charCodeAt(0) !== 127)) {
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
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('为防止密码进入终端历史，密码重置必须在交互式终端中执行。')
  const databaseUrl = process.env.NUXT_DATABASE_URL
  if (!databaseUrl) throw new Error('缺少 NUXT_DATABASE_URL。')
  const parsed = new URL(databaseUrl)
  if (!['mysql:', 'mariadb:'].includes(parsed.protocol) || parsed.username.toLowerCase() === 'root') throw new Error('数据库连接配置不安全。')

  let username
  try {
    username = normalizeAdminUsername(await question('需要重置密码的管理员账号：'))
  } catch (error) {
    throw new Error(error.message || '管理员账号格式不正确。', { cause: error })
  }
  let newPassword
  try {
    newPassword = validateAdminPassword(await question('新密码（输入不回显）：', { hidden: true }), username)
  } catch (error) {
    throw new Error(error.message || '新密码不符合要求。', { cause: error })
  }
  const confirmation = await question('再次输入新密码（输入不回显）：', { hidden: true })
  if (newPassword !== confirmation) throw new Error('两次输入的新密码不一致。')

  const db = knexFactory({ client: 'mysql2', connection: databaseUrl })
  const now = new Date()
  try {
    const admin = await db('admin_users').whereRaw('LOWER(username) = ?', [username]).first()
    if (!admin) throw new Error('未找到该管理员账号。')
    if (!admin.enabled) throw new Error('该管理员已被禁用，不能重置密码。')
    if (await verifyAdminPassword(admin.password_hash, newPassword)) throw new Error('新密码不能与当前密码相同。')
    const passwordHash = await hashAdminPassword(newPassword)
    await db.transaction(async (trx) => {
      const locked = await trx('admin_users').where({ id: admin.id }).forUpdate().first()
      if (!locked || !locked.enabled) throw new Error('管理员账号状态已变化，操作已取消。')
      await trx('admin_users').where({ id: locked.id }).update({ password_hash: passwordHash, credential_version: locked.credential_version + 1, updated_at: now })
      await trx('admin_sessions').where({ admin_user_id: locked.id }).whereNull('revoked_at').update({ revoked_at: now })
      await trx('lead_audit').insert({ lead_id: null, admin_user_id: locked.id, operation_type: 'ADMIN_PASSWORD_RESET', old_status: null, new_status: null, remark_changed: false, before_summary: '', after_summary: '管理员密码已通过本地CLI重置，全部会话已撤销', note_summary: '', request_id: 'admin-reset-cli', source_ip: null, operated_at: now })
    })
    process.stdout.write(`管理员密码已重置：${username}\n`)
  } finally {
    await db.destroy()
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message || '管理员密码重置失败。'}\n`)
  process.exitCode = 1
})
