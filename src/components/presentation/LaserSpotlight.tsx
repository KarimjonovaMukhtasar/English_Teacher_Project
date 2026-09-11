import React, { useEffect, useRef, useState } from 'react';
import { usePresentationStore } from '@/store/presentationStore';

export const LaserSpotlight: React.FC = () => {
  const activeTool = usePresentationStore((s) => s.activeTool);
  const laserRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activeTool !== 'laser') {
      setIsVisible(false);
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!laserRef.current) return;
      setIsVisible(true);
      // Direct hardware-accelerated transform for instantaneous 60+ FPS tracking
      laserRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    const handlePointerLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [activeTool]);

  if (activeTool !== 'laser') return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      <div
        ref={laserRef}
        className={`absolute top-0 left-0 -ml-2 -mt-2 transition-opacity duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          willChange: 'transform'
        }}
      >
        {/* Core Glowing Dot */}
        <div className="relative flex items-center justify-center">
          {/* Intense red center */}
          <div className="h-4 w-4 rounded-full bg-red-600 shadow-[0_0_12px_4px_rgba(239,68,68,0.9),0_0_24px_8px_rgba(220,38,38,0.5)] ring-2 ring-red-400/80 flex items-center justify-center">
            {/* White-hot center core */}
            <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_4px_#ffffff]" />
          </div>

          {/* Soft inner pulsing glow */}
          <div className="absolute h-8 w-8 rounded-full bg-red-500/30 blur-xs animate-pulse pointer-events-none" />

          {/* Subtle outer pulsing wave */}
          <div className="absolute h-12 w-12 rounded-full border border-red-500/40 animate-ping opacity-60 pointer-events-none [animation-duration:1.8s]" />
        </div>
      </div>
    </div>
  );
};
