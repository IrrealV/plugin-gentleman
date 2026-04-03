// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal, createEffect } from "solid-js"
import { cfg, type Cfg } from "./config"
import { HomeLogo, SidebarMustachi, DetectedEnv } from "./components"

const id = "gentleman"

const rec = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return
  return Object.fromEntries(Object.entries(value))
}

const tui: TuiPlugin = async (api, options) => {
  const boot = cfg(rec(options))
  if (!boot.enabled) return

  const [value] = createSignal(boot)
  const [isBusy, setIsBusy] = createSignal(false)

  await api.theme.install("./gentleman.json")
  if (value().set_theme) {
    api.theme.set(value().theme)
  }

  // Detect busy state if API exposes it
  // This is a best-effort detection - OpenCode TUI may or may not expose this
  createEffect(() => {
    try {
      // Check if there's a running agent or session state
      const hasRunningSession = api.state?.session?.running
      setIsBusy(!!hasRunningSession)
    } catch {
      // If API doesn't expose this, animations will just use idle state
      setIsBusy(false)
    }
  })

  api.slots.register({
    slots: {
      home_logo(ctx) {
        return <HomeLogo theme={ctx.theme.current} />
      },
      home_bottom(ctx) {
        return <DetectedEnv theme={ctx.theme.current} providers={api.state.provider} config={value()} />
      },
      sidebar_content(ctx) {
        return <SidebarMustachi theme={ctx.theme.current} config={value()} isBusy={isBusy()} />
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
