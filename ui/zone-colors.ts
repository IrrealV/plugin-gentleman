import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { zoneColors } from "../ascii-frames.ts"
import type { SemanticZone } from "../types.ts"
import type { AnsiColor } from "../ascii-frames.ts"

export type ThemeColor = NonNullable<TuiThemeCurrent["text"]>

const sidebarMustachiZoneColors = {
  eyes: "#F5F5F5",
  eyeFill: "#F5F5F5",
  eyeShadow: "#8A6F7D",
  monocleLens: "#F5F5F5",
  monocle: "#FF69B4",
  mustache: "#FF69B4",
} as const

// ANSI color to hex mapping for reworked face
const ansiColorToHex: Record<AnsiColor, string> = {
  white: "#FFFFFF",
  magenta: "#FF4466",
  black: "#000000",
  grey: "#888888",
}

// Resolve background color from ANSI color
export function getAnsiBackgroundColor(color: AnsiColor): string | undefined {
  if (color === "black") return undefined // Transparent (default terminal background)
  return ansiColorToHex[color]
}

// Resolve foreground color from ANSI color
export function getAnsiForegroundColor(color: AnsiColor): string {
  return ansiColorToHex[color]
}

export function getSidebarMustachiZoneBackgroundColor(zone: SemanticZone | string): string | undefined {
  switch (zone) {
    case "eyeFill":
      return sidebarMustachiZoneColors.eyeFill
    case "monocleLens":
      return sidebarMustachiZoneColors.monocleLens
    default:
      return undefined
  }
}

export function getSidebarMustachiZoneColor(zone: SemanticZone | string, theme?: TuiThemeCurrent): string | ThemeColor {
  switch (zone) {
    case "eyes":
      return sidebarMustachiZoneColors.eyes
    case "eyeFill":
      return sidebarMustachiZoneColors.eyeFill
    case "eyeShadow":
      return sidebarMustachiZoneColors.eyeShadow
    case "monocleLens":
      return sidebarMustachiZoneColors.monocleLens
    case "monocle":
      return sidebarMustachiZoneColors.monocle
    case "eyeOverlay":
      return sidebarMustachiZoneColors.monocle
    case "mustache":
      return sidebarMustachiZoneColors.mustache
    default:
      return getZoneColor(zone, theme)
  }
}

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
