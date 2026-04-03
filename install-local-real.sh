#!/usr/bin/env bash
#
# install-local-real.sh — Install TRUE local .ts plugin for Gentleman
#
# IMPORTANT: This installs a SYSTEM PLUGIN (gentleman-local.ts), NOT the TUI version.
# System plugins CANNOT modify the visual TUI (no logo, no visual components).
# For full TUI functionality, use npm package approach.
#
# Usage:
#   ./install-local-real.sh         # Install local system plugin
#   ./install-local-real.sh clean   # Remove local installation
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_SOURCE="$SCRIPT_DIR/gentleman-local.ts"
PLUGIN_TARGET="$HOME/.config/opencode/plugins/gentleman.ts"
THEME_SOURCE="$SCRIPT_DIR/gentleman.json"
THEME_TARGET="$HOME/.config/opencode/themes/gentleman.json"
OPENCODE_CONFIG="$HOME/.config/opencode/opencode.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}==>${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# ─── Clean Mode ──────────────────────────────────────────────────────────────

if [[ "$1" == "clean" ]]; then
  info "Removing local gentleman plugin installation..."
  
  if [[ -f "$PLUGIN_TARGET" ]] || [[ -L "$PLUGIN_TARGET" ]]; then
    rm "$PLUGIN_TARGET"
    success "Removed plugin file: $PLUGIN_TARGET"
  else
    warn "Plugin not found (already removed?)"
  fi
  
  info "Done. Restart OpenCode to complete uninstall."
  info "Note: Config in opencode.json and theme file are preserved."
  exit 0
fi

# ─── Install Mode ────────────────────────────────────────────────────────────

info "Installing TRUE local-file gentleman plugin (system plugin)..."
echo ""

warn "IMPORTANT: This is a SYSTEM plugin, not a TUI plugin."
warn "Local .ts plugins CANNOT modify the visual TUI."
warn "You will NOT see the mustache logo or visual environment detection."
warn "For full TUI features, use the npm package version instead."
echo ""

read -p "Continue with system plugin installation? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  info "Installation cancelled."
  exit 0
fi

# 1. Check prerequisites
info "Checking prerequisites..."

if [[ ! -d "$HOME/.config/opencode/plugins" ]]; then
  error "OpenCode plugins directory not found: $HOME/.config/opencode/plugins"
  error "Is OpenCode installed?"
  exit 1
fi

if [[ ! -f "$PLUGIN_SOURCE" ]]; then
  error "Plugin source not found: $PLUGIN_SOURCE"
  exit 1
fi

success "OpenCode plugins directory exists"
success "Plugin source file found"

# 2. Install theme file
info "Installing theme file..."

if [[ ! -d "$HOME/.config/opencode/themes" ]]; then
  mkdir -p "$HOME/.config/opencode/themes"
  success "Created themes directory"
fi

if [[ -f "$THEME_SOURCE" ]]; then
  cp "$THEME_SOURCE" "$THEME_TARGET"
  success "Installed gentleman.json theme"
else
  warn "Theme source not found: $THEME_SOURCE"
  warn "You'll need to install gentleman.json manually"
fi

# 3. Copy/symlink plugin file
info "Installing plugin file..."

if [[ -L "$PLUGIN_TARGET" ]] || [[ -f "$PLUGIN_TARGET" ]]; then
  warn "Plugin file already exists: $PLUGIN_TARGET"
  read -p "Overwrite? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm "$PLUGIN_TARGET"
  else
    error "Installation cancelled."
    exit 1
  fi
fi

# Use symlink for development (edits reflect immediately)
ln -sf "$PLUGIN_SOURCE" "$PLUGIN_TARGET"
success "Symlinked plugin: $PLUGIN_TARGET -> $PLUGIN_SOURCE"

# 4. Verify installation
info "Verifying installation..."

if [[ -f "$PLUGIN_TARGET" ]]; then
  success "Plugin file accessible"
else
  error "Plugin file not accessible"
  exit 1
fi

# 5. Check/update OpenCode config
info "Checking OpenCode config..."

if [[ ! -f "$OPENCODE_CONFIG" ]]; then
  warn "opencode.json not found at: $OPENCODE_CONFIG"
  warn "Create it manually with:"
  echo ""
  echo '  {'
  echo '    "theme": "gentleman",'
  echo '    "plugin": ["gentleman"]'
  echo '  }'
  echo ""
else
  NEEDS_PLUGIN=false
  NEEDS_THEME=false
  
  if ! grep -q '"gentleman"' "$OPENCODE_CONFIG"; then
    NEEDS_PLUGIN=true
  fi
  
  if ! grep -q '"theme".*:.*"gentleman"' "$OPENCODE_CONFIG"; then
    NEEDS_THEME=true
  fi
  
  if $NEEDS_PLUGIN || $NEEDS_THEME; then
    warn "OpenCode config needs updates:"
    echo ""
    if $NEEDS_PLUGIN; then
      echo '  Add to "plugin" array: "gentleman"'
    fi
    if $NEEDS_THEME; then
      echo '  Set theme: "theme": "gentleman"'
    fi
    echo ""
    echo "  Full example:"
    echo '  {'
    echo '    "theme": "gentleman",'
    echo '    "plugin": ["gentleman"]'
    echo '  }'
    echo ""
  else
    success "Plugin and theme already configured"
  fi
fi

# Done
echo ""
success "Installation complete!"
echo ""
info "What was installed:"
echo "  ✅ System plugin (gentleman-local.ts) -> ~/.config/opencode/plugins/gentleman.ts"
echo "  ✅ Gentleman theme -> ~/.config/opencode/themes/gentleman.json"
echo ""
warn "What this plugin CANNOT do (requires npm package):"
echo "  ❌ Show mustache logo in TUI"
echo "  ❌ Visual environment detection display"
echo "  ❌ Any TUI customization"
echo ""
info "What this plugin CAN do:"
echo "  ✅ Inject Gentleman branding into AI system prompt"
echo "  ✅ Provide environment info to AI assistant"
echo "  ✅ Add gentleman_status MCP tool"
echo ""
info "Next steps:"
echo "  1. Ensure opencode.json has: \"theme\": \"gentleman\" and \"plugin\": [\"gentleman\"]"
echo "  2. Restart OpenCode"
echo "  3. Use MCP tool: gentleman_status to check installation"
echo ""
info "For FULL TUI features (logo, visual components):"
echo "  See PHASE2-NPM.md for npm package installation"
echo ""
info "To uninstall: ./install-local-real.sh clean"
