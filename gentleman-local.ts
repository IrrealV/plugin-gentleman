/**
 * gentleman-local.ts
 * 
 * TRUE local-file OpenCode system plugin for Gentleman theme.
 * 
 * IMPORTANT LIMITATIONS - Local .ts plugins vs npm TUI plugins:
 * 
 * ✅ What this LOCAL plugin CAN do:
 * - Inject Gentleman branding into system prompt (AI sees it, users don't)
 * - Provide environment detection info to the AI assistant
 * - Add MCP tools for theme management
 * 
 * ❌ What this LOCAL plugin CANNOT do (requires npm package with TUI exports):
 * - Replace the home logo with mustache ASCII art
 * - Add visual UI components or slots
 * - Modify the TUI appearance
 * - Auto-set the theme programmatically
 * - Use JSX/Solid components
 * 
 * HONEST ASSESSMENT:
 * Local .ts plugins are SYSTEM plugins - they extend backend functionality (tools, hooks, prompts).
 * They CANNOT modify the visual TUI. For visual customization, you MUST use the npm package approach.
 * 
 * This file provides the MAXIMUM functionality possible for a local plugin, which is honestly
 * quite limited compared to the full TUI version.
 * 
 * Installation:
 * 1. Copy/symlink this file: ln -sf $(pwd)/gentleman-local.ts ~/.config/opencode/plugins/gentleman.ts
 * 2. Ensure gentleman.json exists in ~/.config/opencode/themes/
 * 3. Manually set theme in opencode.json: { "theme": "gentleman" }
 * 4. Add plugin: { "plugin": ["gentleman"] }
 * 5. Restart OpenCode
 * 
 * For FULL functionality (logo, visual detection), you need the npm package version.
 */

import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { readFileSync, existsSync, copyFileSync } from "node:fs"
import { homedir, platform } from "node:os"
import { join } from "node:path"

type Cfg = {
  enabled: boolean
  inject_branding: boolean
  show_env_info: boolean
}

const rec = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return
  return Object.fromEntries(Object.entries(value))
}

const bool = (value: unknown, fallback: boolean) => {
  if (typeof value !== "boolean") return fallback
  return value
}

const cfg = (opts: Record<string, unknown> | undefined): Cfg => {
  return {
    enabled: bool(opts?.enabled, true),
    inject_branding: bool(opts?.inject_branding, true),
    show_env_info: bool(opts?.show_env_info, true),
  }
}

// Helper to detect OS name
const getOSName = (): string => {
  try {
    const plat = platform()
    switch (plat) {
      case "linux":
        try {
          const osRelease = readFileSync("/etc/os-release", "utf8")
          const match = osRelease.match(/^NAME="?([^"\n]+)"?/m)
          if (match) return match[1]
        } catch {
        }
        return "Linux"
      case "darwin":
        return "macOS"
      case "win32":
        return "Windows"
      default:
        return plat
    }
  } catch {
    return "Unknown"
  }
}

const GentlemanPlugin: Plugin = async (ctx) => {
  const { client } = ctx
  const config = cfg(rec(ctx.options))

  if (!config.enabled) {
    return {}
  }

  // Check if theme file exists
  const themePath = join(homedir(), ".config", "opencode", "themes", "gentleman.json")
  const themeExists = existsSync(themePath)
  
  const configPath = join(homedir(), ".config", "opencode", "opencode.json")
  const configExists = existsSync(configPath)

  let currentTheme = "unknown"
  if (configExists) {
    try {
      const configContent = readFileSync(configPath, "utf8")
      const openCodeConfig = JSON.parse(configContent)
      currentTheme = openCodeConfig.theme || "default"
    } catch {
      // ignore
    }
  }

  const osName = getOSName()
  const isGentlemanActive = currentTheme === "gentleman"

  // Build environment info for system prompt
  const envInfo = config.show_env_info ? [
    `## Gentleman Plugin - Environment Info`,
    `- OS: ${osName}`,
    `- Gentleman theme installed: ${themeExists ? "✅ Yes" : "❌ No"}`,
    `- Current theme: ${currentTheme}`,
    `- Gentleman theme active: ${isGentlemanActive ? "✅ Yes" : "❌ No"}`,
    ``,
    themeExists && !isGentlemanActive 
      ? `To activate Gentleman theme, set "theme": "gentleman" in ~/.config/opencode/opencode.json`
      : "",
  ].filter(Boolean).join("\n") : ""

  // Gentleman branding (ASCII mustache - for system prompt only, user won't see it)
  const brandingArt = config.inject_branding ? [
    ``,
    `    ⠀⠀⠀⠀⢀⣠⣴⣶⣶⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⣶⣶⣦⣄⠀⠀⠀⠀`,
    `    ⠀⠀⢀⣴⣿⡿⠛⠉⠉⠛⢿⣷⣄⠀⠀⠀⠀⠀⠀⣠⣾⡿⠛⠉⠉⠛⢿⣷⣄⠀⠀`,
    `    ⠀⢠⣿⡿⠋⠀⠀⣀⣀⠀⠀⠙⢿⣷⣄⠀⠀⣠⣾⡿⠋⠀⠀⣀⣀⠀⠀⠙⢿⣷⡀`,
    `    ⠀⣿⣿⠁⠀⠀⣾⣿⣿⣷⠀⠀⠀⠙⢿⣷⣾⡿⠋⠀⠀⠀⣾⣿⣿⣷⠀⠀⠈⣿⣿`,
    `    ⠀⢿⣿⣄⠀⠀⠻⠿⠿⠋⠀⢀⣠⣴⡿⠋⠙⢿⣦⣄⠀⠀⠙⠿⠿⠟⠀⠀⣠⣿⡿`,
    `    ⠀⠀⠻⣿⣷⣦⣤⣀⣀⣤⣶⡿⠛⠁⠀⠀⠀⠀⠈⠛⢿⣶⣤⣀⣀⣤⣴⣾⣿⠟⠀`,
    `    ⠀⠀⠀⠀⠙⠻⢿⣿⡿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⢿⣿⡿⠟⠋⠀⠀⠀`,
    ``,
    `                         ╭ Gentleman Plugin ╮`,
    ``,
  ].join("\n") : ""

  const systemContext = [
    brandingArt,
    envInfo,
    ``,
    `NOTE: This is a local system plugin. It cannot modify the visual TUI.`,
    `For visual customization (mustache logo in TUI, environment detection display),`,
    `you need the npm package version with TUI exports.`,
  ].filter(Boolean).join("\n")

  return {
    tool: {
      // Tool to check Gentleman theme status
      gentleman_status: tool(
        {
          description: "Check Gentleman theme installation and activation status",
          input: {},
          output: {},
        },
        async () => {
          return {
            theme_installed: themeExists,
            theme_path: themePath,
            current_theme: currentTheme,
            is_active: isGentlemanActive,
            os: osName,
            message: isGentlemanActive 
              ? "✅ Gentleman theme is active"
              : themeExists
                ? `⚠️  Gentleman theme is installed but not active. Set "theme": "gentleman" in ${configPath}`
                : `❌ Gentleman theme not found. Install gentleman.json to ${themePath}`,
          }
        }
      ),
    },

    // Inject Gentleman branding and environment info into system prompt
    "experimental.chat.system.transform": async (_input, output) => {
      if (!config.enabled) return
      output.system = [...output.system, systemContext]
    },
  }
}

export default GentlemanPlugin
