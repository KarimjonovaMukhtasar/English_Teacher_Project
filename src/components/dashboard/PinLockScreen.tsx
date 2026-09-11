import React, { useState, useEffect } from 'react';
import { Lock, Delete, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface PinLockScreenProps {
  onUnlock: (pin: string) => boolean;
  teacherName: string;
  onSwitchToLogin?: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock, teacherName, onSwitchToLogin }) => {
  const currentPin = useAuthStore((s) => s.currentPin);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [hint, setHint] = useState<string>('');

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        // Automatically attempt unlock when 4 digits entered
        setTimeout(() => {
          const success = onUnlock(newPin);
          if (!success) {
            setError(true);
            setPin('');
            setHint(`Noto'g'ri PIN kod! (Kod: ${currentPin || '1234'})`);
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-md text-white p-4">
      <div className={`w-full max-w-sm rounded-3xl bg-stone-900/90 border border-stone-800 p-8 shadow-2xl transition-[transform,opacity] duration-150 ${
        error ? 'animate-shake border-rose-500/80' : ''
      }`}>
        <div className="flex flex-col items-center text-center">
          {/* Tilchi Logo */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white mb-3 shadow-lg shadow-brand-600/30 ring-2 ring-brand-600/20">
            <span className="font-serif text-2xl font-black -translate-y-[1px]">t</span>
          </div>

          <div className="flex items-center gap-1 mb-1">
            <span className="font-serif text-lg font-bold text-white">tilchi</span>
            <span className="text-base font-bold text-brand-400">.uz</span>
            <span className="ml-1.5 rounded-full bg-brand-500/20 px-2 py-0.5 text-[9px] font-bold text-brand-400 uppercase">
              app.tilchi.uz
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Sinf Rejimi Qulfi
          </h2>
          <p className="mt-1 text-xs text-stone-400">
            Xush kelibsiz, <strong className="text-stone-200">{teacherName}</strong>!
          </p>
          <p className="mt-0.5 text-[11px] text-slate-300">
            Proyektorni ochish uchun 4 xonali PIN kodni kiriting
          </p>

          {/* PIN circles indicator */}
          <div className="my-6 flex items-center justify-center gap-4">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`h-4 w-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'scale-125 bg-brand-500 shadow-lg shadow-brand-500/60'
                      : 'bg-stone-800 border border-stone-700'
                  } ${error ? '!bg-rose-500 !shadow-rose-500/50' : ''}`}
                />
              );
            })}
          </div>

          {hint && (
            <p className="mb-4 text-xs font-medium text-rose-400 animate-pulse">
              {hint}
            </p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="flex h-12 items-center justify-center rounded-xl bg-stone-800/80 hover:bg-stone-800 active:bg-brand-600/40 text-xl font-semibold font-mono tabular-nums text-white active:scale-[0.96] transition-transform duration-150 border border-stone-700/50 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="flex h-12 items-center justify-center rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-medium text-stone-400 active:scale-[0.96] transition-transform duration-150 border border-stone-800 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none"
            >
              Tozalash
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="flex h-12 items-center justify-center rounded-xl bg-stone-800/80 hover:bg-stone-800 active:bg-brand-600/40 text-xl font-semibold font-mono tabular-nums text-white active:scale-[0.96] transition-transform duration-150 border border-stone-700/50 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="flex h-12 items-center justify-center rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white active:scale-[0.96] transition-transform duration-150 border border-stone-800 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none"
            >
              <Delete className="h-5 w-5 -translate-x-[1px]" />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between w-full pt-3 border-t border-stone-800 text-xs text-stone-500">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Standart PIN: <strong className="text-stone-300">{currentPin || '1234'}</strong></span>
            </div>

            {onSwitchToLogin && (
              <button
                onClick={onSwitchToLogin}
                className="text-brand-300 hover:text-white hover:underline font-semibold text-xs"
              >
                Login / Parol orqali kirish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
