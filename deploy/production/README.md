# GitHub Actions production deployment

The server only pulls and runs a prebuilt Linux image. It does not receive source code and does not run `npm ci`, `npm run build` or `docker build`.

This deployment does not copy, modify, reload, restart or otherwise operate Nginx, TLS certificates or DNS. The existing Nginx service remains under separate manual control.

## GitHub configuration

1. Create a GitHub repository and push the reviewed `main` branch.
2. Create an environment named `production`; enable a required reviewer when the repository plan supports it.
3. Add the entire private key from `zhoumaosen.pem` as the environment secret `DEPLOY_SSH_KEY`. Never add the PEM file to Git.
4. From a trusted server console, obtain and verify the SSH host public-key fingerprint. Store the complete verified known-hosts line as the environment secret `DEPLOY_KNOWN_HOSTS`.
5. Keep package workflow permissions enabled so `GITHUB_TOKEN` can publish and temporarily pull the repository's GHCR package.

The workflow targets `root@8.155.35.38:22` and `/opt/kwzg-website`. Replace root with a dedicated deployment account after the first controlled deployment.

## One-time server preparation

Install Docker Engine, Docker Compose v2 and `flock`/util-linux. Create `/opt/kwzg-website/.env` from `runtime.env.example`, set mode `600`, and replace every placeholder. `NUXT_TRUSTED_PROXY_ADDRESSES` must be the verified direct address from which the existing Nginx reaches the application container.

The application continues to bind only to `127.0.0.1:3212`; the existing Nginx configuration is not touched. MariaDB is only attached to the internal Compose network and has no published port.

## Release behavior

- Pulls an immutable `sha-<40 hex characters>` image from GHCR.
- Starts MariaDB and waits for a healthy state.
- Creates a private single-transaction SQL backup before migration.
- Runs exactly one migration container.
- Recreates the application and waits for its readiness health check.
- Serializes deployments with `flock`.
- Keeps/restores the previous application image when the new app fails health checks. A schema migration is not automatically rolled back and must be reviewed before retrying.
- Never runs `docker compose down -v`, global prune, Nginx commands, DNS changes or certificate operations.

After the first successful deployment, create the administrator interactively:

```bash
cd /opt/kwzg-website
docker compose --env-file .env --env-file .release.env -f docker-compose.prod.yml exec app npm run admin:create
```
