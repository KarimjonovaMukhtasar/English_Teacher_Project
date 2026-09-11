import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sparkles,
  BookOpen,
  Clock
} from 'lucide-react';
import { webrtcManager } from '@/lib/webrtc';
import { RemoteCommand, RemoteHostState } from '@/types';

interface MobileRemoteViewProps {
  sessionId: string;
}

export const MobileRemoteView: React.FC<MobileRemoteViewProps> = ({ sessionId }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [hostState, setHostState] = useState<RemoteHostState>({
    currentSlideIndex: 0,
    totalSlides: 1,
    isTimerRunning: false,
    timerSeconds: 300,
    isTimerOpen: false,
    isBlackout: false,
    isWhiteout: false,
    selectedStudent: null,
    lessonTitle: 'Ingliz tili darsi',
  });

  useEffect(() => {
    webrtcManager.initClient(
      sessionId,
      (state) => {
        setHostState(state as RemoteHostState);
      },
      () => {
        setIsConnected(true);
      }
    );

    return () => {
      webrtcManager.destroy();
    };
  }, [sessionId]);

  const send = (cmd: RemoteCommand) => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(25);
      } catch {
        // Ignore vibration errors if restricted by browser policy
      }
    }
    webrtcManager.sendCommand(cmd);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-5 py-3.5">
        <div className="flex items-center gap-2 truncate">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="truncate">
            <h2 className="text-xs font-bold text-white truncate max-w-[180px]">
              {hostState.lessonTitle}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className={`inline-block h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{isConnected ? 'Ulangan' : 'Bog\'lanmoqda...'}</span>
            </div>
          </div>
        </div>

        {/* Slide Counter badge */}
        <div className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-extrabold text-blue-400 font-mono tabular-nums">
          {hostState.currentSlideIndex + 1} / {hostState.totalSlides}
        </div>
      </header>

      {/* Disconnected Notice */}
      {!isConnected && (
        <div className="bg-amber-950/60 border-b border-amber-800/60 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span>Kompuyuter bilan bog‘lanilmoqda... Ikkala qurilma bir xil tarmoqda bo‘lishi tavsiya etiladi.</span>
        </div>
      )}

      {/* Main Controls Area */}
      <main className="flex-1 flex flex-col justify-between p-5 gap-4 max-w-md mx-auto w-full">
        {/* Giant Next & Previous Slide Buttons */}
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-[220px]">
          {/* Previous Slide */}
          <button
            onClick={() => send({ type: 'PREV_SLIDE' })}
            disabled={hostState.currentSlideIndex === 0}
            className="flex flex-col items-center justify-center rounded-3xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-[0.96] transition-transform duration-150 border border-slate-700/60 p-4 disabled:opacity-40"
          >
            <ChevronLeft className="h-10 w-10 text-slate-300 mb-1" />
            <span className="text-sm font-bold text-slate-300">Oldingi</span>
            <span className="text-[10px] text-slate-500">Slayd</span>
          </button>

          {/* Next Slide (Primary action) */}
          <button
            onClick={() => send({ type: 'NEXT_SLIDE' })}
            disabled={hostState.currentSlideIndex >= hostState.totalSlides - 1}
            className="flex flex-col items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 active:scale-[0.96] transition-transform duration-150 shadow-lg shadow-blue-500/30 p-4 disabled:opacity-40"
          >
            <ChevronRight className="h-10 w-10 text-white mb-1" />
            <span className="text-sm font-bold text-white">Keyingi</span>
            <span className="text-[10px] text-blue-200">Slayd</span>
          </button>
        </div>

        {/* Classroom Quick Action Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Timer Toggle */}
          <button
            onClick={() => send({ type: hostState.isTimerRunning ? 'PAUSE_TIMER' : 'START_TIMER' })}
            className={`flex flex-col items-center justify-center rounded-2xl p-3 border active:scale-[0.96] transition-transform duration-150 ${
              hostState.isTimerRunning
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-bold font-mono tabular-nums">
                {formatTime(hostState.timerSeconds)}
              </span>
            </div>
            <span className="text-[10px] font-semibold">
              {hostState.isTimerRunning ? 'To\'xtatish' : 'Taymer'}
            </span>
          </button>

          {/* Blackout screen */}
          <button
            onClick={() => send({ type: 'TOGGLE_BLACKOUT' })}
            className={`flex flex-col items-center justify-center rounded-2xl p-3 border active:scale-[0.96] transition-transform duration-150 ${
              hostState.isBlackout
                ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <Moon className="h-4 w-4 mb-1 text-slate-400" />
            <span className="text-[10px] font-semibold">
              {hostState.isBlackout ? 'Ekranni Ochish' : 'Qoraytirish (B)'}
            </span>
          </button>

          {/* Pick Random Student */}
          <button
            onClick={() => send({ type: 'PICK_STUDENT' })}
            className="flex flex-col items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800/60 p-3 active:scale-[0.96] transition-transform duration-150"
          >
            <Sparkles className="h-4 w-4 mb-1 text-amber-400" />
            <span className="text-[10px] font-semibold">O'quvchi Tanlash</span>
          </button>
        </div>
      </main>
    </div>
  );
};
