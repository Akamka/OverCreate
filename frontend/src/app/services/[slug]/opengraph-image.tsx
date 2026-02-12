// app/services/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { SERVICES, type ServiceSlug } from '@/lib/services.config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type RouteParams = { slug: string };

async function readSlug(params: RouteParams | Promise<RouteParams>): Promise<ServiceSlug | null> {
  const resolved = await params;
  const normalized = (resolved?.slug ?? '').toLowerCase().trim();
  if (!normalized) return null;
  if (normalized in SERVICES) return normalized as ServiceSlug;
  return null;
}

export default async function OGService({ params }: { params: RouteParams | Promise<RouteParams> }) {
  const slug = await readSlug(params);
  const cfg = slug ? SERVICES[slug] : undefined;
  const c1 = `rgb(${cfg?.acc1?.join(' ') || '59 130 246'})`;
  const c2 = `rgb(${cfg?.acc2?.join(' ') || '168 85 247'})`;
  const title = cfg?.title || 'Service';

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
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -120,
            width: 520,
            height: 520,
            borderRadius: '50%',
            filter: 'blur(40px)',
            opacity: 0.5,
            background: `conic-gradient(from 0deg at 50% 50%, ${c1}, ${c2}, ${c1})`,
            maskImage: 'radial-gradient(circle at 50% 50%, transparent 56%, black 57%)',
          }}
        />
        <div style={{ fontSize: 46, opacity: 0.7 }}>OverCreate — Service</div>
        <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: -1, marginTop: 10 }}>
          {title}
        </div>
      </div>
    ),
    size
  );
}
