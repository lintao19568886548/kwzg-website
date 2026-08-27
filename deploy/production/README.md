# GitHub Actions production deployment

The server only loads and runs prebuilt Linux AMD64 images. It does not receive source code and does not run `npm ci`, `npm run build`, `docker build` or registry pulls.

GitHub Actions builds the website image, pulls the pinned MariaDB image on the runner, packages both with `docker save | gzip`, verifies a SHA-256 checksum and streams the bundle over the pinned SSH connection into `docker load` on the server.

## GitHub configuration

1. Use the reviewed `main` branch and the `production` GitHub environment.
2. Generate a repository-specific Ed25519 deployment key. Add only its restricted public key to `/root/.ssh/authorized_keys`, with the comment `github-actions-kwzg-website`.
3. Store that dedicated private key as `DEPLOY_SSH_KEY`. Do not reuse a personal key or another product's CI key.
4. Verify the server RSA and Ed25519 host fingerprints out of band, then store the exact known-hosts lines as `DEPLOY_KNOWN_HOSTS`.
5. Keep the production environment protected by a required reviewer when the repository plan supports it.

The workflow targets `root@8.155.35.38:22` and `/opt/kwzg-website`. The key is dedicated to this repository so it can be revoked without affecting customer systems.

## One-time server preparation

Install Docker Engine, Docker Compose v2 and `flock`/util-linux. Do not modify `/etc/docker/daemon.json`.

Create `/opt/kwzg-website/.env` from `runtime.env.example`, set mode `600`, and replace every placeholder. On this host, the verified Docker proxy source is `10.202.4.1`, and the website binds only to `127.0.0.1:9000`. MariaDB is attached only to the internal Compose network and never publishes port 3306.

The website owns only these shared-host files:

- `/etc/nginx/conf.d/yizuw-org.conf`
- `/etc/nginx/certs/yizuw-org/yizuw.org.crt`
- `/etc/nginx/certs/yizuw-org/yizuw.org.key`
- `/var/www/acme/.well-known/acme-challenge/`

Never modify `00-default.conf`, `parkwise-tenants.map`, `parkwise-entry.inc`, another site's certificate directory or `/etc/docker/daemon.json`.

## Release behavior

- Builds immutable `kwzg-website:sha-<40 hex characters>` images on GitHub's Linux runner.
- Transfers the application and pinned MariaDB images through SSH and loads them locally; the server never contacts Docker Hub or GHCR.
- Verifies both images exist before touching containers.
- Starts MariaDB and waits for a healthy state.
- Creates a private single-transaction SQL backup before migration.
- Runs exactly one migration container.
- Recreates the application and waits for its readiness health check.
- Serializes deployments with `flock` and keeps preloaded rollback images.
- Installs only `yizuw-org.conf`. The installer restores the previous website config if validation or reload fails.
- Activates Nginx only through `nginx -t && systemctl reload nginx`; it never restarts Nginx.
- Never runs `docker compose down -v`, global prune or edits another site's files.

Nginx activation is skipped until the independent `yizuw.org` certificate and key exist. Certificate issuance uses the repository's HTTP-01 bootstrap config and `/var/www/acme` webroot.

After the first successful deployment, create the administrator interactively:

```bash
cd /opt/kwzg-website
docker compose --env-file .env --env-file .release.env -f docker-compose.prod.yml exec app npm run admin:create
```
