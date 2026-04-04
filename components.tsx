// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup, createEffect } from "solid-js"
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

// Home logo: Mustache-only (simple and prominent) with grayscale gradient
export const HomeLogo = (props: { theme: TuiThemeCurrent }) => {
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
export const SidebarMustachi = (props: { theme: TuiThemeCurrent; config: Cfg; isBusy?: boolean }) => {
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

    // Pick a random phrase and rotate through the library
    const pickRandomPhrase = () => {
      const randomIndex = Math.floor(Math.random() * busyPhrases.length)
      return busyPhrases[randomIndex]
    }

    setBusyPhrase(pickRandomPhrase())

    const interval = setInterval(() => {
      setBusyPhrase(pickRandomPhrase())
    }, 3000)

    onCleanup(() => {
      clearInterval(interval)
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

    // First cycle after 30-45s, then every 45-60s (calm, occasional expressiveness)
    const firstDelay = 30000 + Math.random() * 15000
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

  return (
    <box flexDirection="column" alignItems="center">
      {/* Full Mustachi face with semantic zone colors */}
      {buildFace().map(({ content, zone }) => {
        const color = zoneColors[zone as keyof typeof zoneColors] || zoneColors.mustache
        const paddedLine = content.padEnd(27, " ")
        return <text fg={color}>{paddedLine}</text>
      })}

      {/* Display single busy phrase if loading */}
      {busyPhrase() && (
        <text fg={props.theme.warning}>{busyPhrase()}</text>
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
