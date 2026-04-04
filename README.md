# Plugin Gentleman

> **For the Gentleman Programming community** — Bringing Mustachi, our beloved mascot, into your OpenCode terminal.

An OpenCode TUI plugin crafted for the Gentleman Programming community. Mustachi, the official mascot of Gentleman Programming, now accompanies you through your coding sessions with visual flair and environment awareness:

- 🎭 **Prominent ASCII mustache** on the home screen
- 👤 **Full Mustachi face** with eyes in the sidebar
- 👀 **Subtle eye animations** (optional, low-frequency)
- 💬 **Motivational phrases** during busy states (Rioplatense Spanish style)
- 🎨 **Gentleman theme** installed and applied automatically
- 🖥️ **Environment detection** — displays your OS and LLM providers
- ⚙️ **Fully configurable** via `opencode.json`

## Installation

### Quick Start

Install the plugin globally with OpenCode:

```bash
opencode plugin plugin-gentleman --global
```

OpenCode will download the package and update your TUI config automatically.

**Restart OpenCode** to see:
- Prominent ASCII mustache on the home screen
- `OpenCode` branding text
- `Detected: <OS> · <providers>` below the prompt area
- Full Mustachi face in the sidebar

### Alternative: Manual Configuration

If you prefer managing config yourself, add this to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["plugin-gentleman"]
}
```

OpenCode will install npm plugins automatically on startup.

---

### For Developers

**Local Testing with npm link:**

```bash
npm link
```

Then add to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["plugin-gentleman"]
}
```

Restart OpenCode to see changes.

**Local Testing with Tarball:**

```bash
npm pack
opencode plugin ./plugin-gentleman-<version>.tgz --global
```

*If your OpenCode version doesn't accept a tarball path, use the published package flow instead.*

---

## Features

### Visual Components

**Home Screen:**
- Prominent ASCII mustache (no face, just the mustache)
- "OpenCode" branding text  
- Environment detection showing `OS · Providers` below the prompt area

**Sidebar:**
- Full Mustachi face with eyes and mustache
- Animated blink, random look-around in 8 directions *(when animations enabled)*
- Tongue and motivational phrases during busy states *(when animations enabled)*
- Periodic expressive cycle every 45-60s to showcase animations *(when animations enabled)*

### The Mustachi Mascot

**Mustachi** is the official mascot of the Gentleman Programming community — not something invented just for this plugin, but a character beloved by the community and now integrated into your coding environment.

The ASCII representation features:
- **Eyes** that blink and look in 8 directions (center, up, down, left, right, and 4 diagonals) *(sidebar only)*
- **Mustache** rendered in grayscale gradient on home screen, semantic zone colors in sidebar
- **Tongue** that appears during busy states or periodic expressive cycles *(sidebar only)*
- **Motivational phrases** in Rioplatense Spanish style — single random phrase rotating every 3s *(sidebar only)*

**Example phrases during busy states:**
- *"Ponete las pilas, hermano..."*
- *"Dale que va, dale que va..."*
- *"Ya casi, ya casi..."*
- *"Ahí vamos, loco..."*
- *"Un toque más y listo..."*
- *"Aguantá que estoy pensando..."*

### Animations

**Low complexity, low frequency** — subtle and non-intrusive:

**Blink** *(when `animations: true`)*
- Natural eyelid motion: open → half → closed → half → open
- Progressive top-to-bottom animation (80-100ms per frame)
- ~35% chance every 2s (average ~5-6 seconds between blinks)

**Eye Direction** *(when `animations: true`)*
- Every ~3 seconds, eyes randomly look in one of 8 directions or stay center
- 60% chance to stay centered, 40% chance to look around
- Supports: up, down, left, right, and 4 diagonal positions
- Returns to center frequently for natural feel

**Busy/Expressive State** *(when `animations: true`)*
- Tongue appears when OpenCode is processing
- Eyes squint during expressive state
- Single motivational phrase rotating every 3 seconds (36+ phrase library)
- Active during detected busy states OR periodic expressive cycles

**Expressive Cycle Fallback** *(when `animations: true`)*
- First cycle: 30-45s after load
- Subsequent cycles: every 45-60s
- Duration: 8 seconds per cycle
- Ensures tongue + phrases are visible even if runtime busy detection is unreliable

**Disabled** *(when `animations: false`)*
- Mustachi stays in neutral position
- No blink, no eye movement, no tongue, no phrases
- Completely static face

### Gentleman Theme

A refined dark color palette:
- **Background:** Deep navy (`#06080f`)
- **Primary:** Soft blue (`#7FB4CA`)
- **Accent:** Warm gold (`#E0C15A`)
- **Text:** Clean white (`#F3F6F9`)

**Home screen mustache:** 3-tone grayscale gradient for better readability
- **Top:** Light gray (`#C0C0C0`)
- **Middle:** Mid gray (`#808080`)
- **Bottom:** Dark gray (`#505050`)

**Sidebar Mustachi:** Semantic zone colors for visual clarity
- **Monocle:** Soft silver (`#B8B8B8`)
- **Eyes:** Mid gray (`#808080`)
- **Mustache:** Dark gray (`#606060`)
- **Tongue:** Pink/red (`#FF4466`)

### Environment Detection

Displays a "Detected" line with:
- **OS Detection:** Reads distro name on Linux, shows "macOS" or "Windows" on other platforms
- **Provider Detection:** Lists active LLM providers (OpenAI, Copilot, Google, etc.)

Both are fully configurable and can be hidden.

---

## Configuration

All options are configured via plugin tuple syntax in `~/.config/opencode/opencode.json`.

**Quick tip:** To disable animations, add `{ "animations": false }` to your plugin config (see examples below).

### Default Settings

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

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable the plugin entirely |
| `theme` | string | `"gentleman"` | Name of the bundled theme to install |
| `set_theme` | boolean | `true` | Automatically activate the theme on load |
| `show_detected` | boolean | `true` | Show the "Detected" environment info line |
| `show_os` | boolean | `true` | Show detected operating system name |
| `show_providers` | boolean | `true` | Show detected LLM providers |
| `animations` | boolean | `true` | Enable Mustachi animations (eyes, busy state) |

### Examples

**Disable Animations:**

If you prefer a completely static Mustachi (no eye movement, no busy-state tongue/phrases):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    ["plugin-gentleman", { "animations": false }]
  ]
}
```

This sets `animations: false`, which:
- Disables blink animation
- Keeps eyes in neutral center position (no looking around)
- Hides tongue and motivational phrases during busy states
- Disables periodic expressive cycles
- Mustachi remains completely static

**Logo Only (No Detection):**

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    ["plugin-gentleman", { "show_detected": false }]
  ]
}
```

Shows only Mustachi and OpenCode branding, no OS/provider info.

**Show Only OS:**

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

---

## How It Works

The plugin integrates with OpenCode's TUI system through slot registration:

1. **Theme Installation:** Installs `gentleman.json` into OpenCode themes on load
2. **Theme Activation:** Switches to the gentleman theme *(if `set_theme: true`)*
3. **Home Logo Slot:** Registers `home_logo` with mustache-only ASCII art (grayscale gradient)
4. **Environment Detection Slot:** Registers `home_bottom` with OS/provider info below the prompt
5. **Sidebar Slot:** Registers `sidebar_content` with full Mustachi face and animations
6. **Animation Loops:** Starts independent interval timers for:
   - Blink animation (~5-6s average interval)
   - Random eye look-around (~3s interval)
   - Phrase rotation during expressive states (3s interval)
   - Periodic expressive cycles (45-60s interval)
   *(All sidebar-only, when `animations: true`)*
7. **Busy State Detection:** Attempts to read `api.state.session.running` for reactive busy state *(best-effort; may not be exposed by all OpenCode versions)*
8. **Expressive Cycle Fallback:** If busy detection is unreliable, periodic cycles ensure animations are visible

### Technical Stack

- **No Build Step:** Plain TSX transpiled at runtime by OpenCode
- **Solid.js Reactivity:** Uses `createSignal` and `createEffect` for all animations
- **Safe Detection:** All OS/provider detection wrapped in try-catch blocks
- **Cleanup:** Uses `onCleanup` to clear all intervals when components unmount
- **Multi-file Architecture:** Separated concerns for maintainability (see Architecture below)

### Architecture

The plugin is structured as a multi-file module for maintainability and clarity:

- **`tui.tsx`** — Plugin entry point. Handles initialization, theme setup, slot registration, and busy state detection.
- **`components.tsx`** — All UI components (`HomeLogo`, `SidebarMustachi`, `DetectedEnv`). Contains all animation logic with Solid.js signals and effects (blink, look-around, expressive cycle).
- **`ascii-frames.ts`** — All ASCII art assets: 9 eye position frames, 3 blink frames, squinted eyes, mustache designs, 3 tongue frames, and zone color definitions.
- **`phrases.ts`** — Library of 36+ motivational phrases (Rioplatense Spanish style) shown during expressive states.
- **`config.ts`** — Configuration parsing with type-safe defaults and validation helpers.
- **`detection.ts`** — OS detection (reads `/etc/os-release` on Linux) and provider name mapping.

---

## Supported Providers

Friendly name mapping for LLM providers:

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

*Unknown provider IDs display the configured name or raw ID.*

---

## Important Notes

### TUI Plugin vs System Plugin

**This is a TUI plugin for npm installation.**

If you copy `.ts` files to `~/.config/opencode/plugins/` (system plugin):
- ❌ **NO visual changes** — system plugins cannot modify the TUI
- ❌ **NO Mustachi** — only TUI plugins can register slot components  
- ❌ **NO animations** — JSX/Solid.js components only work in TUI plugins

**For full features, use npm installation** (recommended global method above).

### Package Contents

**Files included in npm package** *(via `files` field in `package.json`)*:
- `tui.tsx` — plugin entry point and slot registration
- `components.tsx` — UI components (HomeLogo, SidebarMustachi, DetectedEnv)
- `ascii-frames.ts` — all ASCII art frames, eye positions, and color definitions
- `phrases.ts` — motivational phrases library for busy states
- `config.ts` — configuration parsing helpers and type definitions
- `detection.ts` — OS and provider detection utilities
- `gentleman.json` — theme definition
- `package.json` — auto-included by npm
- `README.md` — auto-included by npm

**Repository-only files** *(excluded from npm package)*:
- `gentleman-local.ts` — legacy local system plugin with limited features
- `install-local-real.sh`, `install-local.sh` — local installation scripts

---

## Known Limitations

1. **Busy State Detection:** The plugin attempts to detect busy states via `api.state.session.running`, but this may not be exposed in all OpenCode versions. If unavailable, a periodic expressive cycle fallback (every 45-60s) ensures animations remain visible.

2. **Animation Frequency:** Current timing intervals:
   - Blink: ~5-6 seconds average (35% chance every 2s)
   - Look-around: 3 seconds (60% center, 40% random direction)
   - Phrase rotation: 3 seconds during expressive state
   - Expressive cycle: first at 30-45s, then every 45-60s
   
   To adjust, modify the intervals in `components.tsx` (lines 79, 107, 168, 193-198).

3. **Slot Usage:** The plugin uses these OpenCode TUI slots:
   - `home_logo` — mustache-only ASCII art (grayscale gradient)
   - `home_bottom` — environment detection (OS + providers)
   - `sidebar_content` — full Mustachi face with animations

4. **Theme Compatibility:** The plugin installs and optionally activates the Gentleman theme. If you prefer a custom theme, set `set_theme: false`.

---

## Development

### Modifying the Plugin

The plugin is organized into focused modules for easy customization:

**Adding new content:**

- **Motivational phrases:** Edit `phrases.ts` — add new phrases to the `busyPhrases` array (currently 36+ phrases)
- **ASCII art frames:** Edit `ascii-frames.ts` — modify eye positions (9 variants), blink frames (3 stages), mustache designs, or tongue states (binary on/off)
- **UI logic:** Edit `components.tsx` — adjust animation timings, add new effects, or tweak component layout
- **Configuration:** Edit `config.ts` — add new config options with type-safe defaults
- **Detection logic:** Edit `detection.ts` — add new OS detection patterns or provider mappings
- **Plugin behavior:** Edit `tui.tsx` — modify slot registration, initialization flow, or busy detection

**Testing locally:**

1. Make your changes in the appropriate file(s)
2. Test with `npm link` or `npm pack` (see "For Developers" section above)
3. No build step needed — OpenCode transpiles TSX at runtime
4. Restart OpenCode to see changes

**Animation timing customization:**

All animation intervals are in `components.tsx`:
- **Look-around interval:** Currently 3000ms (3s)
- **Blink interval:** Currently 2000ms with 35% chance (~5-6s average)
- **Blink frame timing:** Currently 80-100ms per frame progression
- **Phrase rotation:** Currently 3000ms (3s) during expressive state
- **Expressive cycle timing:** First cycle at 30-45s, then every 45-60s
- **Expressive cycle duration:** Currently 8000ms (8s)

**Color customization:**

- **Zone colors (sidebar):** Edit `zoneColors` object in `ascii-frames.ts` (monocle, eyes, mustache, tongue)
- **Home grayscale gradient:** Edit `HomeLogo` component in `components.tsx` (top/middle/bottom color values)
- **Theme colors:** Edit `gentleman.json` for the full color palette

---

## License

ISC
