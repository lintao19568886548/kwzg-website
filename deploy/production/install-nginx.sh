#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_CONFIG=${1:-}
TARGET_CONFIG=/etc/nginx/conf.d/yizuw-org.conf
CERTIFICATE=/etc/nginx/certs/yizuw-org/yizuw.org.crt
PRIVATE_KEY=/etc/nginx/certs/yizuw-org/yizuw.org.key

if [[ ! -s "$SOURCE_CONFIG" ]]; then
  echo "Website Nginx source config is missing." >&2
  exit 2
fi
if [[ ! -s "$CERTIFICATE" || ! -s "$PRIVATE_KEY" ]]; then
  echo "Website TLS certificate or private key is missing." >&2
  exit 2
fi

command -v nginx >/dev/null
command -v systemctl >/dev/null

backup=$(mktemp /etc/nginx/conf.d/.yizuw-org.backup.XXXXXX)
had_previous=0
if [[ -f "$TARGET_CONFIG" ]]; then
  cp -p "$TARGET_CONFIG" "$backup"
  had_previous=1
fi

restore_previous_config() {
  if (( had_previous == 1 )); then
    cp -p "$backup" "$TARGET_CONFIG"
  else
    rm -f "$TARGET_CONFIG"
  fi
}

cleanup() {
  rm -f "$backup"
}
trap cleanup EXIT

install -o root -g root -m 644 "$SOURCE_CONFIG" "$TARGET_CONFIG"
if nginx -t && systemctl reload nginx; then
  echo "NGINX_RELOAD=PASS"
  echo "NGINX_CONFIG=$TARGET_CONFIG"
  exit 0
fi

echo "Website Nginx activation failed; restoring the previous website-owned config." >&2
restore_previous_config
nginx -t >/dev/null 2>&1 || true
systemctl reload nginx >/dev/null 2>&1 || true
exit 3
