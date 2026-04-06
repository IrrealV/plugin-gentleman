/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { zoneColors } from "./ascii-frames"
import { ellipsize, formatCost, formatTokens, getPct, toNumber } from "./message-utils"
import { getMcpStatusColor } from "./mcp-utils"
import type { McpItem } from "./types"

export const ProgressBar = (props: {
  theme?: TuiThemeCurrent
  totalTokens: number
  totalCost: number
  contextLimit?: number
  contextLimitEstimated?: boolean
  costBudgetUsd: number
}) => {
  type ThemeColor = NonNullable<TuiThemeCurrent["text"]>
  const safeLimit = Math.max(0, toNumber(props.contextLimit))
  const hasContextLimit = safeLimit > 0
  const safeBudget = Math.max(0, toNumber(props.costBudgetUsd))
  const hasBudget = safeBudget > 0
  const contextUsagePct = hasContextLimit ? getPct(props.totalTokens, safeLimit) : undefined
  const costPct = hasBudget ? getPct(props.totalCost, safeBudget) : undefined
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

  const tokensLabel = "Tokens"
  const costLabel = "Cost"

  const pctPrefix = props.contextLimitEstimated ? "~" : ""
  const tokensPctText = hasContextLimit ? `${pctPrefix}${contextUsagePct}%` : "n/a"
  const costValue = hasBudget ? `${formatCost(props.totalCost)} / ${formatCost(safeBudget)}` : `${formatCost(props.totalCost)} / n/a`
  const costPctText = hasBudget ? `${costPct}%` : "n/a"

  const renderMetric = (input: {
    label: string
    value: string
    pct: number | undefined
    pctText: string
    color: string | ThemeColor
    marginTop?: number
  }) => {
    return (
      <box flexDirection="column" marginTop={input.marginTop ?? 0}>
        <box flexDirection="row">
          <text fg={props.theme?.textMuted ?? zoneColors.mustache}>{input.label.padEnd(labelWidth, " ")}</text>
          <text fg={props.theme?.text ?? "#FFFFFF"}>{fitCell(input.value, valueWidth)}</text>
        </box>
        <box flexDirection="row">
          <text fg={input.color}>{buildBar(input.pct)}</text>
          <text fg={props.theme?.textMuted ?? zoneColors.mustache}>{" "}</text>
          <text fg={props.theme?.textMuted ?? zoneColors.mustache}>{input.pctText.padStart(pctWidth, " ")}</text>
        </box>
      </box>
    )
  }

  return (
    <box flexDirection="column" marginTop={1}>
      {renderMetric({
        label: tokensLabel,
        value: formatTokens(props.totalTokens),
        pct: contextUsagePct,
        pctText: tokensPctText,
        color: props.theme?.primary ?? zoneColors.eyes,
      })}

      {renderMetric({
        label: costLabel,
        value: costValue,
        pct: costPct,
        pctText: costPctText,
        color: props.theme?.warning ?? zoneColors.tongue,
        marginTop: 1,
      })}
    </box>
  )
}

export const McpStatus = (props: { theme?: TuiThemeCurrent; items: McpItem[] }) => {
  if (!props.items.length) return null

  return (
    <box flexDirection="row" alignItems="center" gap={1} marginTop={1} flexWrap="wrap">
      <text fg={props.theme?.textMuted ?? zoneColors.mustache}>MCP</text>
      {props.items.map(item => {
        return <text fg={getMcpStatusColor(item.status, props.theme)}>{item.name}</text>
      })}
    </box>
  )
}
