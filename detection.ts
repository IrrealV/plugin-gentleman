// OS and provider detection utilities

import { readFileSync } from "node:fs"

// Helper to detect OS name
export const getOSName = (): string => {
  try {
    const platform = typeof process !== "undefined" ? process.platform : "unknown"
    switch (platform) {
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
        return platform
    }
  } catch {
    return "Unknown"
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
export const getProviders = (providers: ReadonlyArray<{ id: string; name: string }> | undefined): string => {
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
