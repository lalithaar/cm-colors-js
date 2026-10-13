export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];
export type OKLCH = [number, number, number];
export type XYZ = [number, number, number];
export type LAB = [number, number, number];
export type WCAGLevel = "AAA" | "AA" | "AA Large" | "FAIL";
export type ReadabilityStatus = "Very Readable" | "Readable" | "Not Readable" | "very readable" | "readable" | "not readable" | "invalid color";
export type ColorInput = string | RGB | RGBA | number[];

export interface MakeReadableOptions {
  mode?: 0 | 1 | 2; // 0 = Strict, 1 = Default (Recursive), 2 = Relaxed
  veryReadable?: boolean; // Aim for AAA
  very_readable?: boolean;
  show?: boolean; // Console preview
  saveReport?: boolean;
  save_report?: boolean;
  large?: boolean;
}

export interface BulkPairInputObject {
  fg?: ColorInput;
  text?: ColorInput;
  text_color?: ColorInput;
  bg?: ColorInput;
  bg_color?: ColorInput;
  large?: boolean;
  large_text?: boolean;
}

export type BulkPairInput = [ColorInput, ColorInput] | [ColorInput, ColorInput, boolean] | BulkPairInputObject;

export interface BulkResultItem {
  0: ColorInput;
  1: ReadabilityStatus;
}

export class Color {
  original: ColorInput;
  background_context: Color | null;
  backgroundContext: Color | null;
  readonly is_valid: boolean;
  readonly isValid: boolean;
  readonly rgb: RGB | null;
  readonly error: string | null;
  readonly format: string;
  constructor(colorInput: ColorInput, backgroundContext?: Color | null);
  to_hex(): string | null;
  toHex(): string | null;
  toString(): string;
}

export class ColorPair {
  text: Color;
  bg: Color;
  large: boolean;
  readonly is_valid: boolean;
  readonly isValid: boolean;
  readonly errors: string[];
  readonly is_readable: ReadabilityStatus;
  readonly isReadable: ReadabilityStatus;
  constructor(textColor: ColorInput, bgColor: ColorInput, largeText?: boolean);
  make_readable(
    mode?: number | MakeReadableOptions,
    very_readable?: boolean,
    show?: boolean,
    save_report?: boolean
  ): [ColorInput | null, boolean];
  makeReadable(
    mode?: number | MakeReadableOptions,
    veryReadable?: boolean,
    show?: boolean,
    saveReport?: boolean
  ): [ColorInput | null, boolean];
}

export function makeReadableBulk(
  pairs: BulkPairInput[],
  mode?: number | MakeReadableOptions,
  veryReadable?: boolean,
  saveReport?: boolean
): Array<[ColorInput, string]>;

export const make_readable_bulk: typeof makeReadableBulk;

export function makeReadable(
  textColor: ColorInput,
  bgColor: ColorInput,
  options?: MakeReadableOptions
): {
  color: ColorInput | null;
  fixedColor: ColorInput | null;
  tunedColor: ColorInput | null;
  success: boolean;
  originalContrast: number;
  finalContrast: number;
  deltaE: number;
  wcagLevel: WCAGLevel;
  isReadable: ReadabilityStatus;
  pair: ColorPair;
};

export const make_readable: typeof makeReadable;

export const version: string;
export const __version__: string;

export const CSS_NAMED_COLORS: Record<string, string>;

// Parsers & Formats
export function parseColorToRgb(color: ColorInput, background?: ColorInput | null): RGB;
export const parse_color_to_rgb: typeof parseColorToRgb;
export function detectColorFormat(color: ColorInput): string;
export const detect_color_format: typeof detectColorFormat;
export function formatColor(rgb: RGB, formatType: string): ColorInput;
export const format_color: typeof formatColor;

// Contrast calculations
export function calculateContrastRatio(textRgb: ColorInput, bgRgb: ColorInput): number;
export const calculate_contrast_ratio: typeof calculateContrastRatio;
export const getContrast: typeof calculateContrastRatio;
export const getContrastRatio: typeof calculateContrastRatio;

export function calculateRelativeLuminance(rgb: ColorInput): number;
export const calculate_relative_luminance: typeof calculateRelativeLuminance;

export function getContrastLevel(contrastRatio: number, large?: boolean): WCAGLevel;
export const get_contrast_level: typeof getContrastLevel;

export function getWcagLevel(textRgb: ColorInput, bgRgb: ColorInput, large?: boolean): WCAGLevel;
export const get_wcag_level: typeof getWcagLevel;

// CIEDE2000 difference
export function calculateDeltaE2000(rgb1: RGB, rgb2: RGB): number;
export const calculate_delta_e_2000: typeof calculateDeltaE2000;
export const deltaE: typeof calculateDeltaE2000;

// Conversions
export function srgbToLinear(channel: number): number;
export const srgb_to_linear: typeof srgbToLinear;
export function linearToSrgb(channel: number): number;
export const linear_to_srgb: typeof linearToSrgb;
export function rgbToLinear(channel: number): number;
export const rgb_to_linear: typeof rgbToLinear;

export function hexToRgb(hexStr: string, string?: boolean): RGB | string;
export const hex_to_rgb: typeof hexToRgb;
export function rgbToHex(rgb: RGB | string): string;
export const rgb_to_hex: typeof rgbToHex;

export function rgbToOklch(rgb: RGB): OKLCH;
export const rgb_to_oklch: typeof rgbToOklch;
export function oklchToRgb(oklch: OKLCH): RGB;
export const oklch_to_rgb: typeof oklchToRgb;

export function rgbToOklchSafe(rgb: RGB): OKLCH;
export const rgb_to_oklch_safe: typeof rgbToOklchSafe;
export function oklchToRgbSafe(oklch: OKLCH): RGB;
export const oklch_to_rgb_safe: typeof oklchToRgbSafe;

export function isValidRgb(rgb: any): rgb is RGB;
export const is_valid_rgb: typeof isValidRgb;
export function isValidOklch(oklch: any): oklch is OKLCH;
export const is_valid_oklch: typeof isValidOklch;

export function calculateHueAngle(a: number, b: number): number;
export const calculate_hue_angle: typeof calculateHueAngle;

export function rgbToXyz(rgb: RGB): XYZ;
export const rgb_to_xyz: typeof rgbToXyz;
export function xyzToLab(xyz: XYZ): LAB;
export const xyz_to_lab: typeof xyzToLab;
export function rgbToLab(rgb: RGB): LAB;
export const rgb_to_lab: typeof rgbToLab;

export function rgbaToRgb(rgba: RGBA, background?: RGB): RGB;
export const rgba_to_rgb: typeof rgbaToRgb;
export function rgbintToString(rgb: RGB): string;
export const rgbint_to_string: typeof rgbintToString;

export function rgbToHsl(rgbColor: ColorInput): string;
export const rgb_to_hsl: typeof rgbToHsl;
export function hslToRgb(hslColor: ColorInput): RGB;
export const hsl_to_rgb: typeof hslToRgb;
export function hslaToRgb(hslaColor: ColorInput, background?: RGB | null): RGB;
export const hsla_to_rgb: typeof hslaToRgb;
export function rgbToHsla(rgbTuple: RGB, alpha?: number): string;
export const rgb_to_hsla: typeof rgbToHsla;

// Optimization
export function binarySearchLightness(
  textRgb: RGB,
  bgRgb: RGB,
  deltaEThreshold?: number,
  targetContrast?: number,
  largeText?: boolean
): RGB | null;
export const binary_search_lightness: typeof binarySearchLightness;

export function gradientDescentOklch(
  textRgb: RGB,
  bgRgb: RGB,
  deltaEThreshold?: number,
  targetContrast?: number,
  largeText?: boolean,
  maxIter?: number
): RGB | null;
export const gradient_descent_oklch: typeof gradientDescentOklch;

export function generateAccessibleColor(
  textRgb: RGB,
  bgRgb: RGB,
  large?: boolean,
  targetContrast?: number | null,
  minContrast?: number | null,
  deltaESequence?: number[] | null
): RGB;
export const generate_accessible_color: typeof generateAccessibleColor;

export function checkAndFixContrast(
  text: ColorInput,
  bg: ColorInput,
  large?: boolean | MakeReadableOptions,
  mode?: number,
  premium?: boolean
): [string, boolean];
export const check_and_fix_contrast: typeof checkAndFixContrast;

export function _strategy_strict(
  textRgb: RGB,
  bgRgb: RGB,
  large: boolean,
  targetContrast: number,
  minContrast: number
): [RGB, boolean];

export function _strategy_recursive(
  textRgb: RGB,
  bgRgb: RGB,
  large: boolean,
  targetContrast: number,
  minContrast: number
): [RGB, boolean];

export function _strategy_relaxed(
  textRgb: RGB,
  bgRgb: RGB,
  large: boolean,
  targetContrast: number,
  minContrast: number
): [RGB, boolean];

// Visualizers
export function toConsole(
  fg: ColorInput,
  bg: ColorInput,
  tunedFg: ColorInput,
  originalLevel?: WCAGLevel | null,
  newLevel?: WCAGLevel | null
): void;
export const to_console: typeof toConsole;

export function toHtml(
  fg: ColorInput,
  bg: ColorInput,
  tunedFg: ColorInput,
  originalLevel?: string,
  newLevel?: string,
  selector?: string,
  filePath?: string
): string;
export const to_html: typeof toHtml;

export function toHtmlBulk(
  pairs: Array<{
    fg: ColorInput;
    bg: ColorInput;
    tuned_fg?: ColorInput;
    tunedFg?: ColorInput;
    original_level?: string;
    originalLevel?: string;
    new_level?: string;
    newLevel?: string;
    selector?: string;
    file?: string;
    filePath?: string;
  }>,
  outputPath?: string
): string;
export const to_html_bulk: typeof toHtmlBulk;

export function _get_level_badge(level?: string | null): [string, string];
