# plugin-gentleman

OpenCode TUI plugin featuring **Mustachi** — an animated ASCII mascot with eyes, mustache, and optional motivational phrases during busy states.

## What This Is

A TUI plugin for OpenCode that:
- 🎭 Shows **Mustachi** (ASCII mascot) in your home logo
- 👀 Subtle **eye animations** (optional, low-frequency)
- 💬 **Motivational phrases** during busy/loading states (Rioplatense Spanish style)
- 🎨 Installs and applies the **Gentleman theme** automatically
- 🖥️ Detects and displays your **OS and LLM providers**
- ⚙️ Fully **configurable** via `opencode.json`

## Installation

### Method 1: Local Testing with Tarball (Recommended First)

```bash
npm pack
npm install -g ./plugin-gentleman-1.0.0.tgz
```

Add to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["plugin-gentleman"]
}
```

Restart OpenCode:

```bash
opencode
```

### Method 2: Development with npm link

```bash
npm link
```

Add to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["plugin-gentleman"]
}
```

Restart OpenCode.

### Method 3: npm Registry (After Publishing)

```bash
npm install -g plugin-gentleman
opencode plugin install plugin-gentleman
```

## Features

### Mustachi Mascot

Mustachi is an ASCII character with:
- Two large eyes that occasionally look in different directions
- A prominent mustache rendered in theme colors
- A tongue that appears during busy/loading states
- Motivational phrases in Rioplatense Spanish style

Example phrases shown during busy states:
- "Ponete las pilas, hermano..."
- "Dale que va, dale que va..."
- "Ya casi, ya casi..."
- "Ahí vamos, loco..."
- "Un toque más y listo..."
- "Aguantá que estoy pensando..."

### Animation Behavior

**Low complexity, low frequency** — designed to be subtle and non-intrusive:

1. **Eye Direction Animation** (when `animations: true`)
   - Every ~4 seconds, Mustachi's eyes may look in a random direction
   - 20% chance of eye movement per interval
   - Returns to neutral position most of the time

2. **Busy State Animation** (when `animations: true`)
   - Tongue appears when OpenCode is processing
   - Motivational phrase rotates every 3 seconds
   - Only active during detected busy states

3. **No Animation** (when `animations: false`)
   - Mustachi stays in neutral position
   - No eye movement
   - No tongue or phrases during busy states

### Theme

The plugin bundles the **Gentleman theme** with a refined dark color palette:
- Background: Deep navy (`#06080f`)
- Primary: Soft blue (`#7FB4CA`)
- Accent: Warm gold (`#E0C15A`)
- Text: Clean white (`#F3F6F9`)

Mustachi uses a 3-tone gradient:
- **Top**: Accent (gold)
- **Middle**: Primary (blue)
- **Bottom**: Error/pink (`#CB7C94`)

### Environment Detection

The plugin shows a "Detected" line with:
- **OS Detection**: Reads distro name on Linux, shows "macOS" or "Windows" on other platforms
- **Provider Detection**: Lists active LLM providers (OpenAI, Copilot, Google, etc.)

Both are fully configurable and can be hidden.

## Configuration

All options are set via plugin tuple syntax in `opencode.json`:

### Default Configuration

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    [
      "plugin-gentleman",
      {
        "enabled": true,
        "theme": "gentleman",
        "set_theme": true,
        "show_detected": true,
        "show_os": true,
        "show_providers": true,
        "animations": true
      }
    ]
  ]
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable the plugin entirely |
| `theme` | string | `"gentleman"` | Name of the bundled theme to install |
| `set_theme` | boolean | `true` | Automatically activate the theme on load |
| `show_detected` | boolean | `true` | Show the "Detected" environment info line |
| `show_os` | boolean | `true` | Show detected operating system name |
| `show_providers` | boolean | `true` | Show detected LLM providers |
| `animations` | boolean | `true` | Enable Mustachi animations (eyes, busy state) |

### Example: Disable Animations

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    ["plugin-gentleman", { "animations": false }]
  ]
}
```

Mustachi will remain static with neutral eyes and no busy-state expressions.

### Example: Logo Only (No Detection)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    ["plugin-gentleman", { "show_detected": false }]
  ]
}
```

Shows only Mustachi and the OpenCode branding, no OS/provider info.

### Example: Show Only OS

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    [
      "plugin-gentleman",
      {
        "show_detected": true,
        "show_os": true,
        "show_providers": false
      }
    ]
  ]
}
```

## How It Works

1. **Theme Installation**: On load, installs `gentleman.json` into OpenCode themes
2. **Theme Activation**: If `set_theme: true`, switches to the gentleman theme
3. **Logo Slot**: Registers `home_logo` slot with Mustachi ASCII art
4. **Environment Detection Slot**: Registers `home_prompt_after` slot with OS/provider info
5. **Animation Loop**: If `animations: true`, starts interval timers for eye variations and busy-state detection
6. **Busy State Detection**: Attempts to read `api.state.session.running` (best-effort; may not be exposed by all OpenCode versions)

### Technical Details

- **No Build Step**: Plain TSX transpiled at runtime by OpenCode
- **Solid.js Reactivity**: Uses `createSignal` and `createEffect` for animations
- **Safe Detection**: All OS/provider detection wrapped in try-catch blocks
- **Cleanup**: Uses `onCleanup` to clear intervals when component unmounts

## Supported Providers

The plugin maps these provider IDs to friendly names:

| Provider ID | Display Name |
|-------------|--------------|
| `openai` | OpenAI |
| `google` | Google |
| `github-copilot` | Copilot |
| `opencode-go` | OpenCode GO |
| `anthropic` | Claude |
| `deepseek` | DeepSeek |
| `openrouter` | OpenRouter |
| `mistral` | Mistral |
| `groq` | Groq |
| `cohere` | Cohere |
| `together` | Together |
| `perplexity` | Perplexity |

Unknown provider IDs display the configured name or raw ID.

## Local Testing Limitations

**IMPORTANT**: This is a **TUI plugin** for npm installation. 

If you try to use this as a local system plugin (copying `.ts` files to `~/.config/opencode/plugins/`):
- ❌ **NO visual changes** — system plugins cannot modify the TUI
- ❌ **NO Mustachi** — only TUI plugins can register slot components
- ❌ **NO animations** — JSX/Solid.js components only work in TUI plugins

**For full features, use npm installation** (tarball or link method above).

## Repository Structure

```
oc-plugin-gentleman/
├── tui.tsx              # TUI plugin entry point (main implementation) ✅ npm
├── gentleman.json       # Gentleman theme definition ✅ npm
├── package.json         # npm package manifest with exports ✅ npm
├── README.md            # This file ✅ npm (auto-included)
├── gentleman-local.ts   # Legacy local system plugin (repo-only, not in npm package)
├── install-local-real.sh # Install script for local plugin (repo-only)
├── install-local.sh     # Install script for local plugin (repo-only)
└── mustachi examples/   # PNG reference images (repo-only)
```

**Files included in npm package** (via `files` field in package.json):
- `tui.tsx` — main plugin implementation
- `gentleman.json` — theme definition
- `package.json` — auto-included by npm
- `README.md` — auto-included by npm

**Local-only files** (excluded from npm, kept in repo for development/reference):
- `gentleman-local.ts` — legacy local system plugin with limited features
- `install-local-real.sh`, `install-local.sh` — local installation scripts
- `mustachi examples/` — reference images
oc-plugin-gentleman/
├── tui.tsx              # TUI plugin entry point (main implementation)
├── gentleman.json       # Gentleman theme definition
├── package.json         # npm package manifest with exports
├── gentleman-local.ts   # Legacy local system plugin (limited features)
├── install-local-real.sh # Install script for local system plugin
├── mustachi examples/   # PNG reference images (not used in final plugin)
└── README.md            # This file
```

## Caveats Before Publishing

1. **Busy State Detection**: The plugin attempts to detect busy states via `api.state.session.running`, but this may not be exposed in all OpenCode versions. If unavailable, busy-state animations won't trigger (eye animations still work).

2. **Animation Frequency**: Currently set to low frequency (4s for eyes, 3s for phrase rotation). If this feels too fast or too slow in real usage, adjust the intervals in `tui.tsx`.

3. **Sidebar Support**: OpenCode TUI may or may not support sidebar slots. Currently, Mustachi only appears in the `home_logo` slot. If sidebar slots become available, this can be added in a future version.

4. **Theme Compatibility**: The plugin installs and optionally activates the Gentleman theme. If the user has a custom theme they prefer, they should set `set_theme: false`.

## Development

To modify the plugin:

1. Edit `tui.tsx` (main implementation)
2. Test locally with `npm link` or `npm pack`
3. No build step needed — OpenCode transpiles TSX at runtime
4. Restart OpenCode to see changes

To add new eye variations:
- Edit the `eyeVariations` array in `tui.tsx`

To add new busy phrases:
- Edit the `busyPhrases` array in `tui.tsx`

To change animation timings:
- Adjust `setInterval` durations in the `Home` component

## License

ISC
