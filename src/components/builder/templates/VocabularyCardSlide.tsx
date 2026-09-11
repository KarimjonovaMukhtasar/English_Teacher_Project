import React, { useState, useEffect } from 'react';
import { VocabularyContent } from '../../../types';
import { Volume2, Quote, BookOpen, Eye, EyeOff } from 'lucide-react';

interface VocabularyCardSlideProps {
  data: VocabularyContent;
  isFullScreen?: boolean;
  hideTranslation?: boolean;
  footerText?: string;
}

const PART_OF_SPEECH_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  noun: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  verb: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  adjective: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  adverb: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  preposition: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  idiom: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  phrasal_verb: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
};

export const VocabularyCardSlide: React.FC<VocabularyCardSlideProps> = ({
  data,
  isFullScreen = false,
  hideTranslation = false,
  footerText,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [accent, setAccent] = useState<'en-US' | 'en-GB'>('en-US');
  const [speed, setSpeed] = useState<number>(0.85);
  const [isRevealed, setIsRevealed] = useState(!hideTranslation);

  useEffect(() => {
    setIsRevealed(!hideTranslation);
  }, [hideTranslation, data.word]);

  // Cancel any ongoing speech synthesis on unmount or slide change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [data.word]);

  const handlePlayAudio = (textToPlay?: string) => {
    const text = textToPlay || data.word;
    if (!text) return;

    if (!textToPlay && data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      setIsPlayingAudio(true);
      audio.play().finally(() => setIsPlayingAudio(false));
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent;
      utterance.rate = speed;

      // Try selecting an English voice matching selected accent
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(
        (v) => v.lang.toLowerCase().replace('_', '-').startsWith(accent.toLowerCase())
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (targetVoice) utterance.voice = targetVoice;

      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const posStyle =
    PART_OF_SPEECH_STYLES[data.partOfSpeech?.toLowerCase()] || {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
    };

  return (
    <div
      className={`h-full w-full flex flex-col justify-between p-6 md:p-8 lg:p-10 bg-[#eaf5f3] text-slate-900 overflow-y-auto ${
        isFullScreen ? 'text-lg' : 'text-base'
      }`}
    >
      {/* Top Bar / Category Tag */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 mb-5 text-white">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-300 text-slate-950">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="text-xs uppercase tracking-wider text-cyan-100 font-bold">
            Vocabulary · pronunciation
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {/* Accent toggle: US vs UK */}
          <div className="flex items-center bg-white rounded-xl p-0.5 border border-slate-200" aria-label="Talaffuz aksenti">
            <button
              type="button"
              onClick={() => setAccent('en-US')}
              aria-pressed={accent === 'en-US'}
              className={`min-h-9 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                accent === 'en-US' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-brand-50'
              }`}
            >
              US
            </button>
            <button
              type="button"
              onClick={() => setAccent('en-GB')}
              aria-pressed={accent === 'en-GB'}
              className={`min-h-9 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                accent === 'en-GB' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-brand-50'
              }`}
            >
              UK
            </button>
          </div>

          {/* Speed toggle: 0.8x vs 1.0x */}
          <button
            type="button"
            onClick={() => setSpeed(speed === 0.85 ? 1.0 : 0.85)}
            className="min-h-9 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold hover:bg-brand-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            title="Talaffuz tezligi"
            aria-label={'Talaffuz tezligi: ' + (speed === 0.85 ? '0.8' : '1.0') + 'x'}
          >
            {speed === 0.85 ? '0.8×' : '1.0×'}
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left / Info Side */}
        <div className={`space-y-5 ${data.imageUrl ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {/* Main Word Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950 drop-shadow-2xs">
                {data.word || 'Vocabulary Word'}
              </h1>
              {data.partOfSpeech && (
                <span
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold uppercase tracking-wide border shadow-2xs ${posStyle.bg} ${posStyle.text} ${posStyle.border}`}
                >
                  {data.partOfSpeech}
                </span>
              )}
            </div>

            {/* Phonetic & Audio Pronunciation */}
            <div className="flex items-center gap-3 pt-1">
              {data.phonetic && (
                <span className="font-mono text-base md:text-xl text-brand-700 font-bold tracking-wide bg-brand-50 px-3 py-1 rounded-lg border border-brand-200">
                  {data.phonetic}
                </span>
              )}
              <button
                type="button"
                onClick={() => handlePlayAudio()}
                title="Talaffuzni tinglash"
                aria-label={'“' + data.word + '” so‘zining talaffuzini tinglash'}
                className={`min-h-11 flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-colors duration-200 border focus:outline-none focus:ring-4 focus:ring-brand-500/20 ${
                  isPlayingAudio
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white hover:bg-brand-50 text-brand-700 border-brand-300 active:scale-[0.98]'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Volume2 className="h-4 w-4 text-white" />
                    <span>Tinglanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 text-brand-600" />
                    <span>Tinglash ({accent === 'en-US' ? 'US' : 'UK'})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Definition Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              English Clinical Definition
            </div>
            <p className="text-base md:text-lg font-medium text-slate-900 leading-relaxed">
              {data.definition || 'Definition of the word goes here.'}
            </p>
          </div>

          {/* Uzbek Translation Card with Retrieval Blindfold Support */}
          {data.translation && (
            isRevealed ? (
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 md:p-5">
                <div className="flex items-center justify-between gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
                  <span>O‘zbekcha tibbiy ma’nosi</span>
                  {hideTranslation && (
                    <button
                      type="button"
                      onClick={() => setIsRevealed(false)}
                      className="min-h-9 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded"
                    >
                      Qayta yashirish
                    </button>
                  )}
                </div>
                <p className="text-lg md:text-2xl font-black text-emerald-900">
                  {data.translation}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsRevealed(true)}
                aria-label="O‘zbekcha tarjimani ochish"
                className="w-full text-left group bg-amber-50/80 hover:bg-amber-100/70 border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-2xl p-4 md:p-5 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/30"
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <EyeOff className="w-4 h-4 text-amber-600" />
                    <span>O‘zbekcha tarjima (parda tushirilgan)</span>
                  </span>
                  <span className="text-[11px] font-extrabold text-amber-700 group-hover:underline flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Ko'rish uchun bosing
                  </span>
                </div>
                <p className="text-xs md:text-sm font-semibold text-slate-500 italic mt-1.5">
                  Talabalardan so'z ma'nosini kontekst asosida topishni so'rang...
                </p>
              </button>
            )
          )}

          {/* Example Sentence */}
          {data.exampleSentence && (
            <div className="relative pl-5 border-l-4 border-brand-500 bg-brand-50/60 p-4 rounded-r-2xl text-slate-800 flex items-start justify-between gap-3">
              <div>
                <Quote className="h-4 w-4 text-brand-600/70 mb-1" />
                <p className="text-sm md:text-base italic font-semibold leading-relaxed text-slate-800">
                  "{data.exampleSentence}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePlayAudio(data.exampleSentence)}
                title="Gapni tinglash"
                aria-label="Misol gapni tinglash"
                className="min-h-11 min-w-11 shrink-0 p-2 rounded-xl bg-white hover:bg-brand-100 text-brand-700 border border-brand-200 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right / Image Side (if present) */}
        {data.imageUrl && (
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-slate-200 bg-white aspect-square flex items-center justify-center">
              <img
                src={data.imageUrl}
                alt={data.word}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute bottom-3 left-4 right-4 rounded-md bg-slate-950/80 px-2 py-1 text-xs text-white font-bold truncate">
                {data.word}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
