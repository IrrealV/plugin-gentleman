import type { RuntimeContext } from "../types.ts"
import type { DetectedStack } from "../utils/detection.ts"
import type { ProviderCollection } from "./plugin-api.ts"
import {
  resolveModelResolution,
  type MustachiModelClass,
  type MustachiModelResolution,
} from "./model-resolver.ts"

export type MustachiSignal = "idle" | "busy" | "thinking" | "working"

export type MustachiActivity = "idle" | "waiting" | "debugging" | "building"

export type MustachiPressure = "low" | "medium" | "high"

export type MustachiGenerationReadiness = "ready" | "deferred" | "offline"

export type MustachiGenerationMode = "auto" | "off"

export interface MustachiContextSummary {
  activity: MustachiActivity
  pressure: MustachiPressure
  stack?: DetectedStack
  modelClass: MustachiModelClass
  generationMode: MustachiGenerationMode
  generationReadiness: MustachiGenerationReadiness
  generationHint: string
  source: "signal" | "runtime" | "stack" | "default"
  model?: string
}

const normalize = (value: unknown): string => {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

const createStatusMatcher = (value: string, token: string): boolean => {
  const normalized = normalize(value)
  if (!normalized) return false

  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}(?:ning|ging|ing|ed|s)?(?=([^a-z0-9]|$))`)
  return pattern.test(normalized)
}

const mapSignalToActivity = (signal?: MustachiSignal): MustachiActivity => {
  switch (signal) {
    case "idle":
      return "idle"
    case "thinking":
      return "waiting"
    case "working":
      return "building"
    default:
      return "debugging"
  }
}

const mapRuntimeStatusToActivity = (statusValue: string): MustachiActivity | undefined => {
  if (!statusValue) return

  if (createStatusMatcher(statusValue, "build") || createStatusMatcher(statusValue, "work") || createStatusMatcher(statusValue, "run")) return "building"
  if (createStatusMatcher(statusValue, "wait") || createStatusMatcher(statusValue, "think") || createStatusMatcher(statusValue, "pending")) return "waiting"
  if (createStatusMatcher(statusValue, "debug") || createStatusMatcher(statusValue, "retry") || createStatusMatcher(statusValue, "busy")) return "debugging"
  if (createStatusMatcher(statusValue, "idle") || createStatusMatcher(statusValue, "ready")) return "idle"
  return
}

const hasRuntimeContext = (value: unknown): boolean => {
  const normalized = normalize(value)
  return normalized.length > 0
}

type ActivityDecision = {
  activity: MustachiActivity
  source: MustachiContextSummary["source"]
}

const resolveActivityFromSignalAndRuntime = (
  runtimeActivity: MustachiActivity | undefined,
  signal?: MustachiSignal,
  hasStack = false,
): ActivityDecision => {
  const signalActivity = signal ? mapSignalToActivity(signal) : undefined

  if (runtimeActivity && runtimeActivity !== "idle") {
    return {
      activity: runtimeActivity,
      source: "runtime",
    }
  }

  if (runtimeActivity === "idle" && signalActivity && signalActivity !== "idle") {
    return {
      activity: signalActivity,
      source: "signal",
    }
  }

  if (runtimeActivity) {
    return {
      activity: runtimeActivity,
      source: "runtime",
    }
  }

  if (signalActivity) {
    return {
      activity: signalActivity,
      source: "signal",
    }
  }

  return {
    activity: hasStack ? "debugging" : "idle",
    source: hasStack ? "stack" : "default",
  }
}

const normalizeResolution = (value: MustachiModelResolution): MustachiModelResolution => {
  return value
}

const resolveGenerationHint = (
  modelClass: MustachiModelClass,
  generationReady: boolean,
  generationMode: MustachiGenerationMode,
): { generationReadiness: MustachiGenerationReadiness; generationHint: string } => {
  if (generationMode !== "auto") {
    return {
      generationReadiness: "offline",
      generationHint: "Personality mode is off, so Mustachi stays on cached fallback phrases.",
    }
  }

  if (modelClass === "offline") {
    return {
      generationReadiness: "offline",
      generationHint: "No runtime model metadata is available, so Mustachi should stay on cached fallback phrases.",
    }
  }

  if (modelClass === "preferred" && generationReady) {
    return {
      generationReadiness: "ready",
      generationHint: "A verified privacy-safe generation seam is available; dynamic generation is allowed for this cycle.",
    }
  }

  return {
    generationReadiness: "deferred",
    generationHint: "A model is visible in runtime metadata, but there is no confirmed privacy-safe generation API in the current plugin surface.",
  }
}

export const getMustachiPromptSeed = (summary: Pick<MustachiContextSummary, "activity" | "pressure" | "stack" | "modelClass">): string => {
  const fragments = [
    `Activity: ${summary.activity}.`,
    `Pressure: ${summary.pressure}.`,
    `Stack label: ${summary.stack ?? "generic"}.`,
    `Model preference: ${summary.modelClass}.`,
  ]

  return fragments.join(" ")
}

export const deriveMustachiContextSummary = (input: {
  signal?: MustachiSignal
  stack?: DetectedStack
  runtimeContext?: RuntimeContext
  generationMode?: MustachiGenerationMode
  preferredModel?: string
  providers?: ProviderCollection
}): MustachiContextSummary => {
  try {
    const modelResolution = normalizeResolution(
      resolveModelResolution({
        runtimeContext: input.runtimeContext,
        preferredModel: input.preferredModel,
        providers: input.providers,
      }),
    )

    const generationMode = input.generationMode ?? "auto"
    const runtime = input.runtimeContext?.runtime ?? input.runtimeContext
    const runtimeStatus = normalize(
      runtime?.status ??
        runtime?.state ??
        runtime?.phase ??
        input.runtimeContext?.status ??
        input.runtimeContext?.state ??
        input.runtimeContext?.phase,
    )

    const runtimeActivity = mapRuntimeStatusToActivity(runtimeStatus)
    const hasStack = hasRuntimeContext(input.stack)
    const { activity, source } = resolveActivityFromSignalAndRuntime(runtimeActivity, input.signal, hasStack)

    const pressure: MustachiPressure = activity === "idle" ? "low" : activity === "waiting" ? "medium" : "high"
    const modelClass = modelResolution.class
    const generationReady = generationMode === "auto" && modelResolution.class === "preferred"
    const { generationReadiness, generationHint } = resolveGenerationHint(modelClass, generationReady, generationMode)

    return {
      activity,
      pressure,
      stack: input.stack,
      modelClass,
      model: modelResolution.model,
      generationMode,
      generationReadiness,
      generationHint,
      source,
    }
  } catch (error) {
    console.debug("[mustachi-context] derive summary failed, using safe defaults", error)
    return {
      activity: hasRuntimeContext(input.stack) ? "debugging" : "idle",
      pressure: hasRuntimeContext(input.stack) ? "high" : "low",
      stack: input.stack,
      modelClass: "offline",
      model: undefined,
      generationMode: "auto",
      generationReadiness: "offline",
      generationHint: "Context derivation failed, using safe offline defaults.",
      source: input.stack ? "stack" : "default",
    }
  }
}

export const buildMustachiContextKey = (summary: MustachiContextSummary): string => {
  return [
    summary.activity,
    summary.pressure,
    summary.stack ?? "generic",
    summary.modelClass,
    summary.generationMode,
    summary.generationReadiness,
  ].join(":")
}

export const isPreferredMustachiModelClass = (modelClass: MustachiModelClass): boolean => {
  return modelClass === "preferred"
}
