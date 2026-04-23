import type { DetectedStack } from "./detection.ts"
import type { McpItem, RuntimeContext } from "../types.ts"

type RuntimeRecord = Record<string, unknown>

const isRecord = (value: unknown): value is RuntimeRecord => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

const monocleLensStackGlyph: Record<DetectedStack, string> = {
  react: "◈",
  angular: "◉",
  vue: "◇",
  node: "●",
  go: "◆",
  python: "◐",
  dotnet: "◍",
  svelte: "◒",
  nextjs: "◌",
  rust: "◧",
  cpp: "◨",
  lua: "◦",
}

export type MonocleLensOverlay = {
  glyph: string
  source: "mcp" | "model" | "stack" | "runtime"
}

const monocleLensModelGlyph = {
  openai: "◎",
  anthropic: "◍",
  google: "◐",
  local: "◒",
  generic: "◉",
} as const

const monocleLensRuntimeGlyph: Record<Exclude<MustachiVisualState, "idle">, string> = {
  working: "◑",
  thinking: "◌",
}

const activeMcpStatuses = new Set(["connected", "enabled", "ready", "online", "active", "running"])

export const MONOCLE_LENS_OVERLAY_LINE_INDEX = 2
const MONOCLE_LENS_OVERLAY_COLUMN_INDEX = 7

const replaceCharAt = (line: string, index: number, value: string): string => {
  if (index < 0 || index >= line.length) return line
  return `${line.slice(0, index)}${value}${line.slice(index + 1)}`
}

const normalizeToken = (value: unknown): string => String(value ?? "").trim().toLowerCase()

const getRuntimeRecord = (runtimeContext: RuntimeContext | unknown): RuntimeRecord | undefined => {
  if (!isRecord(runtimeContext)) return
  return (isRecord(runtimeContext.runtime) ? runtimeContext.runtime : runtimeContext) as RuntimeRecord
}

const getRuntimeModelToken = (runtimeContext: RuntimeContext | unknown): string => {
  const runtime = getRuntimeRecord(runtimeContext)
  if (!runtime) return ""

  const runtimeModel = isRecord(runtime.model) ? runtime.model : undefined
  const rootModel = isRecord((runtimeContext as RuntimeRecord).model) ? (runtimeContext as RuntimeRecord).model : undefined
  return normalizeToken(
    runtimeModel?.id ??
      runtimeModel?.name ??
      rootModel?.id ??
      rootModel?.name ??
      runtime.model ??
      (runtimeContext as RuntimeRecord).model,
  )
}

const getRuntimeProviderToken = (runtimeContext: RuntimeContext | unknown): string => {
  const runtime = getRuntimeRecord(runtimeContext)
  if (!runtime) return ""
  return normalizeToken(runtime.provider ?? (runtimeContext as RuntimeRecord).provider)
}

const hasMcpSignal = (items: ReadonlyArray<McpItem> | undefined): boolean => {
  try {
    if (!Array.isArray(items) || items.length === 0) return false
    return items.some(item => {
      if (!isRecord(item)) return false
      return activeMcpStatuses.has(normalizeToken(item.status))
    })
  } catch {
    return false
  }
}

const resolveModelGlyph = (input: { providerID?: string; modelID?: string; runtimeContext?: RuntimeContext | unknown }): string | undefined => {
  const provider = normalizeToken(input.providerID) || getRuntimeProviderToken(input.runtimeContext)
  const model = normalizeToken(input.modelID) || getRuntimeModelToken(input.runtimeContext)
  const combined = `${provider} ${model}`.trim()
  if (!combined) return

  if (combined.includes("openai") || combined.includes("gpt")) return monocleLensModelGlyph.openai
  if (combined.includes("anthropic") || combined.includes("claude")) return monocleLensModelGlyph.anthropic
  if (combined.includes("google") || combined.includes("gemini")) return monocleLensModelGlyph.google
  if (combined.includes("ollama") || combined.includes("local")) return monocleLensModelGlyph.local
  return monocleLensModelGlyph.generic
}

export const resolveMonocleLensOverlay = (input: {
  mcpSignalEnabled?: boolean
  mcpItems?: ReadonlyArray<McpItem>
  providerID?: string
  modelID?: string
  runtimeContext?: RuntimeContext | unknown
  detectedStack?: DetectedStack
  runtimeHint?: MustachiVisualState
}): MonocleLensOverlay | undefined => {
  try {
    if (input.mcpSignalEnabled === true && hasMcpSignal(input.mcpItems)) return { glyph: "✦", source: "mcp" }

    const modelGlyph = resolveModelGlyph(input)
    if (modelGlyph) return { glyph: modelGlyph, source: "model" }

    const stackGlyph = input.detectedStack ? monocleLensStackGlyph[input.detectedStack] : undefined
    if (stackGlyph) return { glyph: stackGlyph, source: "stack" }

    if (input.runtimeHint && input.runtimeHint !== "idle") {
      return { glyph: monocleLensRuntimeGlyph[input.runtimeHint], source: "runtime" }
    }

    return
  } catch {
    return
  }
}

export const applyMonocleLensOverlay = (frame: string[], overlay: MonocleLensOverlay | undefined): string[] => {
  try {
    if (!overlay?.glyph) return frame

    return frame.map((line, idx) => {
      if (idx !== MONOCLE_LENS_OVERLAY_LINE_INDEX) return line
      return replaceCharAt(line, MONOCLE_LENS_OVERLAY_COLUMN_INDEX, overlay.glyph)
    })
  } catch {
    return frame
  }
}

export type MustachiVisualState = "idle" | "thinking" | "working"

export const getRuntimeVisualHint = (runtimeContext: RuntimeContext | unknown): MustachiVisualState | undefined => {
  try {
    if (!isRecord(runtimeContext)) return

    const runtime = (isRecord(runtimeContext.runtime) ? runtimeContext.runtime : runtimeContext) as RuntimeRecord
    const session = isRecord(runtimeContext.session) ? runtimeContext.session : undefined

    const status = String(runtime.status ?? runtime.state ?? runtime.phase ?? "").toLowerCase()
    const runningSignal = runtime.running ?? session?.running

    if (runningSignal === true) return "working"
    if (status.includes("work") || status.includes("run") || status.includes("load") || status.includes("generat")) {
      return "working"
    }
    if (status.includes("think") || status.includes("reason") || status.includes("plan")) {
      return "thinking"
    }
    return
  } catch {
    return
  }
}

export const resolveVisualState = (input: {
  isBusy: boolean
  runtimeHint?: MustachiVisualState
  expressiveCycle: boolean
}): MustachiVisualState => {
  if (input.isBusy || input.runtimeHint === "working") return "working"
  if (input.expressiveCycle || input.runtimeHint === "thinking") return "thinking"
  return "idle"
}
