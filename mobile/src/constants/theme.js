// ─── Colour Palette ──────────────────────────────────────────────────────────
export const COLORS = {
  // Chassis
  black:       '#0A0A0A',
  blackDeep:   '#050505',
  chassis:     '#111214',
  metal:       '#2A2C30',
  metalLight:  '#3E4045',
  metalBright: '#5A5D65',

  // Industrial accents
  orange:      '#FF6600',
  orangeDim:   '#CC4400',

  // Stable / safe state
  cyan:        '#00F5FF',
  cyanDim:     '#00B0BB',
  cyanGlow:    '#00F5FF44',

  // Anomaly / hazard state
  red:         '#FF1F1F',
  redBright:   '#FF4444',
  redDim:      '#991111',
  redGlow:     '#FF1F1F55',
  crimson:     '#2A0505',   // background tint during anomaly

  // Text
  textPrimary:   '#E8EAF0',
  textSecondary: '#8A8D96',
  textCyan:      '#00F5FF',
  textRed:       '#FF4444',

  // Panel
  panelBg:     '#161820',
  panelBorder: '#2A2C35',
};

// ─── Typography ──────────────────────────────────────────────────────────────
export const FONTS = {
  mono:   'monospace',
  size: {
    xs:   10,
    sm:   12,
    md:   14,
    lg:   18,
    xl:   24,
    xxl:  32,
    hud:  42,
  },
};

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

// ─── Shadows / Glows ─────────────────────────────────────────────────────────
export const glowCyan = {
  shadowColor:   '#00F5FF',
  shadowOffset:  { width: 0, height: 0 },
  shadowOpacity: 0.85,
  shadowRadius:  12,
  elevation:     8,
};

export const glowRed = {
  shadowColor:   '#FF1F1F',
  shadowOffset:  { width: 0, height: 0 },
  shadowOpacity: 0.9,
  shadowRadius:  16,
  elevation:     10,
};

// ─── Bezel Dimensions ────────────────────────────────────────────────────────
export const BEZEL = {
  borderWidth: 4,
  cornerRadius: 28,
  rivetSize:   10,
};

