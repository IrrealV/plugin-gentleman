/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { createSignal, onCleanup, createEffect, createMemo } from "solid-js"
import type { Cfg } from "./config"
import { detectPrimaryStackContext, getOSName, getProviders } from "./detection"
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
import { pickBusyPhrase } from "./phrases"
import type { Message, RuntimeContext, ProviderInfo, SemanticZone } from "./types"
import { ellipsize, getContextTokens, getMessageCost, getMessageRole, hasTokenData } from "./message-utils"
import { extractMcpItems } from "./mcp-utils"
import { applyRightEyeContextualMark, getRuntimeVisualHint, resolveVisualState, type MustachiVisualState } from "./animation-utils"
import { McpStatus, ProgressBar } from "./progress-components"

type ThemeColor = NonNullable<TuiThemeCurrent["text"]>

export function getZoneColor(zone: SemanticZone | string, theme?: TuiThemeCurrent): string | ThemeColor {
  switch (zone) {
    case "monocle":
      return theme?.primary || zoneColors.eyes
    case "eyes":
      return theme?.primary || zoneColors.eyes
    case "mustache":
      return theme?.secondary || zoneColors.mustache
    case "tongue":
      return zoneColors.tongue
    default:
      return theme?.textMuted || zoneColors.mustache
  }
}

const resolveProp = <T,>(value: T | (() => T) | undefined): T | undefined => {
  if (typeof value === "function") return (value as () => T)()
  return value
}

// Home logo: Mustache-only (simple and prominent) flat tone
export const HomeLogo = (props: { theme: TuiThemeCurrent }) => {
  const mustacheTone = getZoneColor("mustache", props.theme)
  const mutedBranding = props.theme?.textMuted ?? "#888888"
  const primaryBranding = props.theme?.primary ?? "#FFFFFF"

  return (
    <box flexDirection="column" alignItems="center">
      {mustachiMustacheOnly.map(line => <text fg={mustacheTone}>{line.padEnd(61, " ")}</text>)}

      <box flexDirection="row" gap={0} marginTop={1}>
        <text fg={mutedBranding}>╭ </text>
        <text fg={primaryBranding}> O p e n C o d e </text>
        <text fg={mutedBranding}> ╮</text>
      </box>

      <text> </text>
    </box>
  )
}

export const SidebarMustachi = (props: {
  theme: TuiThemeCurrent
  config: Cfg
  isBusy?: boolean
  providers?: ReadonlyArray<ProviderInfo>
  sessionId?: string | (() => string | undefined)
  branch?: string | (() => string | undefined)
  getMessages?: () => Message[]
  mcpData?: unknown | (() => unknown)
  runtimeContext?: RuntimeContext | (() => RuntimeContext | undefined)
  contextLimit?: number | (() => number | undefined)
  contextLimitEstimated?: boolean | (() => boolean | undefined)
  costBudgetUsd?: number | (() => number | undefined)
}) => {
  const [pupilIndex, setPupilIndex] = createSignal(0)
  const [blinkFrame, setBlinkFrame] = createSignal(0)
  const [tongueFrame, setTongueFrame] = createSignal(0)
  const [busyPhrase, setBusyPhrase] = createSignal("")
  const [expressiveCycle, setExpressiveCycle] = createSignal(false)
  const [phraseCycle, setPhraseCycle] = createSignal(0)
  const [cachedTokens, setCachedTokens] = createSignal(0)
  const [cachedCost, setCachedCost] = createSignal(0)
  const [activeSessionId, setActiveSessionId] = createSignal<string | undefined>(undefined)

  const resolvedMessages = createMemo(() => {
    const nextMessages = props.getMessages?.() ?? []
    return Array.isArray(nextMessages) ? nextMessages : []
  })

  const detectedStack = createMemo(() => {
    return detectPrimaryStackContext({
      providers: props.providers,
      runtimeContext: resolveProp(props.runtimeContext),
      messages: resolvedMessages(),
    })
  })

  const runtimeHint = createMemo(() => getRuntimeVisualHint(resolveProp(props.runtimeContext)))

  const visualState = createMemo<MustachiVisualState>(() => {
    return resolveVisualState({
      isBusy: !!props.isBusy,
      runtimeHint: runtimeHint(),
      expressiveCycle: expressiveCycle(),
    })
  })

  const shouldShowExpression = createMemo(() => !!props.isBusy || expressiveCycle())

  createEffect(() => {
    if (!props.config.animations || visualState() !== "idle") {
      setPupilIndex(0)
      return
    }

    const interval = setInterval(() => {
      if (Math.random() < 0.6) {
        setPupilIndex(0)
      } else {
        const randomDir = 1 + Math.floor(Math.random() * (pupilPositionFrames.length - 1))
        setPupilIndex(randomDir)
      }
    }, 3000)

    onCleanup(() => clearInterval(interval))
  })

  createEffect(() => {
    if (!props.config.animations) return

    const timeoutIds = new Set<ReturnType<typeof setTimeout>>()
    const schedule = (fn: () => void, delay: number) => {
      const timeoutId = setTimeout(() => {
        timeoutIds.delete(timeoutId)
        fn()
      }, delay)
      timeoutIds.add(timeoutId)
    }

    const blinkSequence = () => {
      setBlinkFrame(0)
      schedule(() => setBlinkFrame(1), 100)
      schedule(() => setBlinkFrame(2), 180)
      schedule(() => setBlinkFrame(1), 260)
      schedule(() => setBlinkFrame(0), 340)
    }

    const interval = setInterval(() => {
      if (Math.random() < 0.35) blinkSequence()
    }, 2000)

    onCleanup(() => {
      clearInterval(interval)
      for (const timeoutId of timeoutIds) {
        clearTimeout(timeoutId)
      }
      timeoutIds.clear()
    })
  })

  createEffect(() => {
    if (!props.config.animations) {
      setTongueFrame(0)
      setBusyPhrase("")
      setExpressiveCycle(false)
      return
    }

    if (!shouldShowExpression()) {
      setTongueFrame(0)
      setBusyPhrase("")
      return
    }

    let currentFrame = 0
    let tongueTimeoutId: ReturnType<typeof setTimeout> | undefined

    const growTongue = () => {
      if (currentFrame < tongueFrames.length - 1) {
        currentFrame += 1
        setTongueFrame(currentFrame)
      }
    }

    tongueTimeoutId = setTimeout(growTongue, 200)

    const rotatePhrase = () => {
      setPhraseCycle(previousCycle => {
        const nextCycle = previousCycle + 1
        setBusyPhrase(previous => pickBusyPhrase({ framework: detectedStack(), cycle: nextCycle, previous }))
        return nextCycle
      })
    }

    rotatePhrase()
    const phraseInterval = setInterval(rotatePhrase, 3500)

    onCleanup(() => {
      if (tongueTimeoutId !== undefined) clearTimeout(tongueTimeoutId)
      clearInterval(phraseInterval)
    })
  })

  createEffect(() => {
    if (!props.config.animations || props.isBusy) {
      setExpressiveCycle(false)
      return
    }

    if (runtimeHint() === "working" || runtimeHint() === "thinking") {
      setExpressiveCycle(false)
      return
    }

    let cycleEndTimeout: ReturnType<typeof setTimeout> | undefined

    const triggerExpressiveCycle = () => {
      setExpressiveCycle(true)
      cycleEndTimeout = setTimeout(() => {
        setExpressiveCycle(false)
      }, 8000)
    }

    const firstDelay = 45000 + Math.random() * 15000
    const firstTimeout = setTimeout(triggerExpressiveCycle, firstDelay)

    const interval = setInterval(() => {
      triggerExpressiveCycle()
    }, 45000 + Math.random() * 15000)

    onCleanup(() => {
      clearTimeout(firstTimeout)
      clearInterval(interval)
      if (cycleEndTimeout !== undefined) clearTimeout(cycleEndTimeout)
      setExpressiveCycle(false)
    })
  })

  const buildFace = () => {
    const lines: { content: string; zone: SemanticZone }[] = []

    let eyeFrame = pupilPositionFrames[pupilIndex()]
    if (visualState() !== "idle") eyeFrame = eyeSquinted

    if (blinkFrame() === 1) {
      eyeFrame = eyeBlinkHalf
    } else if (blinkFrame() === 2) {
      eyeFrame = eyeBlinkClosed
    } else {
      eyeFrame = applyRightEyeContextualMark(eyeFrame, detectedStack())
    }

    eyeFrame.forEach((line, idx) => {
      lines.push({ content: line, zone: idx < 2 ? "monocle" : "eyes" })
    })

    mustachiMustacheSection.forEach(line => {
      lines.push({ content: line, zone: "mustache" })
    })

    if (shouldShowExpression() && tongueFrame() > 0) {
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
  const resolvedContextLimitEstimated = createMemo(() => !!resolveProp(props.contextLimitEstimated))
  const resolvedCostBudgetUsd = createMemo(() => resolveProp(props.costBudgetUsd))
  const resolvedSessionId = createMemo(() => resolveProp(props.sessionId))
  const resolvedMcp = createMemo(() => resolveProp(props.mcpData))

  const liveAssistantStats = createMemo(() => {
    const messages = resolvedMessages()
    let totalCost = 0
    let contextTokens = 0
    let hasContextTokens = false

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index]
      if (getMessageRole(message) !== "assistant") continue

      totalCost += getMessageCost(message)

      if (!hasContextTokens && hasTokenData(message)) {
        contextTokens = getContextTokens(message)
        hasContextTokens = true
      }
    }

    return { contextTokens, totalCost }
  })

  createEffect(() => {
    const sessionId = resolvedSessionId()
    if (sessionId !== activeSessionId()) {
      setActiveSessionId(sessionId)
      setCachedTokens(0)
      setCachedCost(0)
    }

    const liveTokens = liveAssistantStats().contextTokens
    const liveCost = liveAssistantStats().totalCost

    if (liveTokens > 0) setCachedTokens(liveTokens)
    if (liveCost > 0) setCachedCost(liveCost)
  })

  const contextTokens = createMemo(() => {
    const live = liveAssistantStats().contextTokens
    return live > 0 ? live : cachedTokens()
  })

  const totalCost = createMemo(() => {
    const live = liveAssistantStats().totalCost
    return live > 0 ? live : cachedCost()
  })

  const visibleMcpItems = createMemo(() => {
    return extractMcpItems(resolvedMcp())
  })

  return (
    <box flexDirection="column" alignItems="center">
      {buildFace().map(({ content, zone }) => {
        const color = getZoneColor(zone, props.theme)
        const paddedLine = content.padEnd(27, " ")
        return <text fg={color}>{paddedLine}</text>
      })}

      {shouldShowExpression() && busyPhrase() && (
        <text fg={props.theme?.warning ?? zoneColors.tongue}>{busyPhrase()}</text>
      )}

      {branchLabel() && (
        <box flexDirection="row" alignItems="center" gap={1} marginTop={1}>
          <text fg={props.theme?.accent ?? zoneColors.monocle}>⎇</text>
          <text fg={props.theme?.text ?? zoneColors.mustache}>{branchLabel()}</text>
        </box>
      )}

      {props.config.show_metrics && (
        <>
          <ProgressBar
            theme={props.theme}
            totalTokens={contextTokens()}
            totalCost={totalCost()}
            contextLimit={resolvedContextLimit()}
            contextLimitEstimated={resolvedContextLimitEstimated()}
            costBudgetUsd={resolvedCostBudgetUsd() ?? 1}
          />

          <McpStatus theme={props.theme} items={visibleMcpItems()} />
        </>
      )}

      <text> </text>
    </box>
  )
}

export const DetectedEnv = (props: {
  theme: TuiThemeCurrent
  providers: ReadonlyArray<ProviderInfo> | undefined
  config: Cfg
}) => {
  if (!props.config.show_detected) return null

  const os = props.config.show_os ? getOSName() : null
  const providers = props.config.show_providers ? getProviders(props.providers) : null

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
