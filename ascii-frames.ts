// ASCII art frames and animation data

// Premium Mustachi ASCII art - structured by semantic zones
// Each eye state is a complete frame to avoid partial replacements

// Eye frames - neutral state with different pupil positions
// All lines are padded to 27 chars for perfect alignment with mustache

export const eyeNeutralCenter = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░███░░██ ██░░░░░░░██  ",  // 27 chars
  "  ██░░███░░██ ██░░░░░░░██  ",  // 27 chars
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralUp = [
  "     █████       █████     ",  // 27 chars
  "   ██████░██   ██░░░░░██   ",  // 27 chars - pupils up
  "  ██░█████░██ ██░░░░░░░██  ",  // 27 chars - pupils up
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralDown = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "  ██░░███░░██ ██░░░░░░░██  ",  // 27 chars - pupils down
  "██ ██████░░██   ██░░░░░██ ██",  // 27 chars - pupils down
]

export const eyeNeutralLeft = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██████░░░██ ██░░░░░░░██  ",  // 27 chars
  "  ██████░░░██ ██░░░░░░░██  ",  // 27 chars
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralRight = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░░██████ ██░░░░░░░██  ",  // 27 chars
  "  ██░░░██████ ██░░░░░░░██  ",  // 27 chars
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralUpLeft = [
  "     █████       █████     ",  // 27 chars
  "   ███████░██  ██░░░░░██   ",  // 27 chars - up-left diagonal
  "  ████████░██ ██░░░░░░░██  ",  // 27 chars
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralUpRight = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░██████   ",  // 27 chars - up-right diagonal
  "  ██░░░░░░░██ ██░████████  ",  // 27 chars
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralDownLeft = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "  ███████░░██ ██░░░░░░░██  ",  // 27 chars - down-left diagonal
  "██ ████████░█   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralDownRight = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "  ██░░░███████ ██░░░░░░░██  ",  // 27 chars - down-right diagonal
  "██ ██░░░░░██   █████████ ██",  // 27 chars
]

// Squinted eyes version for busy/expressive state
export const eyeSquinted = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░███░░██ ██░░░░░░░██  ",  // 27 chars
  "   █████████   █████████   ",  // 27 chars
  "██  █████         █████  ██",  // 27 chars
]

// Blink frames - half closed (upper eyelid descending from top)
export const eyeBlinkHalf = [
  "     █████       █████     ",  // 27 chars - monocle border top unchanged
  "   ██████████  ██████████  ",  // 27 chars - upper eyelid descends halfway
  "  ██░░███░░██ ██░░░░░░░██  ",  // 27 chars - pupils still visible
  "  ██░░███░░██ ██░░░░░░░██  ",  // 27 chars - pupils still visible
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars - bottom unchanged
]

// Blink frames - fully closed (upper eyelid fully descended)
export const eyeBlinkClosed = [
  "     █████       █████     ",  // 27 chars - monocle border top unchanged
  "   ██████████  ██████████  ",  // 27 chars - upper eyelid down
  "   ██████████  ██████████  ",  // 27 chars - eyes fully closed
  "   █████████   █████████   ",  // 27 chars - bottom transition
  "██  █████         █████  ██",  // 27 chars - bottom unchanged
]

// Mustache section (all lines padded to 27 chars for alignment)
export const mustachiMustacheSection = [
  "██████████         █████████",  // 27 chars
  "████████████     ███████████",  // 27 chars
  " ██████████████████████████ ",  // 27 chars
  "  ▓██████████   █████████▓",  // 27 chars
  "    ▓██████       ██████▓  ",  // 27 chars
]

// Tongue animation frames (progressive) - compact design
export const tongueFrames = [
  [],  // no tongue
  ["             ███", "              █"],  // tongue out
]

// Mustache-only ASCII art for home logo (original massive solid block design)
export const mustachiMustacheOnly = [
  "",
  "               ████████                 ████████",
  "             ████████████             ████████████",
  "    ██      ████████████████       ████████████████      ██",
  "   ████    ████████████████████ ████████████████████    ████",
  "  ██████  ███████████████████████████████████████████  ██████",
  "  ███████████████████████████████████████████████████████████",
  "  ███████████████████████████████████████████████████████████",
  "  ███████████████████████████████████████████████████████████",
  "   █████████████████████████████████████████████████████████",
  "    ███████████████████████████████████████████████████████",
  "      ▓▓█████████████████████     █████████████████████▓▓",
  "        ▓▓▓███████████████           ███████████████▓▓▓",
  "           ▓▓▓█████████                 █████████▓▓▓",
  "              ▓▓▓▓▓▓▓                     ▓▓▓▓▓▓▓",
  "",
]

// Pupil position mapping for look-around animation
// All possible eye directions for random transitions
export const pupilPositionFrames = [
  eyeNeutralCenter,     // center (most common)
  eyeNeutralUp,         // up
  eyeNeutralDown,       // down
  eyeNeutralLeft,       // left
  eyeNeutralRight,      // right
  eyeNeutralUpLeft,     // up-left diagonal
  eyeNeutralUpRight,    // up-right diagonal
  eyeNeutralDownLeft,   // down-left diagonal
  eyeNeutralDownRight,  // down-right diagonal
]

// Semantic zone colors for better visual hierarchy
export const zoneColors = {
  monocle: "#B8B8B8",    // Subtle steel/silver for monocle border (distinct from eye color)
  eyes: "#808080",        // Mid gray for eyes
  mustache: "#606060",    // Darker gray for mustache
  tongue: "#FF4466",      // Pink/Red for tongue
}
