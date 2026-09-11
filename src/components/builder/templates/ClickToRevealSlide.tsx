import React, { useEffect, useId, useState } from 'react';
import { ClickToRevealContent } from '../../../types';
import { HelpCircle, Lightbulb, CheckCircle2, Eye, RotateCcw, LockKeyhole } from 'lucide-react';

interface ClickToRevealSlideProps {
  data: ClickToRevealContent;
  revealStage?: number;
  onRevealChange?: (stage: number) => void;
  isFullScreen?: boolean;
  footerText?: string;
}

export const ClickToRevealSlide: React.FC<ClickToRevealSlideProps> = ({
  data,
  revealStage = 0,
  onRevealChange,
  isFullScreen = false,
  footerText,
}) => {
  const [internalRevealed, setInternalRevealed] = useState(revealStage > 0);
  const [showHint, setShowHint] = useState(false);
  const hintId = useId();
  const answerId = useId();

  // Sync with external revealStage (e.g. from presenter remote / viewer)
  useEffect(() => {
    setInternalRevealed(revealStage > 0);
  }, [revealStage]);

  const handleToggleReveal = () => {
    const nextState = !internalRevealed;
    setInternalRevealed(nextState);
    if (onRevealChange) {
      onRevealChange(nextState ? 1 : 0);
    }
  };
  const canRevealFromSlide = !isFullScreen && Boolean(onRevealChange);

  return (
    <div
      className={`h-full w-full flex flex-col justify-between p-6 md:p-8 lg:p-10 bg-[#eaf5f3] text-slate-900 overflow-y-auto ${
        isFullScreen ? 'text-lg' : 'text-base'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 mb-5 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-slate-950">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-100 font-bold">
              Tekshir va asosla
            </span>
            {data.badge && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-300 text-slate-950">
                {data.badge}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.hint && (
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              aria-expanded={showHint}
              aria-controls={hintId}
              className={`min-h-11 flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-colors duration-200 border focus:outline-none focus:ring-4 focus:ring-brand-500/20 ${
                showHint
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white hover:bg-brand-50 text-slate-700 border-slate-200 active:scale-[0.98]'
              }`}
            >
              <Lightbulb className={`h-3.5 w-3.5 ${showHint ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>{showHint ? 'Yashirish (Hide Hint)' : 'Maslahat (Hint)'}</span>
            </button>
          )}

          {internalRevealed && canRevealFromSlide && (
            <button
              type="button"
              onClick={handleToggleReveal}
              title="Qayta yashirish"
              aria-label="Javobni qayta yashirish"
              className="min-h-11 flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white hover:bg-brand-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Qayta yashirish</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Challenge Content */}
      <div className="flex-1 flex flex-col justify-center space-y-6 max-w-4xl mx-auto w-full">
        {/* Question Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-center space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            Savol / Klinik Holat:
          </div>
          <h2 className="text-xl md:text-3xl font-black text-white leading-relaxed">
            {data.question || 'Savol matni kiritilmagan'}
          </h2>
        </div>

        {/* Collapsible Hint */}
        {showHint && data.hint && (
          <div id={hintId} className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900 text-sm md:text-base">
            <Lightbulb className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <strong className="text-amber-950 font-bold">Maslahat (Clinical Hint): </strong>
              <span className="font-medium">{data.hint}</span>
            </div>
          </div>
        )}

        {/* Answer Card (Hidden vs Revealed) */}
        <div className="w-full">
          {!internalRevealed ? (
            <div
              {...(canRevealFromSlide
                ? {
                    role: 'button',
                    tabIndex: 0,
                    onClick: handleToggleReveal,
                    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleToggleReveal();
                      }
                    },
                    'aria-expanded': internalRevealed,
                    'aria-controls': answerId,
                  }
                : {})}
              className={`group w-full min-h-44 py-8 px-6 rounded-3xl bg-white border-2 border-dashed border-brand-500 text-center flex flex-col items-center justify-center gap-3 ${
                canRevealFromSlide
                  ? 'cursor-pointer hover:bg-cyan-50 hover:border-brand-700 active:scale-[0.99] transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/20'
                  : 'cursor-default'
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 border border-brand-200 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200">
                <Eye className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="text-base md:text-lg font-bold text-slate-900 group-hover:text-brand-800 transition-colors duration-200">
                  {canRevealFromSlide ? 'Javobni previewda ochish' : 'Javob ustoz nazoratida'}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {canRevealFromSlide
                    ? 'Avval o‘zingizning dalilingizni ayting, keyin tekshiring.'
                    : 'O‘qituvchi keyingi boshqaruvni bir marta bosganda javob chiqadi.'}
                </p>
              </div>
              {!canRevealFromSlide && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                  <LockKeyhole className="h-3.5 w-3.5" /> O‘qituvchi rejimi
                </span>
              )}
            </div>
          ) : (
            /* Revealed Card with smooth scale & fade-in */
            <div id={answerId} className="w-full rounded-3xl bg-emerald-50 border border-emerald-300 p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <span className="text-xs md:text-sm font-black uppercase tracking-wider">
                  Javob va klinik izoh
                </span>
              </div>

              {/* Bold Answer */}
              <div className="text-2xl md:text-4xl font-black text-emerald-950 tracking-tight">
                {data.hiddenAnswer}
              </div>

              {/* In-depth Explanation */}
              {data.explanation && (
                <div className="pt-3 border-t border-emerald-200 text-slate-800 text-sm md:text-base font-medium leading-relaxed">
                  <span className="font-bold text-emerald-900">Klinik Izoh: </span>
                  {data.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom status */}
      <div className="text-center text-xs text-slate-600 font-medium mt-4">
        <span>{footerText || 'tilchi.uz • Interaktiv Darslik'}</span>
      </div>
    </div>
  );
};
