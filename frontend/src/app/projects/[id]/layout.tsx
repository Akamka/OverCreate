import type { Metadata } from 'next';
import VerifiedGate from '@/components/VerifiedGate';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <VerifiedGate>{children}</VerifiedGate>;
}
