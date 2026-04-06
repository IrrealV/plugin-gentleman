import type { Message, MessageTokens, TokenUsage } from "./types"

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

export const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return 0
    return value
  }

  if (typeof value === "string") {
    const normalized = value.trim()
    if (!normalized) return 0
    const parsed = Number(normalized)
    if (!Number.isFinite(parsed)) return 0
    return parsed
  }

  return 0
}

export const formatTokens = (tokens: number): string => {
  const value = Math.max(0, toNumber(tokens))
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${Math.round(value)}`
}

export const formatCost = (cost: number): string => {
  const value = Math.max(0, toNumber(cost))
  return `$${value.toFixed(2)}`
}

export const getPct = (value: number, total: number): number => {
  const safeValue = Math.max(0, toNumber(value))
  const safeTotal = Math.max(0, toNumber(total))
  if (!safeTotal) return 0
  return Math.min(100, Math.round((safeValue / safeTotal) * 100))
}

export const getMessageRole = (message: Message): string => {
  return String(message.role ?? message.message?.role ?? message.author?.role ?? "")
}

export const getTokenUsage = (message: Message): TokenUsage => {
  const usage = message.tokenUsage ?? message.usage ?? message.token_usage
  if (usage && isRecord(usage)) return usage as TokenUsage
  return {}
}

const getNativeTokens = (message: Message): MessageTokens | undefined => {
  const tokens = message.tokens
  if (!tokens || !isRecord(tokens)) return

  const hasNativeFields =
    Object.prototype.hasOwnProperty.call(tokens, "input") ||
    Object.prototype.hasOwnProperty.call(tokens, "output") ||
    Object.prototype.hasOwnProperty.call(tokens, "reasoning") ||
    Object.prototype.hasOwnProperty.call(tokens, "cache")

  if (!hasNativeFields) return
  return tokens as MessageTokens
}

export const hasTokenData = (message: Message): boolean => {
  const nativeTokens = getNativeTokens(message)
  if (nativeTokens) return toNumber(nativeTokens.output) > 0

  const usage = getTokenUsage(message)
  const hasParsedValue = (value: unknown): boolean => toNumber(value) > 0

  return (
    hasParsedValue(message.tokens) ||
    hasParsedValue(message.total_tokens) ||
    hasParsedValue(usage.total) ||
    hasParsedValue(usage.total_tokens) ||
    hasParsedValue(usage.input) ||
    hasParsedValue(usage.input_tokens) ||
    hasParsedValue(usage.prompt_tokens) ||
    hasParsedValue(usage.output) ||
    hasParsedValue(usage.output_tokens) ||
    hasParsedValue(usage.completion_tokens)
  )
}

export const getContextTokens = (message: Message): number => {
  const nativeTokens = getNativeTokens(message)
  if (nativeTokens) {
    return Math.max(
      0,
      toNumber(nativeTokens.input) +
        toNumber(nativeTokens.output) +
        toNumber(nativeTokens.reasoning) +
        toNumber(nativeTokens.cache?.read) +
        toNumber(nativeTokens.cache?.write),
    )
  }

  const usage = getTokenUsage(message)
  const direct = toNumber(message.tokens)
  if (direct > 0) return direct

  const total = toNumber(usage.total || usage.total_tokens || message.total_tokens)
  if (total > 0) return total

  const input = toNumber(usage.input || usage.input_tokens || usage.prompt_tokens)
  const output = toNumber(usage.output || usage.output_tokens || usage.completion_tokens)
  return Math.max(0, input + output)
}

export const getMessageCost = (message: Message): number => {
  const usage = getTokenUsage(message)
  return Math.max(0, toNumber(message.cost_usd ?? message.cost ?? message.total_cost ?? usage.cost ?? usage.cost_usd))
}

export const ellipsize = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) return value
  if (maxLength <= 3) return value.slice(0, maxLength)
  return `${value.slice(0, maxLength - 3)}...`
}
