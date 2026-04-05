// Configuration types and parsing helpers

export type Cfg = {
  enabled: boolean
  theme: string
  set_theme: boolean
  show_detected: boolean
  show_os: boolean
  show_providers: boolean
  show_metrics: boolean
  animations: boolean
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

export const cfg = (opts: Record<string, unknown> | undefined): Cfg => {
  return {
    enabled: bool(opts?.enabled, true),
    theme: pick(opts?.theme, "gentleman"),
    set_theme: bool(opts?.set_theme, true),
    show_detected: bool(opts?.show_detected, true),
    show_os: bool(opts?.show_os, true),
    show_providers: bool(opts?.show_providers, true),
    show_metrics: bool(opts?.show_metrics, true),
    animations: bool(opts?.animations, true),
  }
}
