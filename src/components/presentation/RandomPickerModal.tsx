import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  usePresentationStore,
  toggleRandomPicker,
  setActiveGroup,
  recordCalledStudent,
  DEFAULT_STUDENT_GROUPS
} from '@/store/presentationStore';
import { StudentGroup } from '@/types';
import confetti from 'canvas-confetti';
import {
  Users,
  Sparkles,
  Shuffle,
  RotateCcw,
  X,
  ChevronDown,
  Trophy,
  CheckCircle2
} from 'lucide-react';

interface RandomPickerModalProps {
  studentGroups?: StudentGroup[];
}

export const RandomPickerModal: React.FC<RandomPickerModalProps> = ({ studentGroups: propStudentGroups }) => {
  const isOpen = usePresentationStore((s) => s.isRandomPickerOpen);
  const activeGroup = usePresentationStore((s) => s.activeGroup);
  const storeStudentGroups = usePresentationStore((s) => s.studentGroups);
  const studentGroups =
    propStudentGroups && propStudentGroups.length > 0 ? propStudentGroups : storeStudentGroups;

  const handleClose = () => toggleRandomPicker(false);

  // Active group fallback
  const currentGroup = activeGroup || studentGroups[0] || DEFAULT_STUDENT_GROUPS[0];
  const allStudents = currentGroup.students.length > 0 ? currentGroup.students : ['Talaba 1', 'Talaba 2'];

  // Session state
  const [pickedHistory, setPickedHistory] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [displayRollingName, setDisplayRollingName] = useState<string>('?');
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [showGroupSelect, setShowGroupSelect] = useState<boolean>(false);

  // Available students who haven't been picked yet in this round
  const availableStudents = allStudents.filter((s) => !pickedHistory.includes(s));
  const pool = availableStudents.length > 0 ? availableStudents : allStudents;

  // AudioContext singleton to prevent hardware context exhaustion (browser limit is 6)
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

  // Sound generator for roulette tick
  const playTickSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignored
    }
  }, [getAudioContext]);

  // Fire celebratory multi-cannon confetti
  const launchCelebration = () => {
    // Primary center burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.55 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
    });

    // Secondary delayed side fireworks
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.15, y: 0.65 },
        colors: ['#38bdf8', '#34d399', '#fbbf24']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.85, y: 0.65 },
        colors: ['#f472b6', '#a78bfa', '#f87171']
      });
    }, 200);
  };

  const rollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animated rolling name effect for 2-3 seconds with deceleration
  const startRoll = useCallback(() => {
    if (isRolling || pool.length === 0) return;

    setIsRolling(true);
    setSelectedStudent(null);

    // Pick target winner in advance from available pool
    const targetWinner = pool[Math.floor(Math.random() * pool.length)];

    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds total
    let currentInterval = 40; // Initial rapid spin speed (ms)
    let candidateIndex = 0;

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Deceleration easing curve: exponential ease-out
      currentInterval = 40 + Math.pow(progress, 2.8) * 320;

      candidateIndex = (candidateIndex + 1) % allStudents.length;
      setDisplayRollingName(allStudents[candidateIndex]);
      playTickSound();

      if (elapsed < duration) {
        rollingTimeoutRef.current = setTimeout(step, currentInterval);
      } else {
        // Halt precisely on winner
        setDisplayRollingName(targetWinner);
        setSelectedStudent(targetWinner);
        recordCalledStudent(targetWinner, 1);
        setIsRolling(false);
        setPickedHistory((prev) => {
          const next = [...prev, targetWinner];
          // If all picked, loop resets
          if (next.length >= allStudents.length) return [];
          return next;
        });
        launchCelebration();
      }
    };

    rollingTimeoutRef.current = setTimeout(step, currentInterval);
  }, [isRolling, pool, allStudents, playTickSound]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (rollingTimeoutRef.current) {
        clearTimeout(rollingTimeoutRef.current);
      }
    };
  }, []);

  // Listen to remote trigger from mobile or presenter store
  const randomPickerTrigger = usePresentationStore((s) => s.randomPickerTrigger);
  const prevTriggerRef = useRef(randomPickerTrigger);

  useEffect(() => {
    if (randomPickerTrigger > prevTriggerRef.current) {
      prevTriggerRef.current = randomPickerTrigger;
      startRoll();
    }
  }, [randomPickerTrigger, startRoll]);

  // Keyboard shortcut: Space or Enter to pick, Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        startRoll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, startRoll]);

  const handleGroupSelect = (group: StudentGroup) => {
    setActiveGroup(group);
    setPickedHistory([]);
    setSelectedStudent(null);
    setDisplayRollingName('?');
    setShowGroupSelect(false);
  };

  const handleResetHistory = () => {
    setPickedHistory([]);
    setSelectedStudent(null);
    setDisplayRollingName('?');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="random-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-6 text-white overflow-hidden">
        {/* Header with Group Selector & Close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="relative">
            <button
              onClick={() => setShowGroupSelect(!showGroupSelect)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-xs font-semibold text-slate-200 transition"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="max-w-[180px] truncate">{currentGroup.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown menu to switch group */}
            {showGroupSelect && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-800 border border-slate-700 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Guruhni tanlang
                </div>
                {studentGroups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleGroupSelect(g)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition ${
                      g.id === currentGroup.id
                        ? 'bg-blue-600/30 text-blue-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{g.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      ({g.students.length} talaba)
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rolling Stage Card */}
        <div className="my-6 flex flex-col items-center">
          <div
            className={`relative w-full h-44 rounded-2xl flex flex-col items-center justify-center p-6 border transition-all duration-300 ${
              selectedStudent
                ? 'bg-gradient-to-b from-blue-900/40 to-slate-800/80 border-blue-500/50 shadow-xl shadow-blue-500/10'
                : 'bg-slate-800/40 border-slate-700/60'
            }`}
          >
            {/* Crown / Star icon when picked */}
            {selectedStudent && (
              <div className="absolute -top-4 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[11px] tracking-wide shadow-md flex items-center gap-1.5 animate-bounce">
                <Trophy className="w-3.5 h-3.5" />
                Navbatdagi Talaba
              </div>
            )}

            {/* Rolling student name display */}
            <div className="flex flex-col items-center text-center">
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight transition-all duration-150 ${
                  isRolling
                    ? 'text-blue-400 scale-95 blur-[0.5px]'
                    : selectedStudent
                    ? 'text-white scale-105 drop-shadow-md'
                    : 'text-slate-500'
                }`}
              >
                {isRolling ? displayRollingName : selectedStudent || 'Tayyormisiz?'}
              </div>

              <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                {isRolling ? (
                  <span className="text-blue-400 animate-pulse flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Tasodifiy tanlanmoqda...
                  </span>
                ) : selectedStudent ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Savolga javob beradi
                  </span>
                ) : (
                  <span>Tugmani bosing yoki Bo'shliq (Space) tugmasidan foydalaning</span>
                )}
              </div>
            </div>
          </div>

          {/* Student pool stats & reset history */}
          <div className="flex items-center justify-between w-full px-1 text-xs text-slate-400">
            <span>
              Qolgan talabalar:{' '}
              <strong className="text-slate-200">
                {availableStudents.length} / {allStudents.length}
              </strong>
            </span>

            {pickedHistory.length > 0 && (
              <button
                onClick={handleResetHistory}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition text-[11px]"
              >
                <RotateCcw className="w-3 h-3" /> Tarixni tozalash
              </button>
            )}
          </div>
        </div>

        {/* Action Button: Roll / Pick Again */}
        <div className="flex items-center gap-3">
          <button
            onClick={startRoll}
            disabled={isRolling}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm shadow-xl active:scale-[0.96] transition-transform duration-150 ${
              isRolling
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : selectedStudent
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            <Shuffle className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            {isRolling ? 'Aylanmoqda...' : selectedStudent ? 'Yana Tanlash' : 'Talabani Tanlash'}
          </button>
        </div>
      </div>
    </div>
  );
};
