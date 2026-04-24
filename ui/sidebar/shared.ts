import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import type { Cfg } from "../../config.ts"
import type { LspItem, Message, ModifiedFileItem, ProviderInfo, RuntimeContext } from "../../types.ts"
import type { MustachiModelClient } from "../../runtime/model-client.ts"

export type SidebarMustachiProps = {
  theme: TuiThemeCurrent
  config: Cfg
  isBusy?: boolean
  providers?: ReadonlyArray<ProviderInfo>
  sessionId?: string | (() => string | undefined)
  branch?: string | (() => string | undefined)
  getMessages?: () => Message[]
  modifiedFiles?: ReadonlyArray<ModifiedFileItem> | (() => ReadonlyArray<ModifiedFileItem> | undefined)
  lsp?: ReadonlyArray<LspItem> | (() => ReadonlyArray<LspItem> | undefined)
  mcpData?: unknown | (() => unknown)
  runtimeContext?: RuntimeContext | (() => RuntimeContext | undefined)
  personalityModelClient?: MustachiModelClient
  contextLimit?: number | (() => number | undefined)
  contextLimitEstimated?: boolean | (() => boolean | undefined)
  costBudgetUsd?: number | (() => number | undefined)
}

export const resolveProp = <T,>(value: T | (() => T) | undefined): T | undefined => {
  if (typeof value === "function") return (value as () => T)()
  return value
}
