import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePresentationStore, goToSlide, closeSlideSearch } from '@/store/presentationStore';
import {
  Search,
  X,
  Layers,
  BookOpen,
  HelpCircle,
  Columns,
  FileText,
  FileCode,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const SlideSearchModal: React.FC = () => {
  const isOpen = usePresentationStore((s) => s.isSlideSearchOpen);
  const lesson = usePresentationStore((s) => s.currentLesson);
  const currentSlideIndex = usePresentationStore((s) => s.currentSlideIndex);
  const totalSlides = usePresentationStore((s) => s.totalSlides);

  const [query, setQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedTemplate('all');
      setSelectedIndex(currentSlideIndex);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, currentSlideIndex]);

  // Slides data preparation
  const isPdf = lesson?.type === 'pdf-presentation';

  const slidesData = useMemo(() => {
    if (!lesson) return [];
    if (isPdf) {
      // PDF pages list
      return Array.from({ length: totalSlides }, (_, i) => ({
        index: i,
        title: `${lesson.title} — Sahifa ${i + 1}`,
        template: 'pdf-page',
        snippet: `PDF darslik sahifasi #${i + 1}`
      }));
    }

    return (lesson.slides || []).map((slide, idx) => {
      let snippet = '';
      if (slide.content) {
        const c = slide.content;
        switch (c.type) {
          case 'grammar-box':
            snippet = `${c.data.ruleTitle || ''} • ${c.data.explanation || ''} • ${
              c.data.formula?.map((f) => `${f.label}: ${f.text}`).join(' + ') || ''
            }`;
            break;
          case 'vocabulary-card':
            snippet = `${c.data.word || ''} (${c.data.partOfSpeech || ''}) — ${
              c.data.translation || ''
            } • ${c.data.definition || ''}`;
            break;
          case 'click-to-reveal':
            snippet = `Savol: ${c.data.question || ''} | Javob: ${c.data.hiddenAnswer || ''}`;
            break;
          case 'two-column':
            snippet = `${c.data.leftTitle || ''} vs ${c.data.rightTitle || ''}`;
            break;
          case 'blank':
            snippet = `${c.data.heading || ''} • ${c.data.paragraphs?.join(' ') || ''}`;
            break;
        }
      }

      return {
        index: idx,
        title: slide.title || `Slayd ${idx + 1}`,
        template: slide.template,
        snippet
      };
    });
  }, [lesson, isPdf, totalSlides]);

  // Filtered slides based on query and template filter
  const filteredSlides = useMemo(() => {
    let list = slidesData;

    if (selectedTemplate !== 'all') {
      list = list.filter((s) => s.template === selectedTemplate);
    }

    if (!query.trim()) return list;

    const q = query.toLowerCase().trim();

    // Check if query is a direct slide number (e.g., "3" or "#3")
    const numMatch = q.replace('#', '').trim();
    const asNum = parseInt(numMatch, 10);
    const hasNumMatch = !isNaN(asNum) && asNum >= 1 && asNum <= totalSlides;

    return list.filter((slide) => {
      if (hasNumMatch && slide.index + 1 === asNum) return true;
      const titleMatch = slide.title.toLowerCase().includes(q);
      const snippetMatch = slide.snippet.toLowerCase().includes(q);
      const templateMatch = slide.template.toLowerCase().includes(q);
      return titleMatch || snippetMatch || templateMatch;
    });
  }, [slidesData, query, selectedTemplate, totalSlides]);

  // Handle keyboard navigation inside search modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSlideSearch();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredSlides.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSlides[selectedIndex]) {
        goToSlide(filteredSlides[selectedIndex].index);
        closeSlideSearch();
      }
    }
  };

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case 'grammar-box':
        return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'vocabulary-card':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'click-to-reveal':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'two-column':
        return <Columns className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTemplateLabel = (template: string) => {
    switch (template) {
      case 'grammar-box':
        return 'Grammatika';
      case 'vocabulary-card':
        return 'Lug‘at';
      case 'click-to-reveal':
        return 'Savol-Javob';
      case 'two-column':
        return '2 Ustun';
      case 'blank':
        return 'Matn/Slayd';
      case 'pdf-page':
        return 'PDF Sahifa';
      default:
        return template;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={closeSlideSearch}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              aria-label="Slaydlarni qidirish"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Slaydlarni qidirish (mavzu, so'z, qoida yoki raqam)..."
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm md:text-base font-medium focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <kbd className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
              ESC
            </kbd>
            <button
              type="button"
              onClick={closeSlideSearch}
              aria-label="Qidiruv oynasini yopish"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-[0.96] ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Template Filter Pills */}
        {!isPdf && (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/50 border-b border-slate-800/60 overflow-x-auto text-xs">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Filtr:
            </span>
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'grammar-box', label: 'Grammar' },
              { id: 'vocabulary-card', label: 'Vocabulary' },
              { id: 'click-to-reveal', label: 'Quiz' },
              { id: 'two-column', label: '2 Ustun' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTemplate(tab.id);
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedTemplate === tab.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Slide Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filteredSlides.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              "{query}" bo'yicha hech qanday slayd topilmadi.
            </div>
          ) : (
            filteredSlides.map((item, idx) => {
              const isCurrent = item.index === currentSlideIndex;
              const isHighlighted = idx === selectedIndex;

              return (
                <button
                  type="button"
                  key={item.index}
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => {
                    goToSlide(item.index);
                    closeSlideSearch();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors duration-150 border ${
                    isCurrent
                      ? 'bg-blue-950/40 border-blue-500/50 text-white'
                      : isHighlighted
                      ? 'bg-slate-800/80 border-slate-700 text-white'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Slide number badge */}
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-xl font-mono text-xs font-bold shrink-0 border ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    #{item.index + 1}
                  </div>

                  {/* Slide content details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm truncate text-white">
                        {item.title}
                      </h4>
                      <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0">
                        {getTemplateIcon(item.template)}
                        <span>{getTemplateLabel(item.template)}</span>
                      </span>
                    </div>
                    {item.snippet && (
                      <p className="text-xs text-slate-400 truncate leading-relaxed">
                        {item.snippet}
                      </p>
                    )}
                  </div>

                  {/* Status / Jump action */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Hozirgi
                      </span>
                    ) : (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-blue-600 transition">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Jami slaydlar: <strong className="text-white">{totalSlides}</strong></span>
            <span>•</span>
            <span>Navigatsiya: <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300">↑</kbd> <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300">↓</kbd></span>
            <span>•</span>
            <span>Tanlash: <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300">Enter</kbd></span>
          </div>
          <div>
            Tezkor klavish: <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold">/</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
