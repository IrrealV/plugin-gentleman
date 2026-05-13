// ASCII art frames and animation data

// Premium Mustachi ASCII art - structured by semantic zones
// Each eye state is a complete frame to avoid partial replacements

// Eye frames - neutral state with different pupil positions
// All lines are padded to 27 chars for perfect alignment with mustache

export const eyeNeutralCenter = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░   ░░██ ██░░░░░░░██  ",  // 27 chars - hollow pupil center
  "  ██░░   ░░██ ██░░░░░░░██  ",  // 27 chars - hollow pupil center
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralUp = [
  "     █████       █████     ",  // 27 chars
  "   ██░   ░██   ██░░░░░██   ",  // 27 chars - hollow pupil up
  "  ██░░   ░░██ ██░░░░░░░██  ",  // 27 chars - hollow pupil up
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralDown = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "  ██░░   ░░██ ██░░░░░░░██  ",  // 27 chars - hollow pupil down
  "██ ██░   ░██   ██░░░░░██ ██",  // 27 chars - hollow pupil down
]

export const eyeNeutralLeft = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██   ░░░░██ ██░░░░░░░██  ",  // 27 chars - hollow pupil left
  "  ██   ░░░░██ ██░░░░░░░██  ",  // 27 chars - hollow pupil left
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralRight = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░░░   ██ ██░░░░░░░██  ",  // 27 chars - hollow pupil right
  "  ██░░░░   ██ ██░░░░░░░██  ",  // 27 chars - hollow pupil right
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralUpLeft = [
  "    ██████       █████     ",  // 27 chars
  "   █   ░░██    ██░░░░░██   ",  // 27 chars - hollow pupil up-left
  "  ██   ░░░░██ ██░░░░░░░██  ",  // 27 chars - hollow pupil up-left
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralUpRight = [
  "     ██████      █████     ",  // 27 chars
  "   ██░░░   █   ██░░░░░██  ",  // 27 chars - hollow pupil up-right
  "  ██░░░░   ██ ██░░░░░░░██  ",  // 27 chars - hollow pupil up-right
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars
]

export const eyeNeutralDownLeft = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "  ██   ░░░░██ ██░░░░░░░██  ",  // 27 chars - hollow pupil down-left
  "██ █   ░░░██   ██░░░░░██ ██",  // 27 chars - hollow pupil down-left
]

export const eyeNeutralDownRight = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░░░░░░██ ██░░░░░░░██  ",  // 27 chars
  "  ██░░░░   ██ ██░░░░░░░██  ",  // 27 chars - hollow pupil down-right
  "██ ██░░░   █   ██░░░░░██ ██",  // 27 chars - hollow pupil down-right
]

// Squinted eyes version for busy/expressive state
export const eyeSquinted = [
  "     █████       █████     ",  // 27 chars
  "   ██░░░░░██   ██░░░░░██   ",  // 27 chars
  "  ██░░   ░░██ ██░░░░░░░██  ",  // 27 chars
  "   █████████   █████████   ",  // 27 chars
  "██                       ██",  // 27 chars
]

// Blink frames - half closed (upper eyelid descending from top)
export const eyeBlinkHalf = [
  "     █████       █████     ",  // 27 chars - monocle border top unchanged
  "   █████████   █████████  ",  // 27 chars - upper eyelid descends halfway
  "  ██░░   ░░██ ██░░░░░░░██  ",  // 27 chars - pupils still visible
  "  ██░░   ░░██ ██░░░░░░░██  ",  // 27 chars - pupils still visible
  "██ ██░░░░░██   ██░░░░░██ ██",  // 27 chars - bottom unchanged
]

// Blink frames - fully closed (upper eyelid fully descended)
export const eyeBlinkClosed = [
  "     █████       █████     ",  // 27 chars - monocle border top unchanged
  "   █████████   █████████  ",  // 27 chars - upper eyelid down
  "   █████████   █████████  ",  // 27 chars - eyes fully closed
  "   █████████   █████████   ",  // 27 chars - bottom transition
  "██                       ██",  // 27 chars - bottom unchanged
]

// Mustache section (all lines padded to 27 chars for alignment)
export const mustachiMustacheSection = [
  "████████████   ████████████",  // 27 chars - perfectly symmetric
  "█████████████ █████████████",  // 27 chars - perfectly symmetric
  " █████████████████████████ ",  // 27 chars - perfectly symmetric
  "   █████████   █████████   ",  // 27 chars - perfectly symmetric
]

// Tongue animation frames (progressive)
export const tongueFrames = [
  [],  // no tongue
  ["            ███", "             █"],  // tongue out
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

// Face Reworked - Integrated eyes + mustache with per-section ANSI colors
// Lines 0-3: eyes (white foreground, black background)
// Lines 4-8: mustache with mixed section colors

export type AnsiColor = "black" | "white" | "magenta" | "grey";

export interface FaceSection {
  text: string;
  fg: AnsiColor;
  bg: AnsiColor;
}

export type FaceRow = FaceSection[];

export const faceReworked: FaceRow[] = [
  // Lines 0-3: eyes (white on black)
  [
    { text: "   ▄█████▄       ", fg: "white", bg: "black" },
    { text: "▄", fg: "magenta", bg: "black" },
    { text: "▀▀▀▀▀", fg: "magenta", bg: "white" },
    { text: "▄   ", fg: "magenta", bg: "black" },
  ],
  [
    { text: " ▄███▀▀▀███▄   ", fg: "white", bg: "black" },
    { text: "▄", fg: "magenta", bg: "black" },
    { text: "▄███████▄", fg: "white", bg: "magenta" },
    { text: "▄ ", fg: "magenta", bg: "black" },
  ],
  [
    { text: " ███   █████   ", fg: "white", bg: "black" },
    { text: "█", fg: "magenta", bg: "black" },
    { text: "█████████", fg: "white", bg: "black" },
    { text: "█ ", fg: "magenta", bg: "black" },
  ],
  [
    { text: " ███▄   ▄███   ", fg: "white", bg: "black" },
    { text: "█", fg: "magenta", bg: "black" },
    { text: "█████████", fg: "white", bg: "black" },
    { text: "█ ", fg: "magenta", bg: "black" },
  ],
  // Line 4: transition with mixed sections
  [
    { text: "  ", fg: "black", bg: "black" },
    { text: "▀████", fg: "white", bg: "black" },
    { text: "▄███", fg: "magenta", bg: "white" },
    { text: "▄", fg: "magenta", bg: "black" },
    { text: "   ", fg: "black", bg: "black" },
    { text: "▄", fg: "magenta", bg: "black" },
    { text: "███▄", fg: "magenta", bg: "white" },
    { text: "██▀▀", fg: "white", bg: "magenta" },
    { text: "▀  ", fg: "magenta", bg: "black" },
  ],
  // Line 5: mixed sections with per-char colors
  [
    { text: "▄", fg: "magenta", bg: "black" },
    { text: "   ", fg: "black", bg: "black" },
    { text: "▄", fg: "magenta", bg: "black" },
    { text: "████████▄", fg: "magenta", bg: "black" },
    { text: "████████", fg: "magenta", bg: "black" },
    { text: "▄", fg: "magenta", bg: "black" },
    { text: "   ", fg: "black", bg: "black" },
    { text: "▄", fg: "magenta", bg: "black" },
  ],
  // Lines 6-8: mustache (magenta on black) with black spaces
  [
    { text: "▀", fg: "magenta", bg: "black" },
    { text: "█████████████████████████", fg: "magenta", bg: "black" },
    { text: "▀", fg: "magenta", bg: "black" },
  ],
  [
    { text: "  ", fg: "black", bg: "black" },
    { text: "▀█████████▀", fg: "magenta", bg: "black" },
    { text: " ", fg: "black", bg: "black" },
    { text: "▀█████████▀", fg: "magenta", bg: "black" },
    { text: "  ", fg: "black", bg: "black" },
  ],
  [
    { text: "    ", fg: "black", bg: "black" },
    { text: "▀▀███▀▀", fg: "magenta", bg: "black" },
    { text: "     ", fg: "black", bg: "black" },
    { text: "▀▀███▀▀", fg: "magenta", bg: "black" },
    { text: "    ", fg: "black", bg: "black" },
  ],
];

// Reworked Face - Eye variants for animation (lines 0-4)
// Each position has different pupil placement in lines 0-3, line 4 stays same

export const faceReworkedEyes: Record<string, FaceRow[]> = {
  // Center pupil (default)
  center: [
    [
      { text: "   ▄█████▄       ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "white" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄███▀▀▀███▄   ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "white", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███   █████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███▄   ▄███   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    // Line 4: transition with mixed sections
    [
      { text: "  ", fg: "black", bg: "black" },
      { text: "▀████", fg: "white", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "white" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "   ", fg: "black", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "white" },
      { text: "██▀▀", fg: "white", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],

  // Pupil up
  up: [
    [
      { text: "   ▄█▀▀▀█▄       ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "white" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄██   ████▄   ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "white", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███▄   ▄███   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███████████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: "  ▀████", fg: "white", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "white" },
      { text: "▄   ", fg: "magenta", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "white" },
      { text: "██▀▀", fg: "white", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],

  // Pupil down
  down: [
    [
      { text: "   ▄█████▄       ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "white" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄█████████▄   ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "white", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ████▀▀▀████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███   █████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: "  ▀█▄  ", fg: "white", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "   ", fg: "black", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "white" },
      { text: "██▀▀", fg: "white", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],

  // Pupil left
  left: [
    [
      { text: "   ▄█████▄       ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "white" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄█▀▀▀█████▄   ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "white", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " █   ███████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " █▄   ▄█████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: "  ", fg: "black", bg: "black" },
      { text: "▀████", fg: "white", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "white" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "   ", fg: "black", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "white" },
      { text: "██▀▀", fg: "white", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],

  // Pupil right
  right: [
    [
      { text: "   ▄█████▄       ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "white" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄█████▀▀▀█▄   ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "white", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " █████   ███   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " █████▄   ▄█   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: "  ", fg: "black", bg: "black" },
      { text: "▀████", fg: "white", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "white" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "   ", fg: "black", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "white" },
      { text: "██▀▀", fg: "white", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],

  upLeft: [
    [
      { text: "   ▄▀▀▀██▄       ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "white" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄█   █████▄   ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "white", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ██▄   ▄████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███████████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: "  ", fg: "black", bg: "black" },
      { text: "▀████", fg: "white", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "white" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "   ", fg: "black", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "white" },
      { text: "██▀▀", fg: "white", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],

  // Pupil up-right diagonal
  upRight: [
    [
      { text: "   ▄██▀▀▀▄       ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "white" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄███   ███▄   ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "white", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ████▄   ▄██   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███████████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: "  ", fg: "black", bg: "black" },
      { text: "▀████", fg: "white", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "white" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "   ", fg: "black", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "white" },
      { text: "██▀▀", fg: "white", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],

  // Pupil down-left diagonal
  downLeft: [
    [
      { text: "   ▄█████▄       ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "white" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄█████████▄   ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "white", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " █▀  ▄██████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " █   ▀▀█████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: "  ▀▄▄▄█", fg: "white", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "white" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "   ", fg: "black", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "white" },
      { text: "██▀▀", fg: "white", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],

  // Pupil down-right diagonal
  downRight: [
    [
      { text: "   ▄█████▄       ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "white" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄███▀▀▀███▄   ", fg: "white", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "white", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███   █████   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███▄   ▄███   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    // Line 4: transition with mixed sections
    [
      { text: "  ", fg: "black", bg: "black" },
      { text: "▀████", fg: "white", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "white" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "   ", fg: "black", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "white" },
      { text: "██▀▀", fg: "white", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],
};

// Blink frames for reworked face
export const faceReworkedBlink: Record<string, FaceRow[]> = {
  // Half blink - eyelid halfway
  half: [
    [
      { text: "   ▄█████▄       ", fg: "grey", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "magenta" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄█████████▄   ", fg: "grey", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "magenta", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ", fg: "black", bg: "black" },
      { text: "▀▀▀", fg: "grey", bg: "white" },
      { text: "▀▀▀", fg: "grey", bg: "black" },
      { text: "▀▀▀▀▀", fg: "grey", bg: "white" },
      { text: "   ", fg: "black", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀▀▀▀▀", fg: "magenta", bg: "white" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███▄   ▄███   ", fg: "white", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "white", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    // Line 4: transition with mixed sections
    [
      { text: "  ", fg: "black", bg: "black" },
      { text: "▀████", fg: "white", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "white" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "   ", fg: "black", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "white" },
      { text: "██▀▀", fg: "white", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],

  // Full blink - eyes closed
  closed: [
    [
      { text: "   ▄█████▄       ", fg: "grey", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▀▀▀▀▀", fg: "magenta", bg: "magenta" },
      { text: "▄   ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ▄█████████▄   ", fg: "grey", bg: "black" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "▄███████▄", fg: "magenta", bg: "magenta" },
      { text: "▄ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███████████   ", fg: "grey", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "magenta", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    [
      { text: " ███████████   ", fg: "grey", bg: "black" },
      { text: "█", fg: "magenta", bg: "black" },
      { text: "█████████", fg: "magenta", bg: "black" },
      { text: "█ ", fg: "magenta", bg: "black" },
    ],
    // Line 4: transition with mixed sections
    [
      { text: "  ▀████", fg: "grey", bg: "black" },
      { text: "▄███", fg: "magenta", bg: "grey" },
      { text: "▄", fg: "magenta", bg: "black" },
      { text: "   ▄", fg: "magenta", bg: "black" },
      { text: "███▄", fg: "magenta", bg: "magenta" },
      { text: "██▀▀", fg: "magenta", bg: "magenta" },
      { text: "▀  ", fg: "magenta", bg: "black" },
    ],
  ],
};

// Mustache section (lines 5-8) - same for all animations
export const faceReworkedMustache: FaceRow[] = [
  // Line 5
  [
    { text: "▄", fg: "magenta", bg: "black" },
    { text: "   ", fg: "black", bg: "black" },
    { text: "▄", fg: "magenta", bg: "black" },
    { text: "████████▄", fg: "magenta", bg: "black" },
    { text: "████████", fg: "magenta", bg: "black" },
    { text: "▄", fg: "magenta", bg: "black" },
    { text: "   ", fg: "black", bg: "black" },
    { text: "▄", fg: "magenta", bg: "black" },
  ],
  // Line 6
  [
    { text: "▀", fg: "magenta", bg: "black" },
    { text: "█████████████████████████", fg: "magenta", bg: "black" },
    { text: "▀", fg: "magenta", bg: "black" },
  ],
  // Line 7
  [
    { text: "  ", fg: "black", bg: "black" },
    { text: "▀█████████▀", fg: "magenta", bg: "black" },
    { text: " ", fg: "black", bg: "black" },
    { text: "▀█████████▀", fg: "magenta", bg: "black" },
    { text: "  ", fg: "black", bg: "black" },
  ],
  // Line 8
  [
    { text: "    ", fg: "black", bg: "black" },
    { text: "▀▀███▀▀", fg: "magenta", bg: "black" },
    { text: "     ", fg: "black", bg: "black" },
    { text: "▀▀███▀▀", fg: "magenta", bg: "black" },
    { text: "    ", fg: "black", bg: "black" },
  ],
];

export const mustachiVintacheOnly = [
  "",
  "                    ░░░░░░      ░░░░░░",
  "                  ░░░░░░░░░░  ░░░░░░░░░░",
  "                ░░░░░░░░░░░░░░░░░░░░░░░░░░",
  "              ░░░░░░░░░░▒▒▒▒░░▒▒▒▒░░░░░░░░░░",
  "  ░░░░      ░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░        ░░░░",
  "▒▒░░      ░░░░░░▒▒▒▒▒▒▒▒▒▒██▒▒██▒▒▒▒▒▒▒▒▒▒░░░░░░        ▒▒░░",
  "▒▒░░    ░░░░░░░░▒▒▒▒▒▒▒▒▒▒████▒▒████▒▒▒▒▒▒▒▒▒▒░░░░░░░░  ▒▒░░▒",
  "▒▒▒▒░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒██████▒▒██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░▒▒▒",
  "██▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒██████▓▓██▒▒██████▒▒▓▓██▒▒▒▒▒▒▒▒▒▒▒▒▒▒█",
  "████▒▒▒▒▒▒████▒▒▒▒██████████  ██████████▒▒▒▒████▒▒▒▒▒▒▒▒██",
  "  ████████████████████████      ████████████████████████",
  "    ██████████████████              ██████████████████",
  "        ██████████                      ██████████",
  "",
];

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
