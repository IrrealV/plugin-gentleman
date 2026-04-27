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
  sessionId?: string
}

export interface MustachiModelClient {
  generate: (input: MustachiModelGenerationInput) => Promise<string | undefined>
}

// Experimental model-generated Mustachi speech is disabled for stability.
// This factory intentionally returns no client so runtime phrase rendering stays
// local-only and never calls OpenCode chat/session APIs.
export const createMustachiModelClient = (): MustachiModelClient | undefined => undefined
