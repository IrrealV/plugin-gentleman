/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { zoneColors } from "./ascii-frames.ts"
import { ellipsize, formatCost, formatTokens, getPct, toNumber } from "./utils/message-utils.ts"
import { getMcpStatusColor } from "./utils/mcp-utils.ts"
import type { McpItem } from "./types.ts"

type ThemeColor = NonNullable<TuiThemeCurrent["text"]>

export const MetricBar = (props: {
  theme?: TuiThemeCurrent
  label: string
  value: string
  pct: number | undefined
  pctText: string
  color: string | ThemeColor
  marginTop?: number
}) => {
  const barWidth = 20
  const labelWidth = 11
  const valueWidth = 16
  const pctWidth = 6

  const fitCell = (value: string, width: number): string => {
    return ellipsize(value, width).padStart(width, " ")
  }

  const buildBar = (pct: number | undefined) => {
    const normalizedPct = Math.max(0, Math.min(100, toNumber(pct)))
    const filled = normalizedPct > 0 ? Math.max(1, Math.round((normalizedPct / 100) * barWidth)) : 0
    return `${"█".repeat(filled)}${"▒".repeat(Math.max(0, barWidth - filled))}`
  }

  return (
    <box flexDirection="column" marginTop={props.marginTop ?? 0}>
      <box flexDirection="row">
        <text fg={props.theme?.textMuted ?? zoneColors.mustache}>{props.label.padEnd(labelWidth, " ")}</text>
        <text fg={props.theme?.text ?? "#FFFFFF"}>{fitCell(props.value, valueWidth)}</text>
      </box>
      <box flexDirection="row">
        <text fg={props.color}>{buildBar(props.pct)}</text>
        <text fg={props.theme?.textMuted ?? zoneColors.mustache}>{" "}</text>
        <text fg={props.theme?.textMuted ?? zoneColors.mustache}>{props.pctText.padStart(pctWidth, " ")}</text>
      </box>
    </box>
  )
}

export const ProgressBar = (props: {
  theme?: TuiThemeCurrent
  totalTokens: number
  totalCost: number
  contextLimit?: number
  contextLimitEstimated?: boolean
  costBudgetUsd: number
  showTokens?: boolean
  showCost?: boolean
  hasPriorContent?: boolean
}) => {
  const safeLimit = Math.max(0, toNumber(props.contextLimit))
  const hasContextLimit = safeLimit > 0
  const safeBudget = Math.max(0, toNumber(props.costBudgetUsd))
  const hasBudget = safeBudget > 0
  const contextUsagePct = hasContextLimit ? getPct(props.totalTokens, safeLimit) : undefined
  const costPct = hasBudget ? getPct(props.totalCost, safeBudget) : undefined

  const pctPrefix = props.contextLimitEstimated ? "~" : ""
  const tokensPctText = hasContextLimit ? `${pctPrefix}${contextUsagePct}%` : "n/a"
  const costValue = hasBudget ? `${formatCost(props.totalCost)} / ${formatCost(safeBudget)}` : `${formatCost(props.totalCost)} / n/a`
  const costPctText = hasBudget ? `${costPct}%` : "n/a"

  const showTokens = props.showTokens !== false
  const showCost = props.showCost !== false

  if (!showTokens && !showCost) return null

  return (
    <box flexDirection="column" marginTop={props.hasPriorContent ? 1 : 0}>
      {showTokens && (
        <MetricBar
          theme={props.theme}
          label="Tokens"
          value={formatTokens(props.totalTokens)}
          pct={contextUsagePct}
          pctText={tokensPctText}
          color={props.theme?.primary ?? zoneColors.eyes}
        />
      )}

      {showCost && (
        <MetricBar
          theme={props.theme}
          label="Cost"
          value={costValue}
          pct={costPct}
          pctText={costPctText}
          color={props.theme?.warning ?? zoneColors.tongue}
          marginTop={showTokens ? 1 : 0}
        />
      )}
    </box>
  )
}

export const McpStatus = (props: { theme?: TuiThemeCurrent; items: McpItem[]; marginTop?: number }) => {
  if (!props.items.length) return null

  return (
    <box flexDirection="row" alignItems="center" gap={1} marginTop={props.marginTop ?? 1} flexWrap="wrap">
      <text fg={props.theme?.textMuted ?? zoneColors.mustache}>MCP</text>
      {props.items.map(item => {
        return <text fg={getMcpStatusColor(item.status, props.theme)}>{item.name}</text>
      })}
    </box>
  )
}
