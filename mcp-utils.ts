import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import type { McpItem } from "./types"

const HOST_DEFAULT_MCP_NAMES = new Set(["github", "filesystem", "memory", "brave-search", "puppeteer"])

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

const toBoolean = (value: unknown): boolean => value === true

const normalizeStatus = (value: unknown): string => String(value ?? "").toLowerCase()

const getStringOr = (value: unknown, fallback: string): string => {
  const text = String(value ?? "").trim()
  return text || fallback
}

const mapUnknownItem = (item: unknown, index: number): McpItem | undefined => {
  if (!isRecord(item)) return

  const name = getStringOr(item.name ?? item.id ?? item.server, `mcp-${index}`)
  if (!name) return

  return {
    id: typeof item.id === "string" ? item.id : undefined,
    name,
    status: normalizeStatus(item.status ?? item.state ?? item.connectionStatus),
    error: item.error,
    userConfigured: toBoolean(item.userConfigured),
    custom: toBoolean(item.custom),
    isUserDefined: toBoolean(item.isUserDefined),
  }
}

type ThemeColor = NonNullable<TuiThemeCurrent["textMuted"]>

export const getMcpStatusColor = (status: string | undefined, theme?: TuiThemeCurrent): string | ThemeColor => {
  const normalized = String(status ?? "").toLowerCase()
  if (normalized === "connected") return theme?.success ?? "#22C55E"
  if (normalized === "disabled") return theme?.textMuted ?? "#888888"
  if (normalized === "failed" || normalized === "needs_auth" || normalized === "needs_client_registration") {
    return theme?.error ?? "#EF4444"
  }
  return theme?.textMuted ?? "#888888"
}

export const normalizeMcpName = (name: string): string => name.trim().toLowerCase()

export const isLikelyHostDefaultMcp = (item: McpItem): boolean => {
  if (item.userConfigured || item.custom || item.isUserDefined) return false
  return HOST_DEFAULT_MCP_NAMES.has(normalizeMcpName(item.name))
}

export const extractMcpItems = (raw: unknown): McpItem[] => {
  if (!raw) return []

  const fromArray = (items: unknown[]): McpItem[] => {
    return items
      .map((item, index) => mapUnknownItem(item, index))
      .filter((item): item is McpItem => !!item)
  }

  if (Array.isArray(raw)) return fromArray(raw)

  if (isRecord(raw)) {
    if (Array.isArray(raw.servers)) return fromArray(raw.servers)
    if (Array.isArray(raw.items)) return fromArray(raw.items)

    return Object.entries(raw)
      .map(([key, value], index) => {
        if (!isRecord(value)) return
        return mapUnknownItem({ ...value, name: value.name ?? key }, index)
      })
      .filter((item): item is McpItem => !!item)
  }

  return []
}
