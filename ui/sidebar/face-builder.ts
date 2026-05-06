import { resolveSidebarFaceFrames, type SidebarFaceVariant } from "./face-frames.ts"
import {
  applyMonocleLensOverlay,
  resolveMonocleLensOverlayAnchor,
  type MonocleLensOverlay,
  type MonocleLensOverlayAnchor,
  type MustachiVisualState,
} from "../../utils/animation-utils.ts"
import type { SemanticZone } from "../../types.ts"

type FaceSegmentZone = SemanticZone | "eyeFill" | "eyeOverlay" | "eyeShadow" | "monocleLens"

export type FaceSegment = { content: string; zone: FaceSegmentZone }
export type FaceLine = { content: string; zone: SemanticZone; segments?: FaceSegment[] }

export const SIDEBAR_FACE_WIDTH = 27

const MOUSTACHE_TIP_WIDTH = 2
const CLOSED_BLINK_SHADOW_END_LINE = 3

export const getSidebarFaceLineWidth = (line: string): number => Array.from(line).length

export const normalizeSidebarFaceLine = (line: string, width = SIDEBAR_FACE_WIDTH): string => {
  const chars = Array.from(line)
  if (chars.length === width) return line
  if (chars.length > width) return chars.slice(0, width).join("")
  return `${line}${" ".repeat(width - chars.length)}`
}

const getRightEyeStartColumn = (lineWidth: number): number => Math.ceil(lineWidth / 2)

const isRightMonocleRim = (content: string, columnIndex: number, rightEyeStartColumn: number): boolean => {
  return columnIndex >= rightEyeStartColumn && content === "█"
}

const isRightMonocleLensFill = (content: string, columnIndex: number, rightEyeStartColumn: number): boolean => {
  return columnIndex >= rightEyeStartColumn && content === "░"
}

const isLeftEyeFill = (content: string, columnIndex: number, rightEyeStartColumn: number): boolean => {
  return columnIndex < rightEyeStartColumn && content === "░"
}

const isBlinkEyelid = (content: string, lineIndex: number, columnIndex: number, blinkFrame: number, rightEyeStartColumn: number): boolean => {
  if (content !== "█" || blinkFrame === 0) return false
  if (columnIndex >= rightEyeStartColumn) return false
  if (blinkFrame === 1) return lineIndex <= 1
  return lineIndex <= CLOSED_BLINK_SHADOW_END_LINE
}

const compactSegments = (segments: FaceSegment[]): FaceSegment[] => {
  return segments.reduce<FaceSegment[]>((compacted, segment) => {
    const previous = compacted[compacted.length - 1]
    if (previous?.zone === segment.zone) {
      previous.content += segment.content
      return compacted
    }

    compacted.push({ ...segment })
    return compacted
  }, [])
}

const buildEyeSegments = (
  line: string,
  lineIndex: number,
  blinkFrame: number,
  overlayAnchor: MonocleLensOverlayAnchor | undefined,
  hasMonocleLensOverlay: boolean,
): FaceSegment[] => {
  const normalizedLine = normalizeSidebarFaceLine(line)
  const lineWidth = getSidebarFaceLineWidth(normalizedLine)
  const rightEyeStartColumn = getRightEyeStartColumn(lineWidth)

  const segments = Array.from(normalizedLine).map((content, columnIndex): FaceSegment => {
    const isMustacheTip =
      lineIndex === 4 &&
      (columnIndex < MOUSTACHE_TIP_WIDTH || columnIndex >= lineWidth - MOUSTACHE_TIP_WIDTH)
    const isOverlayGlyph = hasMonocleLensOverlay && lineIndex === overlayAnchor?.lineIndex && columnIndex === overlayAnchor.columnIndex

    if (isMustacheTip) return { content, zone: "mustache" }
    if (isOverlayGlyph) return { content, zone: "eyeOverlay" }
    if (isBlinkEyelid(content, lineIndex, columnIndex, blinkFrame, rightEyeStartColumn)) return { content, zone: "eyeShadow" }
    if (isRightMonocleRim(content, columnIndex, rightEyeStartColumn)) return { content, zone: "monocle" }
    if (isRightMonocleLensFill(content, columnIndex, rightEyeStartColumn)) return { content, zone: "monocleLens" }
    if (isLeftEyeFill(content, columnIndex, rightEyeStartColumn)) return { content, zone: "eyeFill" }
    return { content, zone: "eyes" }
  })

  return compactSegments(segments)
}

export const buildMustachiFace = (input: {
  variant: SidebarFaceVariant
  pupilIndex: number
  blinkFrame: number
  visualState: MustachiVisualState
  monocleLensOverlay: MonocleLensOverlay | undefined
  shouldShowExpression: boolean
  tongueFrame: number
}): FaceLine[] => {
  const lines: FaceLine[] = []

  const frames = resolveSidebarFaceFrames(input.variant)

  let eyeFrame = [...frames.pupilPositionFrames[input.pupilIndex]]
  if (input.visualState !== "idle") eyeFrame = [...frames.eyeSquinted]
  let monocleLensOverlayAnchor: MonocleLensOverlayAnchor | undefined

  if (input.blinkFrame === 1) {
    eyeFrame = [...frames.eyeBlinkHalf]
  } else if (input.blinkFrame === 2) {
    eyeFrame = [...frames.eyeBlinkClosed]
  } else {
    monocleLensOverlayAnchor = resolveMonocleLensOverlayAnchor(eyeFrame, input.pupilIndex)
    eyeFrame = applyMonocleLensOverlay(eyeFrame, input.monocleLensOverlay, {
      anchor: monocleLensOverlayAnchor,
    })
  }

  const hasMonocleLensOverlay = !!input.monocleLensOverlay?.glyph && input.blinkFrame === 0

  eyeFrame.forEach((line, idx) => {
    const normalizedLine = normalizeSidebarFaceLine(line)

    lines.push({
      content: normalizedLine,
      zone: "eyes",
      segments: buildEyeSegments(normalizedLine, idx, input.blinkFrame, monocleLensOverlayAnchor, hasMonocleLensOverlay),
    })
  })

  frames.mustacheSection.forEach(line => {
    lines.push({ content: normalizeSidebarFaceLine(line), zone: "mustache" })
  })

  if (input.shouldShowExpression && input.tongueFrame > 0) {
    const tongueLines = frames.tongueFrames[input.tongueFrame]
    tongueLines.forEach(line => {
      lines.push({ content: line, zone: "tongue" })
    })
  }

  return lines
}
