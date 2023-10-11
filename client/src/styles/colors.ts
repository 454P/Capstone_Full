export const COLORS = {
  white0: 'FFFFFF',
  white1: 'DCE0D2',

  gray0: '000000',
  gray1: '353738',
  gray2: '474A4B',

  brown1: '4B280A',
} as const;

export type ColorType = typeof COLORS;
export type Colors = keyof ColorType;
