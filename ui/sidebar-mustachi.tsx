/** @jsxImportSource @opentui/solid */
import { createSignal, createEffect, createMemo } from "solid-js"
import { getStackFromLsp } from "../utils/detection.ts"
import { ellipsize } from "../utils/message-utils.ts"
import { extractMcpItems } from "../utils/mcp-utils.ts"
import { getRuntimeVisualHint, resolveMonocleLensOverlay, resolveVisualState, type MustachiVisualState } from "../utils/animation-utils.ts"
import { getLatestAssistantModelContext } from "../runtime/plugin-api.ts"
import { zoneColors } from "../ascii-frames.ts"
import { McpStatus, ProgressBar } from "../progress-components.tsx"
import { getSidebarMustachiZoneBackgroundColor, getSidebarMustachiZoneColor } from "./zone-colors.ts"
import { buildMustachiFace, normalizeSidebarFaceLine, SIDEBAR_FACE_WIDTH, type FaceSegment } from "./sidebar/face-builder.ts"
import {
  setupBlinkEffect,
  setupExpressiveCycleEffect,
  setupPupilMovementEffect,
  setupTongueAndPhraseEffect,
} from "./sidebar/expression-effects.ts"
import { deriveLiveAssistantStats } from "./sidebar/metrics.ts"
import { resolveProp, type SidebarMustachiProps } from "./sidebar/shared.ts"

type SegmentedCell = { content: string; zone: FaceSegment["zone"] | "unknown" }

const buildSegmentedCells = (segments: FaceSegment[], width = SIDEBAR_FACE_WIDTH): SegmentedCell[] => {
  const cells: SegmentedCell[] = []

  segments.forEach(segment => {
    Array.from(segment.content).forEach(content => {
      cells.push({ content, zone: segment.zone })
    })
  })

  while (cells.length < width) {
    cells.push({ content: " ", zone: "unknown" })
  }

  return cells.slice(0, width)
}

const getSegmentedCellBackgroundColor = (cell: SegmentedCell): string | undefined => {
  if (cell.zone === "eyeOverlay") return undefined
  return getSidebarMustachiZoneBackgroundColor(cell.zone)
}

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

  const latestModelContext = createMemo(() => getLatestAssistantModelContext(resolvedMessages()))

  const resolvedLsp = createMemo(() => {
    const nextLsp = resolveProp(props.lsp)
    return Array.isArray(nextLsp) ? nextLsp : []
  })

  const resolvedModifiedFiles = createMemo(() => {
    const nextModifiedFiles = resolveProp(props.modifiedFiles)
    return Array.isArray(nextModifiedFiles) ? nextModifiedFiles : []
  })

  const detectedStack = createMemo(() => {
    return getStackFromLsp([...resolvedLsp()])
  })

  const resolvedSessionId = createMemo(() => resolveProp(props.sessionId))
  const resolvedPersonalityEnabled = createMemo(() => props.config.personality_enabled)
  const runtimeHint = createMemo(() => getRuntimeVisualHint(resolveProp(props.runtimeContext)))

  const resolvedMcp = createMemo(() => resolveProp(props.mcpData))

  const visibleMcpItems = createMemo(() => {
    return extractMcpItems(resolvedMcp())
  })

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

  const monocleLensOverlay = createMemo(() =>
    resolveMonocleLensOverlay({
      modifiedFiles: resolvedModifiedFiles(),
      mcpSignalEnabled: true,
      mcpItems: visibleMcpItems(),
      providerID: latestModelContext().providerID,
      modelID: latestModelContext().modelID,
      runtimeContext: resolveProp(props.runtimeContext),
      detectedStack: detectedStack(),
      runtimeHint: runtimeHint(),
    }),
  )

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

  return (
    <box flexDirection="column" alignItems="center">
      {buildMustachiFace({
        variant: props.config.sidebar_mini_mascot ? "mini" : "full",
        pupilIndex: pupilIndex(),
        blinkFrame: blinkFrame(),
        visualState: visualState(),
        monocleLensOverlay: monocleLensOverlay(),
        shouldShowExpression: shouldShowExpression(),
        tongueFrame: tongueFrame(),
      }).map(({ content, zone, segments }) => {
        if (segments?.length) {
          const cells = buildSegmentedCells(segments)

          return (
            <box flexDirection="row" gap={0} width={SIDEBAR_FACE_WIDTH}>
              {cells.map(cell => (
                <text fg={getSidebarMustachiZoneColor(cell.zone, props.theme)} bg={getSegmentedCellBackgroundColor(cell)}>{cell.content}</text>
              ))}
            </box>
          )
        }

        const color = getSidebarMustachiZoneColor(zone, props.theme)
        const paddedLine = normalizeSidebarFaceLine(content)
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
