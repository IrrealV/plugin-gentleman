/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import type { Cfg } from "../config.ts"
import type { ProviderInfo } from "../types.ts"
import { getOSName, getProviders } from "../utils/detection.ts"

export const DetectedEnv = (props: {
  theme: TuiThemeCurrent
  providers: ReadonlyArray<ProviderInfo> | undefined
  config: Cfg
}) => {
  if (!props.config.show_detected) return null

  const os = props.config.show_os ? getOSName() : null
  const providers = props.config.show_providers ? getProviders(props.providers) : null

  if (!os && !providers) return null

  return (
    <box flexDirection="row" gap={1}>
      <text fg={props.theme.textMuted}>Detected:</text>
      {os && <text fg={props.theme.text}>{os}</text>}
      {os && providers && <text fg={props.theme.textMuted}>·</text>}
      {providers && <text fg={props.theme.text}>{providers}</text>}
    </box>
  )
}
