// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import { readFileSync } from "node:fs"
import type { TuiPlugin, TuiPluginModule, TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup, createEffect } from "solid-js"

const id = "gentleman"

// Premium Mustachi ASCII art - structured by semantic zones
// Each eye state is a complete frame to avoid partial replacements

// Eye frames - neutral state with different pupil positions
// All lines are padded to 27 chars for perfect alignment with mustache
const eyeNeutralCenter = [
  "     █████       █████     ",  // 27 chars (was 22)
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars (was 24)
  "  ██░░███░░██ ██░░░░░░░██  ",  // 27 chars (was 25)
  "  ██░░███░░██ ██░░░░░░░██  ",  // 27 chars (was 25)
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars (unchanged)
]

const eyeNeutralLeft = [
  "     █████       █████     ",  // 27 chars (was 22)
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars (was 24)
  "  ██████░░░██ ██░░░░░░░██  ",  // 27 chars (was 25)
  "  ██████░░░██ ██░░░░░░░██  ",  // 27 chars (was 25)
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars (unchanged)
]

const eyeNeutralRight = [
  "     █████       █████     ",  // 27 chars (was 22)
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars (was 24)
  "  ██░░░██████ ██░░░░░░░██  ",  // 27 chars (was 25)
  "  ██░░░██████ ██░░░░░░░██  ",  // 27 chars (was 25)
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars (unchanged)
]

// Squinted eyes version for busy/expressive state
const eyeSquinted = [
  "     █████       █████     ",  // 27 chars (was 22)
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars (was 24)
  "  ██░░███░░██ ██░░░░░░░██  ",  // 27 chars (was 25)
  "   █████████   █████████   ",  // 27 chars (was 24)
  "██  █████         █████  ██",  // 27 chars (unchanged)
]

// Blink frames - half closed
const eyeBlinkHalf = [
  "     █████       █████     ",  // 27 chars (was 22)
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars (was 24)
  "  ██░░███░░██ ██░░░░░░░██  ",  // 27 chars (was 25)
  "   █████████   █████████   ",  // 27 chars (was 24)
  "██  █████         █████  ██",  // 27 chars (unchanged)
]

// Blink frames - fully closed
const eyeBlinkClosed = [
  "     █████       █████     ",  // 27 chars (was 22)
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars (was 24)
  "   █████████   █████████   ",  // 27 chars (was 24)
  "   █████████   █████████   ",  // 27 chars (was 24)
  "██  █████         █████  ██",  // 27 chars (unchanged)
]

// Mustache section (all lines padded to 27 chars for alignment)
const mustachiMustacheSection = [
  "██████████         ████████",  // 27 chars (unchanged)
  "████████████     ██████████",  // 27 chars (unchanged)
  " █████████████████████████ ",  // 27 chars (was 26)
  "  ▓██████████   ██████████▓",  // 27 chars (unchanged)
  "    ▓██████       ██████▓  ",  // 27 chars (was 25)
]

// Tongue animation frames (progressive) - compact design
const tongueFrames = [
  [],  // no tongue
  ["             ███", "              █"],  // tongue out
]

// Mustache-only ASCII art for home logo (original massive solid block design)
const mustachiMustacheOnly = [
  "",
  "               ████████                 ████████",
  "             ████████████             ████████████",
  "    ██      ████████████████       ████████████████      ██",
  "   ████    ████████████████████ ████████████████████    ████",
  "  ██████  ███████████████████████████████████████████  ██████",
  "  ███████████████████████████████████████████████████████████",
  "  ███████████████████████████████████████████████████████████",
  "  ███████████████████████████████████████████████████████████",
  "   █████████████████████████████████████████████████████████",
  "    ███████████████████████████████████████████████████████",
  "      ▓▓█████████████████████     █████████████████████▓▓",
  "        ▓▓▓███████████████           ███████████████▓▓▓",
  "           ▓▓▓█████████                 █████████▓▓▓",
  "              ▓▓▓▓▓▓▓                     ▓▓▓▓▓▓▓",
  "",
]

// Pupil position mapping for look-around animation
const pupilPositionFrames = [
  eyeNeutralCenter,  // center
  eyeNeutralLeft,    // looking left
  eyeNeutralRight,   // looking right
  eyeNeutralCenter,  // back to center
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

// Home logo: Mustache-only (simple and prominent) with grayscale gradient
const HomeLogo = (props: { theme: TuiThemeCurrent }) => {
  // Grayscale palette for better TUI readability
  const lightGray = "#C0C0C0"   // Light gray for highlights
  const midGray = "#808080"      // Mid gray for main body
  const darkGray = "#505050"     // Dark gray for shadows
  
  return (
    <box flexDirection="column" alignItems="center">
      {/* Mustache with grayscale gradient for depth */}
      {mustachiMustacheOnly.map((line, idx) => {
        const totalLines = mustachiMustacheOnly.length
        let color = midGray
        if (idx < totalLines / 3) {
          color = lightGray  // Top highlight
        } else if (idx >= (2 * totalLines) / 3) {
          color = darkGray   // Bottom shadow
        }
        return <text fg={color}>{line.padEnd(61, " ")}</text>
      })}
      
      {/* OpenCode branding */}
      <box flexDirection="row" gap={0} marginTop={1}>
        <text fg={props.theme.textMuted} dimColor={true}>╭ </text>
        <text fg={props.theme.primary} bold={true}> O p e n C o d e </text>
        <text fg={props.theme.textMuted} dimColor={true}> ╮</text>
      </box>
      
      <text> </text>
    </box>
  )
}

// Sidebar: Full Mustachi face with progressive animations (semantic zone colors)
const SidebarMustachi = (props: { theme: TuiThemeCurrent; config: Cfg; isBusy?: boolean }) => {
  const [pupilIndex, setPupilIndex] = createSignal(0)
  const [blinkFrame, setBlinkFrame] = createSignal(0)
  const [tongueFrame, setTongueFrame] = createSignal(0)
  const [busyPhrase, setBusyPhrase] = createSignal("")
  const [expressiveCycle, setExpressiveCycle] = createSignal(false)
  
  // Animation: pupil movement (look around) - low frequency, progressive
  createEffect(() => {
    if (!props.config.animations || props.isBusy || expressiveCycle()) {
      setPupilIndex(0)
      return
    }
    
    const interval = setInterval(() => {
      // Cycle through pupil positions progressively
      setPupilIndex((prev) => {
        // 80% chance to stay at center, 20% to move
        if (Math.random() < 0.8) return 0
        return (prev + 1) % pupilPositionFrames.length
      })
    }, 3000)
    
    onCleanup(() => clearInterval(interval))
  })
  
  // Animation: blink - occasional, progressive
  createEffect(() => {
    if (!props.config.animations) return
    
    const blinkSequence = async () => {
      // Open -> half -> closed -> half -> open
      setBlinkFrame(0)
      await new Promise(r => setTimeout(r, 150))
      setBlinkFrame(1)
      await new Promise(r => setTimeout(r, 100))
      setBlinkFrame(2)
      await new Promise(r => setTimeout(r, 100))
      setBlinkFrame(1)
      await new Promise(r => setTimeout(r, 100))
      setBlinkFrame(0)
    }
    
    const interval = setInterval(() => {
      // Blink occasionally (15% chance every 4s)
      if (Math.random() < 0.15) {
        blinkSequence()
      }
    }, 4000)
    
    onCleanup(() => clearInterval(interval))
  })
  
  // Busy/expressive state animation: tongue + phrases
  // If isBusy is reliably reactive, use it; otherwise demonstrate expressiveness periodically
  createEffect(() => {
    if (!props.config.animations) {
      setTongueFrame(0)
      setBusyPhrase("")
      setExpressiveCycle(false)
      return
    }
    
    const shouldShowExpression = props.isBusy || expressiveCycle()
    
    if (!shouldShowExpression) {
      setTongueFrame(0)
      setBusyPhrase("")
      return
    }
    
    // Show tongue progressively when entering expressive state
    let currentFrame = 0
    let tongueTimeoutId: NodeJS.Timeout | undefined
    const growTongue = () => {
      if (currentFrame < tongueFrames.length - 1) {
        currentFrame++
        setTongueFrame(currentFrame)
      }
    }
    tongueTimeoutId = setTimeout(growTongue, 200)
    
    // Rotate busy phrases
    let phraseIdx = Math.floor(Math.random() * busyPhrases.length)
    setBusyPhrase(busyPhrases[phraseIdx])
    
    const interval = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % busyPhrases.length
      setBusyPhrase(busyPhrases[phraseIdx])
    }, 3000)
    
    onCleanup(() => {
      clearInterval(interval)
      if (tongueTimeoutId !== undefined) {
        clearTimeout(tongueTimeoutId)
      }
    })
  })
  
  // Fallback: Periodic expressive cycle (conservative - every 45-60s for ~8s)
  // This ensures tongue + phrases are visibly demonstrated even if runtime busy state is unreliable
  createEffect(() => {
    if (!props.config.animations || props.isBusy) return
    
    const triggerExpressiveCycle = () => {
      setExpressiveCycle(true)
      
      // End expressive cycle after 8 seconds
      setTimeout(() => {
        setExpressiveCycle(false)
      }, 8000)
    }
    
    // First cycle after 30-45s, then every 45-60s
    const firstDelay = 30000 + Math.random() * 15000
    const firstTimeout = setTimeout(triggerExpressiveCycle, firstDelay)
    
    const interval = setInterval(() => {
      triggerExpressiveCycle()
    }, 45000 + Math.random() * 15000)
    
    onCleanup(() => {
      clearTimeout(firstTimeout)
      clearInterval(interval)
    })
  })
  
  // Build the complete Mustachi face
  const buildFace = () => {
    const lines: { content: string; zone: string }[] = []
    
    // Select eye frame based on state
    let eyeFrame = pupilPositionFrames[pupilIndex()]
    
    // Apply squint if busy/expressive
    if (props.isBusy || expressiveCycle()) {
      eyeFrame = eyeSquinted
    }
    
    // Apply blink animation if active
    if (blinkFrame() === 1) {
      eyeFrame = eyeBlinkHalf
    } else if (blinkFrame() === 2) {
      eyeFrame = eyeBlinkClosed
    }
    
    // Add eyes with zone metadata
    eyeFrame.forEach((line, idx) => {
      // Lines 0-1 are monocle border, lines 2-4 are eye interior
      const zone = idx < 2 ? "monocle" : "eyes"
      lines.push({ content: line, zone })
    })
    
    // Add mustache section
    mustachiMustacheSection.forEach(line => {
      lines.push({ content: line, zone: "mustache" })
    })
    
    // Add tongue if expressive (mark as tongue zone for pink color)
    if ((props.isBusy || expressiveCycle()) && tongueFrame() > 0) {
      const tongueLines = tongueFrames[tongueFrame()]
      tongueLines.forEach(line => {
        lines.push({ content: line, zone: "tongue" })
      })
    }
    
    return lines
  }
  
  // Semantic zone colors for better visual hierarchy
  const zoneColors = {
    monocle: "#A0A0A0",    // Lighter gray for monocle border
    eyes: "#808080",        // Mid gray for eyes
    mustache: "#606060",    // Darker gray for mustache
    tongue: "#FF4466",      // Pink/Red for tongue
  }
  
  return (
    <box flexDirection="column" alignItems="center">
      {/* Full Mustachi face with semantic zone colors */}
      {buildFace().map(({ content, zone }) => {
        const color = zoneColors[zone as keyof typeof zoneColors] || zoneColors.mustache
        const paddedLine = content.padEnd(27, " ")
        return <text fg={color}>{paddedLine}</text>
      })}
      
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
      {os && providers && <text fg={props.theme.textMuted}>·</text>}
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
        return <HomeLogo theme={ctx.theme.current} />
      },
      home_bottom(ctx) {
        return <DetectedEnv theme={ctx.theme.current} providers={api.state.provider} config={value()} />
      },
      sidebar_content(ctx) {
        return <SidebarMustachi theme={ctx.theme.current} config={value()} isBusy={isBusy()} />
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
