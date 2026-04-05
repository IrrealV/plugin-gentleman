// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup, createEffect, createMemo } from "solid-js"
import type { Cfg } from "./config"
import { getOSName, getProviders } from "./detection"
import {
  pupilPositionFrames,
  eyeSquinted,
  eyeBlinkHalf,
  eyeBlinkClosed,
  mustachiMustacheSection,
  tongueFrames,
  mustachiMustacheOnly,
  zoneColors,
} from "./ascii-frames"
import { busyPhrases } from "./phrases"

export type SemanticZone = "monocle" | "eyes" | "mustache" | "tongue" | "unknown"

export function getZoneColor(zone: SemanticZone | string, theme?: TuiThemeCurrent): string {
  switch (zone) {
    case "monocle":
      return theme?.accent || zoneColors.monocle
    case "eyes":
      return theme?.primary || zoneColors.eyes
    case "mustache":
      return theme?.secondary || zoneColors.mustache
    case "tongue":
      return theme?.warning || zoneColors.tongue
    default:
      return theme?.textMuted || zoneColors.mustache
  }
}

const toNumber = (value: unknown): number => {
  if (typeof value !== "number") return 0
  if (!Number.isFinite(value)) return 0
  return value
}

const formatTokens = (tokens: number): string => {
  const value = Math.max(0, toNumber(tokens))
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${Math.round(value)}`
}

const formatCost = (cost: number): string => {
  const value = Math.max(0, toNumber(cost))
  return `$${value.toFixed(2)}`
}

const getPct = (value: number, total: number): number => {
  const safeValue = Math.max(0, toNumber(value))
  const safeTotal = Math.max(0, toNumber(total))
  if (!safeTotal) return 0
  return Math.min(100, Math.round((safeValue / safeTotal) * 100))
}

const getMessageRole = (message: any): string => {
  return (
    message?.role ??
    message?.message?.role ??
    message?.author?.role ??
    ""
  )
}

const getTokenUsage = (message: any): any => {
  return message?.tokenUsage ?? message?.usage ?? message?.tokens ?? message?.token_usage ?? {}
}

const hasTokenData = (message: any): boolean => {
  const usage = getTokenUsage(message)
  return (
    typeof message?.tokens === "number" ||
    typeof message?.total_tokens === "number" ||
    typeof usage?.total === "number" ||
    typeof usage?.total_tokens === "number" ||
    typeof usage?.input === "number" ||
    typeof usage?.input_tokens === "number" ||
    typeof usage?.prompt_tokens === "number" ||
    typeof usage?.output === "number" ||
    typeof usage?.output_tokens === "number" ||
    typeof usage?.completion_tokens === "number"
  )
}

const getContextTokens = (message: any): number => {
  const usage = getTokenUsage(message)
  const direct = toNumber(message?.tokens)
  if (direct > 0) return direct

  const total = toNumber(usage?.total || usage?.total_tokens || message?.total_tokens)
  if (total > 0) return total

  const input = toNumber(usage?.input || usage?.input_tokens || usage?.prompt_tokens)
  const output = toNumber(usage?.output || usage?.output_tokens || usage?.completion_tokens)
  return Math.max(0, input + output)
}

const getMessageCost = (message: any): number => {
  const usage = getTokenUsage(message)
  return Math.max(
    0,
    toNumber(
      message?.cost_usd ??
      message?.cost ??
      message?.total_cost ??
      usage?.cost ??
      usage?.cost_usd,
    ),
  )
}

const ellipsize = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) return value
  if (maxLength <= 3) return value.slice(0, maxLength)
  return `${value.slice(0, maxLength - 3)}...`
}

const resolveProp = <T,>(value: T | (() => T) | undefined): T | undefined => {
  if (typeof value === "function") {
    return (value as () => T)()
  }
  return value
}

const ProgressBar = (props: {
  theme?: TuiThemeCurrent
  totalTokens: number
  totalCost: number
  contextLimit?: number
}) => {
  const safeLimit = Math.max(0, toNumber(props.contextLimit))
  const hasContextLimit = safeLimit > 0
  const usagePct = getPct(props.totalTokens, safeLimit)
  const barWidth = 18
  const filled = Math.round((usagePct / 100) * barWidth)
  const bar = `${"█".repeat(filled)}${"▒".repeat(Math.max(0, barWidth - filled))}`

  return (
    <box flexDirection="column" alignItems="center" marginTop={1}>
      <text fg={props.theme?.textMuted ?? zoneColors.mustache}>Tokens: {formatTokens(props.totalTokens)}</text>
      {hasContextLimit && (
        <text fg={props.theme?.accent ?? zoneColors.monocle}>Usage: {usagePct}% {bar}</text>
      )}
      <text fg={props.theme?.textMuted ?? zoneColors.mustache}>Cost: {formatCost(props.totalCost)}</text>
    </box>
  )
}

// Home logo: Mustache-only (simple and prominent) with grayscale gradient
export const HomeLogo = (props: { theme: TuiThemeCurrent }) => {
  const topTone = getZoneColor("monocle", props.theme)
  const midTone = getZoneColor("eyes", props.theme)
  const bottomTone = getZoneColor("mustache", props.theme)
  const mutedBranding = props.theme?.textMuted ?? "#888888"
  const primaryBranding = props.theme?.primary ?? "#FFFFFF"

  return (
    <box flexDirection="column" alignItems="center">
      {/* Mustache with theme-reactive gradient for depth */}
      {mustachiMustacheOnly.map((line, idx) => {
        const totalLines = mustachiMustacheOnly.length
        let color = midTone
        if (idx < totalLines / 3) {
          color = topTone  // Top highlight
        } else if (idx >= (2 * totalLines) / 3) {
          color = bottomTone   // Bottom shadow
        }
        return <text fg={color}>{line.padEnd(61, " ")}</text>
      })}

      {/* OpenCode branding */}
      <box flexDirection="row" gap={0} marginTop={1}>
        <text fg={mutedBranding} dimColor={true}>╭ </text>
        <text fg={primaryBranding} bold={true}> O p e n C o d e </text>
        <text fg={mutedBranding} dimColor={true}> ╮</text>
      </box>

      <text> </text>
    </box>
  )
}

// Sidebar: Full Mustachi face with progressive animations (semantic zone colors)
export const SidebarMustachi = (props: {
  theme: TuiThemeCurrent
  config: Cfg
  isBusy?: boolean
  branch?: string | (() => string | undefined)
  getMessages?: () => any[]
  contextLimit?: number | (() => number | undefined)
}) => {
  const [pupilIndex, setPupilIndex] = createSignal(0)
  const [blinkFrame, setBlinkFrame] = createSignal(0)
  const [tongueFrame, setTongueFrame] = createSignal(0)
  const [busyPhrase, setBusyPhrase] = createSignal("")
  const [expressiveCycle, setExpressiveCycle] = createSignal(false)

  // Animation: pupil movement (look around) - random transitions, not a sequence
  createEffect(() => {
    if (!props.config.animations || props.isBusy || expressiveCycle()) {
      setPupilIndex(0)
      return
    }

    const interval = setInterval(() => {
      // Random eye movement - not sequential
      // 60% chance to stay at center, 40% to move randomly
      if (Math.random() < 0.6) {
        setPupilIndex(0)  // center
      } else {
        // Pick a random direction (skip center at index 0)
        const randomDir = 1 + Math.floor(Math.random() * (pupilPositionFrames.length - 1))
        setPupilIndex(randomDir)
      }
    }, 3000)  // Natural cadence: check every 3s for eye movement

    onCleanup(() => clearInterval(interval))
  })

  // Animation: blink - occasional, progressive top-to-bottom motion
  createEffect(() => {
    if (!props.config.animations) return

    const blinkSequence = async () => {
      // Open -> half -> closed -> half -> open (normal eyelid motion)
      setBlinkFrame(0)
      await new Promise(r => setTimeout(r, 100))
      setBlinkFrame(1)
      await new Promise(r => setTimeout(r, 80))
      setBlinkFrame(2)
      await new Promise(r => setTimeout(r, 80))
      setBlinkFrame(1)
      await new Promise(r => setTimeout(r, 80))
      setBlinkFrame(0)
    }

    const interval = setInterval(() => {
      // Natural blink frequency (~every 5-6 seconds)
      // 35% chance every 2s = average 5.7s between blinks
      if (Math.random() < 0.35) {
        blinkSequence()
      }
    }, 2000)  // Natural cadence: check every 2s for blink

    onCleanup(() => clearInterval(interval))
  })

  // Busy/expressive state animation: tongue + single rotating phrase
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

    // Pick a single random phrase for this expressive cycle/state
    const pickRandomPhrase = () => {
      const randomIndex = Math.floor(Math.random() * busyPhrases.length)
      return busyPhrases[randomIndex]
    }

    setBusyPhrase(pickRandomPhrase())

    onCleanup(() => {
      if (tongueTimeoutId !== undefined) {
        clearTimeout(tongueTimeoutId)
      }
    })
  })

  // Fallback: Periodic expressive cycle (conservative - every ~45-60 seconds for ~8s)
  // This ensures tongue + phrases are visibly demonstrated even if runtime busy state is unreliable
  createEffect(() => {
    if (!props.config.animations || props.isBusy) return

    let cycleEndTimeout: NodeJS.Timeout | undefined

    const triggerExpressiveCycle = () => {
      setExpressiveCycle(true)

      // End expressive cycle after 8 seconds
      cycleEndTimeout = setTimeout(() => {
        setExpressiveCycle(false)
      }, 8000)
    }

    // First cycle after 45-60s, then every 45-60s (calm, occasional expressiveness)
    const firstDelay = 45000 + Math.random() * 15000
    const firstTimeout = setTimeout(triggerExpressiveCycle, firstDelay)

    const interval = setInterval(() => {
      triggerExpressiveCycle()
    }, 45000 + Math.random() * 15000)

    onCleanup(() => {
      clearTimeout(firstTimeout)
      clearInterval(interval)
      if (cycleEndTimeout !== undefined) {
        clearTimeout(cycleEndTimeout)
      }
      // Explicitly reset expressive cycle state to prevent sticking
      setExpressiveCycle(false)
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

  const branchLabel = createMemo(() => {
    const value = resolveProp(props.branch)?.trim()
    if (!value) return ""
    return ellipsize(value, 24)
  })

  const resolvedContextLimit = createMemo(() => resolveProp(props.contextLimit))

  const assistantMessages = createMemo(() => {
    const messages = props.getMessages?.() ?? []
    return messages.filter((message: any) => getMessageRole(message) === "assistant")
  })

  const contextTokens = createMemo(() => {
    const lastAssistantWithTokens = [...assistantMessages()].reverse().find((message: any) => hasTokenData(message))
    return getContextTokens(lastAssistantWithTokens)
  })

  const totalCost = createMemo(() => {
    return assistantMessages().reduce((sum: number, message: any) => sum + getMessageCost(message), 0)
  })

  return (
    <box flexDirection="column" alignItems="center">
      {/* Full Mustachi face with semantic zone colors */}
      {buildFace().map(({ content, zone }) => {
        const color = getZoneColor(zone, props.theme)
        const paddedLine = content.padEnd(27, " ")
        return <text fg={color}>{paddedLine}</text>
      })}

      {branchLabel() && (
        <text fg={props.theme?.textMuted ?? zoneColors.mustache}>⎇ {branchLabel()}</text>
      )}

      {props.config.show_metrics && (
        <ProgressBar
          theme={props.theme}
          totalTokens={contextTokens()}
          totalCost={totalCost()}
          contextLimit={resolvedContextLimit()}
        />
      )}

      {/* Display a single busy phrase for the current expressive cycle */}
      {busyPhrase() && (
        <text fg={props.theme?.warning ?? zoneColors.tongue}>{busyPhrase()}</text>
      )}

      <text> </text>
    </box>
  )
}

export const DetectedEnv = (props: {
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
