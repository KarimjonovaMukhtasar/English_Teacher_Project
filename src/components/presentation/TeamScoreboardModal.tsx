import React, { useState, useRef, useEffect } from 'react';
import {
  usePresentationStore,
  addTeamScore,
  resetTeamScore,
  closeScoreboard
} from '@/store/presentationStore';
import {
  Trophy,
  Plus,
  Minus,
  RotateCcw,
  X,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TeamScoreboardModal: React.FC = () => {
  const isOpen = usePresentationStore((s) => s.isScoreboardOpen);
  const scoreA = usePresentationStore((s) => s.teamScoreA);
  const scoreB = usePresentationStore((s) => s.teamScoreB);

  const [teamAName, setTeamAName] = useState('Team Red (Row 1)');
  const [teamBName, setTeamBName] = useState('Team Blue (Row 2)');
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio synthesis helper for classroom feedback
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Keyboard shortcut: Escape to close when full modal is open
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeScoreboard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized]);

  const playChime = (type: 'point' | 'deduct' | 'win') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (type === 'point') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'deduct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
        osc.frequency.linearRampToValueAtTime(261.63, ctx.currentTime + 0.15); // C4
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'win') {
        // Confetti celebration sound
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.3);
        });
      }
    } catch {
      // AudioContext unavailable
    }
  };

  const handleScore = (team: 'A' | 'B', delta: number) => {
    addTeamScore(team, delta);
    if (delta > 0) {
      playChime('point');
      // Light celebratory burst if significant lead or milestone
      const newScore = team === 'A' ? scoreA + delta : scoreB + delta;
      if (newScore % 5 === 0 && newScore > 0) {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { x: team === 'A' ? 0.35 : 0.65, y: 0.6 }
        });
      }
    } else {
      playChime('deduct');
    }
  };

  const handleReset = () => {
    resetTeamScore();
    playChime('deduct');
  };

  const triggerWinnerCelebration = () => {
    playChime('win');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (!isOpen) return null;

  // Floating Minimized Widget
  if (isMinimized) {
    return (
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-white select-none animate-in fade-in slide-in-from-top-3">
        {/* Team A quick badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/30">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-xs font-bold text-rose-300 max-w-[80px] truncate">{teamAName}</span>
          <span className="font-mono tabular-nums text-sm font-black text-white ml-1">{scoreA}</span>
          <button
            onClick={() => handleScore('A', 1)}
            className="w-5 h-5 rounded-md bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-xs font-bold active:scale-[0.96] transition-transform duration-150 ml-1"
          >
            +1
          </button>
        </div>

        <span className="text-xs font-black text-slate-500">VS</span>

        {/* Team B quick badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/20 border border-blue-500/30">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs font-bold text-blue-300 max-w-[80px] truncate">{teamBName}</span>
          <span className="font-mono tabular-nums text-sm font-black text-white ml-1">{scoreB}</span>
          <button
            onClick={() => handleScore('B', 1)}
            className="w-5 h-5 rounded-md bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-xs font-bold active:scale-[0.96] transition-transform duration-150 ml-1"
          >
            +1
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* Maximize & Close buttons */}
        <button
          onClick={() => setIsMinimized(false)}
          title="Kattalashtirish"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={closeScoreboard}
          title="Yopish"
          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Full Scoreboard Modal
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Darslik Jamoalar Hisobi"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={closeScoreboard}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-white animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-1.5">
                <span>Darslik Jamoalar Hisobi</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Gamification
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                O'quvchilarni faollashtirish uchun qatorlar yoki guruhlararo ballar tizimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              title="Kichraytirish (Slaydda ko'rsatish)"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeScoreboard}
              title="Yopish"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Teams Score Grid */}
        <div className="grid grid-cols-2 gap-4 my-6">
          {/* Team A (Red) */}
          <div className="rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/40 p-5 flex flex-col items-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-rose-500" />
            <input
              type="text"
              aria-label="Qizil jamoa nomi"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              className="text-center font-bold text-sm text-rose-300 bg-transparent border-b border-rose-500/30 focus:border-rose-400 focus:outline-hidden px-2 py-0.5 w-full mb-3"
            />

            <div className="text-6xl font-black font-mono tabular-nums tracking-tight text-white my-3 drop-shadow-md">
              {scoreA}
            </div>

            <div className="flex items-center gap-1.5 w-full mt-2">
              <button
                type="button"
                aria-label={`${teamAName} jamoasidan 1 ball ayirish`}
                onClick={() => handleScore('A', -1)}
                className="flex-1 min-h-[40px] py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs active:scale-[0.96] transition-transform duration-150"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={`${teamAName} jamoasiga 1 ball qo'shish`}
                onClick={() => handleScore('A', 1)}
                className="flex-2 min-h-[40px] py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1 font-bold text-sm shadow-md shadow-rose-600/30 active:scale-[0.96] transition-transform duration-150"
              >
                <Plus className="w-4 h-4" />
                <span>+1</span>
              </button>
              <button
                type="button"
                aria-label={`${teamAName} jamoasiga 2 ball qo'shish`}
                onClick={() => handleScore('A', 2)}
                className="flex-1 min-h-[40px] py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 flex items-center justify-center font-bold text-xs border border-rose-500/30 active:scale-[0.96] transition-transform duration-150"
              >
                +2
              </button>
            </div>

            {scoreA > scoreB && (
              <button
                type="button"
                onClick={triggerWinnerCelebration}
                className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 active:scale-[0.96] transition-transform duration-150 min-h-[32px] px-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>G'oliblikni nishonlash</span>
              </button>
            )}
          </div>

          {/* Team B (Blue) */}
          <div className="rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-500/40 p-5 flex flex-col items-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />
            <input
              type="text"
              aria-label="Moviy jamoa nomi"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              className="text-center font-bold text-sm text-blue-300 bg-transparent border-b border-blue-500/30 focus:border-blue-400 focus:outline-hidden px-2 py-0.5 w-full mb-3"
            />

            <div className="text-6xl font-black font-mono tabular-nums tracking-tight text-white my-3 drop-shadow-md">
              {scoreB}
            </div>

            <div className="flex items-center gap-1.5 w-full mt-2">
              <button
                type="button"
                aria-label={`${teamBName} jamoasidan 1 ball ayirish`}
                onClick={() => handleScore('B', -1)}
                className="flex-1 min-h-[40px] py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs active:scale-[0.96] transition-transform duration-150"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={`${teamBName} jamoasiga 1 ball qo'shish`}
                onClick={() => handleScore('B', 1)}
                className="flex-2 min-h-[40px] py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1 font-bold text-sm shadow-md shadow-blue-600/30 active:scale-[0.96] transition-transform duration-150"
              >
                <Plus className="w-4 h-4" />
                <span>+1</span>
              </button>
              <button
                type="button"
                aria-label={`${teamBName} jamoasiga 2 ball qo'shish`}
                onClick={() => handleScore('B', 2)}
                className="flex-1 min-h-[40px] py-2 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 flex items-center justify-center font-bold text-xs border border-blue-500/30 active:scale-[0.96] transition-transform duration-150"
              >
                +2
              </button>
            </div>

            {scoreB > scoreA && (
              <button
                onClick={triggerWinnerCelebration}
                className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 active:scale-[0.96] transition-transform duration-150"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>G'oliblikni nishonlash</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white active:scale-[0.96] transition-transform duration-150 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hisobni yangilash (0-0)</span>
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 active:scale-[0.96] transition-transform duration-150 font-medium"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Kichraytirib darsda qoldirish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
