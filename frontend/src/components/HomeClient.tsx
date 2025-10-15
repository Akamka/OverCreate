'use client';

import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import ServicesGrid from '@/components/ServicesGrid';
import Testimonials from '@/components/Testimonials';
import OrderForm from '@/components/OrderForm';
import AboutSection from '@/components/AboutSection';
import type { Portfolio } from '@/types/portfolio';
import type { RGB } from '@/types/ui';
import type { ServiceSlug } from '@/lib/services.config';

export default function HomeClient({ items }: { items: Portfolio[] }) {
  // keep accents consistent site-wide
  const ACCENT_FROM: RGB = [59, 130, 246];  // blue-500
  const ACCENT_TO:   RGB = [168, 85, 247];  // purple-500

  // You can bind the request to a specific service if needed, e.g. 'web'
  const DEFAULT_SERVICE: ServiceSlug | undefined = undefined;

  return (
    <main className="relative z-10">
      <NavBar />
      <Hero />
      <ServicesGrid />

      <AboutSection />

      <Testimonials />

      {/* Contact / Order */}
      <section id="contact" className="py-20 px-6 md:px-16">
        <div className="max-w-[1200px] mx-auto">
          

          <OrderForm
            service={DEFAULT_SERVICE}
            accentFrom={ACCENT_FROM}
            accentTo={ACCENT_TO}
          />

          <div className="mt-6 text-neutral-400 text-sm">
            Or email us:{" "}

            <a className="">
                <br />+48 575 933 658 /  +380 969 901 003
            </a>

            <a className="underline">
              <br />overcreate.studio@gmail.com
            </a>

          </div>
        </div>
      </section>
    </main>
  );
}
