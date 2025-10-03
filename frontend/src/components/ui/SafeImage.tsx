// src/components/ui/SafeImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { safeImageSrc } from '@/lib/images';

type Props = Omit<ImageProps, 'src'> & {
  src?: string | null;
  fallbackSrc?: string;
};

export default function SafeImage({ src, fallbackSrc, alt, ...rest }: Props) {
  const finalSrc = safeImageSrc(src, fallbackSrc ?? '/placeholder.svg');
  return <Image src={finalSrc} alt={alt ?? ''} {...rest} />;
}
