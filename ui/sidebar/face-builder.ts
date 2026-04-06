import {
  pupilPositionFrames,
  eyeSquinted,
  eyeBlinkHalf,
  eyeBlinkClosed,
  mustachiMustacheSection,
  tongueFrames,
} from "../../ascii-frames.ts"
import { applyRightEyeContextualMark, type MustachiVisualState } from "../../utils/animation-utils.ts"
import type { DetectedStack } from "../../utils/detection.ts"
import type { SemanticZone } from "../../types.ts"

export type FaceLine = { content: string; zone: SemanticZone }

export const buildMustachiFace = (input: {
  pupilIndex: number
  blinkFrame: number
  visualState: MustachiVisualState
  detectedStack: DetectedStack | undefined
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
    eyeFrame = applyRightEyeContextualMark(eyeFrame, input.detectedStack)
  }

  eyeFrame.forEach((line, idx) => {
    lines.push({ content: line, zone: idx < 2 ? "monocle" : "eyes" })
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
