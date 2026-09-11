import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  usePresentationStore,
  toggleTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  setTimerSeconds,
  tickTimer,
  presentationStore,
} from '@/store/presentationStore';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  Clock,
  Timer as StopwatchIcon,
  Plus,
  Minus
} from 'lucide-react';

type TimerMode = 'countdown' | 'stopwatch';

export const TimerModal: React.FC = () => {
  const isOpen = usePresentationStore((s) => s.isTimerOpen);
  const handleClose = () => toggleTimer(false);

  const [mode, setMode] = useState<TimerMode>('countdown');

  // Countdown state synced with presentationStore
  const isTimerRunning = usePresentationStore((s) => s.isTimerRunning);
  const timerSeconds = usePresentationStore((s) => s.timerSeconds);
  const [totalSeconds, setTotalSeconds] = useState<number>(120); // Default 2m
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Stopwatch state
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);

  // AudioContext singleton to prevent multiple hardware context allocations
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Beep sound with Web Audio API (Tick & Alarm) using singleton context
  const playSound = (type: 'tick' | 'alarm') => {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'alarm') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.2);
        });
      }
    } catch {
      // Ignore audio failure
    }
  };

  // Stopwatch Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStopwatchRunning && isOpen && mode === 'stopwatch') {
      interval = setInterval(() => {
        setStopwatchSeconds((sec) => sec + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning, isOpen, mode]);

  // A deadline-based timer stays accurate after a background-tab pause.
  useEffect(() => {
    if (!isTimerRunning || !isOpen || mode !== 'countdown') return;
    tickTimer();
    const interval = window.setInterval(tickTimer, 250);
    return () => window.clearInterval(interval);
  }, [isTimerRunning, isOpen, mode]);

  // Audio warning on last 3 seconds of countdown
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0 && timerSeconds <= 3) {
      playSound('tick');
    } else if (isTimerRunning && timerSeconds === 0) {
      playSound('alarm');
    }
  }, [timerSeconds, isTimerRunning]);

  // Countdown controls
  const adjustSeconds = (delta: number) => {
    const current = presentationStore.state.timerSeconds;
    const next = Math.max(0, current + delta);
    setTimerSeconds(next);
    setTotalSeconds((prev) => Math.max(next, prev));
  };

  const applyPreset = (secs: number) => {
    pauseTimer();
    setTotalSeconds(secs);
    setTimerSeconds(secs);
  };

  const resetCountdown = () => {
    pauseTimer();
    setTimerSeconds(totalSeconds);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchSeconds(0);
  };

  const togglePlayCountdown = () => {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      if (timerSeconds === 0) {
        setTimerSeconds(totalSeconds);
      }
      startTimer();
    }
  };

  // Keyboard shortcut: Space to play/pause, Escape to close, R to reset
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        if (mode === 'countdown') {
          togglePlayCountdown();
        } else {
          setIsStopwatchRunning((r) => !r);
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        e.stopPropagation();
        if (mode === 'countdown') resetCountdown();
        else resetStopwatch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, totalSeconds, isTimerRunning, timerSeconds]);

  if (!isOpen) return null;

  // Formatting utilities
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Circular progress calculations
  const progressRatio = totalSeconds > 0 ? timerSeconds / totalSeconds : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Ring color depending on remaining time
  const getRingColor = () => {
    if (timerSeconds === 0) return 'stroke-rose-500';
    if (timerSeconds <= 10) return 'stroke-rose-500 animate-pulse';
    if (progressRatio <= 0.25) return 'stroke-amber-400';
    return 'stroke-blue-500';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Taymer va Sekundomer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-6 text-white overflow-hidden">
        {/* Header with Mode Switcher & Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setMode('countdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'countdown'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Taymer
            </button>
            <button
              onClick={() => setMode('stopwatch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'stopwatch'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <StopwatchIcon className="w-3.5 h-3.5" />
              Sekundomer
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              title={isSoundEnabled ? 'Ovozni o\'chirish' : 'Ovozni yoqish'}
              className={`p-2 rounded-xl border transition ${
                isSoundEnabled
                  ? 'bg-slate-800/80 border-slate-700 text-blue-400 hover:bg-slate-700'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode 1: Countdown Timer */}
        {mode === 'countdown' && (
          <div className="flex flex-col items-center mt-6">
            {/* Circular Progress Ring with Digital Display */}
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 200 200">
                {/* Background Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  className={`${getRingColor()} transition-all duration-300 ease-out`}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Digital Clock in Center */}
              <div className="absolute flex flex-col items-center">
                <span
                  className={`font-mono tabular-nums text-4xl font-extrabold tracking-tight transition-colors ${
                    timerSeconds === 0
                      ? 'text-rose-500 animate-bounce'
                      : timerSeconds <= 10
                      ? 'text-rose-400'
                      : 'text-white'
                  }`}
                >
                  {formatTime(timerSeconds)}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mt-1">
                  {timerSeconds === 0
                    ? "Vaqt tugadi!"
                    : isTimerRunning
                    ? 'Ketmoqda...'
                    : 'Pauza'}
                </span>
              </div>
            </div>

            {/* Micro Adjustment (+/- 30s) */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => adjustSeconds(-30)}
                disabled={timerSeconds <= 30}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.96] transition-transform duration-150 text-slate-300 disabled:opacity-40 disabled:pointer-events-none border border-slate-700/60"
              >
                <Minus className="w-3 h-3" /> 30s
              </button>
              <button
                onClick={() => adjustSeconds(30)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.96] transition-transform duration-150 text-slate-300 border border-slate-700/60"
              >
                <Plus className="w-3 h-3" /> 30s
              </button>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-2 w-full mt-5">
              {[
                { label: '30s', sec: 30 },
                { label: '1m', sec: 60 },
                { label: '2m', sec: 120 },
                { label: '3m', sec: 180 },
                { label: '5m', sec: 300 }
              ].map((p) => {
                const isActive = totalSeconds === p.sec && !isTimerRunning;
                return (
                  <button
                    key={p.sec}
                    onClick={() => applyPreset(p.sec)}
                    className={`py-2 rounded-xl text-xs font-bold transition-transform duration-150 active:scale-[0.96] border ${
                      isActive
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons: Start/Pause & Reset */}
            <div className="flex items-center gap-3 w-full mt-6">
              <button
                onClick={resetCountdown}
                title="Qayta o'rnatish"
                className="flex items-center justify-center p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.96] transition-transform duration-150 border border-slate-700 text-slate-300 hover:text-white"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayCountdown}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm shadow-lg active:scale-[0.96] transition-transform duration-150 ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    Pauza
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current translate-x-[1px]" />
                    Boshlash
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: Stopwatch */}
        {mode === 'stopwatch' && (
          <div className="flex flex-col items-center mt-6">
            <div className="relative flex items-center justify-center w-48 h-48 rounded-full bg-slate-800/40 border border-slate-700/60 shadow-inner">
              <div className="flex flex-col items-center">
                <span className="font-mono tabular-nums text-4xl font-extrabold text-white tracking-tight">
                  {formatTime(stopwatchSeconds)}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mt-1">
                  {isStopwatchRunning ? 'Sekundomer ishlamoqda' : 'To\'xtatilgan'}
                </span>
              </div>
            </div>

            {/* Action Buttons: Start/Pause & Reset */}
            <div className="flex items-center gap-3 w-full mt-8">
              <button
                onClick={resetStopwatch}
                title="Qayta o'rnatish"
                className="flex items-center justify-center p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.96] transition-transform duration-150 border border-slate-700 text-slate-300 hover:text-white"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm shadow-lg active:scale-[0.96] transition-transform duration-150 ${
                  isStopwatchRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                {isStopwatchRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    Pauza
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current translate-x-[1px]" />
                    Boshlash
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
