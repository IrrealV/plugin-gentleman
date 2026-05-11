// Configuration types and parsing helpers

export type Cfg = {
  enabled: boolean
  theme: string
  set_theme: boolean
  show_detected: boolean
  show_os: boolean
  show_providers: boolean
  show_metrics: boolean
  show_face: boolean
  show_branch: boolean
  show_tokens: boolean
  show_cost: boolean
  show_mcp: boolean
  animations: boolean
  cost_budget_usd: number
  personality_enabled: boolean
  personality_mode: "auto" | "off"
  // Canonical format: "provider/model" (for example "google/gemini-2.5-flash")
  personality_model: string
  logo_style: "default" | "vintage"
  face_style: "mini" | "full" | "reworked"
}

export type ResolvedMetricVisibility = {
  branch: boolean
  tokens: boolean
  cost: boolean
  mcp: boolean
  usesGranularOverride: boolean
}

export type ResolvedSidebarConfig = {
  showFace: boolean
  showBranch: boolean
  metrics: ResolvedMetricVisibility
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

export const cfg = (opts: Record<string, unknown> | undefined): Cfg => {
  return {
    enabled: bool(opts?.enabled, true),
    theme: pick(opts?.theme, "gentleman"),
    set_theme: bool(opts?.set_theme, false),
    show_detected: bool(opts?.show_detected, true),
    show_os: bool(opts?.show_os, true),
    show_providers: bool(opts?.show_providers, true),
    show_metrics: bool(opts?.show_metrics, true),
    show_face: bool(opts?.show_face, true),
    show_branch: bool(opts?.show_branch, true),
    show_tokens: bool(opts?.show_tokens, true),
    show_cost: bool(opts?.show_cost, true),
    show_mcp: bool(opts?.show_mcp, true),
    animations: bool(opts?.animations, true),
    cost_budget_usd: num(opts?.cost_budget_usd, 1),
    personality_enabled: bool(opts?.personality_enabled, true),
    personality_mode: oneOf(opts?.personality_mode, ["auto", "off"] as const, "auto"),
    personality_model: canonicalModel(opts?.personality_model),
    logo_style: oneOf(opts?.logo_style, ["default", "vintage"] as const, "vintage"),
    face_style: oneOf(opts?.face_style, ["mini", "full", "reworked"] as const, "reworked"),
  }
}

export const resolveSidebarConfig = (
  parsed: Cfg,
  rawOpts?: Record<string, unknown>,
): ResolvedSidebarConfig => {
  const showFace = parsed.show_face
  const rawBoolOverride = (key: keyof Cfg): boolean | null => {
    if (!rawOpts || typeof rawOpts[key] !== "boolean") return null
    return parsed[key] as boolean
  }

  // ---- Precedence rules (highest to lowest) ----
  //
  // 1. Explicit granular flag (show_branch / show_tokens / show_cost / show_mcp)
  //    — detected only when the raw value is boolean.
  //
  // 2. show_metrics (legacy master switch)
  //    — applied to tokens, cost, and mcp as a group.
  //    — NEVER controlled branch (branch was always independent in legacy).
  //
  // 3. Package defaults (cfg() in config.ts, all true).
  //
  // NOTE on compatibility: Granular keys (show_branch, show_tokens, show_cost,
  // show_mcp) are deliberately excluded from package.json exports.config. If
  // OpenCode merges those exported defaults into the options object, the runtime
  // would see "show_branch" in rawOpts as true even when the user never set it.
  // That breaks legacy behavior: { show_metrics: false } would not hide tokens
  // because the merged show_tokens:true default would be misclassified as an
  // explicit override. By keeping only non-granular keys in package.json, we
  // preserve the ability to detect genuinely explicit user overrides.
  //
  // Mixed example — user sets { show_metrics: false, show_branch: true }:
  //   → branch visible (explicit override), tokens/cost/mcp hidden (show_metrics).
  // -------------------------------------------------

  const hasExplicitShowMetrics = rawOpts ? "show_metrics" in rawOpts : false
  const metricsDefault = hasExplicitShowMetrics ? parsed.show_metrics : true

  // Detect explicit granular overrides only from raw boolean values. Malformed
  // values are treated as absent so cfg() fallback defaults cannot bypass the
  // legacy show_metrics switch.
  const explicitBranch = rawBoolOverride("show_branch")
  const explicitTokens = rawBoolOverride("show_tokens")
  const explicitCost   = rawBoolOverride("show_cost")
  const explicitMcp    = rawBoolOverride("show_mcp")

  // Branch: legacy behavior — always independent of show_metrics.
  // If not explicitly set, branch defaults to visible (true).
  const showBranch = explicitBranch ?? true
  const showTokens = explicitTokens ?? metricsDefault
  const showCost   = explicitCost   ?? metricsDefault
  const showMcp    = explicitMcp    ?? metricsDefault

  const usesGranularOverride =
    explicitBranch !== null ||
    explicitTokens !== null ||
    explicitCost   !== null ||
    explicitMcp    !== null

  return {
    showFace,
    showBranch,
    metrics: {
      branch: showBranch,
      tokens: showTokens,
      cost: showCost,
      mcp: showMcp,
      usesGranularOverride,
    },
  }
}
