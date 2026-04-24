import {
  pupilPositionFrames,
  eyeSquinted,
  eyeBlinkHalf,
  eyeBlinkClosed,
  mustachiMustacheSection,
  tongueFrames,
} from "../../ascii-frames.ts"
import {
  applyMonocleLensOverlay,
  resolveMonocleLensOverlayAnchor,
  type MonocleLensOverlay,
  type MonocleLensOverlayAnchor,
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
  let monocleLensOverlayAnchor: MonocleLensOverlayAnchor | undefined

  if (input.blinkFrame === 1) {
    eyeFrame = eyeBlinkHalf
  } else if (input.blinkFrame === 2) {
    eyeFrame = eyeBlinkClosed
  } else {
    monocleLensOverlayAnchor = resolveMonocleLensOverlayAnchor(eyeFrame, input.pupilIndex)
    eyeFrame = applyMonocleLensOverlay(eyeFrame, input.monocleLensOverlay, {
      anchor: monocleLensOverlayAnchor,
    })
  }

  const hasMonocleLensOverlay = !!input.monocleLensOverlay?.glyph && input.blinkFrame === 0

  eyeFrame.forEach((line, idx) => {
    const zone = idx < 2 || (hasMonocleLensOverlay && idx === monocleLensOverlayAnchor?.lineIndex) ? "monocle" : "eyes"
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
