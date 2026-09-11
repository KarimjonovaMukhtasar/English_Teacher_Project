import React from 'react';
import { GrammarRuleContent } from '../../../types';
import { BookOpen, Eye, Lightbulb } from 'lucide-react';

interface GrammarBoxSlideProps {
  data: GrammarRuleContent;
  isFullScreen?: boolean;
  hideTranslation?: boolean;
  footerText?: string;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue: {
    bg: 'bg-blue-50/90 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-600',
    text: 'text-blue-950 dark:text-blue-200',
    badge: 'bg-blue-100 text-blue-900 border border-blue-300 font-bold',
  },
  indigo: {
    bg: 'bg-indigo-50/90 dark:bg-indigo-950/40',
    border: 'border-indigo-300 dark:border-indigo-600',
    text: 'text-indigo-950 dark:text-indigo-200',
    badge: 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold',
  },
  emerald: {
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-600',
    text: 'text-emerald-950 dark:text-emerald-200',
    badge: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
  },
  green: {
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-600',
    text: 'text-emerald-950 dark:text-emerald-200',
    badge: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
  },
  amber: {
    bg: 'bg-amber-50/90 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-600',
    text: 'text-amber-950 dark:text-amber-200',
    badge: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
  },
  yellow: {
    bg: 'bg-amber-50/90 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-600',
    text: 'text-amber-950 dark:text-amber-200',
    badge: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
  },
  purple: {
    bg: 'bg-purple-50/90 dark:bg-purple-950/40',
    border: 'border-purple-300 dark:border-purple-600',
    text: 'text-purple-950 dark:text-purple-200',
    badge: 'bg-purple-100 text-purple-900 border border-purple-300 font-bold',
  },
  rose: {
    bg: 'bg-rose-50/90 dark:bg-rose-950/40',
    border: 'border-rose-300 dark:border-rose-600',
    text: 'text-rose-950 dark:text-rose-200',
    badge: 'bg-rose-100 text-rose-900 border border-rose-300 font-bold',
  },
  red: {
    bg: 'bg-rose-50/90 dark:bg-rose-950/40',
    border: 'border-rose-300 dark:border-rose-600',
    text: 'text-rose-950 dark:text-rose-200',
    badge: 'bg-rose-100 text-rose-900 border border-rose-300 font-bold',
  },
  brand: {
    bg: 'bg-brand-50/90 dark:bg-brand-950/40',
    border: 'border-brand-300 dark:border-brand-600',
    text: 'text-brand-950 dark:text-brand-200',
    badge: 'bg-brand-100 text-brand-900 border border-brand-300 font-bold',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    border: 'border-slate-300 dark:border-slate-600',
    text: 'text-slate-900 dark:text-slate-200',
    badge: 'bg-slate-200 text-slate-900 border border-slate-300 font-bold',
  },
};

function getFormulaColorConfig(color?: string) {
  if (!color) return COLOR_MAP.brand;
  const lower = color.toLowerCase();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  if (lower.includes('indigo')) return COLOR_MAP.indigo;
  if (lower.includes('emerald') || lower.includes('green')) return COLOR_MAP.emerald;
  if (lower.includes('rose') || lower.includes('red')) return COLOR_MAP.rose;
  if (lower.includes('amber') || lower.includes('yellow')) return COLOR_MAP.amber;
  if (lower.includes('purple')) return COLOR_MAP.purple;
  if (lower.includes('blue')) return COLOR_MAP.blue;
  if (lower.includes('brand')) return COLOR_MAP.brand;
  if (lower.includes('slate') || lower.includes('gray')) return COLOR_MAP.slate;
  return COLOR_MAP.brand;
}

function highlightSentence(sentence: string, highlightWord: string) {
  if (!highlightWord || !highlightWord.trim()) {
    return sentence;
  }

  const escaped = highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = sentence.split(new RegExp(`(${escaped})`, 'gi'));

  return parts.map((part, i) =>
    part.toLowerCase() === highlightWord.toLowerCase() ? (
      <span
        key={i}
        className="inline-block px-1.5 py-0.5 rounded-md bg-amber-400/25 text-amber-900 dark:text-amber-200 font-bold underline decoration-amber-500 decoration-2 underline-offset-2"
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export const GrammarBoxSlide: React.FC<GrammarBoxSlideProps> = ({
  data,
  isFullScreen = false,
  hideTranslation = false,
  footerText,
}) => {
  const [revealedIdxs, setRevealedIdxs] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    setRevealedIdxs({});
  }, [hideTranslation, data.ruleTitle]);

  const toggleRevealIdx = (idx: number) => {
    setRevealedIdxs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };
  return (
    <div
      className={`h-full w-full flex flex-col justify-between p-6 md:p-8 lg:p-10 bg-[#eaf5f3] text-slate-900 overflow-y-auto ${
        isFullScreen ? 'text-lg' : 'text-base'
      }`}
    >
      {/* Header / Title */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 mb-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-slate-950">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-100 font-bold">
              Clinical grammar
            </span>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white">
              {data.ruleTitle || 'Grammar Rule Title'}
            </h1>
          </div>
        </div>
        <div className="hidden sm:block px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600">
          Formula va klinik qo‘llash
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center space-y-5">
        {/* Formula Boxes Row */}
        {data.formula && data.formula.length > 0 && (
          <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 md:p-6 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Sentence Formula:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
              {data.formula.map((item, index) => {
                const colorConfig = getFormulaColorConfig(item.color);
                return (
                  <React.Fragment key={index}>
                    <div
                      className={`flex flex-col items-center justify-center px-4 py-3 md:px-5 md:py-3.5 rounded-xl border-2 ${colorConfig.bg} ${colorConfig.border}`}
                    >
                      <span
                        className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1.5 ${colorConfig.badge}`}
                      >
                        {item.label}
                      </span>
                      <span className={`text-base md:text-xl font-black ${colorConfig.text}`}>
                        {item.text}
                      </span>
                    </div>
                    {index < data.formula.length - 1 && (
                      <span className="text-2xl md:text-3xl font-black text-brand-600 select-none">
                        +
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
        {/* Explanation Card */}
        {data.explanation && (
          <div className="bg-sky-50/80 border-l-4 border-sky-600 rounded-r-xl p-3.5 md:p-4 text-slate-900 text-sm md:text-base font-medium leading-relaxed shadow-2xs">
            <p>{data.explanation}</p>
          </div>
        )}

        {/* Examples Section */}
        {data.examples && data.examples.length > 0 && (
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clinical Examples:
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {data.examples.map((eg, idx) => (
                  <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 md:p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-sky-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {idx + 1}
                    </span>
                    <p className="text-sm md:text-base font-semibold text-slate-900">
                      {highlightSentence(eg.sentence, eg.highlightWord)}
                    </p>
                  </div>
                  {eg.translation && (
                    hideTranslation && !revealedIdxs[idx] ? (
                      <button
                        onClick={() => toggleRevealIdx(idx)}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-bold bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-dashed border-amber-300 shrink-0 self-start sm:self-auto transition cursor-pointer"
                        title="Tarjimani ko'rish uchun bosing"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Tarjimani ko'rish
                      </button>
                    ) : hideTranslation ? (
                      <button
                        type="button"
                        onClick={() => toggleRevealIdx(idx)}
                        className="min-h-9 text-xs text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 self-start sm:self-auto transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        title="Tarjimani yashirish uchun bosing"
                      >
                        {eg.translation}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 self-start sm:self-auto">
                        {eg.translation}
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Note Card */}
        {data.note && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs md:text-sm">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <p className="font-semibold">{data.note}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 font-medium mt-4">
        {footerText || 'tilchi.uz • Interaktiv Darslik'}
      </div>
    </div>
  );
};
