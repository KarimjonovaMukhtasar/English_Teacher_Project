import React, { useState, useEffect, useRef } from 'react';
import {
  usePresentationStore,
  setActiveTool,
  setPenColor,
  setPenSize,
  setHighlighterColor,
  setHighlighterSize,
  clearCanvas,
  nextSlide,
  prevSlide,
  goToSlide,
  toggleBlackout,
  toggleWhiteout,
  toggleTimer,
  toggleRandomPicker,
  toggleSpeakerNotes,
  toggleQrRemote,
  toggleFullscreen,
  setFullscreen,
  toggleSlideSearch,
  toggleScoreboard,
  togglePedagogyModal,
  toggleTranslationCurtain
} from '@/store/presentationStore';
import { addFullscreenChangeListener, isFullscreenActive } from '@/lib/fullscreen';
import {
  ChevronLeft,
  ChevronRight,
  MousePointer,
  Pen,
  Highlighter,
  Eraser,
  Trash2,
  Sparkles,
  Clock,
  Shuffle,
  Moon,
  Sun,
  FileText,
  QrCode,
  Maximize,
  Minimize,
  X,
  Pin,
  PinOff,
  Search,
  Trophy,
  Eye,
  EyeOff,
  MoreHorizontal
} from 'lucide-react';

// Tooltip helper component with keyboard shortcut badge
interface TooltipButtonProps {
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'laser';
  className?: string;
  children?: React.ReactNode;
}

const TooltipButton: React.FC<TooltipButtonProps> = ({
  label,
  shortcut,
  active,
  onClick,
  icon,
  variant = 'default',
  className = '',
  children
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  let activeClass = 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400';
  if (variant === 'laser') {
    activeClass = 'bg-red-600 text-white shadow-md shadow-red-500/40 ring-2 ring-red-400';
  } else if (variant === 'warning') {
    activeClass = 'bg-amber-500 text-slate-950 font-semibold shadow-md ring-1 ring-amber-300';
  } else if (variant === 'danger') {
    activeClass = 'bg-rose-600 text-white shadow-md ring-1 ring-rose-400';
  }

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onClick}
        type="button"
        title={label + (shortcut ? ` (${shortcut})` : '')}
        aria-label={label}
        className={`relative flex items-center justify-center min-w-[40px] min-h-[40px] rounded-xl transition-transform duration-150 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none ${
          active
            ? activeClass
            : 'text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800'
        } ${className}`}
      >
        {icon}
      </button>

      {/* Tooltip (desktop hover only) */}
      {showTooltip && (
        <div className="hidden sm:flex pointer-events-none absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-50 items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/95 border border-slate-800 text-white text-[11px] font-medium shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
          <span>{label}</span>
          {shortcut && (
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
              {shortcut}
            </kbd>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export interface PresenterToolbarProps {
  onExit?: () => void;
  totalSlides?: number;
}

export const PresenterToolbar: React.FC<PresenterToolbarProps> = ({
  onExit,
  totalSlides: propTotalSlides
}) => {
  // Store values
  const activeTool = usePresentationStore((s) => s.activeTool);
  const penColor = usePresentationStore((s) => s.penColor);
  const penSize = usePresentationStore((s) => s.penSize);
  const highlighterColor = usePresentationStore((s) => s.highlighterColor);
  const highlighterSize = usePresentationStore((s) => s.highlighterSize);
  const currentSlideIndex = usePresentationStore((s) => s.currentSlideIndex);
  const storeTotalSlides = usePresentationStore((s) => s.totalSlides);
  const totalSlides = propTotalSlides !== undefined ? propTotalSlides : storeTotalSlides;
  const isBlackout = usePresentationStore((s) => s.isBlackout);
  const isWhiteout = usePresentationStore((s) => s.isWhiteout);
  const isTimerOpen = usePresentationStore((s) => s.isTimerOpen);
  const isTimerRunning = usePresentationStore((s) => s.isTimerRunning);
  const timerSeconds = usePresentationStore((s) => s.timerSeconds);
  const isRandomPickerOpen = usePresentationStore((s) => s.isRandomPickerOpen);
  const isSlideSearchOpen = usePresentationStore((s) => s.isSlideSearchOpen);
  const isScoreboardOpen = usePresentationStore((s) => s.isScoreboardOpen);
  const isPedagogyModalOpen = usePresentationStore((s) => s.isPedagogyModalOpen);
  const isTranslationCurtainActive = usePresentationStore((s) => s.isTranslationCurtainActive);
  const isSpeakerNotesOpen = usePresentationStore((s) => s.isSpeakerNotesOpen);
  const isQrRemoteOpen = usePresentationStore((s) => s.isQrRemoteOpen);
  const isFullscreen = usePresentationStore((s) => s.isFullscreen);

  // Popover menus state
  const [showPenPopover, setShowPenPopover] = useState(false);
  const [showHighlighterPopover, setShowHighlighterPopover] = useState(false);
  const [showMorePopover, setShowMorePopover] = useState(false);
  const [isJumpOpen, setIsJumpOpen] = useState(false);
  const [jumpSlideInput, setJumpSlideInput] = useState('');

  // Auto-hide toolbar state
  const [isHovered, setIsHovered] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!isPinned) {
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 3500);
    }
  };

  useEffect(() => {
    const handleActivity = () => resetIdleTimer();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('keydown', handleActivity);

    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isPinned]);

  // Sync fullscreen state with cross-browser events (Safari, Chrome, Firefox) and listen for 'F' shortcut
  useEffect(() => {
    setFullscreen(isFullscreenActive());
    const cleanupFs = addFullscreenChangeListener((isFs) => {
      setFullscreen(isFs);
    });

    return () => {
      cleanupFs();
    };
  }, []);

  const closeAllPopovers = () => {
    setShowMorePopover(false);
    setShowPenPopover(false);
    setShowHighlighterPopover(false);
    setIsJumpOpen(false);
  };

  // Pen palettes
  const penColors = [
    { name: 'Qizil', hex: '#ef4444' },
    { name: "Ko'k", hex: '#3b82f6' },
    { name: 'Yashil', hex: '#10b981' },
    { name: 'Sariq', hex: '#eab308' },
    { name: 'Binafsha', hex: '#8b5cf6' },
    { name: 'Oq', hex: '#ffffff' },
    { name: "To'q kulrang", hex: '#1e293b' }
  ];

  const penSizes = [
    { label: 'Ingichka', size: 2 },
    { label: "O'rtacha", size: 4 },
    { label: 'Qalin', size: 6 },
    { label: 'Katta', size: 10 }
  ];

  // Highlighter palettes
  const highlighterColors = [
    { name: 'Sariq', hex: '#facc15' },
    { name: 'Yashil', hex: '#4ade80' },
    { name: "Ko'k", hex: '#60a5fa' },
    { name: 'Pushti', hex: '#f472b6' },
    { name: "To'q sariq", hex: '#fb923c' }
  ];

  const highlighterSizes = [
    { label: 'Yupqa', size: 16 },
    { label: 'Standart', size: 24 },
    { label: 'Keng', size: 36 }
  ];

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpSlideInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalSlides) {
      goToSlide(pageNum - 1);
      setIsJumpOpen(false);
      setJumpSlideInput('');
    }
  };

  const formatTimerMinutes = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Check if any secondary tool is currently active
  const isAnySecondaryActive = Boolean(
    activeTool === 'highlighter' ||
    activeTool === 'eraser' ||
    isSlideSearchOpen ||
    isRandomPickerOpen ||
    isScoreboardOpen ||
    isPedagogyModalOpen ||
    isTranslationCurtainActive ||
    isBlackout ||
    isWhiteout ||
    isSpeakerNotesOpen ||
    isQrRemoteOpen
  );

  const isBarVisible =
    isHovered ||
    isPinned ||
    !isIdle ||
    showPenPopover ||
    showHighlighterPopover ||
    showMorePopover ||
    isJumpOpen;

  return (
    <>
      {/* Click-away backdrop for popovers */}
      {(showMorePopover || showPenPopover || showHighlighterPopover || isJumpOpen) && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] md:bg-transparent"
          onClick={closeAllPopovers}
        />
      )}

      {/* Transparent Bottom Hover Detection Area */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-0 left-0 right-0 h-16 pointer-events-none md:pointer-events-auto z-30"
      />

      {/* Floating Presenter Toolbar Container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out select-none max-w-[calc(100vw-1rem)] ${
          isBarVisible
            ? 'opacity-100 translate-y-0 shadow-2xl'
            : 'opacity-60 hover:opacity-100 translate-y-2'
        }`}
      >
        {/* Jump to Slide Popover */}
        {isJumpOpen && (
          <form
            onSubmit={handleJumpSubmit}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-2.5 rounded-2xl bg-slate-900/98 border border-slate-700 shadow-2xl backdrop-blur-2xl flex items-center gap-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="text-xs font-medium text-slate-300">Slayd:</div>
            <input
              type="number"
              min={1}
              max={totalSlides}
              value={jumpSlideInput}
              onChange={(e) => setJumpSlideInput(e.target.value)}
              placeholder="1"
              autoFocus
              className="w-16 px-2.5 py-1.5 text-xs font-mono tabular-nums rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-xs text-slate-400 font-mono tabular-nums">/ {totalSlides}</span>
            <button
              type="submit"
              className="px-3 py-1.5 min-h-[36px] text-xs rounded-lg bg-brand-600 hover:bg-brand-700 font-bold text-white active:scale-[0.96] transition-transform"
            >
              O'tish
            </button>
            <button
              type="button"
              onClick={() => setIsJumpOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white active:scale-[0.96] transition-transform"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Pen Color & Size Popover */}
        {showPenPopover && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-3.5 rounded-2xl bg-slate-900/98 border border-slate-700 shadow-2xl backdrop-blur-2xl z-50 w-60 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Qalam Ranglari
              </span>
              <button
                onClick={() => setShowPenPopover(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white active:scale-[0.96] transition-transform"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-1 mb-3">
              {penColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setPenColor(c.hex);
                    setActiveTool('pen');
                  }}
                  title={c.name}
                  className={`w-7 h-7 rounded-full transition-transform active:scale-[0.96] border ${
                    penColor === c.hex
                      ? 'scale-110 border-white ring-2 ring-blue-500 shadow-md'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Chiziq Qalinligi
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {penSizes.map((s) => (
                <button
                  key={s.size}
                  onClick={() => {
                    setPenSize(s.size);
                    setActiveTool('pen');
                  }}
                  className={`py-1.5 min-h-[36px] text-xs font-semibold rounded-lg transition active:scale-[0.96] ${
                    penSize === s.size
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.size}px
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Highlighter Popover */}
        {showHighlighterPopover && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-3.5 rounded-2xl bg-slate-900/98 border border-slate-700 shadow-2xl backdrop-blur-2xl z-50 w-56 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Marker Rangi
              </span>
              <button
                onClick={() => setShowHighlighterPopover(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white active:scale-[0.96] transition-transform"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-1 mb-3">
              {highlighterColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setHighlighterColor(c.hex);
                    setActiveTool('highlighter');
                  }}
                  title={c.name}
                  className={`w-7 h-7 rounded-full transition-transform active:scale-[0.96] border ${
                    highlighterColor === c.hex
                      ? 'scale-110 border-white ring-2 ring-yellow-400 shadow-md'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Marker Eni
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {highlighterSizes.map((s) => (
                <button
                  key={s.size}
                  onClick={() => {
                    setHighlighterSize(s.size);
                    setActiveTool('highlighter');
                  }}
                  className={`py-1.5 min-h-[36px] text-xs font-semibold rounded-lg transition active:scale-[0.96] ${
                    highlighterSize === s.size
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.size}px
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile / Tablet "Ko'proq" (More) Popover */}
        {showMorePopover && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[min(340px,calc(100vw-1.5rem))] max-h-[75vh] overflow-y-auto rounded-2xl bg-slate-900/98 border border-slate-700/90 shadow-2xl backdrop-blur-2xl p-3 z-50 text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Ko'proq Asboblar
              </div>
              <button
                onClick={() => setShowMorePopover(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white active:scale-[0.96] transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* 1. Markup & Search */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                  Chizish & Qidirish
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Highlighter */}
                  <button
                    onClick={() => {
                      setActiveTool('highlighter');
                      setShowMorePopover(false);
                      setShowHighlighterPopover(true);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      activeTool === 'highlighter'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="relative">
                      <Highlighter className="w-4 h-4" />
                      <span
                        className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-slate-900"
                        style={{ backgroundColor: highlighterColor }}
                      />
                    </div>
                    <div className="flex-1 text-left truncate">Marker</div>
                    <kbd className="text-[10px] px-1 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">H</kbd>
                  </button>

                  {/* Eraser */}
                  <button
                    onClick={() => {
                      setActiveTool('eraser');
                      setShowMorePopover(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      activeTool === 'eraser'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Eraser className="w-4 h-4" />
                    <div className="flex-1 text-left truncate">O'chirg'ich</div>
                    <kbd className="text-[10px] px-1 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">E</kbd>
                  </button>

                  {/* Clear Canvas */}
                  <button
                    onClick={() => {
                      clearCanvas();
                      setShowMorePopover(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-medium bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-rose-300 active:scale-[0.96] transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                    <div className="flex-1 text-left truncate">Tozalash</div>
                    <kbd className="text-[10px] px-1 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">C</kbd>
                  </button>

                  {/* Slide Search */}
                  <button
                    onClick={() => {
                      toggleSlideSearch();
                      setShowMorePopover(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      isSlideSearchOpen
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <div className="flex-1 text-left truncate">Qidirish</div>
                    <kbd className="text-[10px] px-1 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">/</kbd>
                  </button>
                </div>
              </div>

              {/* 2. Classroom Widgets */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                  Interaktiv Mashg'ulot
                </div>
                <div className="space-y-1">
                  {/* Random Picker */}
                  <button
                    onClick={() => {
                      toggleRandomPicker();
                      setShowMorePopover(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      isRandomPickerOpen
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shuffle className="w-4 h-4 text-emerald-400" />
                      <span>Tasodifiy Talaba</span>
                    </div>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">R</kbd>
                  </button>

                  {/* Scoreboard */}
                  <button
                    onClick={() => {
                      toggleScoreboard();
                      setShowMorePopover(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      isScoreboardOpen
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span>Jamoalar Hisobi (Scoreboard)</span>
                    </div>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">G</kbd>
                  </button>

                  {/* Pedagogy Toolbox */}
                  <button
                    onClick={() => {
                      togglePedagogyModal();
                      setShowMorePopover(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      isPedagogyModalOpen
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Pedagogik Asboblar (Qo'ng'iroq, Qura...)</span>
                    </div>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">M</kbd>
                  </button>

                  {/* Translation Curtain */}
                  <button
                    onClick={() => {
                      toggleTranslationCurtain();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      isTranslationCurtainActive
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isTranslationCurtainActive ? (
                        <EyeOff className="w-4 h-4 text-amber-950" />
                      ) : (
                        <Eye className="w-4 h-4 text-sky-400" />
                      )}
                      <span>Lug'at Pardasi (Tarjima)</span>
                    </div>
                    <span className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isTranslationCurtainActive ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {isTranslationCurtainActive ? "Yopiq" : "Ochiq"}
                      </span>
                      <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">U</kbd>
                    </span>
                  </button>
                </div>
              </div>

              {/* 3. Screen & Utility */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                  Ekran & Eslatmalar
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Blackout */}
                  <button
                    onClick={() => toggleBlackout()}
                    className={`flex items-center gap-2 px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      isBlackout
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <div className="flex-1 text-left truncate">Qora ekran</div>
                    <kbd className="text-[10px] px-1 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">B</kbd>
                  </button>

                  {/* Whiteout */}
                  <button
                    onClick={() => toggleWhiteout()}
                    className={`flex items-center gap-2 px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      isWhiteout
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-300" />
                    <div className="flex-1 text-left truncate">Oq ekran</div>
                    <kbd className="text-[10px] px-1 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">W</kbd>
                  </button>

                  {/* Notes */}
                  <button
                    onClick={() => {
                      toggleSpeakerNotes();
                      setShowMorePopover(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      isSpeakerNotesOpen
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-sky-400" />
                    <div className="flex-1 text-left truncate">Eslatmalar</div>
                    <kbd className="text-[10px] px-1 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">N</kbd>
                  </button>

                  {/* QR Remote */}
                  <button
                    onClick={() => {
                      toggleQrRemote();
                      setShowMorePopover(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      isQrRemoteOpen
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-purple-400" />
                    <div className="flex-1 text-left truncate">QR Pult</div>
                    <kbd className="text-[10px] px-1 py-0.5 rounded bg-slate-900/60 font-mono text-slate-400">Q</kbd>
                  </button>
                </div>

                {/* Pin toolbar toggle */}
                <div className="mt-1.5">
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={`w-full flex items-center justify-between px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium active:scale-[0.96] transition-transform ${
                      isPinned
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isPinned ? (
                        <Pin className="w-4 h-4 text-blue-400 fill-current" />
                      ) : (
                        <PinOff className="w-4 h-4 text-slate-400" />
                      )}
                      <span>{isPinned ? "Panel doim ko'rinsin (Mahkamlangan)" : "Panelni pastga mahkamlash"}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {isPinned ? "Yoniq" : "O'chiq"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Button Bar: smoothly scrolls horizontally on narrow viewports, clean flex on desktop */}
        <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-white overflow-x-auto md:overflow-visible scrollbar-none max-w-full">
          {/* 1. Slide Navigation: Prev, Slide #, Next, (Search on md+) */}
          <div className="flex items-center gap-0.5 shrink-0">
            <TooltipButton
              label="Oldingi slayd"
              shortcut="←"
              onClick={prevSlide}
              icon={<ChevronLeft className="w-5 h-5 -translate-x-[0.5px]" />}
            />

            {/* Slide Counter / Jump to slide */}
            <button
              onClick={() => {
                setIsJumpOpen(!isJumpOpen);
                setShowPenPopover(false);
                setShowHighlighterPopover(false);
                setShowMorePopover(false);
              }}
              className="h-10 min-w-[40px] px-2 sm:px-2.5 rounded-xl hover:bg-slate-800 active:scale-[0.96] transition-transform text-xs font-mono tabular-nums font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1 shrink-0"
              title="Slaydga o'tish (raqamni bosing)"
            >
              <span className="tabular-nums">{currentSlideIndex + 1}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-400 tabular-nums">{totalSlides}</span>
            </button>

            <TooltipButton
              label="Keyingi slayd"
              shortcut="→ / Space"
              onClick={nextSlide}
              icon={<ChevronRight className="w-5 h-5 translate-x-[0.5px]" />}
            />

            {/* Slide Search (inline on md+, in More popover on mobile) */}
            <div className="hidden md:flex items-center">
              <TooltipButton
                label="Slaydlarni qidirish"
                shortcut="/"
                active={isSlideSearchOpen}
                onClick={() => toggleSlideSearch()}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

          {/* 2. Interactive Tools: Pointer, Pen, (Highlighter, Eraser, Clear on md+), Laser */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Pointer */}
            <TooltipButton
              label="Ko'rsatkich (Slaydni boshqarish)"
              shortcut="V"
              active={activeTool === 'pointer'}
              onClick={() => {
                setActiveTool('pointer');
                setShowPenPopover(false);
                setShowHighlighterPopover(false);
                setShowMorePopover(false);
              }}
              icon={<MousePointer className="w-4 h-4" />}
            />

            {/* Pen */}
            <TooltipButton
              label="Qalam (Chizish)"
              shortcut="P"
              active={activeTool === 'pen'}
              onClick={() => {
                if (activeTool === 'pen') {
                  setShowPenPopover(!showPenPopover);
                  setShowHighlighterPopover(false);
                  setShowMorePopover(false);
                } else {
                  setActiveTool('pen');
                  setShowHighlighterPopover(false);
                  setShowMorePopover(false);
                }
              }}
              icon={
                <div className="relative flex items-center justify-center">
                  <Pen className="w-4 h-4" />
                  <span
                    className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-slate-900 shadow-xs"
                    style={{ backgroundColor: penColor }}
                  />
                </div>
              }
            />

            {/* Highlighter (inline on md+, in More popover on mobile) */}
            <div className="hidden md:flex items-center">
              <TooltipButton
                label="Marker (Matnni ajratish)"
                shortcut="H"
                active={activeTool === 'highlighter'}
                onClick={() => {
                  if (activeTool === 'highlighter') {
                    setShowHighlighterPopover(!showHighlighterPopover);
                  } else {
                    setActiveTool('highlighter');
                    setShowPenPopover(false);
                    setShowMorePopover(false);
                  }
                }}
                icon={
                  <div className="relative flex items-center justify-center">
                    <Highlighter className="w-4 h-4" />
                    <span
                      className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-slate-900 shadow-xs"
                      style={{ backgroundColor: highlighterColor }}
                    />
                  </div>
                }
              />
            </div>

            {/* Eraser (inline on md+) */}
            <div className="hidden md:flex items-center">
              <TooltipButton
                label="O'chirg'ich"
                shortcut="E"
                active={activeTool === 'eraser'}
                onClick={() => {
                  setActiveTool('eraser');
                  setShowPenPopover(false);
                  setShowHighlighterPopover(false);
                  setShowMorePopover(false);
                }}
                icon={<Eraser className="w-4 h-4" />}
              />
            </div>

            {/* Clear Canvas (inline on md+) */}
            <div className="hidden md:flex items-center">
              <TooltipButton
                label="Doskani tozalash"
                shortcut="C"
                onClick={clearCanvas}
                icon={<Trash2 className="w-4 h-4" />}
              />
            </div>

            {/* Laser Pointer (Always visible) */}
            <TooltipButton
              label="Lazer ko'rsatgich"
              shortcut="L"
              active={activeTool === 'laser'}
              variant="laser"
              onClick={() => {
                setActiveTool(activeTool === 'laser' ? 'pointer' : 'laser');
                setShowPenPopover(false);
                setShowHighlighterPopover(false);
                setShowMorePopover(false);
              }}
              icon={<Sparkles className="w-4 h-4" />}
            />
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

          {/* 3. Classroom Widgets: Timer (Always visible with tabular-nums), (Random, Scoreboard, Pedagogy, Curtain on md+) */}
          <div className="flex items-center gap-0.5 shrink-0">
            <TooltipButton
              label={isTimerRunning ? `Taymer: ${formatTimerMinutes(timerSeconds)}` : "Taymer / Sekundomer"}
              shortcut="T"
              active={isTimerOpen || isTimerRunning}
              onClick={() => toggleTimer()}
              className={isTimerRunning ? "px-2.5 w-auto min-w-[58px]" : ""}
              icon={
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {isTimerRunning && (
                    <span className="text-[11px] font-mono tabular-nums font-bold text-amber-300">
                      {formatTimerMinutes(timerSeconds)}
                    </span>
                  )}
                </div>
              }
            />

            {/* Random Picker (inline on md+) */}
            <div className="hidden md:flex items-center">
              <TooltipButton
                label="Tasodifiy Talaba Tanlash"
                shortcut="R"
                active={isRandomPickerOpen}
                onClick={() => toggleRandomPicker()}
                icon={<Shuffle className="w-4 h-4" />}
              />
            </div>

            {/* Scoreboard (inline on md+) */}
            <div className="hidden md:flex items-center">
              <TooltipButton
                label="Jamoalar Hisobi (Scoreboard)"
                shortcut="G"
                active={isScoreboardOpen}
                onClick={() => toggleScoreboard()}
                icon={<Trophy className="w-4 h-4" />}
              />
            </div>

            {/* Pedagogical Toolbox (inline on md+) */}
            <div className="hidden md:flex items-center">
              <TooltipButton
                label="Pedagogik Asboblar (Qo'ng'iroq, Qura, Svetofor)"
                shortcut="M"
                active={isPedagogyModalOpen}
                onClick={() => togglePedagogyModal()}
                icon={<Sparkles className="w-4 h-4 text-amber-400" />}
              />
            </div>

            {/* Translation Curtain (inline on md+) */}
            <div className="hidden md:flex items-center">
              <TooltipButton
                label={
                  isTranslationCurtainActive
                    ? "Lug'at Pardasini ochish (Tarjimani ko'rsatish)"
                    : "Lug'at Pardasi (Tarjimani yashirish)"
                }
                shortcut="U"
                active={isTranslationCurtainActive}
                variant={isTranslationCurtainActive ? "warning" : "default"}
                onClick={() => toggleTranslationCurtain()}
                icon={
                  isTranslationCurtainActive ? (
                    <EyeOff className="w-4 h-4 text-amber-950" />
                  ) : (
                    <Eye className="w-4 h-4 text-sky-400" />
                  )
                }
              />
            </div>
          </div>

          {/* Desktop Divider */}
          <div className="hidden md:block h-6 w-px bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

          {/* 4. Display Modes: Blackout & Whiteout (inline on md+) */}
          <div className="hidden md:flex items-center gap-0.5 shrink-0">
            <TooltipButton
              label="Qora ekran (Blackout)"
              shortcut="B"
              active={isBlackout}
              onClick={() => toggleBlackout()}
              icon={<Moon className="w-4 h-4" />}
            />

            <TooltipButton
              label="Oq ekran (Whiteout)"
              shortcut="W"
              active={isWhiteout}
              onClick={() => toggleWhiteout()}
              icon={<Sun className="w-4 h-4" />}
            />
          </div>

          {/* Desktop Divider */}
          <div className="hidden md:block h-6 w-px bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

          {/* 5. Utilities: Notes & QR Remote (inline on md+) */}
          <div className="hidden md:flex items-center gap-0.5 shrink-0">
            <TooltipButton
              label="O'qituvchi Eslatmalari"
              shortcut="N"
              active={isSpeakerNotesOpen}
              onClick={() => toggleSpeakerNotes()}
              icon={<FileText className="w-4 h-4" />}
            />

            <TooltipButton
              label="Masofaviy Pult (QR)"
              shortcut="Q"
              active={isQrRemoteOpen}
              onClick={() => toggleQrRemote()}
              icon={<QrCode className="w-4 h-4" />}
            />
          </div>

          {/* Divider before Mobile More / End controls */}
          <div className="h-6 w-px bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

          {/* 6. Mobile "Ko'proq" (More) Popover Trigger (< md) */}
          <div className="flex md:hidden items-center shrink-0">
            <TooltipButton
              label="Ko'proq asboblar"
              active={showMorePopover || isAnySecondaryActive}
              onClick={() => {
                setShowMorePopover(!showMorePopover);
                setShowPenPopover(false);
                setShowHighlighterPopover(false);
                setIsJumpOpen(false);
              }}
              icon={
                <div className="relative flex items-center justify-center">
                  <MoreHorizontal className="w-5 h-5" />
                  {isAnySecondaryActive && !showMorePopover && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-pulse" />
                  )}
                </div>
              }
            />
          </div>

          {/* Mobile Divider before Fullscreen & Exit */}
          <div className="flex md:hidden h-6 w-px bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

          {/* 7. End Controls: Fullscreen, Pin (md+), Exit */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Fullscreen Button */}
            <TooltipButton
              label={isFullscreen ? "To'liq ekrandan chiqish" : "To'liq ekran"}
              shortcut="F"
              active={isFullscreen}
              onClick={() => toggleFullscreen()}
              icon={
                isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )
              }
            />

            {/* Pin / Unpin Auto-hide (inline on md+) */}
            <div className="hidden md:flex items-center">
              <TooltipButton
                label={isPinned ? 'Avto-yashirishni yoqish' : 'Panelni mahkamlash'}
                onClick={() => setIsPinned(!isPinned)}
                active={isPinned}
                icon={
                  isPinned ? (
                    <Pin className="w-3.5 h-3.5 text-blue-400 fill-current" />
                  ) : (
                    <PinOff className="w-3.5 h-3.5 text-slate-500" />
                  )
                }
              />
            </div>

            {/* Exit Lesson */}
            {onExit && (
              <TooltipButton
                label="Darsdan chiqish"
                shortcut="Esc"
                onClick={onExit}
                variant="danger"
                icon={<X className="w-4 h-4 text-rose-400" />}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
