import OrderForm from '@/components/OrderForm';
import type { CSSVars, RGB } from '@/types/ui';

export default function ServiceCTA({
  accentFrom, accentTo,
}: { accentFrom: RGB; accentTo: RGB }) {
  const vars: CSSVars = { '--acc1': accentFrom.join(' '), '--acc2': accentTo.join(' ') };

  return (
    <section id="contact" className="oc-section px-6 md:px-16">
      <div className="max-w-[1200px] mx-auto">
        <div className="hcard" style={vars}>
          <div className="hcard-body p-8">
            <div className="hcard-engrave" />
            <div className="hcard-scan" />
            <div className="relative z-10">
              <h2 className="text-3xl font-semibold">Оставить заявку</h2>
              <p className="text-neutral-300 mt-2">
                Укажите контакты и кратко опишите задачу — ответим в течение рабочего дня.
              </p>
              <div className="mt-6">
                <OrderForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
