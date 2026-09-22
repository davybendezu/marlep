import { useEffect, useRef, useState } from 'react';

const MIN_VISIBLE_MS = 1900;
const MAX_WAIT_MS = 6000;
const FADE_MS = 600;

export default function SplashScreen({ onDone }) {
  const [started, setStarted] = useState(false);
  const [fading, setFading] = useState(false);
  const audioRef = useRef(null);
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
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // El conteo hacia el cierre automatico solo arranca despues del boton "Iniciar":
  // asi el play() del audio ocurre en respuesta directa a un gesto del usuario y
  // los navegadores no lo bloquean. El cierre espera a que el audio termine de
  // sonar (evento "ended"), no a una duracion adivinada de antemano, con un
  // minimo visible y un tope de seguridad por si el audio falla.
  useEffect(() => {
    if (!started) return undefined;

    const audio = audioRef.current;
    let minElapsed = false;
    let audioDone = !audio;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setFading(true);
      setTimeout(onDone, FADE_MS);
    };

    const tryFinish = () => {
      if (minElapsed && audioDone) finish();
    };

    const minTimer = setTimeout(() => {
      minElapsed = true;
      tryFinish();
    }, MIN_VISIBLE_MS);

    const safetyTimer = setTimeout(finish, MAX_WAIT_MS);

    const handleAudioDone = () => {
      audioDone = true;
      tryFinish();
    };

    audio?.addEventListener('ended', handleAudioDone);
    audio?.addEventListener('error', handleAudioDone);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(safetyTimer);
      audio?.removeEventListener('ended', handleAudioDone);
      audio?.removeEventListener('error', handleAudioDone);
    };
  }, [started, onDone]);

  const handleStart = () => {
    audioRef.current?.play().catch(() => {});
    setStarted(true);
  };

  return (
    <div
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream-50 transition-opacity duration-[600ms] ease-out ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {started ? (
        <>
          <div className="splash-stage relative flex h-40 w-40 items-center justify-center">
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
        </>
      ) : (
        <>
          <img
            src="/images/logo.png"
            alt="Marlep Cosmetics"
            className="h-32 w-32 rounded-full object-cover shadow-soft"
          />
          <p className="mt-6 font-display text-xl font-semibold text-leaf-700">Marlep Cosmetics</p>
          <button type="button" onClick={handleStart} className="btn-primary mt-8">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M8 5v14l11-7z" />
            </svg>
            Iniciar
          </button>
        </>
      )}

      <span className="sr-only">Cargando Marlep Cosmetics…</span>
      <audio ref={audioRef} src="/audio/marlep-splash.mp3" preload="auto" />
    </div>
  );
}
