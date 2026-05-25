/**
 * Twenty design tokens — TypeScript mirror of `app/globals.css`.
 *
 * Use these only for:
 *  - inline styles where Tailwind classes are awkward (charts, dynamic colors)
 *  - JS-driven sizing where exact pixel values are needed
 *  - Power BI embed config that takes raw hex/rgb
 *
 * For component styling, prefer Tailwind classes that read CSS variables
 * (e.g. `bg-background`, `text-foreground`, `border-border`).
 *
 * Source of truth (visual language): https://github.com/twentyhq/twenty
 */

export const twentyColors = {
  light: {
    background: "#ffffff",
    backgroundSecondary: "#f6f6f6",
    backgroundTertiary: "#efefef",
    foreground: "#1f1f1f",
    foregroundSecondary: "#474747",
    foregroundTertiary: "#7a7a7a",
    borderLight: "#ececec",
    borderMedium: "#e0e0e0",
    borderStrong: "#cdcdcd",
    blue: "#1d7afc",
    green: "#36b37e",
    red: "#de350b",
    orange: "#ff8b00",
    purple: "#6554c0",
    pink: "#f64790",
    gray: "#7a7a7a",
  },
  dark: {
    background: "#161616",
    backgroundSecondary: "#1c1c1c",
    backgroundTertiary: "#242424",
    foreground: "#ededed",
    foregroundSecondary: "#b3b3b3",
    foregroundTertiary: "#818181",
    borderLight: "rgba(255,255,255,0.06)",
    borderMedium: "rgba(255,255,255,0.10)",
    borderStrong: "rgba(255,255,255,0.16)",
    blue: "#4e92ff",
    green: "#4ec99f",
    red: "#ef5236",
    orange: "#ffa033",
    purple: "#8472d6",
    pink: "#ff6ca6",
    gray: "#9ca0a5",
  },
} as const;

/**
 * States semánticos — alias por intención.
 * `destructive` ya está cubierto vía Tailwind (`bg-destructive`).
 * Si tocás un valor acá, mantené sincronizado `--success/--warning/--info` en globals.css.
 */
export const twentyStates = {
  light: {
    success: twentyColors.light.green,
    warning: twentyColors.light.orange,
    info: twentyColors.light.blue,
    danger: twentyColors.light.red,
  },
  dark: {
    success: twentyColors.dark.green,
    warning: twentyColors.dark.orange,
    info: twentyColors.dark.blue,
    danger: twentyColors.dark.red,
  },
} as const;

/**
 * Soft variants — para chips/tags. Tints sutiles sobre fondo.
 * Equivalentes a `--{color}-soft` en globals.css.
 * Para Tailwind usá `bg-blue-soft text-twenty-blue` directamente.
 */
export const twentySoft = {
  light: {
    blue:   "rgba(29,122,252,0.10)",
    green:  "rgba(54,179,126,0.10)",
    red:    "rgba(222,53,11,0.10)",
    orange: "rgba(255,139,0,0.12)",
    purple: "rgba(101,84,192,0.10)",
    pink:   "rgba(246,71,144,0.10)",
    gray:   "rgba(122,122,122,0.08)",
  },
  dark: {
    blue:   "rgba(78,146,255,0.18)",
    green:  "rgba(78,201,159,0.18)",
    red:    "rgba(239,82,54,0.18)",
    orange: "rgba(255,160,51,0.20)",
    purple: "rgba(132,114,214,0.18)",
    pink:   "rgba(255,108,166,0.18)",
    gray:   "rgba(156,160,165,0.14)",
  },
} as const;

/**
 * Layered surfaces (z-axis) — apilado Twenty-style.
 * base → raised (sidebar/cards) → overlay (hover) → floating (popovers).
 * Equivalentes a `--surface-*` en globals.css.
 */
export const twentySurfaces = {
  light: {
    base:     "#ffffff",
    raised:   "#fafafa", /* oklch(0.985 0 0) */
    overlay:  "#f5f5f5", /* oklch(0.97  0 0) */
    floating: "#ffffff",
  },
  dark: {
    base:     "#161616",
    raised:   "#1d1d1d", /* oklch(0.22 0 0) */
    overlay:  "#262626", /* oklch(0.26 0 0) */
    floating: "#212121", /* oklch(0.24 0 0) */
  },
} as const;

export const twentySpacing = {
  /** Base unit = 4px (Twenty's scale: `spacing(n) = n * 4`) */
  unit: 4,
  scale: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80] as const,
} as const;

export const twentyRadius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  pill: 9999,
} as const;

export const twentyTypography = {
  fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontMono: '"IBM Plex Mono", ui-monospace, monospace',
  size: {
    xs: 11,
    sm: 12,
    base: 13,
    lg: 14,
    xl: 16,
    "2xl": 20,
    "3xl": 24,
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.5,
  },
} as const;

export const twentyDensity = {
  /** Heights in pixels for common controls */
  heightXs: 24,
  heightSm: 32,
  heightMd: 40,
  /** Default vertical/horizontal padding for inputs/buttons */
  paddingX: 12,
  paddingY: 8,
  /** Default row height for tables */
  rowHeight: 32,
} as const;

/**
 * Elevation scale — Twenty/Linear style con tints muy sutiles.
 * En CSS están como `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` (Tailwind utilities).
 * Mantener sincronizado con `--elevation-*` en globals.css.
 */
export const twentyElevation = {
  light: {
    xs: "0 1px 2px 0 rgba(0,0,0,0.04)",
    sm: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
    md: "0 4px 8px -2px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)",
    lg: "0 12px 20px -4px rgba(0,0,0,0.10), 0 4px 8px -4px rgba(0,0,0,0.06)",
    xl: "0 24px 40px -8px rgba(0,0,0,0.14), 0 8px 16px -8px rgba(0,0,0,0.08)",
  },
  dark: {
    xs: "0 1px 2px 0 rgba(0,0,0,0.30)",
    sm: "0 1px 3px 0 rgba(0,0,0,0.40), 0 1px 2px -1px rgba(0,0,0,0.30)",
    md: "0 4px 8px -2px rgba(0,0,0,0.50), 0 2px 4px -2px rgba(0,0,0,0.30)",
    lg: "0 12px 20px -4px rgba(0,0,0,0.60), 0 4px 8px -4px rgba(0,0,0,0.40)",
    xl: "0 24px 40px -8px rgba(0,0,0,0.70), 0 8px 16px -8px rgba(0,0,0,0.50)",
  },
} as const;

/**
 * @deprecated Usá `twentyElevation.{mode}.{xs|sm|md|lg|xl}` o las utilities Tailwind `shadow-*`.
 * Se mantiene por compatibilidad con consumidores existentes.
 */
export const twentyShadows = {
  light: twentyElevation.light.sm,
  strong: twentyElevation.light.lg,
} as const;

export type TwentyMode = keyof typeof twentyColors;
export type TwentyElevationLevel = keyof typeof twentyElevation.light;
export type TwentyAccent = keyof typeof twentySoft.light;
