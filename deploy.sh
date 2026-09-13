#!/usr/bin/env bash
# deploy.sh — deploy mathmd to /var/www/html/mathmd
#
# What it does:
#   1. Clones the repo into ~/mathmd if missing (git@github.com:denizsincar29/mathmd.git)
#   2. Pulls latest main (fast-forward only)
#   3. Syncs tracked files to DEST via rsync — never passes --delete, so
#      manually-added server-side files in DEST are left alone (same pattern
#      as ahap_web_editor / motion-detector)
#
# Usage:
#   ./deploy.sh              — deploy to default target
#   ./deploy.sh /other/path  — deploy to a custom target
#
# No sudo needed: /var/www/html carries the caddy setgid bit, so files created
# here automatically get ownership denizsincar29:caddy.

set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-/var/www/html/mathmd}"
REPO="git@github.com:denizsincar29/mathmd.git"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ── Clone into ~/mathmd if missing ───────────────────────────────────────────
if [[ ! -d "$SRC/.git" ]]; then
    echo -e "${YELLOW}==> repo not found at $SRC, cloning...${NC}"
    git clone "$REPO" "$SRC"
fi

cd "$SRC"

# ── Pull latest main ─────────────────────────────────────────────────────────
echo -e "${GREEN}==> pulling latest main${NC}"
git fetch --prune origin
if git rev-parse --verify -q origin/main >/dev/null; then
    git pull --ff-only origin main
else
    git pull --ff-only origin master
fi

# ── Preflight ────────────────────────────────────────────────────────────────
if [[ ! -f "$SRC/index.html" ]]; then
    echo -e "${RED}ERROR: index.html not found after update${NC}"
    exit 1
fi

# ── Create dest if needed ────────────────────────────────────────────────────
mkdir -p "$DEST"

# ── Deploy: tracked files only, no --delete ──────────────────────────────────
# --no-owner --no-group: let the files pick up the caddy setgid of /var/www/html
# instead of copying the repo's deniz:deniz group (rsync -a preserves it otherwise).
echo -e "${GREEN}==> deploying to $DEST${NC}"
git ls-files \
  | grep -v -e '^deploy\.sh$' -e '^README\.md$' -e '^\.nojekyll$' \
  | rsync -av --no-owner --no-group --files-from=- "$SRC/" "$DEST/"

echo
echo -e "${GREEN}==> Done.${NC}"
echo    "    Deployed to $DEST"
echo    "    Served at  https://mathmd.denizsincar.ru"
