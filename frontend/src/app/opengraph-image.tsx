// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#0A0A0F',
          color: 'white',
          padding: 60,
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: -1 }}>
          OverCreate
        </div>
        <div style={{ marginTop: 12, fontSize: 34, opacity: 0.9 }}>
          Design that ships, code that scales
        </div>
      </div>
    ),
    size
  );
}
