import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const source = path => readFile(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('production readiness configuration', () => {
  it('separates migrations from replicated application startup', async () => {
    const packageJson = JSON.parse(await source('package.json'))
    const compose = await source('compose.production.yml')
    const migrate = await source('scripts/migrate.js')
    expect(packageJson.scripts.start).not.toContain('migrate')
    expect(compose).toMatch(/migrate:[\s\S]*npm["', ]+run["', ]+db:migrate/)
    expect(compose).toMatch(/app:[\s\S]*condition: service_completed_successfully/)
    expect(migrate).toContain('GET_LOCK')
    expect(migrate).toContain('RELEASE_LOCK')
  })

  it('keeps database private and runs the application image as non-root', async () => {
    const dockerfile = await source('Dockerfile')
    const compose = await source('compose.production.yml')
    expect(dockerfile).toMatch(/FROM node:22\.22\.2-bookworm-slim/)
    expect(dockerfile).toContain('USER node')
    expect(dockerfile).toContain('STOPSIGNAL SIGTERM')
    expect(dockerfile).toContain('HEALTHCHECK')
    expect(dockerfile).toContain('ARG NUXT_PUBLIC_SITE_URL=https://yizuw.org')
    expect(dockerfile).toContain('ARG NUXT_PUBLIC_INDEXABLE=false')
    expect(dockerfile).toContain('ARG NUXT_ENABLE_HSTS=false')
    const databaseBlock = compose.slice(compose.indexOf('  db:'), compose.indexOf('  migrate:'))
    expect(databaseBlock).not.toMatch(/ports:/)
    expect(compose).toMatch(/database:\s*\r?\n\s*internal: true/)
    expect(compose).not.toContain(':latest')
  })

  it('prepares canonical HTTPS proxy, cache and no-store boundaries', async () => {
    const nginx = await source('deploy/nginx/yizuw.org.conf.example')
    expect(nginx).toContain('return 301 https://yizuw.org$request_uri')
    expect(nginx).toContain('ssl_protocols TLSv1.2 TLSv1.3')
    expect(nginx).toContain('server_tokens off')
    expect(nginx).toContain('server 127.0.0.1:9000')
    expect(nginx).toContain('/etc/nginx/certs/yizuw-org/yizuw.org.crt')
    expect(nginx).toContain('/etc/nginx/certs/yizuw-org/yizuw.org.key')
    expect(nginx).toContain('Cache-Control "no-store"')
    expect(nginx).toContain('client_max_body_size 1m')
    expect(nginx).not.toMatch(/proxy_pass\s+https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/)
    expect(nginx).not.toContain('default_server')
    expect(nginx).not.toContain('server_name _')
  })

  it('builds on CI, streams pinned images and reloads only the website Nginx config', async () => {
    const workflow = await source('.github/workflows/ci-deploy.yml')
    const compose = await source('docker-compose.prod.yml')
    const deploy = await source('deploy/production/deploy.sh')
    const nginxInstaller = await source('deploy/production/install-nginx.sh')
    expect(workflow).toContain('docker save "$APP_IMAGE:sha-$GITHUB_SHA" "$DB_IMAGE" | gzip -1')
    expect(workflow).toContain('gzip -dc .deploy-artifact/deployment-images.tar.gz')
    expect(workflow).toContain('"docker load"')
    expect(workflow).not.toContain('docker login')
    expect(compose).toMatch(/db:[\s\S]*pull_policy: never/)
    expect(compose).toContain('127.0.0.1:${KWZG_APP_PORT:-9000}:3000')
    expect(deploy).not.toContain('docker pull')
    expect(deploy).toContain('docker image inspect mariadb:11.4.5')
    expect(nginxInstaller).toContain('TARGET_CONFIG=/etc/nginx/conf.d/yizuw-org.conf')
    expect(nginxInstaller).toContain('nginx -t && systemctl reload nginx')
    expect(nginxInstaller).not.toContain('systemctl restart nginx')
  })

  it('keeps audit, backup, database and private files ignored', async () => {
    const gitignore = await source('.gitignore')
    const dockerignore = await source('.dockerignore')
    for (const entry of ['private-reference/', 'incoming/', '*.log', 'backups/', 'database-data/', '*.sql']) expect(gitignore).toContain(entry)
    for (const entry of ['private-reference', 'incoming', 'assets/raw', 'backups', 'database-data', '*.log']) expect(dockerignore).toContain(entry)
  })

  it('keeps the admin drawer keyboard-contained and privacy contact complete', async () => {
    const admin = await source('app/pages/admin/leads.vue')
    const privacy = await source('app/pages/privacy.vue')
    expect(admin).toContain("event.key === 'Escape'")
    expect(admin).toContain("event.key !== 'Tab'")
    expect(admin).toContain('drawerCloseButton.value?.focus()')
    expect(admin).toContain('drawerTrigger?.focus()')
    expect(privacy).toContain('siteConfig.company.legalName')
    expect(privacy).toContain('siteConfig.contact.address')
  })

  it('keeps sitemap limited to public marketing routes and robots controlled by the index switch', async () => {
    const sitemap = await source('server/routes/sitemap.xml.get.js')
    const robots = await source('server/routes/robots.txt.get.js')
    expect((sitemap.match(/^ {2}'\//gm) || [])).toHaveLength(13)
    expect(sitemap).not.toMatch(/'\/call'|'\/admin|'\/api/)
    expect(robots).toContain('config.public.indexable')
    expect(robots).toContain('Disallow: /admin/')
    expect(robots).toContain('Disallow: /call')
  })

  it('uses a placeholder-only production environment template', async () => {
    const environment = await source('.env.example')
    expect(environment).toContain('NUXT_PUBLIC_SITE_URL=https://yizuw.org')
    expect(environment).toContain('NUXT_TRUSTED_ORIGINS=https://yizuw.org,https://www.yizuw.org')
    expect(environment).toContain('NUXT_PUBLIC_INDEXABLE=false')
    expect(environment).toContain('replace-with-')
    expect(environment).not.toMatch(/\$argon2id\$v=/)
  })
})
