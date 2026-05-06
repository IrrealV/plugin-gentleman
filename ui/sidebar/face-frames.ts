import {
  pupilPositionFrames,
  eyeSquinted,
  eyeBlinkHalf,
  eyeBlinkClosed,
  mustachiMustacheSection,
  tongueFrames,
} from "../../ascii-frames.ts"

export interface SidebarFaceFrames {
  pupilPositionFrames: readonly (readonly string[])[]
  eyeSquinted: readonly string[]
  eyeBlinkHalf: readonly string[]
  eyeBlinkClosed: readonly string[]
  mustacheSection: readonly string[]
  tongueFrames: readonly (readonly string[])[]
}

const rstrip = (value: string): string => value.replace(/\s+$/, "")

export const measureFrameWidth = (lines: readonly string[]): number => {
  return lines.reduce((max, line) => {
    const width = Array.from(rstrip(line)).length
    return width > max ? width : max
  }, 0)
}

export const measureFramesWidth = (frames: SidebarFaceFrames): number => {
  const widths = [
    ...frames.pupilPositionFrames.map(frame => measureFrameWidth(frame)),
    measureFrameWidth(frames.eyeSquinted),
    measureFrameWidth(frames.eyeBlinkHalf),
    measureFrameWidth(frames.eyeBlinkClosed),
    measureFrameWidth(frames.mustacheSection),
    ...frames.tongueFrames.map(frame => measureFrameWidth(frame)),
  ]

  return widths.reduce((max, width) => (width > max ? width : max), 0)
}

const centerCropLine = (line: string, targetWidth: number): string => {
  const chars = Array.from(rstrip(line))
  if (chars.length <= targetWidth) return chars.join("")

  const start = Math.floor((chars.length - targetWidth) / 2)
  return chars.slice(start, start + targetWidth).join("")
}

const centerCropFrame = (lines: readonly string[], targetWidth: number): readonly string[] => {
  return lines.map(line => centerCropLine(line, targetWidth))
}

const deriveMiniFrames = (full: SidebarFaceFrames): SidebarFaceFrames => {
  const fullWidth = measureFramesWidth(full)
  const targetWidth = Math.floor(0.75 * fullWidth)

  return {
    pupilPositionFrames: full.pupilPositionFrames.map(frame => centerCropFrame(frame, targetWidth)),
    eyeSquinted: centerCropFrame(full.eyeSquinted, targetWidth),
    eyeBlinkHalf: centerCropFrame(full.eyeBlinkHalf, targetWidth),
    eyeBlinkClosed: centerCropFrame(full.eyeBlinkClosed, targetWidth),
    mustacheSection: centerCropFrame(full.mustacheSection, targetWidth),
    tongueFrames: full.tongueFrames.map(frame => centerCropFrame(frame, targetWidth)),
  }
}

export const assertMiniWidthConstraint = (full: SidebarFaceFrames, mini: SidebarFaceFrames): boolean => {
  const fullWidth = measureFramesWidth(full)
  const miniWidth = measureFramesWidth(mini)
  const maxAllowed = Math.floor(0.75 * fullWidth)

  if (miniWidth <= maxAllowed) return true

  // Non-fatal: preserve current behavior by falling back to full.
  console.error(
    `[plugin-gentleman] sidebar mini mascot width constraint violated: W_mini=${miniWidth} > floor(0.75*W_full)=${maxAllowed} (W_full=${fullWidth}). Falling back to full frames.`,
  )
  return false
}

const SIDEBAR_FRAMES_FULL: SidebarFaceFrames = {
  pupilPositionFrames,
  eyeSquinted,
  eyeBlinkHalf,
  eyeBlinkClosed,
  mustacheSection: mustachiMustacheSection,
  tongueFrames,
}

const SIDEBAR_FRAMES_MINI: SidebarFaceFrames = deriveMiniFrames(SIDEBAR_FRAMES_FULL)

export const SIDEBAR_FRAMES = {
  full: SIDEBAR_FRAMES_FULL,
  mini: SIDEBAR_FRAMES_MINI,
} as const

export type SidebarFaceVariant = keyof typeof SIDEBAR_FRAMES

export const resolveSidebarFaceFrames = (variant: SidebarFaceVariant): SidebarFaceFrames => {
  if (variant === "mini") {
    return assertMiniWidthConstraint(SIDEBAR_FRAMES_FULL, SIDEBAR_FRAMES_MINI) ? SIDEBAR_FRAMES_MINI : SIDEBAR_FRAMES_FULL
  }

  return SIDEBAR_FRAMES_FULL
}
