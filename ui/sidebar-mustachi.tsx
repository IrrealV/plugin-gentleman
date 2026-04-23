/** @jsxImportSource @opentui/solid */
import { createSignal, createEffect, createMemo } from "solid-js"
import { getStackFromLsp } from "../utils/detection.ts"
import { ellipsize } from "../utils/message-utils.ts"
import { extractMcpItems } from "../utils/mcp-utils.ts"
import { getRuntimeVisualHint, resolveVisualState, type MustachiVisualState } from "../utils/animation-utils.ts"
import { zoneColors } from "../ascii-frames.ts"
import { McpStatus, ProgressBar } from "../progress-components.tsx"
import { getZoneColor } from "./zone-colors.ts"
import { buildMustachiFace } from "./sidebar/face-builder.ts"
import {
  setupBlinkEffect,
  setupExpressiveCycleEffect,
  setupPupilMovementEffect,
  setupTongueAndPhraseEffect,
} from "./sidebar/expression-effects.ts"
import { deriveLiveAssistantStats } from "./sidebar/metrics.ts"
import { resolveProp, type SidebarMustachiProps } from "./sidebar/shared.ts"

export const SidebarMustachi = (props: SidebarMustachiProps) => {
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

  const resolvedLsp = createMemo(() => {
    const nextLsp = resolveProp(props.lsp)
    return Array.isArray(nextLsp) ? nextLsp : []
  })

  const detectedStack = createMemo(() => {
    return getStackFromLsp([...resolvedLsp()])
  })

  const resolvedSessionId = createMemo(() => resolveProp(props.sessionId))
  const resolvedPersonalityEnabled = createMemo(() => props.config.personality_enabled)
  const resolvedPersonalityMode = createMemo(() => props.config.personality_mode)
  const resolvedPersonalityModel = createMemo(() => props.config.personality_model ?? "")

  const runtimeHint = createMemo(() => getRuntimeVisualHint(resolveProp(props.runtimeContext)))

  const visualState = createMemo<MustachiVisualState>(() => {
    if (!resolvedPersonalityEnabled()) {
      return "idle"
    }

    return resolveVisualState({
      isBusy: !!props.isBusy,
      runtimeHint: runtimeHint(),
      expressiveCycle: expressiveCycle(),
    })
  })

  const shouldShowExpression = createMemo(() => resolvedPersonalityEnabled() && (!!props.isBusy || expressiveCycle()))

  setupPupilMovementEffect({
    animations: () => !!props.config.animations,
    visualState,
    setPupilIndex,
  })

  setupBlinkEffect({
    animations: () => !!props.config.animations,
    setBlinkFrame,
  })

  setupTongueAndPhraseEffect({
    animations: () => !!props.config.animations,
    shouldShowExpression,
    detectedStack,
    runtimeContext: () => resolveProp(props.runtimeContext),
    personalityProviders: () => resolveProp(props.providers),
    personalityEnabled: resolvedPersonalityEnabled,
    personalityMode: resolvedPersonalityMode,
    personalityModel: resolvedPersonalityModel,
    personalityModelClient: () => props.personalityModelClient,
    sessionId: resolvedSessionId,
    setTongueFrame,
    setBusyPhrase,
    setExpressiveCycle,
    setPhraseCycle,
  })

  setupExpressiveCycleEffect({
    animations: () => !!props.config.animations && resolvedPersonalityEnabled(),
    isBusy: () => resolvedPersonalityEnabled() && !!props.isBusy,
    runtimeHint: () => (resolvedPersonalityEnabled() ? runtimeHint() : undefined),
    setExpressiveCycle,
  })

  const branchLabel = createMemo(() => {
    const value = resolveProp(props.branch)?.trim()
    if (!value) return ""
    return ellipsize(value, 24)
  })

  const resolvedContextLimit = createMemo(() => resolveProp(props.contextLimit))
  const resolvedContextLimitEstimated = createMemo(() => !!resolveProp(props.contextLimitEstimated))
  const resolvedCostBudgetUsd = createMemo(() => resolveProp(props.costBudgetUsd))
  const resolvedMcp = createMemo(() => resolveProp(props.mcpData))

  const liveAssistantStats = createMemo(() => deriveLiveAssistantStats(resolvedMessages()))

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
      {buildMustachiFace({
        pupilIndex: pupilIndex(),
        blinkFrame: blinkFrame(),
        visualState: visualState(),
        detectedStack: detectedStack(),
        shouldShowExpression: shouldShowExpression(),
        tongueFrame: tongueFrame(),
      }).map(({ content, zone }) => {
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
