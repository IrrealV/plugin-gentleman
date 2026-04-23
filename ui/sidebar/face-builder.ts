import {
  pupilPositionFrames,
  eyeSquinted,
  eyeBlinkHalf,
  eyeBlinkClosed,
  mustachiMustacheSection,
  tongueFrames,
} from "../../ascii-frames.ts"
import {
  MONOCLE_LENS_OVERLAY_LINE_INDEX,
  applyMonocleLensOverlay,
  type MonocleLensOverlay,
  type MustachiVisualState,
} from "../../utils/animation-utils.ts"
import type { SemanticZone } from "../../types.ts"

export type FaceLine = { content: string; zone: SemanticZone }

export const buildMustachiFace = (input: {
  pupilIndex: number
  blinkFrame: number
  visualState: MustachiVisualState
  monocleLensOverlay: MonocleLensOverlay | undefined
  shouldShowExpression: boolean
  tongueFrame: number
}): FaceLine[] => {
  const lines: FaceLine[] = []

  let eyeFrame = pupilPositionFrames[input.pupilIndex]
  if (input.visualState !== "idle") eyeFrame = eyeSquinted

  if (input.blinkFrame === 1) {
    eyeFrame = eyeBlinkHalf
  } else if (input.blinkFrame === 2) {
    eyeFrame = eyeBlinkClosed
  } else {
    eyeFrame = applyMonocleLensOverlay(eyeFrame, input.monocleLensOverlay)
  }

  const hasMonocleLensOverlay = !!input.monocleLensOverlay?.glyph && input.blinkFrame === 0

  eyeFrame.forEach((line, idx) => {
    const zone = idx < 2 || (hasMonocleLensOverlay && idx === MONOCLE_LENS_OVERLAY_LINE_INDEX) ? "monocle" : "eyes"
    lines.push({ content: line, zone })
  })

  mustachiMustacheSection.forEach(line => {
    lines.push({ content: line, zone: "mustache" })
  })

  if (input.shouldShowExpression && input.tongueFrame > 0) {
    const tongueLines = tongueFrames[input.tongueFrame]
    tongueLines.forEach(line => {
      lines.push({ content: line, zone: "tongue" })
    })
  }

  return lines
}
