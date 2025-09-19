import VerifiedGate from '@/components/VerifiedGate';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <VerifiedGate>{children}</VerifiedGate>;
}
