export const socialFormats = {
  square: { width: 1080, height: 1080, label: 'Instagram post', hint: '1080 × 1080' },
  landscape: { width: 1200, height: 630, label: 'LinkedIn / X', hint: '1200 × 630' },
  story: { width: 1080, height: 1920, label: 'Story', hint: '1080 × 1920' },
} as const;
export type SocialFormat = keyof typeof socialFormats;

export const socialThemes = ['dark', 'light', 'brand'] as const;
export type SocialTheme = (typeof socialThemes)[number];
