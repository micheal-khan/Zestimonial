import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// iOS home-screen icon: the same mark as app/icon.svg, drawn full-bleed (iOS rounds the corners itself).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#21322b' }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <g fill="#d9f75b">
            <circle cx="23" cy="32" r="8" />
            <path d="M30.6 34.2c-.4 8.1-6 13.8-13 15.8-.9.3-1.5-.8-.8-1.4 3-2.6 5.1-5.6 5.9-9.4z" />
            <circle cx="41" cy="32" r="8" />
            <path d="M48.6 34.2c-.4 8.1-6 13.8-13 15.8-.9.3-1.5-.8-.8-1.4 3-2.6 5.1-5.6 5.9-9.4z" />
            <path d="M51 7c.8 4.6 2.9 6.9 7.5 7.7-4.6.8-6.7 3.1-7.5 7.7-.8-4.6-2.9-6.9-7.5-7.7 4.6-.8 6.7-3.1 7.5-7.7z" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
