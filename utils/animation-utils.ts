import type { DetectedStack } from "./detection.ts"
import type { McpItem, ModifiedFileItem, RuntimeContext } from "../types.ts"

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
  source: "modified" | "mcp" | "model" | "stack" | "runtime"
}

export type MonocleLensOverlayAnchor = {
  lineIndex: number
  columnIndex: number
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

const monocleLensFileTypeGlyph = {
  typescript: "◈",
  javascript: "●",
  json: "◫",
  markdown: "◇",
  styles: "◧",
  markup: "◌",
  go: "◆",
  python: "◐",
  rust: "◧",
  dotnet: "◍",
  lua: "◦",
  shell: "◒",
  config: "◉",
  generic: "·",
} as const

const activeMcpStatuses = new Set(["connected", "enabled", "ready", "online", "active", "running"])

export const MONOCLE_LENS_OVERLAY_LINE_INDEX = 2
const MONOCLE_LENS_OVERLAY_COLUMN_INDEX = 7

const MONOCLE_LENS_OVERLAY_FALLBACK_ANCHOR: MonocleLensOverlayAnchor = {
  lineIndex: MONOCLE_LENS_OVERLAY_LINE_INDEX,
  columnIndex: MONOCLE_LENS_OVERLAY_COLUMN_INDEX,
}

const monocleLensOverlayAnchorsByPupilIndex: Record<number, MonocleLensOverlayAnchor> = {
  0: { lineIndex: 2, columnIndex: 7 },
  1: { lineIndex: 1, columnIndex: 7 },
  2: { lineIndex: 3, columnIndex: 7 },
  3: { lineIndex: 2, columnIndex: 5 },
  4: { lineIndex: 2, columnIndex: 9 },
  5: { lineIndex: 1, columnIndex: 5 },
  6: { lineIndex: 1, columnIndex: 9 },
  7: { lineIndex: 3, columnIndex: 5 },
  8: { lineIndex: 3, columnIndex: 9 },
}

const replaceCharAt = (line: string, index: number, value: string): string => {
  if (index < 0 || index >= line.length) return line
  return `${line.slice(0, index)}${value}${line.slice(index + 1)}`
}

const isOverlayAnchorUsable = (frame: string[], anchor: MonocleLensOverlayAnchor | undefined): anchor is MonocleLensOverlayAnchor => {
  if (!anchor) return false
  const line = frame[anchor.lineIndex]
  if (typeof line !== "string") return false
  const char = line[anchor.columnIndex]
  return char === " "
}

export const resolveMonocleLensOverlayAnchor = (
  frame: string[],
  pupilIndex?: number,
): MonocleLensOverlayAnchor => {
  try {
    const mappedAnchor = typeof pupilIndex === "number" ? monocleLensOverlayAnchorsByPupilIndex[pupilIndex] : undefined
    if (isOverlayAnchorUsable(frame, mappedAnchor)) return mappedAnchor

    const candidates: MonocleLensOverlayAnchor[] = []
    for (let lineIndex = 1; lineIndex <= 3; lineIndex += 1) {
      const line = frame[lineIndex]
      if (typeof line !== "string") continue
      for (let columnIndex = 4; columnIndex <= 10; columnIndex += 1) {
        if (line[columnIndex] === " ") candidates.push({ lineIndex, columnIndex })
      }
    }

    const nearestCandidate = candidates.sort((left, right) => {
      const leftDistance = Math.abs(left.lineIndex - MONOCLE_LENS_OVERLAY_LINE_INDEX) + Math.abs(left.columnIndex - MONOCLE_LENS_OVERLAY_COLUMN_INDEX)
      const rightDistance = Math.abs(right.lineIndex - MONOCLE_LENS_OVERLAY_LINE_INDEX) + Math.abs(right.columnIndex - MONOCLE_LENS_OVERLAY_COLUMN_INDEX)
      return leftDistance - rightDistance
    })[0]

    if (isOverlayAnchorUsable(frame, nearestCandidate)) return nearestCandidate
    return MONOCLE_LENS_OVERLAY_FALLBACK_ANCHOR
  } catch {
    return MONOCLE_LENS_OVERLAY_FALLBACK_ANCHOR
  }
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

const getPathBasename = (file: string): string => {
  const normalized = file.split(/[?#]/, 1)[0] ?? ""
  return normalized.split(/[\\/]/).pop()?.toLowerCase() ?? ""
}

const getFileExtension = (file: string): string => {
  const basename = getPathBasename(file)
  if (!basename || basename.startsWith(".") && basename.indexOf(".", 1) === -1) return ""
  return basename.includes(".") ? basename.split(".").pop() ?? "" : basename
}

const resolveFileTypeGlyph = (file: string): string | undefined => {
  const basename = getPathBasename(file)
  const extension = getFileExtension(file)

  if (["ts", "tsx", "mts", "cts"].includes(extension)) return monocleLensFileTypeGlyph.typescript
  if (["js", "jsx", "mjs", "cjs"].includes(extension)) return monocleLensFileTypeGlyph.javascript
  if (["json", "jsonc"].includes(extension) || basename === "package-lock.json") return monocleLensFileTypeGlyph.json
  if (["md", "mdx", "markdown"].includes(extension)) return monocleLensFileTypeGlyph.markdown
  if (["css", "scss", "sass", "less", "styl"].includes(extension)) return monocleLensFileTypeGlyph.styles
  if (["html", "htm", "xml", "svg"].includes(extension)) return monocleLensFileTypeGlyph.markup
  if (extension === "go") return monocleLensFileTypeGlyph.go
  if (["py", "pyw"].includes(extension)) return monocleLensFileTypeGlyph.python
  if (extension === "rs") return monocleLensFileTypeGlyph.rust
  if (["cs", "fs", "vb"].includes(extension)) return monocleLensFileTypeGlyph.dotnet
  if (extension === "lua") return monocleLensFileTypeGlyph.lua
  if (["sh", "bash", "zsh", "fish"].includes(extension)) return monocleLensFileTypeGlyph.shell
  if (["yaml", "yml", "toml", "ini", "env"].includes(extension)) return monocleLensFileTypeGlyph.config
  if (["dockerfile", "makefile", "justfile"].includes(basename)) return monocleLensFileTypeGlyph.config
  if (extension) return monocleLensFileTypeGlyph.generic
  return
}

const resolveModifiedFileGlyph = (files: ReadonlyArray<ModifiedFileItem> | undefined): string | undefined => {
  try {
    if (!Array.isArray(files) || files.length === 0) return

    const candidates = files
      .filter(item => isRecord(item) && typeof item.file === "string" && item.file.trim())
      .map((item, index) => ({
        file: item.file,
        index,
        activity: Number(item.additions ?? 0) + Number(item.deletions ?? 0),
      }))
      .sort((left, right) => right.activity - left.activity || left.index - right.index)

    for (const candidate of candidates) {
      const glyph = resolveFileTypeGlyph(candidate.file)
      if (glyph) return glyph
    }

    return
  } catch {
    return
  }
}

export const resolveMonocleLensOverlay = (input: {
  modifiedFiles?: ReadonlyArray<ModifiedFileItem>
  mcpSignalEnabled?: boolean
  mcpItems?: ReadonlyArray<McpItem>
  providerID?: string
  modelID?: string
  runtimeContext?: RuntimeContext | unknown
  detectedStack?: DetectedStack
  runtimeHint?: MustachiVisualState
}): MonocleLensOverlay | undefined => {
  try {
    const modifiedFileGlyph = resolveModifiedFileGlyph(input.modifiedFiles)
    if (modifiedFileGlyph) return { glyph: modifiedFileGlyph, source: "modified" }

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

export const applyMonocleLensOverlay = (
  frame: string[],
  overlay: MonocleLensOverlay | undefined,
  input?: { pupilIndex?: number; anchor?: MonocleLensOverlayAnchor },
): string[] => {
  try {
    if (!overlay?.glyph) return frame
    const anchor = input?.anchor ?? resolveMonocleLensOverlayAnchor(frame, input?.pupilIndex)

    return frame.map((line, idx) => {
      if (idx !== anchor.lineIndex) return line
      return replaceCharAt(line, anchor.columnIndex, overlay.glyph)
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
