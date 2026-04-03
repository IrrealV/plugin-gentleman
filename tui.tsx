// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import { readFileSync } from "node:fs"
import type { TuiPlugin, TuiPluginModule, TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup, createEffect } from "solid-js"

const id = "gentleman"

// Mustachi ASCII art - inspired by mustachi examples (eyes, mustache, optional tongue)
// Base state: neutral look
const mustachiBase = [
  "",
  "    ╭─────╮       ╭─────╮    ",
  "   │ ● ● │       │ ○ ○ │    ",
  "    ╰─────╯       ╰─────╯    ",
  "       ╲           ╱         ",
  "        ╲         ╱          ",
  "   ╭─────═════════─────╮     ",
  "  ╱   ╭───────────╮   ╲      ",
  " ╱    │ ~~~~~~~~~ │    ╲     ",
  "╱     ╰───────────╯     ╲    ",
  "╲                       ╱    ",
  " ╲                     ╱     ",
  "  ╰───────────────────╯      ",
  "",
]

// Eye variations for subtle animation
const eyeVariations = [
  { left: "● ●", right: "○ ○" },  // neutral
  { left: "◐ ●", right: "○ ○" },  // left eye looking left
  { left: "● ◑", right: "○ ○" },  // left eye looking right
  { left: "● ●", right: "◐ ○" },  // right eye looking left
  { left: "● ●", right: "○ ◑" },  // right eye looking right
]

// Busy/loading state with tongue and motivational phrases
const busyPhrases = [
  "Ponete las pilas, hermano...",
  "Dale que va, dale que va...",
  "Ya casi, ya casi...",
  "Ahí vamos, loco...",
  "Un toque más y listo...",
  "Aguantá que estoy pensando...",
  "Momento, momento...",
  "Ya te lo traigo, tranqui...",
]

type Cfg = {
  enabled: boolean
  theme: string
  set_theme: boolean
  show_detected: boolean
  show_os: boolean
  show_providers: boolean
  animations: boolean
}

type Api = Parameters<TuiPlugin>[0]

const rec = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return
  return Object.fromEntries(Object.entries(value))
}

const pick = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback
  if (!value.trim()) return fallback
  return value
}

const bool = (value: unknown, fallback: boolean) => {
  if (typeof value !== "boolean") return fallback
  return value
}

const cfg = (opts: Record<string, unknown> | undefined): Cfg => {
  return {
    enabled: bool(opts?.enabled, true),
    theme: pick(opts?.theme, "gentleman"),
    set_theme: bool(opts?.set_theme, true),
    show_detected: bool(opts?.show_detected, true),
    show_os: bool(opts?.show_os, true),
    show_providers: bool(opts?.show_providers, true),
    animations: bool(opts?.animations, true),
  }
}

// Helper to detect OS name
const getOSName = (): string => {
  try {
    const platform = typeof process !== "undefined" ? process.platform : "unknown"
    switch (platform) {
      case "linux":
        try {
          const osRelease = readFileSync("/etc/os-release", "utf8")
          const match = osRelease.match(/^NAME="?([^"\n]+)"?/m)
          if (match) return match[1]
        } catch {
        }
        return "Linux"
      case "darwin":
        return "macOS"
      case "win32":
        return "Windows"
      default:
        return platform
    }
  } catch {
    return "Unknown"
  }
}

// Map provider IDs to friendly display names
const providerDisplayNames: Record<string, string> = {
  "openai": "OpenAI",
  "google": "Google",
  "github-copilot": "Copilot",
  "opencode-go": "OpenCode GO",
  "anthropic": "Claude",
  "deepseek": "DeepSeek",
  "openrouter": "OpenRouter",
  "mistral": "Mistral",
  "groq": "Groq",
  "cohere": "Cohere",
  "together": "Together",
  "perplexity": "Perplexity",
}

// Helper to detect active providers from OpenCode state
const getProviders = (providers: ReadonlyArray<{ id: string; name: string }> | undefined): string => {
  if (!providers || providers.length === 0) {
    return "No providers configured"
  }
  
  // Map provider IDs to friendly names and deduplicate
  const names = new Set<string>()
  for (const provider of providers) {
    const displayName = providerDisplayNames[provider.id] || provider.name || provider.id
    names.add(displayName)
  }
  
  // Return compact comma-separated list
  return Array.from(names).sort().join(", ")
}

const Home = (props: { theme: TuiThemeCurrent; config: Cfg; isBusy?: boolean }) => {
  const [eyeIndex, setEyeIndex] = createSignal(0)
  const [showTongue, setShowTongue] = createSignal(false)
  const [busyPhrase, setBusyPhrase] = createSignal("")
  
  // Animation: subtle eye variation every 3-5 seconds
  createEffect(() => {
    if (!props.config.animations) return
    
    const interval = setInterval(() => {
      // Randomly change eyes occasionally (20% chance)
      if (Math.random() < 0.2) {
        setEyeIndex((Math.floor(Math.random() * eyeVariations.length)))
      } else {
        setEyeIndex(0) // back to neutral
      }
    }, 4000) // check every 4 seconds
    
    onCleanup(() => clearInterval(interval))
  })
  
  // Busy state animation: show tongue + rotate phrases
  createEffect(() => {
    if (!props.config.animations || !props.isBusy) {
      setShowTongue(false)
      setBusyPhrase("")
      return
    }
    
    setShowTongue(true)
    
    let phraseIdx = 0
    setBusyPhrase(busyPhrases[phraseIdx])
    
    const interval = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % busyPhrases.length
      setBusyPhrase(busyPhrases[phraseIdx])
    }, 3000) // rotate every 3 seconds
    
    onCleanup(() => clearInterval(interval))
  })
  
  // Build Mustachi with current eye state
  const currentEyes = eyeVariations[eyeIndex()]
  const mustachi = mustachiBase.map((line, idx) => {
    // Replace eyes in line 2
    if (idx === 2) {
      return `   │ ${currentEyes.left} │       │ ${currentEyes.right} │    `
    }
    return line
  })
  
  // Add tongue if busy
  if (showTongue()) {
    mustachi.push("         ╲ ● ╱              ")
    mustachi.push("           v                ")
  }
  
  const topColor = props.theme.accent || "#E0C15A"
  const midColor = props.theme.primary || "#7FB4CA"
  const bottomColor = props.theme.error || "#CB7C94"
  
  return (
    <box flexDirection="column" alignItems="center">
      {/* Mustachi with 3-tone gradient */}
      {mustachi.map((line, idx) => {
        const totalLines = mustachi.length
        let color = midColor
        if (idx < totalLines / 3) {
          color = topColor
        } else if (idx >= (2 * totalLines) / 3) {
          color = bottomColor
        }
        return <text fg={color}>{line}</text>
      })}
      
      {/* OpenCode branding */}
      <box flexDirection="row" gap={0}>
        <text fg={props.theme.textMuted} dimColor={true}>╭</text>
        <text fg={props.theme.primary} dimColor={false}> OpenCode </text>
        <text fg={props.theme.textMuted} dimColor={true}>╮</text>
      </box>
      
      {/* Busy phrase if loading */}
      {busyPhrase() && (
        <text fg={props.theme.warning}>{busyPhrase()}</text>
      )}
      
      <text> </text>
    </box>
  )
}

const DetectedEnv = (props: { 
  theme: TuiThemeCurrent
  providers: ReadonlyArray<{ id: string; name: string }> | undefined
  config: Cfg
}) => {
  if (!props.config.show_detected) return null
  
  const os = props.config.show_os ? getOSName() : null
  const providers = props.config.show_providers ? getProviders(props.providers) : null
  
  // Don't render if nothing to show
  if (!os && !providers) return null
  
  return (
    <box flexDirection="row" gap={1}>
      <text fg={props.theme.textMuted}>Detected:</text>
      {os && <text fg={props.theme.text}>{os}</text>}
      {os && providers && <text fg={props.theme.textMuted}>•</text>}
      {providers && <text fg={props.theme.text}>{providers}</text>}
    </box>
  )
}

const tui: TuiPlugin = async (api, options) => {
  const boot = cfg(rec(options))
  if (!boot.enabled) return

  const [value] = createSignal(boot)
  const [isBusy, setIsBusy] = createSignal(false)

  await api.theme.install("./gentleman.json")
  if (value().set_theme) {
    api.theme.set(value().theme)
  }

  // Detect busy state if API exposes it
  // This is a best-effort detection - OpenCode TUI may or may not expose this
  createEffect(() => {
    try {
      // Check if there's a running agent or session state
      const hasRunningSession = api.state?.session?.running
      setIsBusy(!!hasRunningSession)
    } catch {
      // If API doesn't expose this, animations will just use idle state
      setIsBusy(false)
    }
  })

  api.slots.register({
    slots: {
      home_logo(ctx) {
        return <Home theme={ctx.theme.current} config={value()} isBusy={isBusy()} />
      },
      home_prompt_after(ctx) {
        return <DetectedEnv theme={ctx.theme.current} providers={api.state.provider} config={value()} />
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
