// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import { readFileSync } from "node:fs"
import type { TuiPlugin, TuiPluginModule, TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup, createEffect } from "solid-js"

const id = "gentleman"

// Premium Mustachi ASCII art - compact version for sidebar (25 chars wide)
// Base structure with eyes that will be replaced dynamically
const mustachiNeutralBase = [
  "     █████       █████",
  "   ██░░░░░██   ██░░░░░██",
  "  ██░░███░░██ ██░░░░░░░██",
  "  ██░░███░░██ ██░░░░░░░██",
  "██ ██░░░░░██   ██░░░░░██ ██",
]

// Squinted eyes version for busy state
const mustachiSquintedBase = [
  "     █████       █████",
  "   ██░░░░░██   ██░░░░░██",
  "  ██░░███░░██ ██░░░░░░░██",
  "   █████████   █████████",
  "██  █████         █████  ██",
]

// Mustache section (compact 25-char wide design)
const mustachiMustacheSection = [
  "██████████         ████████",
  "████████████     ██████████",
  " █████████████████████████",
  "  ▓██████████   ██████████▓",
  "    ▓██████       ██████▓",
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

// Left pupil positions for look-around animation (progressive)
// Modifies only the left eye (white sclera with dark pupil)
// Right eye is monocle/glass and remains static
// Pupil is on lines 2 and 3 (indices 2-3) of the 5-line eye array
const leftPupilPositions = [
  "██░░███░░██",  // center (line 2 of eyes)
  "██████░░░██",  // looking left
  "██░░░██████",  // looking right
  "██░░███░░██",  // center again
]

// Blink animation frames (progressive) - affects both eyes
const blinkFrames = [
  // Open eyes (default state embedded in base arrays)
  { left: mustachiNeutralBase, squinted: mustachiSquintedBase },
  // Half closed
  { 
    left: [
      "     █████       █████",
      "   ██░░░░░██   ██░░░░░██",
      "  ██░░███░░██ ██░░░░░░░██",
      "   █████████   █████████",
      "██  █████         █████  ██",
    ],
    squinted: mustachiSquintedBase  // squinted stays squinted during blink
  },
  // Fully closed
  {
    left: [
      "     █████       █████",
      "   ██░░░░░██   ██░░░░░██",
      "   █████████   █████████",
      "   █████████   █████████",
      "██  █████         █████  ██",
    ],
    squinted: mustachiSquintedBase
  },
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

// Sidebar: Full Mustachi face with progressive animations (grayscale for clarity)
const SidebarMustachi = (props: { theme: TuiThemeCurrent; config: Cfg; isBusy?: boolean }) => {
  const [pupilIndex, setPupilIndex] = createSignal(0)
  const [blinkFrame, setBlinkFrame] = createSignal(0)
  const [tongueFrame, setTongueFrame] = createSignal(0)
  const [busyPhrase, setBusyPhrase] = createSignal("")
  
  // Animation: pupil movement (look around) - low frequency, progressive
  createEffect(() => {
    if (!props.config.animations || props.isBusy) {
      setPupilIndex(0)
      return
    }
    
    const interval = setInterval(() => {
      // Cycle through pupil positions progressively
      setPupilIndex((prev) => {
        // 80% chance to stay at center, 20% to move
        if (Math.random() < 0.8) return 0
        return (prev + 1) % leftPupilPositions.length
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
  
  // Busy state animation: tongue grows progressively + rotate phrases
  createEffect(() => {
    if (!props.config.animations || !props.isBusy) {
      setTongueFrame(0)
      setBusyPhrase("")
      return
    }
    
    // Grow tongue progressively when entering busy state (2 frames: hidden -> visible)
    let currentFrame = 0
    let tongueTimeoutId: NodeJS.Timeout | undefined
    const growTongue = () => {
      if (currentFrame < tongueFrames.length - 1) {
        currentFrame++
        setTongueFrame(currentFrame)
      }
    }
    // Show tongue immediately when busy
    tongueTimeoutId = setTimeout(growTongue, 200)
    
    // Rotate busy phrases
    let phraseIdx = 0
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
  
  // Build the complete Mustachi face
  const buildFace = () => {
    const lines: string[] = []
    
    // Select eye base based on busy state
    let eyeBase = props.isBusy ? mustachiSquintedBase : mustachiNeutralBase
    
    // Apply blink animation if active
    if (blinkFrame() > 0 && blinkFrame() < blinkFrames.length) {
      eyeBase = props.isBusy 
        ? blinkFrames[blinkFrame()].squinted 
        : blinkFrames[blinkFrame()].left
    }
    
    // Add eyes with pupil position (modify line 2 for left eye pupil - index 2 in 5-line array)
    eyeBase.forEach((line, idx) => {
      if (idx === 2 && !props.isBusy && pupilIndex() >= 0) {
        // Replace pupil in left eye (positions 2-12 of the line for the 25-char compact design)
        const pupil = leftPupilPositions[pupilIndex()]
        const modifiedLine = line.substring(0, 2) + pupil + line.substring(13)
        lines.push(modifiedLine)
      } else {
        lines.push(line)
      }
    })
    
    // Add mustache section
    mustachiMustacheSection.forEach(line => lines.push(line))
    
    // Add tongue if busy (progressive frames) - mark as tongue for coloring
    if (props.isBusy && tongueFrame() > 0) {
      const tongueLines = tongueFrames[tongueFrame()]
      tongueLines.forEach(line => lines.push(`TONGUE:${line}`))
    }
    
    return lines
  }
  
  // Grayscale palette for TUI clarity
  const lightGray = "#C0C0C0"   // Light gray for highlights
  const midGray = "#808080"      // Mid gray for main body
  const darkGray = "#505050"     // Dark gray for shadows
  const tongueColor = "#FF4466"  // Pink/Red for tongue
  
  return (
    <box flexDirection="column" alignItems="center">
      {/* Full Mustachi face with grayscale gradient + pink tongue */}
      {buildFace().map((line, idx, arr) => {
        // Check if this is a tongue line
        const isTongue = line.startsWith("TONGUE:")
        const displayLine = isTongue ? line.substring(7) : line
        const paddedLine = displayLine.padEnd(25, " ")
        
        if (isTongue) {
          return <text fg={tongueColor}>{paddedLine}</text>
        }
        
        // Apply grayscale gradient to eyes and mustache
        const totalLines = arr.length
        let color = midGray
        if (idx < totalLines / 3) {
          color = lightGray  // Top highlight
        } else if (idx >= (2 * totalLines) / 3) {
          color = darkGray   // Bottom shadow
        }
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
