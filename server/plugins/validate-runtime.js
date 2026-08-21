import { closeDatabase } from '../utils/database.js'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('close', async () => {
    await closeDatabase()
  })
})
