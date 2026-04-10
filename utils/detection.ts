// OS and provider detection utilities

import { readFileSync } from "node:fs"
import type { LspItem, ProviderInfo } from "../types.ts"

export type DetectedStack =
  | "react"
  | "angular"
  | "vue"
  | "node"
  | "go"
  | "python"
  | "dotnet"
  | "svelte"
  | "nextjs"
  | "rust"
  | "cpp"
  | "lua"

let cachedOSName: string | undefined

// Helper to detect OS name
export const getOSName = (): string => {
  if (cachedOSName !== undefined) {
    return cachedOSName
  }

  try {
    const platform = typeof process !== "undefined" ? process.platform : "unknown"
    switch (platform) {
      case "linux":
        try {
          const osRelease = readFileSync("/etc/os-release", "utf8")
          const match = osRelease.match(/^NAME="?([^"\n]+)"?/m)
          if (match) {
            cachedOSName = match[1]
            return cachedOSName
          }
        } catch {
        }
        cachedOSName = "Linux"
        return cachedOSName
      case "darwin":
        cachedOSName = "macOS"
        return cachedOSName
      case "win32":
        cachedOSName = "Windows"
        return cachedOSName
      default:
        cachedOSName = platform
        return cachedOSName
    }
  } catch {
    cachedOSName = "Unknown"
    return cachedOSName
  }
}

// Map provider IDs to friendly display names
const providerDisplayNames: Record<string, string> = {
  "openai": "OpenAI",
  "google": "Google",
  "github-copilot": "Copilot",
  "opencode-go": "OpenCode GO",
  "anthropic": "Claude",
  "deepseek": "DeepSeek",
  "openrouter": "OpenRouter",
  "mistral": "Mistral",
  "groq": "Groq",
  "cohere": "Cohere",
  "together": "Together",
  "perplexity": "Perplexity",
}

// Helper to detect active providers from OpenCode state
export const getProviders = (providers: ReadonlyArray<ProviderInfo> | undefined): string => {
  if (!providers || providers.length === 0) {
    return "No providers configured"
  }

  // Map provider IDs to friendly names and deduplicate
  const names = new Set<string>()
  for (const provider of providers) {
    const displayName = providerDisplayNames[provider.id] || provider.name || provider.id
    names.add(displayName)
  }

  // Return compact comma-separated list
  return Array.from(names).sort().join(", ")
}

const lspToStack: Record<string, DetectedStack> = {
  gopls: "go",
  // TypeScript-family servers keep the React stack bucket;
  // monocle mark symbol is resolved separately in animation-utils.
  tsserver: "react",
  "typescript-language-server": "react",
  vtsls: "react",
  "rust-analyzer": "rust",
  pyright: "python",
  basedpyright: "python",
  clangd: "cpp",
  lua_ls: "lua",
  omnisharp: "dotnet",
}

export const getStackFromLsp = (lspItems: LspItem[]): DetectedStack | undefined => {
  try {
    if (!Array.isArray(lspItems) || lspItems.length === 0) return

    for (const item of lspItems) {
      const id = typeof item?.id === "string" ? item.id.toLowerCase().trim() : ""
      console.debug("[getStackFromLsp] item.id", item?.id)
      if (!id) continue

      const detected = lspToStack[id]
      if (detected) return detected
    }

    return
  } catch {
    return
  }
}

type StackDetectionInput = {
  lsp?: ReadonlyArray<LspItem>
}

// Legacy shim retained for compatibility with older call-sites.
// Regex heuristics were removed; this now delegates to native LSP state only.
export const detectPrimaryStackContext = (input: StackDetectionInput): DetectedStack | undefined => {
  return getStackFromLsp(Array.isArray(input.lsp) ? [...input.lsp] : [])
}
