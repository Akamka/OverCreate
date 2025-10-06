'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import {
  // web / UI design
  SiFigma, SiFramer, SiWebflow, SiAdobephotoshop, SiAdobeillustrator, SiAdobexd,
  // motion / video / 3D
  SiAdobeaftereffects, SiAdobepremierepro, SiBlender, SiThreedotjs,
  // front-end core
  SiHtml5, SiCss3, SiSass, SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiRedux, SiVite, SiTailwindcss,
  // back-end / db / api
  SiNodedotjs, SiExpress, SiGraphql, SiPrisma, SiMongodb, SiPostgresql, SiFirebase,
  // devops / hosting / tooling
  SiGit, SiGithub, SiDocker, SiNginx, SiVercel, SiNetlify, SiAmazon,
} from 'react-icons/si';
import LogoLoop, { type LogoItem } from './LogoLoop';

export default function Hero() {
  // плавный скролл к #contact
  const goToContact = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById('contact');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // большой набор иконок; без href → не кликаются
  const techLogos: LogoItem[] = [
    // web / UI design
    { node: <SiFigma />,               title: 'Figma' },
    { node: <SiFramer />,              title: 'Framer' },
    { node: <SiWebflow />,             title: 'Webflow' },
    { node: <SiAdobephotoshop />,      title: 'Adobe Photoshop' },
    { node: <SiAdobeillustrator />,    title: 'Adobe Illustrator' },
    { node: <SiAdobexd />,             title: 'Adobe XD' },

    // motion / 3D / video
    { node: <SiAdobeaftereffects />,   title: 'After Effects' },
    { node: <SiAdobepremierepro />,    title: 'Premiere Pro' },
    { node: <SiBlender />,             title: 'Blender' },
    { node: <SiThreedotjs />,          title: 'three.js' },

    // front-end core
    { node: <SiHtml5 />,               title: 'HTML5' },
    { node: <SiCss3 />,                title: 'CSS3' },
    { node: <SiSass />,                title: 'Sass' },
    { node: <SiJavascript />,          title: 'JavaScript' },
    { node: <SiTypescript />,          title: 'TypeScript' },
    { node: <SiReact />,               title: 'React' },
    { node: <SiNextdotjs />,           title: 'Next.js' },
    { node: <SiRedux />,               title: 'Redux' },
    { node: <SiVite />,                title: 'Vite' },
    { node: <SiTailwindcss />,         title: 'Tailwind CSS' },

    // back-end / data / api
    { node: <SiNodedotjs />,           title: 'Node.js' },
    { node: <SiExpress />,             title: 'Express' },
    { node: <SiGraphql />,             title: 'GraphQL' },
    { node: <SiPrisma />,              title: 'Prisma' },
    { node: <SiMongodb />,             title: 'MongoDB' },
    { node: <SiPostgresql />,          title: 'PostgreSQL' },
    { node: <SiFirebase />,            title: 'Firebase' },

    // devops / hosting / tooling
    { node: <SiGit />,                 title: 'Git' },
    { node: <SiGithub />,              title: 'GitHub' },
    { node: <SiDocker />,              title: 'Docker' },
    { node: <SiNginx />,               title: 'Nginx' },
    { node: <SiVercel />,              title: 'Vercel' },
    { node: <SiNetlify />,             title: 'Netlify' },
    { node: <SiAmazon />,           title: 'AWS' },
  ];

  return (
    <section
      id="home"
      className="oc-section oc-section--flat relative px-6 md:px-16 min-h-[100svh] flex items-center"
    >
      {/* мягкие пятна */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[40vw] h-[40vw] bg-fuchsia-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-[40vw] h-[40vw] bg-sky-400/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1200px] w-full mx-auto relative z-10">
        <p className="text-sm uppercase tracking-[.25em] text-white/60">
          Design × Code Studio
        </p>

        <h1 className="mt-3 text-5xl md:text-7xl font-semibold leading-[1.05]">
          OverCreate — design that<br />ships, code that scales
        </h1>

        <p className="mt-6 text-neutral-300 max-w-2xl">
          From motion and brand identity to websites and full-stack apps —
          we turn business goals into clear interfaces, fast performance,
          and engaging visual stories.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="#services"
            className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-neutral-200"
          >
            View services
          </Link>

          <Link
            href="#contact"
            onClick={goToContact}
            className="rounded-2xl border border-white/20 px-6 py-3 font-medium hover:border-white/40"
            aria-label="Contact us"
          >
            Contact us
          </Link>
        </div>
      </div>


{/* бесшовная лента иконок на всю ширину, без затемнений */}
<div className="absolute left-0 right-0 -bottom-8 z-10">
  <LogoLoop
    logos={techLogos}
    speed={120}
    direction="left"
    logoHeight={36}
    gap={40}
    pauseOnHover
    scaleOnHover
    fadeOut={false}
    width="100dvw"                 // вместо 100vw
    className="full-bleed"         // вместо w-screen + mx-[calc(50%-50vw)]
    ariaLabel="Technology stack"
  />
</div>

    </section>
  );
}
