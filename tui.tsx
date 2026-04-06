/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal, createEffect } from "solid-js"
import { cfg } from "./config.ts"
import { HomeLogo } from "./ui/home-logo.tsx"
import { SidebarMustachi } from "./ui/sidebar-mustachi.tsx"
import { DetectedEnv } from "./ui/detected-env.tsx"
import {
  rec,
  disableInternalSidebarPlugins,
  getProviderArray,
  getLatestAssistantModelContext,
  getContextLimit,
  type PluginApiLike,
} from "./runtime/plugin-api.ts"
import { isSessionBusy } from "./runtime/busy-detection.ts"

const id = "gentleman"

const tui: TuiPlugin = async (rawApi, options) => {
  const api = rawApi as unknown as PluginApiLike
  const boot = cfg(rec(options))
  if (!boot.enabled) return

  void (async () => {
    try {
      await disableInternalSidebarPlugins(api)
    } catch (error) {
      console.warn("[plugin-gentleman] Background sidebar suppression failed:", error)
    }
  })()

  const [value] = createSignal(boot)
  const [isBusy, setIsBusy] = createSignal(false)

  void (async () => {
    try {
      await api.theme.install("./gentleman.json")
      if (value().set_theme) {
        api.theme.set(value().theme)
      }
    } catch (error) {
      console.error("[plugin-gentleman] Theme setup failed:", error)
    }
  })()

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
