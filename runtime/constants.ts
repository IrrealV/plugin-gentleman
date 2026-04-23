export const SAFE_PROVIDER_PATTERNS: readonly RegExp[] = [
  /(^|[^a-z0-9])opencode([^a-z0-9]|$)/,
  /(^|[^a-z0-9])local([^a-z0-9]|$)/,
  /(^|[^a-z0-9])ollama([^a-z0-9]|$)/,
  /(^|[^a-z0-9])lmstudio([^a-z0-9]|$)/,
  /(^|[^a-z0-9])zen([^a-z0-9]|$)/,
] as const

export const SAFE_MODEL_PATTERNS: readonly RegExp[] = [
  /(^|[^a-z0-9])(gpt[-_]?oss|gemma|qwen|gemini|claude|zen)(?:[-_./][a-z0-9]+)*(?:-[0-9]+(?:\.[0-9]+)?[a-z0-9]*)?(?=[^a-z0-9]|$)/,
] as const

export const SMALL_MODEL_ALIASES: readonly string[] = ["small_model", "small", "tiny"]

export const MODEL_RESOLUTION_HINTS = {
  explicit: "Explicit config override selected using canonical provider/model format.",
  safeRuntime: "Runtime metadata matches privacy-safe known model/provider pattern.",
  freeAlias: "A free/Zen/low-cost model alias was found in provider metadata.",
  allowlist: "An allowlisted low-cost model was found from provider catalog.",
  unavailable: "No generation-ready model candidate was identified.",
} as const

export type ModelResolutionHint = keyof typeof MODEL_RESOLUTION_HINTS
