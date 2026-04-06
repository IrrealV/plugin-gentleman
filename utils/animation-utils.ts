import type { DetectedStack } from "./detection.ts"
import type { RuntimeContext } from "../types.ts"

type RuntimeRecord = Record<string, unknown>

const isRecord = (value: unknown): value is RuntimeRecord => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

const rightEyeStackMark: Record<DetectedStack, string> = {
  react: "R",
  angular: "A",
  vue: "V",
  node: "N",
  go: "G",
  python: "P",
  dotnet: "D",
  svelte: "S",
  nextjs: "X",
  rust: "U",
}

const replaceCharAt = (line: string, index: number, value: string): string => {
  if (index < 0 || index >= line.length) return line
  return `${line.slice(0, index)}${value}${line.slice(index + 1)}`
}

export const applyRightEyeContextualMark = (frame: string[], stack: DetectedStack | undefined): string[] => {
  if (!stack) return frame
  const marker = rightEyeStackMark[stack]
  if (!marker) return frame

  return frame.map((line, idx) => {
    if (idx < 2 || idx > 3) return line
    return replaceCharAt(line, 20, marker)
  })
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
