#!/usr/bin/env bash
set -Eeuo pipefail

IMAGE_REPOSITORY=${1:-}
IMAGE_TAG=${2:-}
APP_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"
RUNTIME_ENV="$APP_DIR/.env"
RELEASE_ENV="$APP_DIR/.release.env"
PREVIOUS_RELEASE_ENV="$APP_DIR/.previous-release.env"
BACKUP_DIR="$APP_DIR/backups"

if [[ ! "$IMAGE_REPOSITORY" =~ ^ghcr\.io/[a-z0-9._/-]+$ ]]; then
  echo "Invalid GHCR image repository." >&2
  exit 2
fi
if [[ ! "$IMAGE_TAG" =~ ^sha-[0-9a-f]{40}$ ]]; then
  echo "Invalid immutable image tag." >&2
  exit 2
fi
if [[ ! -s "$COMPOSE_FILE" || ! -s "$RUNTIME_ENV" ]]; then
  echo "Production compose file or runtime .env is missing." >&2
  exit 2
fi

command -v docker >/dev/null
docker compose version >/dev/null
command -v flock >/dev/null

umask 077
mkdir -p "$BACKUP_DIR"
chmod 700 "$APP_DIR" "$BACKUP_DIR"
exec 9>"$APP_DIR/.deploy.lock"
if ! flock -n 9; then
  echo "Another production deployment is already running." >&2
  exit 3
fi

if [[ -s "$RELEASE_ENV" ]]; then
  cp "$RELEASE_ENV" "$PREVIOUS_RELEASE_ENV"
else
  rm -f "$PREVIOUS_RELEASE_ENV"
fi

release_tmp=$(mktemp "$APP_DIR/.release.env.XXXXXX")
printf 'KWZG_IMAGE=%s\nKWZG_IMAGE_TAG=%s\n' "$IMAGE_REPOSITORY" "$IMAGE_TAG" > "$release_tmp"
mv "$release_tmp" "$RELEASE_ENV"

compose=(docker compose --env-file "$RUNTIME_ENV" --env-file "$RELEASE_ENV" -f "$COMPOSE_FILE")
app_switched=0

restore_previous_release() {
  local exit_code=$?
  trap - ERR
  if [[ -s "$PREVIOUS_RELEASE_ENV" ]]; then
    cp "$PREVIOUS_RELEASE_ENV" "$RELEASE_ENV"
    if (( app_switched == 1 )); then
      local previous_image previous_tag
      previous_image=$(sed -n 's/^KWZG_IMAGE=//p' "$RELEASE_ENV")
      previous_tag=$(sed -n 's/^KWZG_IMAGE_TAG=//p' "$RELEASE_ENV")
      if [[ -n "$previous_image" && -n "$previous_tag" ]]; then
        docker pull "$previous_image:$previous_tag" || true
        compose=(docker compose --env-file "$RUNTIME_ENV" --env-file "$RELEASE_ENV" -f "$COMPOSE_FILE")
        "${compose[@]}" up -d --no-deps --force-recreate app || true
      fi
    fi
  else
    if (( app_switched == 1 )); then
      "${compose[@]}" stop app || true
    fi
    rm -f "$RELEASE_ENV"
  fi
  echo "Deployment failed; the previous application image was retained or restored. Review migration state before retrying." >&2
  exit "$exit_code"
}
trap restore_previous_release ERR

echo "Pulling immutable image $IMAGE_REPOSITORY:$IMAGE_TAG"
docker pull "$IMAGE_REPOSITORY:$IMAGE_TAG"

"${compose[@]}" up -d db
db_id=$("${compose[@]}" ps -q db)
for _ in $(seq 1 60); do
  if [[ "$(docker inspect --format '{{.State.Health.Status}}' "$db_id" 2>/dev/null || true)" == "healthy" ]]; then break; fi
  sleep 2
done
if [[ "$(docker inspect --format '{{.State.Health.Status}}' "$db_id")" != "healthy" ]]; then
  echo "MariaDB did not become healthy." >&2
  exit 4
fi

backup_file="$BACKUP_DIR/kwzg-before-${IMAGE_TAG}-$(date -u +%Y%m%dT%H%M%SZ).sql"
if ! "${compose[@]}" exec -T db sh -c 'exec mariadb-dump --user=root --password="$MARIADB_ROOT_PASSWORD" --single-transaction --quick --routines --triggers --events --default-character-set=utf8mb4 "$MARIADB_DATABASE"' > "$backup_file"; then
  rm -f "$backup_file"
  echo "Database backup failed; deployment stopped before migration." >&2
  exit 5
fi
chmod 600 "$backup_file"

"${compose[@]}" up --no-deps --force-recreate migrate
"${compose[@]}" up -d --no-deps --force-recreate app
app_switched=1

app_id=$("${compose[@]}" ps -q app)
for _ in $(seq 1 60); do
  if [[ "$(docker inspect --format '{{.State.Health.Status}}' "$app_id" 2>/dev/null || true)" == "healthy" ]]; then break; fi
  sleep 2
done
if [[ "$(docker inspect --format '{{.State.Health.Status}}' "$app_id")" != "healthy" ]]; then
  echo "Application did not pass its readiness check." >&2
  exit 6
fi

trap - ERR
echo "DEPLOYMENT_STATUS=PASS"
echo "DEPLOYED_IMAGE=$IMAGE_REPOSITORY:$IMAGE_TAG"
echo "DATABASE_BACKUP=$backup_file"
