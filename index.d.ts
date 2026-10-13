export type RGB = [number, number, number];
export type WCAGLevel = "AAA" | "AA" | "FAIL";
export type ReadabilityStatus = "very readable" | "readable" | "not readable";

export interface MakeReadableOptions {
  large?: boolean;
  mode?: 0 | 1 | 2; // 0 = Strict, 1 = Default (Recursive), 2 = Relaxed
  veryReadable?: boolean; // Aim for AAA
  premium?: boolean;
}

export interface MakeReadableResult {
  color: string;
  tunedRgb: RGB;
  success: boolean;
  originalContrast: number;
  finalContrast: number;
  deltaE: number;
  wcagLevel: WCAGLevel;
  isReadable: boolean;
}

export class Color {
  raw: string | RGB;
  rgb: RGB | null;
  isValid: boolean;
  error: string | null;
  readonly hex: string | null;
  readonly luminance: number | null;
  readonly oklch: [number, number, number] | null;
  readonly lab: [number, number, number] | null;
  constructor(input: string | RGB);
}

export class ColorPair {
  text: Color;
  bg: Color;
  large: boolean;
  readonly isValid: boolean;
  readonly contrast: number | null;
  readonly wcagLevel: WCAGLevel;
  readonly isReadable: ReadabilityStatus;
  constructor(text: string | RGB, bg: string | RGB, large?: boolean);
  makeReadable(options?: MakeReadableOptions): [string, boolean];
  make_readable(options?: MakeReadableOptions): [string, boolean];
}

export function makeReadable(
  textColor: string | RGB,
  bgColor: string | RGB,
  options?: MakeReadableOptions
): MakeReadableResult;

export const make_readable: typeof makeReadable;

export function getContrast(textColor: string | RGB, bgColor: string | RGB): number;

export function getWcagLevel(
  textRgb: RGB | string,
  bgRgb: RGB | string,
  large?: boolean
): WCAGLevel;

export function deltaE(color1: string | RGB, color2: string | RGB): number;

export function calculateContrastRatio(textRgb: RGB, bgRgb: RGB): number;
export function calculateRelativeLuminance(rgb: RGB): number;
export function calculateDeltaE2000(rgb1: RGB, rgb2: RGB): number;
export function parseColor(colorInput: string | RGB): RGB;
export function hexToRgb(hex: string): RGB;
export function rgbToHex(rgb: RGB): string;
export function rgbToOklch(rgb: RGB): [number, number, number];
export function oklchToRgb(oklch: [number, number, number]): RGB;
