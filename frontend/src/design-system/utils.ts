/**
 * MotivTrack Design System - Utility Functions
 * 
 * Helper functions for working with design tokens
 */

import { theme } from './theme';

/**
 * Get a CSS variable value
 */
export function getCSSVar(varName: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/**
 * Set a CSS variable value
 */
export function setCSSVar(varName: string, value: string): void {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(varName, value);
}

/**
 * Combine class names, filtering out falsy values
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get spacing value by key
 */
export function spacing(key: keyof typeof theme.spacing): string {
  return theme.spacing[key];
}

/**
 * Get radius value by key
 */
export function radius(key: keyof typeof theme.radius): string {
  return theme.radius[key];
}

/**
 * Get shadow value by key
 */
export function shadow(key: keyof typeof theme.shadows): string {
  return theme.shadows[key];
}
