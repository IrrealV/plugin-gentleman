// Configuration types and parsing helpers

export const THEMES = {
  gentleman: "gentleman",
  soft: "soft",
} as const

export type ThemeName = (typeof THEMES)[keyof typeof THEMES]

export interface Cfg {
  enabled: boolean
  theme: ThemeName
  set_theme: boolean
  sidebar_mini_mascot: boolean
  show_detected: boolean
  show_os: boolean
  show_providers: boolean
  show_metrics: boolean
  animations: boolean
  cost_budget_usd: number
  personality_enabled: boolean
  personality_mode: "auto" | "off"
  // Canonical format: "provider/model" (for example "google/gemini-2.5-flash")
  personality_model: string
}

const rec = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return
  return Object.fromEntries(Object.entries(value))
}

const pick = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback
  if (!value.trim()) return fallback
  return value
}

const bool = (value: unknown, fallback: boolean) => {
  if (typeof value !== "boolean") return fallback
  return value
}

const num = (value: unknown, fallback: number) => {
  if (typeof value !== "number") return fallback
  if (!Number.isFinite(value) || value <= 0) return fallback
  return value
}

const str = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback
  if (!value.trim()) return fallback
  return value
}

const canonicalModel = (value: unknown): string => {
  if (typeof value !== "string") return ""
  return value.trim()
}

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => {
  const normalized = str(value, fallback)
  const candidate = normalized.toLowerCase() as T
  return allowed.includes(candidate) ? candidate : fallback
}

const THEMES_ARRAY = Object.values(THEMES) as readonly ThemeName[]

export const cfg = (opts: Record<string, unknown> | undefined): Cfg => {
  return {
    enabled: bool(opts?.enabled, true),
    theme: oneOf(opts?.theme, THEMES_ARRAY, THEMES.gentleman),
    set_theme: bool(opts?.set_theme, false),
    sidebar_mini_mascot: bool(opts?.sidebar_mini_mascot, false),
    show_detected: bool(opts?.show_detected, true),
    show_os: bool(opts?.show_os, true),
    show_providers: bool(opts?.show_providers, true),
    show_metrics: bool(opts?.show_metrics, true),
    animations: bool(opts?.animations, true),
    cost_budget_usd: num(opts?.cost_budget_usd, 1),
    personality_enabled: bool(opts?.personality_enabled, true),
    personality_mode: oneOf(opts?.personality_mode, ["auto", "off"] as const, "auto"),
    personality_model: canonicalModel(opts?.personality_model),
  }
}
