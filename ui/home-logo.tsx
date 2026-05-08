/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { mustachiMustacheOnly, mustachiVintacheOnly } from "../ascii-frames.ts"
import { getSidebarMustachiZoneColor } from "./zone-colors.ts"

// Home logo: Mustache-only (simple and prominent) flat tone
export const HomeLogo = (props: { theme: TuiThemeCurrent; logoStyle?: "default" | "vintage" }) => {
  const mustacheTone = getSidebarMustachiZoneColor("mustache", props.theme)
  const mutedBranding = props.theme?.textMuted ?? "#888888"
  const primaryBranding = props.theme?.primary ?? "#FFFFFF"

  const logo = () => props.logoStyle === "default" ? mustachiMustacheOnly : mustachiVintacheOnly

  return (
    <box flexDirection="column" alignItems="center">
      {logo().map(line => <text fg={mustacheTone}>{line.padEnd(61, " ")}</text>)}

      <box flexDirection="row" gap={0} marginTop={1}>
        <text fg={mutedBranding}>╭ </text>
        <text fg={primaryBranding}> O p e n C o d e </text>
        <text fg={mutedBranding}> ╮</text>
      </box>

      <text> </text>
    </box>
  )
}
