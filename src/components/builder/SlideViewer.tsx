import React from 'react';
import { SlideItem } from '../../types';
import { GrammarBoxSlide } from './templates/GrammarBoxSlide';
import { VocabularyCardSlide } from './templates/VocabularyCardSlide';
import { ClickToRevealSlide } from './templates/ClickToRevealSlide';
import { TwoColumnSlide } from './templates/TwoColumnSlide';
import { BlankSlide } from './templates/BlankSlide';
import { AlertCircle } from 'lucide-react';
import { usePresentationStore } from '@/store/presentationStore';

export interface SlideViewerProps {
  slide?: SlideItem | null;
  mode?: 'preview' | 'full-screen' | 'presentation';
  revealStage?: number;
  onRevealChange?: (stage: number) => void;
  className?: string;
  footerText?: string;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({
  slide,
  mode,
  revealStage = 0,
  onRevealChange,
  className = '',
  footerText,
}) => {
  const isTranslationCurtainActive = usePresentationStore(
    (s) => s.isTranslationCurtainActive
  );

  if (!slide) {
    return (
      <div
        className={`w-full aspect-video flex flex-col items-center justify-center bg-slate-900 text-slate-400 rounded-2xl border border-slate-800 p-8 ${className}`}
      >
        <AlertCircle className="h-10 w-10 text-slate-600 mb-2" />
        <p className="text-sm font-medium">Hech qanday slayd tanlanmagan</p>
        <p className="text-xs text-slate-500">Iltimos, ko‘rish uchun slayd tanlang yoki yarating</p>
      </div>
    );
  }

  const isFullScreen = mode === 'full-screen' || mode === 'presentation';

  const renderContent = () => {
    const { template, content } = slide;

    switch (template) {
      case 'grammar-box': {
        const data =
          content.type === 'grammar-box'
            ? content.data
            : {
                ruleTitle: slide.title,
                formula: [],
                explanation: '',
                examples: [],
              };
        return (
          <GrammarBoxSlide
            data={data}
            isFullScreen={isFullScreen}
            hideTranslation={isTranslationCurtainActive}
            footerText={footerText}
          />
        );
      }

      case 'vocabulary-card': {
        const data =
          content.type === 'vocabulary-card'
            ? content.data
            : {
                word: slide.title,
                phonetic: '',
                partOfSpeech: '',
                definition: '',
                translation: '',
                exampleSentence: '',
              };
        return (
          <VocabularyCardSlide
            data={data}
            isFullScreen={isFullScreen}
            hideTranslation={isTranslationCurtainActive}
            footerText={footerText}
          />
        );
      }

      case 'click-to-reveal': {
        const data =
          content.type === 'click-to-reveal'
            ? content.data
            : {
                question: slide.title,
                hiddenAnswer: '',
                explanation: '',
              };
        return (
          <ClickToRevealSlide
            data={data}
            revealStage={revealStage}
            onRevealChange={onRevealChange}
            isFullScreen={isFullScreen}
            footerText={footerText}
          />
        );
      }

      case 'two-column': {
        const data =
          content.type === 'two-column'
            ? content.data
            : {
                leftTitle: 'Column 1',
                leftBadge: '',
                leftPoints: [],
                rightTitle: 'Column 2',
                rightBadge: '',
                rightPoints: [],
              };
        return <TwoColumnSlide data={data} isFullScreen={isFullScreen} footerText={footerText} />;
      }

      case 'blank': {
        const data =
          content.type === 'blank'
            ? content.data
            : {
                heading: slide.title,
                paragraphs: [],
              };
        return <BlankSlide data={data} isFullScreen={isFullScreen} footerText={footerText} />;
      }

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400">
            <AlertCircle className="h-8 w-8 text-amber-400 mb-2" />
            <p className="text-sm font-semibold">Noma’lum slayd shabloni: {template}</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none rounded-2xl shadow-xl border border-slate-200/80 bg-white flex flex-col ${className}`}
    >
      <div className="w-full h-full flex-1 min-h-0 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};
