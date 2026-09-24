import { ImageResponse } from 'next/og';
import { socialFormats, type SocialFormat, type SocialTheme } from '@/lib/social';

type Input = {
  testimonial: { author_name: string; author_role: string; rating: number };
  quote: string;
  workspace: { name: string; brand_color: string };
  format: SocialFormat;
  theme: SocialTheme;
};

/** Draws a testimonial as a PNG sized for the chosen social network. */
export function renderSocialImage({ testimonial: t, quote, workspace, format, theme }: Input) {
  const { width, height } = socialFormats[format];
  const brand = workspace.brand_color;
  const colors = theme === 'light' ? { bg: '#f5f7f3', card: '#ffffff', text: '#21322b', muted: '#748079', accent: brand }
    : theme === 'brand' ? { bg: brand, card: brand, text: readableOn(brand), muted: readableOn(brand) === '#ffffff' ? 'rgba(255,255,255,.7)' : 'rgba(33,50,43,.7)', accent: readableOn(brand) }
    : { bg: '#21322b', card: '#21322b', text: '#ffffff', muted: 'rgba(255,255,255,.6)', accent: brand };

  // Decorations scale with the short side; the quote is sized to fill the space that remains.
  const unit = Math.min(width, height) / 24;
  const padding = Math.round(unit * 2.2);
  const outer = theme === 'light' ? Math.round(unit) : 0;
  const textWidth = width - 2 * (padding + outer);
  const textHeight = height - 2 * (padding + outer) - unit * 5.2 - unit * 3.2;
  const fitted = Math.sqrt((textHeight * textWidth) / (Math.max(quote.length, 20) * 0.52 * 1.35 * 1.2));
  const fontSize = Math.round(Math.min(unit * 1.9, Math.max(unit * 0.6, fitted)));
  const starOn = theme === 'brand' ? colors.text : '#f2b744';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: colors.bg, padding: outer }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: colors.card, color: colors.text, padding, borderRadius: outer ? unit * 1.2 : 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: unit }}>
            <div style={{ display: 'flex', gap: unit * 0.3 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <svg key={n} width={unit * 1.1} height={unit * 1.1} viewBox="0 0 24 24" fill={starOn} fillOpacity={n <= t.rating ? 1 : 0.25}>
                  <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7.3L12 17.8 5.8 21.5l1.6-7.3L2 9.5l7.1-.6z" />
                </svg>
              ))}
            </div>
            <div style={{ display: 'flex', marginTop: unit * 1.4, fontSize, lineHeight: 1.35, fontWeight: 600, letterSpacing: '-0.02em' }}>“{quote}”</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: unit }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: unit * 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: unit * 2.6, height: unit * 2.6, borderRadius: 999, background: colors.accent, color: theme === 'brand' ? brand : '#21322b', fontSize: unit * 0.9, fontWeight: 700 }}>{initials(t.author_name)}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: unit * 0.95, fontWeight: 700 }}>{t.author_name}</div>
                <div style={{ display: 'flex', fontSize: unit * 0.75, color: colors.muted }}>{t.author_role}</div>
              </div>
            </div>
            <div style={{ display: 'flex', fontSize: unit * 0.7, color: colors.muted, fontWeight: 600 }}>{workspace.name}</div>
          </div>
        </div>
      </div>
    ),
    { width, height },
  );
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

/** Picks dark or white text for a background color using its relative luminance. */
function readableOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#21322b' : '#ffffff';
}
