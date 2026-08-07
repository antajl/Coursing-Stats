export const TYPOGRAPHY = {
  fontSize: {
    xxs: '0.625rem', // 10px
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.563rem', // 25px
    '3xl': '1.953rem', // 31.25px
    '4xl': '2.441rem', // 39.06px
    '5xl': '3.052rem', // 48.83px
  },
  lineHeight: {
    tight: '1.1',
    snug: '1.2',
    normal: '1.3',
    relaxed: '1.4',
    loose: '1.5',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export type TypographySize = keyof typeof TYPOGRAPHY.fontSize;
export type LineHeight = keyof typeof TYPOGRAPHY.lineHeight;
export type LetterSpacing = keyof typeof TYPOGRAPHY.letterSpacing;
