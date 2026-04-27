import { pickBusyPhrase } from "../phrases.ts"
import type { DetectedStack } from "../utils/detection.ts"
import type { RuntimeContext } from "../types.ts"
import type { ProviderCollection } from "./plugin-api.ts"
import {
  buildMustachiContextKey,
  deriveMustachiContextSummary,
  type MustachiContextSummary,
  type MustachiGenerationMode,
  type MustachiSignal,
} from "./mustachi-context.ts"

export interface MustachiPersonalityInput {
  signal?: MustachiSignal
  stack?: DetectedStack
  cycle?: number
  previous?: string
  context?: MustachiContextSummary
  generationMode?: MustachiGenerationMode
  preferredModel?: string
  runtimeContext?: RuntimeContext
  providers?: ProviderCollection
  fallbackPhrase?: string
  sessionId?: string
}

export interface MustachiPersonalityProfile {
  signal: MustachiSignal
  context: MustachiContextSummary
  stack?: DetectedStack
  cycle: number
  cacheKey: string
  sessionId?: string
  generationMode: MustachiGenerationMode
  preferredModel?: string
}

export interface MustachiPersonalityLayer {
  getProfile: (input: MustachiPersonalityInput) => MustachiPersonalityProfile
  getFallbackPhrase: (input: MustachiPersonalityInput) => string
  canGenerate: (input: MustachiPersonalityInput) => boolean
  resolvePhrase: (input: MustachiPersonalityInput) => Promise<string>
}

const normalizeSessionId = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined
  const next = value.trim()
  return next.length > 0 ? next : undefined
}

const createProfile = (input: MustachiPersonalityInput): MustachiPersonalityProfile => {
  const signal: MustachiSignal = input.signal ?? "busy"
  const cycle = Number.isFinite(input.cycle as number) ? Math.max(0, Math.trunc(input.cycle ?? 0)) : 0
  const context = input.context ?? deriveMustachiContextSummary({
    signal,
    stack: input.stack,
    runtimeContext: input.runtimeContext,
    generationMode: input.generationMode,
    preferredModel: input.preferredModel,
    providers: input.providers,
  })
  const sessionId = normalizeSessionId(input.sessionId)

  const profile: MustachiPersonalityProfile = {
    signal,
    context,
    stack: input.stack,
    cycle,
    cacheKey: "",
    sessionId,
    generationMode: input.generationMode ?? "auto",
    preferredModel: input.preferredModel,
  }

  profile.cacheKey = [
    profile.signal,
    buildMustachiContextKey(profile.context),
    profile.stack ?? "generic",
    profile.sessionId ?? "global",
    profile.cycle,
  ].join(":")

  return profile
}

export const createMustachiPersonalityLayer = (deps: {
  enabled?: boolean
} = {}): MustachiPersonalityLayer => {
  const getFallbackPhrase = (input: MustachiPersonalityInput): string => {
    if (deps.enabled === false) return ""
    const profile = createProfile(input)
    return pickBusyPhrase({ framework: profile.stack, cycle: profile.cycle, previous: input.previous })
  }

  return {
    getProfile: createProfile,
    getFallbackPhrase,
    canGenerate: () => false,
    resolvePhrase: async input => getFallbackPhrase(input),
  }
}
