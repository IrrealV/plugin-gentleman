#!/usr/bin/env bash
#
# install-local.sh — Install gentleman plugin for local OpenCode testing
#
# Usage:
#   ./install-local.sh        # Install with default config
#   ./install-local.sh clean  # Remove local installation
#

set -e

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="plugin-gentleman"
OPENCODE_PLUGINS="$HOME/.config/opencode/plugins"
OPENCODE_CONFIG="$HOME/.config/opencode/opencode.json"
THEME_FILE="$HOME/.config/opencode/themes/gentleman.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() {
  echo -e "${BLUE}==>${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

warn() {
  echo -e "${YELLOW}!${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1"
}

# ─── Clean Mode ──────────────────────────────────────────────────────────────

if [[ "$1" == "clean" ]]; then
  info "Removing local gentleman plugin installation..."
  
  # Remove symlink
  if [[ -L "$OPENCODE_PLUGINS/$PLUGIN_NAME" ]]; then
    rm "$OPENCODE_PLUGINS/$PLUGIN_NAME"
    success "Removed plugin symlink"
  else
    warn "Plugin symlink not found (already removed?)"
  fi
  
  info "Done. Restart OpenCode to complete uninstall."
  info "Note: Config in opencode.json and theme file are preserved."
  exit 0
fi

# ─── Install Mode ────────────────────────────────────────────────────────────

info "Installing gentleman plugin for local testing..."

# 1. Check prerequisites
info "Checking prerequisites..."

if [[ ! -d "$OPENCODE_PLUGINS" ]]; then
  error "OpenCode plugins directory not found: $OPENCODE_PLUGINS"
  error "Is OpenCode installed?"
  exit 1
fi

if [[ ! -f "$THEME_FILE" ]]; then
  error "Gentleman theme not found: $THEME_FILE"
  error "Expected theme file to exist before plugin installation."
  error "Copy gentleman.json to ~/.config/opencode/themes/ first."
  exit 1
fi

success "OpenCode plugins directory exists"
success "Gentleman theme found"

# 2. Create symlink
info "Creating symlink..."

if [[ -L "$OPENCODE_PLUGINS/$PLUGIN_NAME" ]]; then
  CURRENT_TARGET=$(readlink "$OPENCODE_PLUGINS/$PLUGIN_NAME")
  if [[ "$CURRENT_TARGET" == "$PLUGIN_DIR" ]]; then
    success "Symlink already exists and points to correct location"
  else
    warn "Symlink exists but points to: $CURRENT_TARGET"
    warn "Removing old symlink and creating new one..."
    rm "$OPENCODE_PLUGINS/$PLUGIN_NAME"
    ln -sf "$PLUGIN_DIR" "$OPENCODE_PLUGINS/$PLUGIN_NAME"
    success "Updated symlink"
  fi
elif [[ -e "$OPENCODE_PLUGINS/$PLUGIN_NAME" ]]; then
  error "Path exists but is not a symlink: $OPENCODE_PLUGINS/$PLUGIN_NAME"
  error "Remove it manually before running this script."
  exit 1
else
  ln -sf "$PLUGIN_DIR" "$OPENCODE_PLUGINS/$PLUGIN_NAME"
  success "Created symlink: $OPENCODE_PLUGINS/$PLUGIN_NAME -> $PLUGIN_DIR"
fi

# 3. Verify symlink
info "Verifying installation..."
if [[ -f "$OPENCODE_PLUGINS/$PLUGIN_NAME/tui.tsx" ]]; then
  success "Plugin files accessible via symlink"
else
  error "Cannot access tui.tsx through symlink"
  exit 1
fi

# 4. Check config
info "Checking opencode.json config..."

if [[ ! -f "$OPENCODE_CONFIG" ]]; then
  warn "opencode.json not found. You'll need to create it manually."
  warn "See LOCAL-TESTING.md for config examples."
else
  if grep -q "\"$PLUGIN_NAME\"" "$OPENCODE_CONFIG"; then
    success "Plugin already configured in opencode.json"
  else
    warn "Plugin not found in opencode.json"
    warn "Add this to your config:"
    echo ""
    echo "  {"
    echo "    \"plugin\": [\"$PLUGIN_NAME\"]"
    echo "  }"
    echo ""
  fi
fi

# Done
echo ""
success "Installation complete!"
echo ""
info "Next steps:"
echo "  1. Ensure opencode.json includes: [\"$PLUGIN_NAME\"]"
echo "  2. Restart OpenCode"
echo "  3. Look for the gentleman mustache logo"
echo ""
info "For detailed config options, see LOCAL-TESTING.md"
echo ""
info "To uninstall: ./install-local.sh clean"
