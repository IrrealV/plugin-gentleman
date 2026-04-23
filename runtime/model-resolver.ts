import type { RuntimeContext } from "../types.ts"
import type { ProviderCollection } from "./plugin-api.ts"
import { SAFE_MODEL_PATTERNS, SMALL_MODEL_ALIASES, type ModelResolutionHint } from "./constants.ts"

export type MustachiModelClass = "offline" | "preferred" | "generic"

export type MustachiModelSource =
  | "configured"
  | "runtime"
  | "allowlisted"
  | "unknown"

export type MustachiModelResolution = {
  model?: string
  provider?: string
  class: MustachiModelClass
  source: MustachiModelSource
  hint: ModelResolutionHint
}

export interface MustachiModelResolutionInput {
  runtimeContext?: RuntimeContext
  preferredModel?: string
  providers?: ProviderCollection
}

const normalize = (value: unknown): string => {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

const hasSafeToken = (value: string, patterns: readonly RegExp[]): boolean => {
  return patterns.some(pattern => pattern.test(value))
}

const resolveProvider = (runtimeContext?: RuntimeContext): string => {
  const runtime = runtimeContext?.runtime ?? runtimeContext
  return normalize(runtime?.provider ?? runtimeContext?.provider)
}

const resolveModel = (runtimeContext?: RuntimeContext): string => {
  const runtime = runtimeContext?.runtime ?? runtimeContext
  const runtimeModel = normalize(runtime?.model?.id ?? runtimeContext?.model?.id)
  if (runtimeModel) return runtimeModel

  const metadataModel = normalize(runtime?.metadata?.framework ?? runtimeContext?.metadata?.framework)
  if (metadataModel) return metadataModel

  return ""
}

const isSmallModelAlias = (value: string): boolean => {
  return SMALL_MODEL_ALIASES.some(alias => value === alias)
}

const MODEL_ID_SEGMENT = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/

const parseConfiguredModel = (preferredModel?: string): { provider: string; model: string } | undefined => {
  const normalized = normalize(preferredModel)
  if (!normalized) return

  const parts = normalized.split("/")
  if (parts.length !== 2) return

  const provider = parts[0]?.trim() ?? ""
  const model = parts[1]?.trim() ?? ""
  if (!provider || !model) return
  if (!MODEL_ID_SEGMENT.test(provider) || !MODEL_ID_SEGMENT.test(model)) return

  return {
    provider,
    model: `${provider}/${model}`,
  }
}

export const resolveConfiguredModel = (preferredModel?: string): MustachiModelResolution => {
  const parsed = parseConfiguredModel(preferredModel)
  if (!parsed) return { class: "offline", source: "unknown", hint: "unavailable" }

  return {
    model: parsed.model,
    provider: parsed.provider,
    class: "preferred",
    source: "configured",
    hint: "explicit",
  }
}

export const resolveRuntimeModel = (runtimeContext?: RuntimeContext): MustachiModelResolution => {
  const provider = resolveProvider(runtimeContext)
  const model = resolveModel(runtimeContext)

  if (!model) {
    return { class: "offline", source: "unknown", hint: "unavailable" }
  }

  if (isSmallModelAlias(model)) {
    return {
      model,
      provider,
      class: "preferred",
      source: "runtime",
      hint: "freeAlias",
    }
  }

  return { class: "offline", source: "unknown", hint: "unavailable" }
}

export const resolveAllowlistedModel = (providers?: ProviderCollection): MustachiModelResolution => {
  const providerList = Array.isArray(providers)
    ? providers
    : Object.values(providers ?? {}).filter((provider): provider is Record<string, unknown> => typeof provider === "object" && provider !== null)

  for (const provider of providerList) {
    const providerId = typeof provider?.id === "string" ? normalize(provider.id) : ""
    const models = provider?.models
    if (!models || typeof models !== "object" || Array.isArray(models)) continue

    for (const modelID of Object.keys(models)) {
      if (hasSafeToken(modelID.toLowerCase(), SAFE_MODEL_PATTERNS)) {
        return {
          model: modelID,
          provider: providerId || undefined,
          class: "preferred",
          source: "allowlisted",
          hint: "allowlist",
        }
      }
    }
  }

  return { class: "offline", source: "unknown", hint: "unavailable" }
}

export const resolveModelResolution = (input: MustachiModelResolutionInput): MustachiModelResolution => {
  const configured = resolveConfiguredModel(input.preferredModel)
  if (configured.class === "preferred" && configured.model) return configured

  const runtime = resolveRuntimeModel(input.runtimeContext)
  if (runtime.class === "preferred" && runtime.model) return runtime

  const allowlisted = resolveAllowlistedModel(input.providers)
  if (allowlisted.class !== "offline" && allowlisted.model) return allowlisted

  return { class: "offline", source: "unknown", hint: "unavailable" }
}

export const isPreferredModelResolution = (value: MustachiModelResolution): boolean => {
  return value.class === "preferred"
}
