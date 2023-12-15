export const TYPOGRAPHY = {
  Bold76: {
    fontFamily: 'Maplestory',
    fontSize: '76px',
    fontWeight: 'bold',
  },
  Bold36: {
    fontFamily: 'Maplestory',
    fontSize: '36px',
    fontWeight: 'bold',
  },
  Bold20: {
    fontFamily: 'Maplestory',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  Bold10: {
    fontFamily: 'Maplestory',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  Light10: {
    fontFamily: 'Maplestory',
    fontSize: '10px',
    fontWeight: 'light',
  },
} as const;

export type TypographyType = typeof TYPOGRAPHY;
export type TypographyVariant = keyof TypographyType;
