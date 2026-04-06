/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule, TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { createSignal, createEffect } from "solid-js"
import { cfg } from "./config"
import { HomeLogo, SidebarMustachi, DetectedEnv } from "./components"
import type { Message, ProviderInfo, RuntimeContext } from "./types"
import { toNumber } from "./message-utils"

const id = "gentleman"

type ProviderCollection = ReadonlyArray<ProviderInfo> | Record<string, ProviderInfo> | undefined

type PluginEnabledMap = Record<string, boolean>

interface SessionStateApi {
  running?: boolean
  messages?: (sessionId: string) => Message[]
  status?: (sessionId: string) => unknown
}

interface SidebarStateApi {
  mcp?: unknown | (() => unknown)
}

interface PluginStateApi {
  provider?: ProviderCollection
  session: SessionStateApi
  vcs?: { branch?: string }
  mcp?: () => unknown
  sidebar?: SidebarStateApi
}

interface PluginApiLike {
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

const rec = (value: unknown): Record<string, unknown> | undefined => {
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

const getLatestAssistantModelContext = (
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

const disableInternalSidebarPlugins = async (api: PluginApiLike): Promise<void> => {
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

const isBusySessionStatus = (statusValue: unknown): boolean => {
  const normalized = String(statusValue ?? "").toLowerCase()
  return normalized === "busy" || normalized === "retry"
}

const isSessionBusy = (statusPayload: unknown): boolean => {
  if (!statusPayload) return false
  if (typeof statusPayload === "string") return isBusySessionStatus(statusPayload)
  if (!isRecord(statusPayload)) return false

  return (
    isBusySessionStatus(statusPayload.status) ||
    isBusySessionStatus(statusPayload.state) ||
    isBusySessionStatus(statusPayload.phase)
  )
}

const getProviderArray = (providers: ProviderCollection): ReadonlyArray<ProviderInfo> => {
  if (Array.isArray(providers)) return providers
  if (isRecord(providers)) return Object.values(providers).filter(item => isRecord(item) && typeof item.id === "string") as ProviderInfo[]
  return []
}

const getContextLimit = (
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

const tui: TuiPlugin = async (rawApi, options) => {
  const api = rawApi as unknown as PluginApiLike
  const boot = cfg(rec(options))
  if (!boot.enabled) return

  await disableInternalSidebarPlugins(api)

  const [value] = createSignal(boot)
  const [isBusy, setIsBusy] = createSignal(false)

  try {
    await api.theme.install("./gentleman.json")
    if (value().set_theme) {
      api.theme.set(value().theme)
    }
  } catch (error) {
    console.error("[plugin-gentleman] Theme setup failed:", error)
  }

  createEffect(() => {
    try {
      if (api.state?.session?.running !== undefined) {
        setIsBusy(!!api.state.session.running)
      } else {
        setIsBusy(false)
      }
    } catch {
      // feature-detection path: keep silent to avoid noisy logs on hosts without this API
      setIsBusy(false)
    }
  })

  api.slots.register({
    mode: "replace",
    slots: {
      home_logo(ctx) {
        return <HomeLogo theme={ctx.theme.current} />
      },
      home_bottom(ctx) {
        return <DetectedEnv theme={ctx.theme.current} providers={getProviderArray(api.state.provider)} config={value()} />
      },
      sidebar_content(ctx, slotValue) {
        const sessionID = slotValue?.session_id ?? slotValue?.sessionID
        const getSessionMessages = () => {
          if (!sessionID || typeof api.state.session.messages !== "function") return []
          return api.state.session.messages(sessionID)
        }

        const sessionStatus =
          sessionID && typeof api.state?.session?.status === "function"
            ? api.state.session.status(sessionID)
            : undefined

        return (
          <SidebarMustachi
            theme={ctx.theme.current}
            config={value()}
            isBusy={isSessionBusy(sessionStatus) || isBusy()}
            providers={getProviderArray(api.state.provider)}
            sessionId={() => sessionID}
            branch={() => api.state.vcs?.branch}
            getMessages={() => getSessionMessages()}
            mcpData={() => {
              const rootState = api.state
              if (typeof rootState.mcp === "function") {
                return rootState.mcp()
              }

              const sidebarState = api.state.sidebar
              if (typeof sidebarState?.mcp === "function") {
                return sidebarState.mcp()
              }

              return sidebarState?.mcp
            }}
            runtimeContext={() => slotValue}
            contextLimit={() => {
              const { providerID, modelID } = getLatestAssistantModelContext(getSessionMessages())
              if (!providerID || !modelID) return
              return getContextLimit(api.state.provider, providerID, modelID)
            }}
            contextLimitEstimated={() => false}
            costBudgetUsd={value().cost_budget_usd}
          />
        )
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
