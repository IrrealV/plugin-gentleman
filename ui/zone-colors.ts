import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { zoneColors } from "../ascii-frames.ts"
import type { SemanticZone } from "../types.ts"

export type ThemeColor = NonNullable<TuiThemeCurrent["text"]>

export function getZoneColor(zone: SemanticZone | string, theme?: TuiThemeCurrent): string | ThemeColor {
  switch (zone) {
    case "monocle":
      return theme?.primary || zoneColors.eyes
    case "eyes":
      return theme?.primary || zoneColors.eyes
    case "mustache":
      return theme?.secondary || zoneColors.mustache
    case "tongue":
      return zoneColors.tongue
    default:
      return theme?.textMuted || zoneColors.mustache
  }
}
