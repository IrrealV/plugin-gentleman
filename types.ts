export type SemanticZone = "monocle" | "eyes" | "mustache" | "tongue" | "unknown"

export type NumericLike = number | string

export interface MessageTokens {
  input?: NumericLike
  output?: NumericLike
  reasoning?: NumericLike
  cache?: {
    read?: NumericLike
    write?: NumericLike
  }
}

export interface TokenUsage {
  total?: NumericLike
  total_tokens?: NumericLike
  input?: NumericLike
  input_tokens?: NumericLike
  prompt_tokens?: NumericLike
  output?: NumericLike
  output_tokens?: NumericLike
  completion_tokens?: NumericLike
  cost?: NumericLike
  cost_usd?: NumericLike
  [key: string]: unknown
}

export interface Message {
  role?: string
  message?: { role?: string; content?: unknown }
  author?: { role?: string }
  tokenUsage?: TokenUsage
  usage?: TokenUsage
  tokens?: MessageTokens | NumericLike
  token_usage?: TokenUsage
  total_tokens?: NumericLike
  modelID?: string
  modelId?: string
  model?: string | { id?: string; name?: string }
  providerID?: string
  providerId?: string
  provider?: string | { id?: string }
  cost_usd?: NumericLike
  cost?: NumericLike
  total_cost?: NumericLike
  content?: unknown
  [key: string]: unknown
}

export interface RuntimeContext {
  runtime?: {
    status?: string
    state?: string
    phase?: string
    running?: boolean
    model?: { id?: string; name?: string }
    metadata?: {
      framework?: string
      stack?: string
      language?: string
      [key: string]: unknown
    }
    provider?: string
    [key: string]: unknown
  }
  model?: { id?: string; name?: string }
  metadata?: {
    framework?: string
    stack?: string
    language?: string
    [key: string]: unknown
  }
  provider?: string
  status?: string
  state?: string
  phase?: string
  running?: boolean
  session?: { running?: boolean; [key: string]: unknown }
  [key: string]: unknown
}

export interface McpItem {
  id?: string
  name: string
  status?: string
  error?: unknown
  userConfigured?: boolean
  custom?: boolean
  isUserDefined?: boolean
}

export interface ProviderModel {
  limit?: { context?: NumericLike }
  [key: string]: unknown
}

export interface ProviderInfo {
  id: string
  name: string
  models?: Record<string, ProviderModel>
  [key: string]: unknown
}
