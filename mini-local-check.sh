#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
  printf "${BLUE}[INFO]${NC} %s\n" "$1"
}

log_ok() {
  printf "${GREEN}[OK]${NC} %s\n" "$1"
}

log_warn() {
  printf "${YELLOW}[WARN]${NC} %s\n" "$1"
}

log_error() {
  printf "${RED}[ERROR]${NC} %s\n" "$1" >&2
}

die() {
  log_error "$1"
  exit 1
}

on_error() {
  local exit_code=$?
  local line_no=${1:-unknown}
  log_error "Command failed at line ${line_no} (exit ${exit_code})."
  exit "$exit_code"
}

trap 'on_error $LINENO' ERR

require_cmd() {
  local cmd="$1"
  local hint="$2"

  if ! command -v "$cmd" >/dev/null 2>&1; then
    die "Missing required command '${cmd}'. ${hint}"
  fi
}

extract_version() {
  local pkg_json="$1"

  node -e '
const fs = require("fs");
const file = process.argv[1];
const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
process.stdout.write((pkg.version || "unknown") + "\n");
' "$pkg_json"
}

search_marker_in_dir() {
  local marker="$1"
  local target_dir="$2"

  if [[ ! -d "$target_dir" ]]; then
    return 1
  fi

  grep -R --line-number --fixed-strings -- "$marker" "$target_dir" >/dev/null 2>&1
}

main() {
  local cache_packages="$HOME/.cache/opencode/packages/plugin-gentleman@latest"
  local cache_node_modules="$HOME/.cache/opencode/node_modules/plugin-gentleman"
  local cache_packages_root="$HOME/.cache/opencode/packages"
  local tarball=""
  local markers=(
    "personality_enabled"
    "personality_model"
    "resolveMonocleLensOverlay"
    "applyMonocleLensOverlay"
  )

  log_info "Checking required commands"
  require_cmd "npm" "Install Node.js/npm first."
  require_cmd "opencode" "Install OpenCode CLI and ensure it is in PATH."
  require_cmd "node" "Node.js is required to read package.json version."
  log_ok "All required commands are available"

  log_info "Packing plugin tarball with npm pack"
  tarball="$(npm pack --json | node -e '
const fs = require("fs");
const payload = JSON.parse(fs.readFileSync(0, "utf8"));
process.stdout.write(payload?.[0]?.filename || "");
')"
  [[ -n "$tarball" ]] || die "npm pack did not return a tarball name."
  [[ -f "$tarball" ]] || die "Tarball '${tarball}' was not found in repo root."
  log_ok "Tarball created: ${tarball}"

  log_info "Purging OpenCode plugin-gentleman cache"
  rm -rf "$cache_packages_root"/plugin-gentleman-*.tgz@latest "$cache_packages_root"/file:
  rm -rf "$cache_packages" "$cache_node_modules"
  log_ok "Cache purged"

  log_info "Installing local tarball into ACTIVE OpenCode package slot (no publish)"
  mkdir -p "$cache_packages"
  npm install --prefix "$cache_packages" "$(pwd)/$tarball"
  log_ok "Plugin installed in $cache_packages"

  log_info "Verifying installed version from cache package.json"
  if [[ -f "$cache_packages/node_modules/plugin-gentleman/package.json" ]]; then
    local version
    version="$(extract_version "$cache_packages/node_modules/plugin-gentleman/package.json")"
    log_ok "Active package slot version: ${version}"
  elif [[ -f "$cache_packages/package.json" ]]; then
    log_warn "Active slot root package has no plugin version field (expected dependency wrapper)."
  elif [[ -f "$cache_node_modules/package.json" ]]; then
    local version
    version="$(extract_version "$cache_node_modules/package.json")"
    log_ok "Cached node_modules version: ${version}"
  else
    log_warn "No cache package.json found after install; version verification skipped."
  fi

  log_info "Checking current feature markers in cache"
  local marker
  for marker in "${markers[@]}"; do
    if search_marker_in_dir "$marker" "$cache_packages" || search_marker_in_dir "$marker" "$cache_node_modules"; then
      log_ok "Marker found: ${marker}"
    else
      log_warn "Marker NOT found: ${marker}"
    fi
  done

  printf "\n${BLUE}Runtime checklist (manual, after restarting OpenCode):${NC}\n"
  printf "  1) Restart OpenCode completely.\n"
  printf "  2) Open a session with sidebar visible.\n"
  printf "  3) Confirm Mustachi renders, metrics still work, and no TUI regressions appear.\n"
  printf "  4) Toggle personality options in plugin config if needed:\n"
  printf "     - personality_enabled=false should keep Mustachi neutral.\n"
  printf "     - personality_mode=off should keep fallback phrases only.\n"
  printf "     - personality_model should use canonical provider/model format.\n"
  printf "  5) Confirm monocle overlay reacts to MCP/model/stack/runtime signals when available.\n"
  printf "  6) To verify the published npm update path separately, run:\n"
  printf "     opencode plugin plugin-gentleman@latest --global --force\n"
  printf "\n${GREEN}Done.${NC} Local verification artifact: %s\n" "$tarball"
}

main "$@"
