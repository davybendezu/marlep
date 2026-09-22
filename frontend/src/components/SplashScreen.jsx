import { useEffect, useState } from 'react';

const VISIBLE_MS = 1900;
const FADE_MS = 600;

export default function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false);
  const [entry] = useState(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 70;
    const spin = 180 + Math.random() * 180;
    return {
      x: Math.round(Math.cos(angle) * distance),
      y: Math.round(Math.sin(angle) * distance),
      rotate: Math.round(Math.random() < 0.5 ? -spin : spin),
    };
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const fadeTimer = setTimeout(() => setFading(true), VISIBLE_MS);
    const doneTimer = setTimeout(() => {
      document.body.style.overflow = '';
      onDone();
    }, VISIBLE_MS + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = '';
    };
  }, [onDone]);

  return (
    <div
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream-50 transition-opacity duration-[600ms] ease-out ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex h-40 w-40 items-center justify-center">
        <span className="splash-glow" />
        <span className="splash-ring" />
        <span className="splash-ring [animation-delay:0.9s]" />
        <img
          src="/images/logo.png"
          alt="Marlep Cosmetics"
          className="splash-logo relative h-32 w-32 rounded-full object-cover shadow-soft"
          style={{
            '--start-x': `${entry.x}px`,
            '--start-y': `${entry.y}px`,
            '--start-rotate': `${entry.rotate}deg`,
          }}
        />
      </div>

      <div className="mt-6 overflow-hidden">
        <p className="splash-text font-display text-xl font-semibold text-leaf-700">Marlep Cosmetics</p>
      </div>
      <div className="overflow-hidden">
        <p className="splash-text splash-text-delay text-xs uppercase tracking-[0.3em] text-honey-600">
          Suavidad Natural
        </p>
      </div>

      <span className="sr-only">Cargando Marlep Cosmetics…</span>
    </div>
  );
}
