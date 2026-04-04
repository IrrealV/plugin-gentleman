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

  // Theme setup - wrapped in try-catch to avoid breaking plugin bootstrap
  try {
    await api.theme.install("./gentleman.json")
    if (value().set_theme) {
      api.theme.set(value().theme)
    }
  } catch (error) {
    // Theme installation failed - log but continue with slot registration
    // Plugin will still render with default theme
    console.error("[plugin-gentleman] Theme setup failed:", error)
  }

  // Detect busy state if API exposes it
  // Note: Best-effort detection - OpenCode TUI may not expose session.running
  // If unavailable, isBusy remains false and expressive cycle fallback handles animations
  createEffect(() => {
    try {
      // Attempt to reactively track running state if API supports it
      // This may or may not work depending on OpenCode version
      if (api.state?.session?.running !== undefined) {
        setIsBusy(!!api.state.session.running)
      } else {
        // API doesn't expose running state - degrade gracefully
        // Expressive cycle fallback in components.tsx will demonstrate animations
        setIsBusy(false)
      }
    } catch {
      // If API doesn't expose this at all, stay in idle state
      // Periodic expressive cycles ensure animations are still visible
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
