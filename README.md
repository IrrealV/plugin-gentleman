# Plugin Gentleman

> **Mustachi** — An animated ASCII mascot bringing personality to your OpenCode terminal.

An OpenCode TUI plugin that adds visual flair and environment awareness to your coding sessions:

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
- Animated eyes that occasionally look around *(when animations enabled)*
- Tongue and motivational phrases during busy states *(when animations enabled)*

### The Mustachi Mascot

An ASCII character with personality:
- **Eyes** that occasionally look in different directions *(sidebar only)*
- **Mustache** rendered in theme colors *(both home and sidebar)*
- **Tongue** that appears during busy/loading states *(sidebar only)*
- **Motivational phrases** in Rioplatense Spanish style *(sidebar only)*

**Example phrases during busy states:**
- *"Ponete las pilas, hermano..."*
- *"Dale que va, dale que va..."*
- *"Ya casi, ya casi..."*
- *"Ahí vamos, loco..."*
- *"Un toque más y listo..."*
- *"Aguantá que estoy pensando..."*

### Animations

**Low complexity, low frequency** — subtle and non-intrusive:

**Eye Direction** *(when `animations: true`)*
- Every ~4 seconds, eyes may look in a random direction
- 20% chance of movement per interval
- Returns to neutral position most of the time

**Busy State** *(when `animations: true`)*
- Tongue appears when OpenCode is processing
- Motivational phrase rotates every 3 seconds
- Only active during detected busy states

**Disabled** *(when `animations: false`)*
- Mustachi stays in neutral position
- No eye movement, tongue, or phrases

### Gentleman Theme

A refined dark color palette:
- **Background:** Deep navy (`#06080f`)
- **Primary:** Soft blue (`#7FB4CA`)
- **Accent:** Warm gold (`#E0C15A`)
- **Text:** Clean white (`#F3F6F9`)

**Mustachi gradient** (3-tone):
- **Top:** Accent gold
- **Middle:** Primary blue  
- **Bottom:** Error pink (`#CB7C94`)

### Environment Detection

Displays a "Detected" line with:
- **OS Detection:** Reads distro name on Linux, shows "macOS" or "Windows" on other platforms
- **Provider Detection:** Lists active LLM providers (OpenAI, Copilot, Google, etc.)

Both are fully configurable and can be hidden.

---

## Configuration

All options are configured via plugin tuple syntax in `opencode.json`.

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

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    ["plugin-gentleman", { "animations": false }]
  ]
}
```

Mustachi will remain static with neutral eyes and no busy-state expressions.

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
3. **Home Logo Slot:** Registers `home_logo` with mustache-only ASCII art
4. **Environment Detection Slot:** Registers `home_bottom` with OS/provider info below the prompt
5. **Sidebar Slot:** Registers `sidebar_content` with full Mustachi face and animations
6. **Animation Loop:** Starts interval timers for eye variations and busy-state detection *(if `animations: true`, sidebar only)*
7. **Busy State Detection:** Attempts to read `api.state.session.running` *(best-effort; may not be exposed by all OpenCode versions)*

### Technical Stack

- **No Build Step:** Plain TSX transpiled at runtime by OpenCode
- **Solid.js Reactivity:** Uses `createSignal` and `createEffect` for animations
- **Safe Detection:** All OS/provider detection wrapped in try-catch blocks
- **Cleanup:** Uses `onCleanup` to clear intervals when component unmounts

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
- `tui.tsx` — main plugin implementation
- `gentleman.json` — theme definition
- `package.json` — auto-included by npm
- `README.md` — auto-included by npm

**Repository-only files** *(excluded from npm package)*:
- `gentleman-local.ts` — legacy local system plugin with limited features
- `install-local-real.sh`, `install-local.sh` — local installation scripts

---

## Known Limitations

1. **Busy State Detection:** The plugin attempts to detect busy states via `api.state.session.running`, but this may not be exposed in all OpenCode versions. If unavailable, busy-state animations won't trigger *(eye animations still work in sidebar)*.

2. **Animation Frequency:** Currently set to low frequency (4s for eyes, 3s for phrase rotation). Adjust the intervals in `tui.tsx` if needed.

3. **Slot Usage:** The plugin uses these OpenCode TUI slots:
   - `home_logo` — mustache-only ASCII art
   - `home_bottom` — environment detection (OS + providers)
   - `sidebar_content` — full Mustachi face with animations

4. **Theme Compatibility:** The plugin installs and optionally activates the Gentleman theme. If you prefer a custom theme, set `set_theme: false`.

---

## Development

### Modifying the Plugin

To work on the plugin:

1. Edit `tui.tsx` (main implementation)
2. Test locally with `npm link` or `npm pack`
3. No build step needed — OpenCode transpiles TSX at runtime
4. Restart OpenCode to see changes

### Adding New Content

**Eye variations:**
- Edit the `eyeVariations` array in `tui.tsx` *(affects sidebar only)*

**Busy phrases:**
- Edit the `busyPhrases` array in `tui.tsx` *(affects sidebar only)*

**Animation timings:**
- Adjust `setInterval` durations in the `SidebarMustachi` component

---

## License

ISC
