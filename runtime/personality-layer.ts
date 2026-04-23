import { busyPhrases, pickBusyPhrase } from "../phrases.ts"
import type { DetectedStack } from "../utils/detection.ts"
import type { RuntimeContext } from "../types.ts"
import type { ProviderCollection } from "./plugin-api.ts"
import type { MustachiModelClient } from "./model-client.ts"
import {
  buildMustachiContextKey,
  deriveMustachiContextSummary,
  getMustachiPromptSeed,
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

type ContextTemplateInput = {
  context: MustachiContextSummary
  stack?: DetectedStack
  cycle: number
}

type CacheEntry = {
  expiresAt: number
  value: string
}

const DEFAULT_CACHE_TTL_MS = 60_000
const DEFAULT_GENERATION_TIMEOUT_MS = 1_500
const DEFAULT_MAX_PHRASE_LENGTH = 140
const MAX_HISTORY_SIZE = 4
const MAX_HISTORY_KEYS = 120
const MAX_CACHE_KEYS = 120

const normalizeSessionId = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined

  const next = value.trim()
  return next.length > 0 ? next : undefined
}

const sanitizePhrase = (value: unknown): string => {
  if (typeof value !== "string") return ""
  const next = value.replace(/\s+/g, " ").trim()
  if (!next) return ""
  if (next.length > DEFAULT_MAX_PHRASE_LENGTH) return next.slice(0, DEFAULT_MAX_PHRASE_LENGTH).trim()
  return next
}

const stackLabels: Partial<Record<DetectedStack, string>> = {
  react: "la nave de React",
  angular: "el convento de Angular",
  vue: "la bohemia de Vue",
  node: "la parrilla de Node",
  go: "el motorcito de Go",
  python: "la serpiente ilustre",
  dotnet: "la oficina de .NET",
  svelte: "el teatro de Svelte",
  nextjs: "el multiverso de Next",
  rust: "la herrería de Rust",
}

const contextTemplates = {
  idle: [
    "Todo sereno por acá, mostro.",
    "Silencio elegante: ni el bug se anima a respirar.",
    "Estamos tranquilos, pero con clase, papá.",
  ],
  waiting: [
    "Paciencia premium, que esto sale con moñito.",
    "Estoy dejando que la idea se cocine a fuego lento.",
    "Un toque de suspenso y ya aparece la magia.",
  ],
  debugging: [
    "Estoy interrogando al drama técnico con glamour.",
    "Ese bug se hace el picante, pero ya canta.",
    "Se puso denso el asunto, justo como me gusta.",
  ],
  building: [
    "Estamos levantando esto con más facha que apuro.",
    "Acá se construye fino, sin vender humo.",
    "Va tomando forma, despacio pero con categoría.",
  ],
} as const

const pressureTags: Record<MustachiContextSummary["pressure"], string[]> = {
  low: ["Tranqui", "Todo bajo control", "Cero humo"],
  medium: ["Vamos midiendo el caos", "Con paciencia táctica", "Sin drama todavía"],
  high: ["Esto viene con picante", "Hay tensión, pero hay oficio", "Estamos al límite con elegancia"],
}

const pickFromPool = (pool: readonly string[], cycle: number): string => {
  if (!pool.length) return ""
  return pool[Math.abs(cycle * 11) % pool.length] ?? pool[0] ?? ""
}

const getHistoryKey = (profile: MustachiPersonalityProfile): string => {
  return [
    profile.signal,
    buildMustachiContextKey(profile.context),
    profile.stack ?? "generic",
    profile.sessionId ?? "global",
  ].join(":")
}

const chooseDistinctPhrase = (options: Array<string | undefined>, blocked: string[]): string => {
  const normalizedBlocked = new Set(blocked.map(item => sanitizePhrase(item)).filter(Boolean))

  for (const option of options) {
    const safe = sanitizePhrase(option)
    if (safe && !normalizedBlocked.has(safe)) return safe
  }

  for (const option of options) {
    const safe = sanitizePhrase(option)
    if (safe) return safe
  }

  return ""
}

const buildContextualFallback = (input: ContextTemplateInput): string => {
  const baseLine = pickFromPool(contextTemplates[input.context.activity], input.cycle)
  const pressureTag = pickFromPool(pressureTags[input.context.pressure], input.cycle + 1)
  const stackLabel = input.stack ? stackLabels[input.stack] : undefined

  const parts = [baseLine, pressureTag]
  if (stackLabel && input.cycle % 2 === 0) {
    parts.push(`Hoy manda ${stackLabel}.`)
  }

  return sanitizePhrase(parts.filter(Boolean).join(" "))
}

const buildCacheKey = (profile: MustachiPersonalityProfile): string => {
  return [
    profile.signal,
    buildMustachiContextKey(profile.context),
    profile.stack ?? "generic",
    profile.sessionId ?? "global",
    profile.cycle,
  ].join(":")
}

const buildPrompt = (profile: MustachiPersonalityProfile): string => {
  return [
    "You are Mustachi, a brief satirical ASCII mascot.",
    "Write one short Rioplatense Spanish line.",
    "Stay privacy-safe: do not mention code, files, paths, repos, secrets, or user content.",
    "Use only the abstract context below; never invent specific repository details.",
    `Current mode: ${profile.signal}.`,
    getMustachiPromptSeed(profile.context),
    `Generation status: ${profile.context.generationReadiness}.`,
    "Keep it light, witty, and under one sentence.",
  ].join(" ")
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

  profile.cacheKey = buildCacheKey(profile)
  return profile
}

const sanitizeCacheTTL = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_CACHE_TTL_MS
  }

  if (value < 1_000) return 1_000
  if (value > 86_400_000) return 86_400_000
  return Math.trunc(value)
}

const pruneHistory = (phraseHistory: Map<string, string[]>) => {
  while (phraseHistory.size > MAX_HISTORY_KEYS) {
    const oldest = phraseHistory.keys().next().value
    if (!oldest) break
    phraseHistory.delete(oldest)
  }
}

const pruneCache = (cache: Map<string, CacheEntry>) => {
  const now = Date.now()

  for (const [key, value] of cache) {
    if (value.expiresAt <= now) cache.delete(key)
  }

  while (cache.size > MAX_CACHE_KEYS) {
    const oldest = cache.keys().next().value
    if (!oldest) break
    cache.delete(oldest)
  }
}

export const createMustachiPersonalityLayer = (deps: {
  modelClient?: MustachiModelClient
  ttlMs?: number
  generationTimeoutMs?: number
  enabled?: boolean
  generationMode?: MustachiGenerationMode
  preferredModel?: string
  providers?: ProviderCollection
} = {}): MustachiPersonalityLayer => {
  const cache = new Map<string, CacheEntry>()
  const inFlight = new Map<string, Promise<string>>()
  const phraseHistory = new Map<string, string[]>()
  const modelGenerate = deps.modelClient?.generate
  const hasModelGenerate = typeof modelGenerate === "function"
  const generationMode = deps.generationMode ?? "auto"
  const preferredModel = deps.preferredModel
  const providers = deps.providers
  const isPersonalityEnabled = deps.enabled !== false

  const getRecentPhrases = (profile: MustachiPersonalityProfile): string[] => {
    return phraseHistory.get(getHistoryKey(profile)) ?? []
  }

  const rememberPhrase = (profile: MustachiPersonalityProfile, value: string) => {
    const safe = sanitizePhrase(value)
    if (!safe) return

    const key = getHistoryKey(profile)
    const previous = phraseHistory.get(key) ?? []
    const next = [...previous.filter(entry => entry !== safe), safe].slice(-MAX_HISTORY_SIZE)
    phraseHistory.set(key, next)
    pruneHistory(phraseHistory)
  }

  const getCachedPhrase = (profile: MustachiPersonalityProfile): string | undefined => {
    const cached = cache.get(profile.cacheKey)
    if (!cached) return
    if (cached.expiresAt <= Date.now()) {
      cache.delete(profile.cacheKey)
      return
    }
    return cached.value
  }

  const setCachedPhrase = (profile: MustachiPersonalityProfile, value: string, ttlMs = DEFAULT_CACHE_TTL_MS) => {
    pruneCache(cache)

    cache.set(profile.cacheKey, {
      expiresAt: Date.now() + sanitizeCacheTTL(ttlMs),
      value,
    })
  }

  const resolveContext = (input: MustachiPersonalityInput): MustachiContextSummary => {
    if (input.context) return input.context

    return deriveMustachiContextSummary({
      signal: input.signal,
      stack: input.stack,
      runtimeContext: input.runtimeContext,
      generationMode: input.generationMode ?? generationMode,
      preferredModel: input.preferredModel ?? preferredModel,
      providers: input.providers ?? providers,
    })
  }

  const resolveFallbackPhrase = (input: MustachiPersonalityInput): string => {
    const profile = createProfile(input)
    const recent = getRecentPhrases(profile)
    const context = input.context ?? resolveContext(input)
    const classicFallback = pickBusyPhrase({ framework: profile.stack, cycle: profile.cycle, previous: input.previous })
    const contextualFallback = buildContextualFallback({
      context,
      stack: profile.stack,
      cycle: profile.cycle,
    })

    const selected =
      profile.cycle % 3 !== 0
        ? chooseDistinctPhrase([contextualFallback, classicFallback, busyPhrases[0]], [input.previous ?? "", ...recent])
        : chooseDistinctPhrase([classicFallback, contextualFallback, busyPhrases[0]], [input.previous ?? "", ...recent])

    rememberPhrase(profile, selected)

    return selected
  }

  const canGenerate = (input: MustachiPersonalityInput): boolean => {
    const context = resolveContext(input)

    if (!isPersonalityEnabled) return false
    if (context.generationMode !== "auto") return false

    return hasModelGenerate && context.generationReadiness === "ready"
  }

  const resolvePhrase = async (input: MustachiPersonalityInput): Promise<string> => {
    if (!isPersonalityEnabled) {
      return resolveFallbackPhrase(input)
    }

    const profile = createProfile(input)
    const cached = getCachedPhrase(profile)
    if (cached) return cached

    const providedFallback = sanitizePhrase(input.fallbackPhrase)
    const fallback = providedFallback || resolveFallbackPhrase(input)

    if (!hasModelGenerate || !canGenerate(input)) {
      setCachedPhrase(profile, fallback, deps.ttlMs)
      return fallback
    }

    const generate = modelGenerate

    if (typeof generate !== "function") {
      setCachedPhrase(profile, fallback, deps.ttlMs)
      return fallback
    }

    const existing = inFlight.get(profile.cacheKey)
    if (existing) return existing

    const promise = (async () => {
      try {
        const generated = await generate({
          prompt: buildPrompt(profile),
          signal: profile.signal,
          context: {
            activity: profile.context.activity,
            pressure: profile.context.pressure,
            modelClass: profile.context.modelClass,
            generationReadiness: profile.context.generationReadiness,
          },
          model: profile.context.model,
          runtimeContext: input.runtimeContext,
          providers: input.providers,
          timeoutMs: deps.generationTimeoutMs ?? DEFAULT_GENERATION_TIMEOUT_MS,
          stack: profile.stack,
        })
        const safe = sanitizePhrase(generated)
        if (safe) {
          rememberPhrase(profile, safe)
          setCachedPhrase(profile, safe, deps.ttlMs)
          return safe
        }
      } catch (error) {
        console.debug("[mustachi-personality-layer] generate failed, using fallback", error)
      }

      setCachedPhrase(profile, fallback, deps.ttlMs)
      rememberPhrase(profile, fallback)
      return fallback
    })()

    inFlight.set(profile.cacheKey, promise)

    try {
      return await promise
    } finally {
      inFlight.delete(profile.cacheKey)
    }
  }

  return {
    getProfile: createProfile,
    getFallbackPhrase: resolveFallbackPhrase,
    canGenerate,
    resolvePhrase,
  }
}
