import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { toNumber } from "../utils/message-utils.ts"
import type { LspItem, Message, ModifiedFileItem, ProviderInfo, RuntimeContext } from "../types.ts"

export type ProviderCollection = ReadonlyArray<ProviderInfo> | Record<string, ProviderInfo> | undefined

type PluginEnabledMap = Record<string, boolean>

export interface SessionStateApi {
  running?: boolean
  messages?: (sessionId: string) => Message[]
  status?: (sessionId: string) => unknown
  diff?: (sessionId: string) => ReadonlyArray<ModifiedFileItem>
}

export interface SidebarStateApi {
  mcp?: unknown | (() => unknown)
}

export interface PluginStateApi {
  provider?: ProviderCollection
  session: SessionStateApi
  vcs?: { branch?: string }
  lsp?: () => ReadonlyArray<LspItem>
  mcp?: () => unknown
  sidebar?: SidebarStateApi
}

export interface PluginApiLike {
  kv?: {
    get?: (key: string, fallback: unknown) => Promise<unknown>
    set?: (key: string, value: unknown) => Promise<unknown>
  }
  plugins?: {
    deactivate?: (pluginID: string) => Promise<unknown>
    disable?: (pluginID: string) => Promise<unknown>
  }
  theme: {
    install: (path: string) => Promise<unknown>
    set: (themeID: string) => void
  }
  state: PluginStateApi
  slots: {
    register: (payload: {
      mode: "replace"
      slots: {
        home_logo: (ctx: { theme: { current: TuiThemeCurrent } }) => unknown
        home_bottom: (ctx: { theme: { current: TuiThemeCurrent } }) => unknown
        sidebar_content: (
          ctx: { theme: { current: TuiThemeCurrent } },
          slotValue: { session_id?: string; sessionID?: string } & RuntimeContext,
        ) => unknown
      }
    }) => void
  }
}

export const rec = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return
  return Object.fromEntries(Object.entries(value))
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

const getMessageRole = (message: Message): string => {
  return String(message.role ?? message.message?.role ?? message.author?.role ?? "").toLowerCase()
}

const getModelID = (message: Message): string => {
  if (typeof message.modelID === "string") return message.modelID
  if (typeof message.modelId === "string") return message.modelId
  if (typeof message.model === "string") return message.model
  if (isRecord(message.model) && typeof message.model.id === "string") return message.model.id
  return ""
}

const getProviderID = (message: Message): string => {
  if (typeof message.providerID === "string") return message.providerID
  if (typeof message.providerId === "string") return message.providerId
  if (typeof message.provider === "string") return message.provider
  if (isRecord(message.provider) && typeof message.provider.id === "string") return message.provider.id
  return ""
}

export const getLatestAssistantModelContext = (
  messages: ReadonlyArray<Message>,
): { modelID?: string; providerID?: string } => {
  const normalizedMessages = Array.isArray(messages) ? messages : []

  for (let index = normalizedMessages.length - 1; index >= 0; index -= 1) {
    const message = normalizedMessages[index]
    if (getMessageRole(message) !== "assistant") continue

    const outputTokens = toNumber(isRecord(message.tokens) ? message.tokens.output : undefined)
    if (!outputTokens) continue

    const modelID = getModelID(message)
    const providerID = getProviderID(message)

    if (modelID || providerID) {
      return {
        modelID: modelID || undefined,
        providerID: providerID || undefined,
      }
    }
  }

  return {}
}

export const disableInternalSidebarPlugins = async (api: PluginApiLike): Promise<void> => {
  const explicitTargets = ["internal:sidebar-context", "internal:sidebar-mcp"]
  const kvKey = "plugin_enabled"

  try {
    const getKV = api.kv?.get
    const setKV = api.kv?.set
    if (typeof getKV === "function" && typeof setKV === "function") {
      const current = await getKV(kvKey, {})
      const nextMap: PluginEnabledMap = {
        ...(isRecord(current) ? (current as PluginEnabledMap) : {}),
      }

      for (const pluginID of explicitTargets) {
        nextMap[pluginID] = false
      }

      await setKV(kvKey, nextMap)
    }
  } catch (error) {
    console.warn("[plugin-gentleman] Could not persist sidebar suppression state", error)
  }

  const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  try {
    const deactivate = api.plugins?.deactivate
    const disable = api.plugins?.disable

    for (const pluginID of explicitTargets) {
      let deactivated = false
      for (let attempt = 0; attempt < 3 && !deactivated; attempt += 1) {
        try {
          if (typeof deactivate === "function") {
            const result = await deactivate(pluginID)
            if (result !== false) {
              deactivated = true
              break
            }
          }

          if (typeof disable === "function") {
            const result = await disable(pluginID)
            if (result !== false) {
              deactivated = true
              break
            }
          }
        } catch (error) {
          if (attempt === 2) {
            console.warn(`[plugin-gentleman] Could not disable ${pluginID} after retries`, error)
          }
        }

        if (!deactivated && attempt < 2) {
          await pause(120)
        }
      }
    }
  } catch (error) {
    console.warn("[plugin-gentleman] Sidebar suppression best-effort step failed", error)
  }
}

export const getProviderArray = (providers: ProviderCollection): ReadonlyArray<ProviderInfo> => {
  if (Array.isArray(providers)) return providers
  if (isRecord(providers)) return Object.values(providers).filter(item => isRecord(item) && typeof item.id === "string") as ProviderInfo[]
  return []
}

export const getContextLimit = (
  providers: ProviderCollection,
  providerID: string,
  modelID: string,
): number | undefined => {
  const providerList = getProviderArray(providers)
  const provider = providerList.find(item => item.id === providerID)
  const directLimit = toNumber(provider?.models?.[modelID]?.limit?.context)
  if (directLimit) return directLimit

  if (isRecord(providers)) {
    const providerFromMap = providers[providerID]
    return toNumber(providerFromMap?.models?.[modelID]?.limit?.context) || undefined
  }
}
