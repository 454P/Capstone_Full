import type { CSSProperties } from 'react';

export interface SpaceStyle {
  margin?: CSSProperties['margin'];
  padding?: CSSProperties['padding'];
}

export interface BoxStyle extends SpaceStyle {
  display?: CSSProperties['display'];
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  backgroundColor?: CSSProperties['backgroundColor'];
}

export type SpaceStyleProperties = keyof SpaceStyle;
export type BoxStyleProperties = keyof BoxStyle;
