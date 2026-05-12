import {
  pupilPositionFrames,
  eyeSquinted,
  eyeBlinkHalf,
  eyeBlinkClosed,
  mustachiMustacheSection,
  tongueFrames,

  // Reworked face
  faceReworked,
  faceReworkedEyes,
  faceReworkedBlink,
  faceReworkedMustache,
  type FaceRow,
  type AnsiColor,
} from "../../ascii-frames.ts";
import {
  applyMonocleLensOverlay,
  resolveMonocleLensOverlayAnchor,
  type MonocleLensOverlay,
  type MonocleLensOverlayAnchor,
  type MustachiVisualState,
} from "../../utils/animation-utils.ts";
import type { SemanticZone } from "../../types.ts";

export type { FaceSection, FaceRow, AnsiColor } from "../../ascii-frames.ts";

type FaceSegmentZone =
  | SemanticZone
  | "eyeFill"
  | "eyeOverlay"
  | "eyeShadow"
  | "monocleLens";

export type FaceSegment = {
  content: string;
  zone: FaceSegmentZone;
  fg?: AnsiColor;
  bg?: AnsiColor;
};
export type FaceLine = {
  content: string;
  zone: SemanticZone;
  segments?: FaceSegment[];
};

export const SIDEBAR_FACE_WIDTH = 27;

const MOUSTACHE_TIP_WIDTH = 2;
const CLOSED_BLINK_SHADOW_END_LINE = 3;

export const getSidebarFaceLineWidth = (line: string): number =>
  Array.from(line).length;

export const normalizeSidebarFaceLine = (
  line: string,
  width = SIDEBAR_FACE_WIDTH,
): string => {
  const chars = Array.from(line);
  if (chars.length === width) return line;
  if (chars.length > width) return chars.slice(0, width).join("");
  return `${line}${" ".repeat(width - chars.length)}`;
};

const getRightEyeStartColumn = (lineWidth: number): number =>
  Math.ceil(lineWidth / 2);

const isRightMonocleRim = (
  content: string,
  columnIndex: number,
  rightEyeStartColumn: number,
): boolean => {
  return columnIndex >= rightEyeStartColumn && content === "█";
};

const isRightMonocleLensFill = (
  content: string,
  columnIndex: number,
  rightEyeStartColumn: number,
): boolean => {
  return columnIndex >= rightEyeStartColumn && content === "░";
};

const isLeftEyeFill = (
  content: string,
  columnIndex: number,
  rightEyeStartColumn: number,
): boolean => {
  return columnIndex < rightEyeStartColumn && content === "░";
};

const isBlinkEyelid = (
  content: string,
  lineIndex: number,
  columnIndex: number,
  blinkFrame: number,
  rightEyeStartColumn: number,
): boolean => {
  if (content !== "█" || blinkFrame === 0) return false;
  if (columnIndex >= rightEyeStartColumn) return false;
  if (blinkFrame === 1) return lineIndex <= 1;
  return lineIndex <= CLOSED_BLINK_SHADOW_END_LINE;
};

const compactSegments = (segments: FaceSegment[]): FaceSegment[] => {
  return segments.reduce<FaceSegment[]>((compacted, segment) => {
    const previous = compacted[compacted.length - 1];
    if (previous?.zone === segment.zone) {
      previous.content += segment.content;
      return compacted;
    }

    compacted.push({ ...segment });
    return compacted;
  }, []);
};

const buildEyeSegments = (
  line: string,
  lineIndex: number,
  blinkFrame: number,
  overlayAnchor: MonocleLensOverlayAnchor | undefined,
  hasMonocleLensOverlay: boolean,
): FaceSegment[] => {
  const normalizedLine = normalizeSidebarFaceLine(line);
  const lineWidth = getSidebarFaceLineWidth(normalizedLine);
  const rightEyeStartColumn = getRightEyeStartColumn(lineWidth);

  const segments = Array.from(normalizedLine).map(
    (content, columnIndex): FaceSegment => {
      const isMustacheTip =
        lineIndex === 4 &&
        (columnIndex < MOUSTACHE_TIP_WIDTH ||
          columnIndex >= lineWidth - MOUSTACHE_TIP_WIDTH);
      const isOverlayGlyph =
        hasMonocleLensOverlay &&
        lineIndex === overlayAnchor?.lineIndex &&
        columnIndex === overlayAnchor.columnIndex;

      if (isMustacheTip) return { content, zone: "mustache" };
      if (isOverlayGlyph) return { content, zone: "eyeOverlay" };
      if (
        isBlinkEyelid(
          content,
          lineIndex,
          columnIndex,
          blinkFrame,
          rightEyeStartColumn,
        )
      )
        return { content, zone: "eyeShadow" };
      if (isRightMonocleRim(content, columnIndex, rightEyeStartColumn))
        return { content, zone: "monocle" };
      if (isRightMonocleLensFill(content, columnIndex, rightEyeStartColumn))
        return { content, zone: "monocleLens" };
      if (isLeftEyeFill(content, columnIndex, rightEyeStartColumn))
        return { content, zone: "eyeFill" };
      return { content, zone: "eyes" };
    },
  );

  return compactSegments(segments);
};

export const buildMustachiFace = (input: {
  pupilIndex: number;
  blinkFrame: number;
  visualState: MustachiVisualState;
  monocleLensOverlay: MonocleLensOverlay | undefined;
  shouldShowExpression: boolean;
  tongueFrame: number;
  faceStyle?: "full" | "reworked";
}): FaceLine[] => {
  // Handle reworked face style with animation variants
  if (input.faceStyle === "reworked") {
    const lines: FaceLine[] = [];

    // Determine which eye frame to use based on blink and visual state
    let eyeFrames: FaceRow[];
    let useSquint = input.visualState !== "idle" && input.blinkFrame === 0;

    if (input.blinkFrame === 1) {
      // Half blink
      eyeFrames = faceReworkedBlink.half;
    } else if (input.blinkFrame === 2) {
      // Full blink
      eyeFrames = faceReworkedBlink.closed;
    } else if (useSquint) {
      // Busy state - use center with squint logic (could add squint variants later)
      eyeFrames = faceReworkedEyes.center;
    } else {
      // Normal - use pupil position
      // pupilIndex maps to: 0=center, 1=up, 2=down, 3=left, 4=right, 5=upLeft, 6=upRight, 7=downLeft, 8=downRight
      const pupilKeys = ["center", "up", "down", "left", "right", "upLeft", "upRight", "downLeft", "downRight"];
      const pupilKey = pupilKeys[input.pupilIndex] || "center";
      eyeFrames = faceReworkedEyes[pupilKey] || faceReworkedEyes.center;
    }

    // Add eye frames (first 5 lines: 4 eyes + 1 transition)
    eyeFrames.forEach((row) => {
      lines.push({
        content: row.map((s) => s.text).join(""),
        zone: "eyes" as SemanticZone,
        segments: row.map((section) => ({
          content: section.text,
          zone: section.fg === "white" ? "eyes" : "mustache",
          fg: section.fg,
          bg: section.bg,
        })),
      });
    });

    // Add mustache (lines 5-8)
    faceReworkedMustache.forEach((row) => {
      lines.push({
        content: row.map((s) => s.text).join(""),
        zone: "mustache" as SemanticZone,
        segments: row.map((section) => ({
          content: section.text,
          zone: section.fg === "white" ? "eyes" : "mustache",
          fg: section.fg,
          bg: section.bg,
        })),
      });
    });

    // Add tongue if expression is shown
    if (input.shouldShowExpression && input.tongueFrame > 0) {
      const tongueLines = tongueFrames[input.tongueFrame];
      tongueLines.forEach((line) => {
        lines.push({ content: line, zone: "tongue" });
      });
    }

    return lines;
  }

  const lines: FaceLine[] = [];

  const frames = pupilPositionFrames;

  let eyeFrame = frames[input.pupilIndex];
  if (input.visualState !== "idle") eyeFrame = eyeSquinted;
  let monocleLensOverlayAnchor: MonocleLensOverlayAnchor | undefined;

  if (input.blinkFrame === 1) {
    eyeFrame = eyeBlinkHalf;
  } else if (input.blinkFrame === 2) {
    eyeFrame = eyeBlinkClosed;
  } else {
    monocleLensOverlayAnchor = resolveMonocleLensOverlayAnchor(
      eyeFrame,
      input.pupilIndex,
    );
    eyeFrame = applyMonocleLensOverlay(eyeFrame, input.monocleLensOverlay, {
      anchor: monocleLensOverlayAnchor,
    });
  }

  const hasMonocleLensOverlay =
    !!input.monocleLensOverlay?.glyph && input.blinkFrame === 0;

  eyeFrame.forEach((line, idx) => {
    const normalizedLine = normalizeSidebarFaceLine(line);

    lines.push({
      content: normalizedLine,
      zone: "eyes",
      segments: buildEyeSegments(
        normalizedLine,
        idx,
        input.blinkFrame,
        monocleLensOverlayAnchor,
        hasMonocleLensOverlay,
      ),
    });
  });

  const mustacheSection = mustachiMustacheSection;
  mustacheSection.forEach((line) => {
    lines.push({ content: normalizeSidebarFaceLine(line), zone: "mustache" });
  });

  if (input.shouldShowExpression && input.tongueFrame > 0) {
    const tongueLines = tongueFrames[input.tongueFrame];
    tongueLines.forEach((line) => {
      lines.push({ content: line, zone: "tongue" });
    });
  }

  return lines;
};
