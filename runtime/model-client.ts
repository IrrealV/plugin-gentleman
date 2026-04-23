import { resolveModelResolution } from "./model-resolver.ts"
import type { RuntimeContext } from "../types.ts"
import type { ProviderCollection } from "./plugin-api.ts"

export interface MustachiModelGenerationInput {
  prompt: string
  signal: string
  context: {
    activity: string
    pressure: string
    modelClass: string
    generationReadiness: string
  }
  stack?: unknown
  model?: string
  runtimeContext?: RuntimeContext
  providers?: ProviderCollection
  timeoutMs?: number
  provider?: string
}

export interface MustachiModelClient {
  generate: (input: MustachiModelGenerationInput) => Promise<string | undefined>
}

type ModelClientOptions = {
  timeoutMs?: number
}

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): value is UnknownRecord => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

const isFunction = (value: unknown): value is (...args: unknown[]) => unknown => {
  return typeof value === "function"
}

const withTimeout = <T>(value: Promise<T>, timeoutMs: number): Promise<T | undefined> => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return value
  }

  let timer: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<undefined>(resolve => {
    timer = setTimeout(() => resolve(undefined), timeoutMs)
  })

  return Promise.race([value, timeout]).then(result => {
    if (timer) clearTimeout(timer)
    return result
  }) as Promise<T | undefined>
}

const DEFAULT_GENERATION_TIMEOUT_MS = 2_000

const parseModelOutput = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value.trim() || undefined
  }

  if (!asRecord(value)) return undefined

  if (typeof value.content === "string") return value.content.trim() || undefined
  if (typeof value.text === "string") return value.text.trim() || undefined
  if (typeof value.output === "string") return value.output.trim() || undefined

  if (Array.isArray(value.choices)) {
    const firstChoice = value.choices[0]
    if (asRecord(firstChoice)) {
      const fromMessage = firstChoice.message
      if (asRecord(fromMessage) && typeof fromMessage.content === "string") return fromMessage.content.trim() || undefined
      if (typeof firstChoice.text === "string") return firstChoice.text.trim() || undefined
    }
  }

  if (isRecord(value.result) && typeof value.result.content === "string") {
    return value.result.content.trim() || undefined
  }

  return undefined
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

const resolveGenerateFn = (api: unknown): ((input: unknown) => Promise<unknown> | unknown) | undefined => {
  if (!asRecord(api)) return

  const candidates: unknown[] = [
    api.generate,
    api.chat?.generate,
    api.chat?.completion?.generate,
    api.chat?.completions?.create,
    api.completion?.generate,
    api.model?.generate,
    api.models?.generate,
    api.models?.completion?.generate,
    api.models?.completions?.create,
  ]

  for (const candidate of candidates) {
    if (isFunction(candidate)) return candidate as (input: unknown) => Promise<unknown> | unknown
  }

  return
}

export const createMustachiModelClient = (
  api: unknown,
  options: ModelClientOptions = {},
): MustachiModelClient | undefined => {
  const generateFn = resolveGenerateFn(api)
  if (!generateFn) return

  const timeoutMs =
    Number.isFinite(options.timeoutMs) && typeof options.timeoutMs === "number" && options.timeoutMs > 0
      ? options.timeoutMs
      : DEFAULT_GENERATION_TIMEOUT_MS

  return {
    generate: async (input: MustachiModelGenerationInput) => {
      const candidate = resolveModelResolution({
        preferredModel: input.model ?? undefined,
        runtimeContext: input.runtimeContext,
        providers: input.providers,
      })

      if (candidate.class === "offline" || !candidate.model) {
        return undefined
      }

      const hasRequestTimeout =
        Number.isFinite(input.timeoutMs) &&
        typeof input.timeoutMs === "number" &&
        input.timeoutMs > 0

      const effectiveTimeoutMs = hasRequestTimeout ? input.timeoutMs : timeoutMs

      const modelProviderHint = candidate.provider ?? input.provider

      const withProvider = (payload: Record<string, unknown>): Record<string, unknown> => {
        if (!modelProviderHint) return payload

        return {
          ...payload,
          provider: modelProviderHint,
          providerId: modelProviderHint,
          providerID: modelProviderHint,
        }
      }

      const messageCandidates = [
        withProvider({ prompt: input.prompt, context: input.context, signal: input.signal, model: candidate.model, stack: input.stack }),
        withProvider({ prompt: input.prompt, model: candidate.model }),
        withProvider({ messages: [{ role: "user", content: input.prompt }], model: candidate.model }),
        withProvider({ input: input.prompt, model: candidate.model }),
        withProvider({ text: input.prompt, model: candidate.model }),
      ]

      for (const message of messageCandidates) {
        try {
          const response = await withTimeout(Promise.resolve(generateFn(message)), effectiveTimeoutMs)
          if (response === undefined) continue
          const parsed = parseModelOutput(response)
          if (parsed) return parsed
        } catch {
          continue
        }
      }

      return undefined
    },
  }
}
