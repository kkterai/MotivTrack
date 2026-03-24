/**
 * MotivTrack Design System - Theme Object
 * 
 * This is the single source of truth for design tokens in TypeScript.
 * Use this when you need programmatic access to design values.
 * For CSS, prefer using CSS variables from tokens.css.
 */

export const theme = {
  colors: {
    brand: {
      primary: "#16324F",
      secondary: "#2A6F97",
    },
    semantic: {
      success: "#1FA37A",
      warm: "#E9C46A",
      reward: "#F4A261",
      destructive: "#E76F51",
      info: "#2A6F97",
      warning: "#E9C46A",
      active: "#1FA37A",
    },
    surface: {
      page: "#FCFBF8",
      panel: "#F6F3EE",
      card: "#FFFFFF",
      muted: "#E7EAEC",
    },
    text: {
      primary: "#1E2A36",
      secondary: "#4F5D6B",
      inverse: "#FFFFFF",
    },
    border: {
      default: "#D7DDE2",
      muted: "#E7EAEC",
    },
  },
  fonts: {
    sans: `"Manrope", system-ui, sans-serif`,
    serif: `"Literata", Georgia, serif`,
    sansAlt: `"Inter", system-ui, sans-serif`,
    serifAlt: `"Merriweather", Georgia, serif`,
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    xxl: "24px",
    pill: "999px",
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
  },
  shadows: {
    sm: "0 1px 3px rgba(22, 50, 79, 0.06)",
    md: "0 6px 18px rgba(22, 50, 79, 0.08)",
    lg: "0 10px 28px rgba(22, 50, 79, 0.10)",
  },
} as const;

/**
 * Type definitions for design tokens
 */
export type Theme = typeof theme;
export type ColorBrand = keyof typeof theme.colors.brand;
export type ColorSemantic = keyof typeof theme.colors.semantic;
export type ColorSurface = keyof typeof theme.colors.surface;
export type ColorText = keyof typeof theme.colors.text;
export type ColorBorder = keyof typeof theme.colors.border;
export type FontFamily = keyof typeof theme.fonts;
export type Radius = keyof typeof theme.radius;
export type Spacing = keyof typeof theme.spacing;
export type Shadow = keyof typeof theme.shadows;
