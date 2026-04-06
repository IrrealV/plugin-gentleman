// OS and provider detection utilities

import { readFileSync } from "node:fs"
import type { Message, ProviderInfo, RuntimeContext } from "../types.ts"

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

type StackDetectionInput = {
  providers?: ReadonlyArray<ProviderInfo>
  runtimeContext?: RuntimeContext
  messages?: ReadonlyArray<Message>
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

const getMessageField = (message: Message, key: "model" | "provider"): unknown => {
  const direct = message[key]
  if (typeof direct === "string") return direct
  if (isRecord(direct)) return direct.id ?? direct["name"]
  return undefined
}

const getRuntimeRecord = (runtimeContext: RuntimeContext | undefined): Record<string, unknown> => {
  if (!runtimeContext) return {}
  if (runtimeContext.runtime && isRecord(runtimeContext.runtime)) return runtimeContext.runtime as Record<string, unknown>
  return runtimeContext as Record<string, unknown>
}

const stackRules: Record<DetectedStack, RegExp[]> = {
  react: [/\breact\b/, /\btsx\b/, /\bjsx\b/],
  angular: [/\bangular\b/, /\bnx\b/],
  vue: [/\bvue\b/, /\bnuxt\b/],
  node: [/\bnode\b/, /\bnodejs\b/, /\bexpress\b/, /\bnestjs\b/],
  go: [/\bgolang\b/, /\bgo\s+mod\b/, /\bgo\.sum\b/, /\bgin\b/, /\bfiber\b/],
  python: [/\bpython\b/, /\.py\b/, /\bdjango\b/, /\bfastapi\b/],
  dotnet: [/\.net\b/, /\bdotnet\b/, /\bc#\b/, /\basp\.net\b/],
  svelte: [/\bsvelte\b/, /\bsveltekit\b/],
  nextjs: [/\bnext\.js\b/, /\bnextjs\b/],
  rust: [/\brust\b/, /\baxum\b/, /\bactix\b/],
}

const stackPriority: DetectedStack[] = [
  "nextjs",
  "react",
  "angular",
  "vue",
  "svelte",
  "node",
  "go",
  "python",
  "dotnet",
  "rust",
]

const pushHint = (bucket: string[], value: unknown) => {
  if (typeof value === "string" && value.trim()) {
    bucket.push(value.toLowerCase())
  }
}

const extractText = (value: unknown): string => {
  if (typeof value === "string") return value
  if (Array.isArray(value)) {
    return value.map(item => extractText(item)).filter(Boolean).join(" ")
  }
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>
    return [extractText(item.text), extractText(item.content), extractText(item.value)]
      .filter(Boolean)
      .join(" ")
  }
  return ""
}

export const detectPrimaryStackContext = (input: StackDetectionInput): DetectedStack | undefined => {
  try {
    const hints: string[] = []
    const runtime = getRuntimeRecord(input.runtimeContext)
    const model = isRecord(runtime.model) ? runtime.model : undefined
    const metadata = isRecord(runtime.metadata) ? runtime.metadata : undefined

    for (const provider of input.providers ?? []) {
      pushHint(hints, provider.id)
      pushHint(hints, provider.name)
    }

    pushHint(hints, model?.id)
    pushHint(hints, model?.name)
    pushHint(hints, runtime?.provider)
    pushHint(hints, metadata?.framework)
    pushHint(hints, metadata?.stack)
    pushHint(hints, metadata?.language)

    const recentMessages = (input.messages ?? []).slice(-6)
    for (const message of recentMessages) {
      pushHint(hints, getMessageField(message, "model"))
      pushHint(hints, getMessageField(message, "provider"))
      pushHint(hints, extractText(message.content))
      pushHint(hints, extractText(message.message?.content))
    }

    if (!hints.length) return

    const scores = new Map<DetectedStack, number>()
    const corpus = hints.join(" ")
    for (const stack of stackPriority) {
      let score = 0
      for (const pattern of stackRules[stack]) {
        if (pattern.test(corpus)) score += 1
      }
      if (score > 0) scores.set(stack, score)
    }

    let best: DetectedStack | undefined
    let bestScore = 0
    for (const stack of stackPriority) {
      const score = scores.get(stack) ?? 0
      if (score > bestScore) {
        best = stack
        bestScore = score
      }
    }

    return best
  } catch {
    return
  }
}
