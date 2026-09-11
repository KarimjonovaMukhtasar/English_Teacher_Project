import React, { useState, useEffect } from 'react';
import {
  Lesson,
  SlideItem,
  TemplateType,
  GrammarRuleContent,
  VocabularyContent,
  ClickToRevealContent,
  TwoColumnContent,
  BlankContent,
} from '../../types';
import { SlideViewer } from './SlideViewer';
import { saveLesson } from '../../db';
import { SlideGeneratorModal } from './SlideGeneratorModal';
import {
  X,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  BookOpen,
  Sparkles,
  HelpCircle,
  SplitSquareVertical,
  Presentation,
  Maximize2,
  Check,
  FileText,
  Eye,
  Wand2,
} from 'lucide-react';

interface SlideBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLesson?: Lesson | null;
  onSave?: (savedLesson: Lesson) => void;
}

const TEMPLATE_OPTIONS: { type: TemplateType; label: string; icon: React.ElementType; description: string }[] = [
  {
    type: 'grammar-box',
    label: 'Grammar Box',
    icon: BookOpen,
    description: 'Formula capsules, explanation & highlighted examples',
  },
  {
    type: 'vocabulary-card',
    label: 'Vocabulary Card',
    icon: Sparkles,
    description: 'Word, phonetics, part of speech, translation & image',
  },
  {
    type: 'click-to-reveal',
    label: 'Click to Reveal',
    icon: HelpCircle,
    description: 'Interactive question, hint & animated hidden answer',
  },
  {
    type: 'two-column',
    label: 'Two Column',
    icon: SplitSquareVertical,
    description: 'Band 5 vs Band 8 or comparison points side-by-side',
  },
  {
    type: 'blank',
    label: 'Blank Slide',
    icon: Presentation,
    description: 'Freeform slide with heading, paragraphs & optional image',
  },
];

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Ko‘k (Blue)' },
  { value: 'emerald', label: 'Yashil (Emerald)' },
  { value: 'amber', label: 'Sariq (Amber)' },
  { value: 'purple', label: 'Binafsha (Purple)' },
  { value: 'rose', label: 'Qizil (Rose)' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'slate', label: 'Kulrang (Slate)' },
];

function getDefaultSlideContent(template: TemplateType, title: string) {
  switch (template) {
    case 'grammar-box':
      return {
        type: 'grammar-box' as const,
        data: {
          ruleTitle: title || 'Grammar Rule',
          formula: [
            { label: 'Subject', text: 'I / You / We / They', color: 'blue' },
            { label: 'Verb', text: 'study / work', color: 'emerald' },
            { label: 'Object', text: 'English', color: 'amber' },
          ],
          explanation: 'Qoidaning batafsil izohi (Detailed explanation of this grammatical structure).',
          examples: [
            {
              sentence: 'They study English every afternoon.',
              highlightWord: 'study',
              translation: 'Ular har kuni tushdan keyin ingliz tilini o‘rganishadi.',
            },
          ],
          note: 'Eslatma: 3-shaxs birlikda fe’lga -s/-es qo‘shiladi.',
        } as GrammarRuleContent,
      };

    case 'vocabulary-card':
      return {
        type: 'vocabulary-card' as const,
        data: {
          word: title || 'Perserverance',
          phonetic: '/ˌpɜː.sɪˈvɪə.rəns/',
          partOfSpeech: 'noun',
          definition: 'Persistence in doing something despite difficulty or delay in achieving success.',
          translation: 'Tirishqoqlik, sabot, qat’iyat',
          exampleSentence: 'Success requires both natural talent and unwavering perseverance.',
          imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
        } as VocabularyContent,
      };

    case 'click-to-reveal':
      return {
        type: 'click-to-reveal' as const,
        data: {
          badge: 'Speaking Challenge 🎯',
          question: 'What is the correct past tense form of "go" and "think"?',
          hint: 'Both are irregular verbs.',
          hiddenAnswer: 'went & thought',
          explanation: 'The past simple form of "go" is "went", and "think" becomes "thought".',
        } as ClickToRevealContent,
      };

    case 'two-column':
      return {
        type: 'two-column' as const,
        data: {
          leftTitle: 'Band 5.0 (Common Mistakes)',
          leftBadge: 'Incorrect / Weak',
          leftPoints: [
            'Very simple vocabulary with repeated words.',
            'Frequent grammatical inaccuracies in verb tenses.',
            'Short sentences with no clear connectors.',
          ],
          rightTitle: 'Band 8.0+ (Academic English)',
          rightBadge: 'Correct / Strong',
          rightPoints: [
            'Sophisticated vocabulary and idiomatic phrases.',
            'Flawless use of complex grammar structures.',
            'Cohesive transition devices across all sentences.',
          ],
        } as TwoColumnContent,
      };

    case 'blank':
    default:
      return {
        type: 'blank' as const,
        data: {
          heading: title || 'Slide Heading',
          subheading: 'Subtitle or key topic',
          paragraphs: [
            'Dars matni yoki muhim xulosalar bu yerda yoziladi.',
            'Key concepts and summary points for the students.',
          ],
        } as BlankContent,
      };
  }
}

export const SlideBuilderModal: React.FC<SlideBuilderModalProps> = ({
  isOpen,
  onClose,
  initialLesson,
  onSave,
}) => {
  const [lessonTitle, setLessonTitle] = useState('New English Lesson');
  const [category, setCategory] = useState('Grammar');
  const [level, setLevel] = useState<Lesson['level']>('Intermediate');
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [testRevealStage, setTestRevealStage] = useState(0);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleLessonGenerated = (generatedLesson: Lesson) => {
    if (generatedLesson.title) setLessonTitle(generatedLesson.title);
    if (generatedLesson.category) setCategory(generatedLesson.category);
    if (generatedLesson.level) setLevel(generatedLesson.level);
    if (generatedLesson.slides && generatedLesson.slides.length > 0) {
      setSlides(generatedLesson.slides);
      setActiveSlideId(generatedLesson.slides[0].id);
    }
    setIsGeneratorOpen(false);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  // Initialize data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialLesson) {
      setLessonTitle(initialLesson.title || 'Untitled Lesson');
      setCategory(initialLesson.category || 'Grammar');
      setLevel(initialLesson.level || 'Intermediate');
      const loadedSlides: SlideItem[] = initialLesson.slides && initialLesson.slides.length > 0
        ? initialLesson.slides
        : [
            {
              id: 'slide-1',
              title: 'Welcome & Objectives',
              template: 'blank' as TemplateType,
              order: 0,
              speakerNotes: '',
              content: getDefaultSlideContent('blank', 'Welcome & Objectives'),
            },
          ];
      setSlides(loadedSlides);
      setActiveSlideId(loadedSlides[0]?.id || '');
    } else {
      setLessonTitle('New English Lesson');
      setCategory('Grammar');
      setLevel('Intermediate');
      const initialSlide: SlideItem = {
        id: 'slide-' + Date.now(),
        title: 'Grammar Rule',
        template: 'grammar-box',
        order: 0,
        speakerNotes: 'Briefly explain the rule before presenting examples.',
        content: getDefaultSlideContent('grammar-box', 'Grammar Rule'),
      };
      setSlides([initialSlide]);
      setActiveSlideId(initialSlide.id);
    }
    setTestRevealStage(0);
  }, [isOpen, initialLesson]);

  if (!isOpen) return null;

  const activeSlide = slides.find((s) => s.id === activeSlideId) || slides[0];

  // Helper to update active slide
  const updateActiveSlide = (updater: (prev: SlideItem) => SlideItem) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === activeSlide?.id ? updater(s) : s))
    );
  };

  // Add Slide
  const handleAddSlide = (template: TemplateType = 'grammar-box') => {
    const newSlideId = 'slide-' + Date.now();
    const newOrder = slides.length;
    const title = `Slide ${newOrder + 1}`;
    const newSlide: SlideItem = {
      id: newSlideId,
      title,
      template,
      order: newOrder,
      speakerNotes: '',
      content: getDefaultSlideContent(template, title),
    };

    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideId(newSlideId);
    setTestRevealStage(0);
  };

  // Delete Slide
  const handleDeleteSlide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) {
      alert('Darsda kamida 1 ta slayd bo‘lishi kerak!');
      return;
    }

    const filtered = slides.filter((s) => s.id !== id);
    // Re-index order
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx }));
    setSlides(reordered);

    if (activeSlideId === id) {
      setActiveSlideId(reordered[0].id);
    }
  };

  // Duplicate Slide
  const handleDuplicateSlide = (slide: SlideItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSlide: SlideItem = {
      ...JSON.parse(JSON.stringify(slide)),
      id: 'slide-' + Date.now(),
      title: `${slide.title} (Nusxa)`,
      order: slides.length,
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideId(newSlide.id);
  };

  // Move Slide Up
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const updated = [...slides];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    // update order
    updated.forEach((s, idx) => (s.order = idx));
    setSlides(updated);
  };

  // Move Slide Down
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === slides.length - 1) return;
    const updated = [...slides];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    // update order
    updated.forEach((s, idx) => (s.order = idx));
    setSlides(updated);
  };

  // Switch Template for current slide
  const handleTemplateChange = (newTemplate: TemplateType) => {
    if (!activeSlide || activeSlide.template === newTemplate) return;
    updateActiveSlide((s) => ({
      ...s,
      template: newTemplate,
      content: getDefaultSlideContent(newTemplate, s.title),
    }));
    setTestRevealStage(0);
  };

  // Save Lesson to Dexie
  const handleSaveLesson = async () => {
    setIsSaving(true);
    try {
      const lessonToSave: Lesson = {
        id: initialLesson?.id || 'lesson-' + Date.now(),
        title: lessonTitle.trim() || 'Untitled Lesson',
        category,
        level,
        type: 'interactive-slides',
        slides,
        createdAt: initialLesson?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await saveLesson(lessonToSave);

      if (onSave) {
        onSave(lessonToSave);
      }

      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    } catch (err) {
      console.error('Save lesson failed:', err);
      alert('Darsni saqlashda xatolik yuz berdi!');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGeneratorOpen) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveLesson();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lessonTitle, category, level, slides, isGeneratorOpen]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Yopish (Close)"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Lesson Title Input */}
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Dars mavzusini kiriting..."
              className="bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/80 focus:border-brand-500 rounded-xl px-3 py-1.5 text-base font-bold text-white focus:outline-none transition w-full max-w-sm truncate"
            />

            {/* Category Selector */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="hidden sm:block bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="Grammar">Grammar</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="IELTS">IELTS</option>
              <option value="Speaking">Speaking</option>
              <option value="General English">General English</option>
              <option value="Reading">Reading</option>
              <option value="Writing">Writing</option>
            </select>

            {/* Level Selector */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Lesson['level'])}
              className="hidden md:block bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Elementary">Elementary</option>
              <option value="Pre-Intermediate">Pre-Intermediate</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Upper-Intermediate">Upper-Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {showSaveToast && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl animate-fadeIn">
              <Check className="h-4 w-4" />
              <span>Saqlandi (Cmd+S)!</span>
            </div>
          )}

          {/* Smart Generator Launcher */}
          <button
            type="button"
            onClick={() => setIsGeneratorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-[0.96] transition-transform duration-150"
            title="Mavzu bo‘yicha avtomatik slaydlar generatsiya qilish"
          >
            <Sparkles className="h-3.5 w-3.5 fill-current text-slate-950" />
            <span className="hidden sm:inline">✨ Aqlli Generator</span>
          </button>

          <button
            type="button"
            onClick={handleSaveLesson}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.96] transition-transform duration-150 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 disabled:opacity-50"
            title="Saqlash (Cmd+S)"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saqlanmoqda...' : 'Darsni Saqlash'}</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= LEFT DRAWER: Slide List ================= */}
        <aside className="w-64 md:w-72 bg-slate-900/70 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Slaydlar (<span className="font-mono tabular-nums">{slides.length}</span>)
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-[0.96] transition-transform duration-150 text-white text-xs font-bold shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Slayd</span>
              </button>

              {showAddMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSlide('grammar-box');
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150 text-slate-200 hover:text-white"
                  >
                    <BookOpen className="h-4 w-4 text-brand-400" />
                    <span>Qoida (Grammar Box)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSlide('vocabulary-card');
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150 text-slate-200 hover:text-white"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span>So‘z kartasi (Vocabulary)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSlide('click-to-reveal');
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150 text-slate-200 hover:text-white"
                  >
                    <HelpCircle className="h-4 w-4 text-purple-400" />
                    <span>Test (Click-to-Reveal)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSlide('two-column');
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150 text-slate-200 hover:text-white"
                  >
                    <SplitSquareVertical className="h-4 w-4 text-amber-400" />
                    <span>Taqqoslash (Two Column)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSlide('blank');
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150 text-slate-200 hover:text-white"
                  >
                    <Presentation className="h-4 w-4 text-rose-400" />
                    <span>Erkin slayd (Blank)</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMenu(false);
                      setIsGeneratorOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.96] transition-transform duration-150 text-amber-400 font-semibold"
                  >
                    <Wand2 className="h-4 w-4 text-amber-400" />
                    <span>✨ Aqlli Generator ochish</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Slide List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {slides.map((slide, index) => {
              const isActive = slide.id === activeSlide?.id;
              const TemplateIcon =
                TEMPLATE_OPTIONS.find((t) => t.type === slide.template)?.icon || Presentation;

              return (
                <div
                  key={slide.id}
                  onClick={() => {
                    setActiveSlideId(slide.id);
                    setTestRevealStage(0);
                  }}
                  className={`group relative rounded-xl p-2.5 border transition cursor-pointer flex flex-col gap-2 ${
                    isActive
                      ? 'bg-brand-600/15 border-brand-500 shadow-md shadow-brand-500/10'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  {/* Top line: Index, Title & Template badge */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-slate-700 text-[11px] font-bold font-mono tabular-nums text-slate-300">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-white truncate">
                        {slide.title || `Slide ${index + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <TemplateIcon className="h-3.5 w-3.5 text-brand-400" />
                    </div>
                  </div>

                  {/* Template description label */}
                  <div className="text-[10px] text-slate-400 truncate pl-7">
                    {slide.template}
                  </div>

                  {/* Slide Action Buttons */}
                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-700/40 opacity-80 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => handleMoveUp(index, e)}
                      title="Yuqoriga surish"
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === slides.length - 1}
                      onClick={(e) => handleMoveDown(index, e)}
                      title="Pastga surish"
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDuplicateSlide(slide, e)}
                      title="Nusxalash"
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSlide(slide.id, e)}
                      title="O‘chirish"
                      className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ================= CENTER: Live Slide Preview & Speaker Notes ================= */}
        <main className="flex-1 flex flex-col bg-slate-950/60 overflow-hidden">
          {/* Top toolbar */}
          <div className="h-11 border-b border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-200 font-mono tabular-nums">
                Slayd {slides.findIndex((s) => s.id === activeSlide?.id) + 1} / {slides.length}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 uppercase font-mono tracking-wider">
                {activeSlide?.template}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeSlide?.template === 'click-to-reveal' && (
                <button
                  type="button"
                  onClick={() => setTestRevealStage((prev) => (prev > 0 ? 0 : 1))}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                    testRevealStage > 0
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-800 text-purple-300 border-purple-500/30 hover:bg-slate-700'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{testRevealStage > 0 ? 'Yashirish (Hide)' : 'Ko‘rish (Reveal)'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsFullScreenPreview(!isFullScreenPreview)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                title="To‘liq ekran (Full Screen)"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>To‘liq ekran</span>
              </button>
            </div>
          </div>

          {/* Live Preview Area */}
          <div className="flex-1 p-4 md:p-6 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-4xl max-h-full">
              <SlideViewer
                slide={activeSlide}
                mode="preview"
                revealStage={testRevealStage}
                onRevealChange={setTestRevealStage}
                footerText={`${category} • ${level}`}
              />
            </div>
          </div>

          {/* Bottom Speaker Notes Drawer */}
          <div className="border-t border-slate-800 bg-slate-900/80 p-3 shrink-0">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-300">
              <FileText className="h-3.5 w-3.5 text-brand-400" />
              <span>O‘qituvchi eslatmalari (Speaker Notes - faqat o‘qituvchiga ko‘rinadi):</span>
            </div>
            <textarea
              value={activeSlide?.speakerNotes || ''}
              onChange={(e) =>
                updateActiveSlide((s) => ({ ...s, speakerNotes: e.target.value }))
              }
              rows={2}
              placeholder="Dars paytida ushbu slayd haqida eslatmalar yozib qoldiring..."
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition resize-none"
            />
          </div>
        </main>

        {/* ================= RIGHT PANEL: Template Selector & Dynamic Form ================= */}
        <aside className="w-80 md:w-96 bg-slate-900/90 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Slayd Sozlamalari
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Shablonni tanlang va ma’lumotlarni kiriting
            </p>
          </div>

          {/* Active Slide Title */}
          <div className="p-4 border-b border-slate-800 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Slayd Nomi (Title):</label>
            <input
              type="text"
              value={activeSlide?.title || ''}
              onChange={(e) =>
                updateActiveSlide((s) => ({ ...s, title: e.target.value }))
              }
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Template Selector Options */}
          <div className="p-4 border-b border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Shablon turi (Template):</label>
            <div className="grid grid-cols-1 gap-2">
              {TEMPLATE_OPTIONS.map((tmpl) => {
                const isSelected = activeSlide?.template === tmpl.type;
                const Icon = tmpl.icon;
                return (
                  <button
                    key={tmpl.type}
                    type="button"
                    onClick={() => handleTemplateChange(tmpl.type)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-none mb-1">{tmpl.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {tmpl.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Content Form */}
          <div className="p-4 space-y-5 flex-1">
            {activeSlide?.template === 'grammar-box' && (
              <GrammarBoxForm
                slide={activeSlide}
                updateActiveSlide={updateActiveSlide}
              />
            )}

            {activeSlide?.template === 'vocabulary-card' && (
              <VocabularyCardForm
                slide={activeSlide}
                updateActiveSlide={updateActiveSlide}
              />
            )}

            {activeSlide?.template === 'click-to-reveal' && (
              <ClickToRevealForm
                slide={activeSlide}
                updateActiveSlide={updateActiveSlide}
              />
            )}

            {activeSlide?.template === 'two-column' && (
              <TwoColumnForm
                slide={activeSlide}
                updateActiveSlide={updateActiveSlide}
              />
            )}

            {activeSlide?.template === 'blank' && (
              <BlankForm
                slide={activeSlide}
                updateActiveSlide={updateActiveSlide}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Full-Screen Preview Modal Overlay (when toggled) */}
      {isFullScreenPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullScreenPreview(false)}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600 shadow-xl transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <SlideViewer
              slide={activeSlide}
              mode="full-screen"
              revealStage={testRevealStage}
              onRevealChange={setTestRevealStage}
              footerText={`${category} • ${level}`}
            />
          </div>
        </div>
      )}

      {/* Smart Slide Generator Modal within Builder */}
      <SlideGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onLessonGenerated={handleLessonGenerated}
      />
    </div>
  );
};

// ================= FORM SUBCOMPONENTS =================

// 1. Grammar Box Form
interface FormSubProps {
  slide: SlideItem;
  updateActiveSlide: (updater: (prev: SlideItem) => SlideItem) => void;
}

const GrammarBoxForm: React.FC<FormSubProps> = ({ slide, updateActiveSlide }) => {
  const content = slide.content.type === 'grammar-box' ? slide.content.data : ({} as GrammarRuleContent);

  const updateData = (updater: (prev: GrammarRuleContent) => GrammarRuleContent) => {
    updateActiveSlide((s) => {
      const current = s.content.type === 'grammar-box' ? s.content.data : ({} as GrammarRuleContent);
      return {
        ...s,
        content: {
          type: 'grammar-box',
          data: updater(current),
        },
      };
    });
  };

  const handleAddFormulaToken = () => {
    updateData((prev) => ({
      ...prev,
      formula: [...(prev.formula || []), { label: 'Element', text: 'verb', color: 'blue' }],
    }));
  };

  const handleRemoveFormulaToken = (index: number) => {
    updateData((prev) => ({
      ...prev,
      formula: (prev.formula || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddExample = () => {
    updateData((prev) => ({
      ...prev,
      examples: [
        ...(prev.examples || []),
        { sentence: 'He plays tennis.', highlightWord: 'plays', translation: '' },
      ],
    }));
  };

  const handleRemoveExample = (index: number) => {
    updateData((prev) => ({
      ...prev,
      examples: (prev.examples || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Qoida Sarlavhasi (Rule Title):</label>
        <input
          type="text"
          value={content.ruleTitle || ''}
          onChange={(e) => updateData((p) => ({ ...p, ruleTitle: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200"
        />
      </div>

      {/* Formula Builder */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-300">Formula Elementlari:</label>
          <button
            type="button"
            onClick={handleAddFormulaToken}
            className="flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
          >
            <Plus className="h-3 w-3" />
            <span>Element qo‘shish</span>
          </button>
        </div>

        <div className="space-y-2">
          {(content.formula || []).map((token, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Element #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFormulaToken(idx)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Subject)"
                  value={token.label}
                  onChange={(e) =>
                    updateData((p) => {
                      const formula = [...p.formula];
                      formula[idx].label = e.target.value;
                      return { ...p, formula };
                    })
                  }
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Text (e.g. He / She)"
                  value={token.text}
                  onChange={(e) =>
                    updateData((p) => {
                      const formula = [...p.formula];
                      formula[idx].text = e.target.value;
                      return { ...p, formula };
                    })
                  }
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-200"
                />
              </div>
              <select
                value={token.color}
                onChange={(e) =>
                  updateData((p) => {
                    const formula = [...p.formula];
                    formula[idx].color = e.target.value;
                    return { ...p, formula };
                  })
                }
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-200"
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    Rang: {c.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Qoida Izohi (Explanation):</label>
        <textarea
          rows={3}
          value={content.explanation || ''}
          onChange={(e) => updateData((p) => ({ ...p, explanation: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200 resize-none"
        />
      </div>

      {/* Examples Builder */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-300">Misollar (Examples):</label>
          <button
            type="button"
            onClick={handleAddExample}
            className="flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
          >
            <Plus className="h-3 w-3" />
            <span>Misol qo‘shish</span>
          </button>
        </div>

        <div className="space-y-2">
          {(content.examples || []).map((eg, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Misol #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveExample(idx)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Sentence (e.g. She watches TV.)"
                value={eg.sentence}
                onChange={(e) =>
                  updateData((p) => {
                    const examples = [...p.examples];
                    examples[idx].sentence = e.target.value;
                    return { ...p, examples };
                  })
                }
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-200"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Highlight word (e.g. watches)"
                  value={eg.highlightWord}
                  onChange={(e) =>
                    updateData((p) => {
                      const examples = [...p.examples];
                      examples[idx].highlightWord = e.target.value;
                      return { ...p, examples };
                    })
                  }
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Uzbek translation"
                  value={eg.translation || ''}
                  onChange={(e) =>
                    updateData((p) => {
                      const examples = [...p.examples];
                      examples[idx].translation = e.target.value;
                      return { ...p, examples };
                    })
                  }
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-200"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Qo‘shimcha Maslahat (Note/Tip):</label>
        <input
          type="text"
          value={content.note || ''}
          onChange={(e) => updateData((p) => ({ ...p, note: e.target.value }))}
          placeholder="Eslatma yoki muhim qoida..."
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200"
        />
      </div>
    </div>
  );
};

// 2. Vocabulary Card Form
const VocabularyCardForm: React.FC<FormSubProps> = ({ slide, updateActiveSlide }) => {
  const content = slide.content.type === 'vocabulary-card' ? slide.content.data : ({} as VocabularyContent);

  const updateData = (updater: (prev: VocabularyContent) => VocabularyContent) => {
    updateActiveSlide((s) => {
      const current = s.content.type === 'vocabulary-card' ? s.content.data : ({} as VocabularyContent);
      return {
        ...s,
        content: {
          type: 'vocabulary-card',
          data: updater(current),
        },
      };
    });
  };

  return (
    <div className="space-y-3.5 text-xs">
      <div className="space-y-1">
        <label className="font-semibold text-slate-300">So‘z (Word):</label>
        <input
          type="text"
          value={content.word || ''}
          onChange={(e) => updateData((p) => ({ ...p, word: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200 font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Transkripsiya (Phonetic):</label>
          <input
            type="text"
            placeholder="/ˈɔːlweɪz/"
            value={content.phonetic || ''}
            onChange={(e) => updateData((p) => ({ ...p, phonetic: e.target.value }))}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200 font-mono"
          />
          {/* Quick IPA symbol buttons */}
          <div className="flex flex-wrap gap-1 pt-1">
            {['æ', 'ə', 'ɪ', 'iː', 'ʌ', 'θ', 'ð', 'ʃ', 'tʃ', 'dʒ', 'ŋ', 'ˈ'].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => updateData((p) => ({ ...p, phonetic: (p.phonetic || '') + sym }))}
                className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-brand-600 text-slate-300 hover:text-white font-mono text-[10px] border border-slate-700 transition"
                title={`Belgi qo'shish: ${sym}`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">So‘z turkumi (Part of Speech):</label>
          <select
            value={content.partOfSpeech || 'noun'}
            onChange={(e) => updateData((p) => ({ ...p, partOfSpeech: e.target.value }))}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-slate-200"
          >
            <option value="noun">noun (ot)</option>
            <option value="verb">verb (fe'l)</option>
            <option value="adjective">adjective (sifat)</option>
            <option value="adverb">adverb (ravish)</option>
            <option value="preposition">preposition (predlog)</option>
            <option value="idiom">idiom (iboraviy)</option>
            <option value="phrasal_verb">phrasal verb</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Inglizcha Ta’rif (Definition):</label>
        <textarea
          rows={2}
          value={content.definition || ''}
          onChange={(e) => updateData((p) => ({ ...p, definition: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200 resize-none"
        />
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-emerald-400">🇺🇿 O‘zbekcha Tarjima (Translation):</label>
        <input
          type="text"
          value={content.translation || ''}
          onChange={(e) => updateData((p) => ({ ...p, translation: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-emerald-500/40 px-3 py-1.5 text-emerald-300 font-semibold"
        />
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Misol Gap (Example Sentence):</label>
        <textarea
          rows={2}
          value={content.exampleSentence || ''}
          onChange={(e) => updateData((p) => ({ ...p, exampleSentence: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200 resize-none"
        />
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Rasm Havolasi (Image URL):</label>
        <input
          type="text"
          placeholder="https://images.unsplash.com/..."
          value={content.imageUrl || ''}
          onChange={(e) => updateData((p) => ({ ...p, imageUrl: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200 truncate"
        />
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          <button
            type="button"
            onClick={() =>
              updateData((p) => ({
                ...p,
                imageUrl:
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
              }))
            }
            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-brand-400 border border-slate-700 transition"
          >
            📚 Kitob
          </button>
          <button
            type="button"
            onClick={() =>
              updateData((p) => ({
                ...p,
                imageUrl:
                  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
              }))
            }
            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-brand-400 border border-slate-700 transition"
          >
            👥 Talabalar
          </button>
          <button
            type="button"
            onClick={() =>
              updateData((p) => ({
                ...p,
                imageUrl:
                  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
              }))
            }
            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
          >
            🩺 Tibbiyot
          </button>
          <button
            type="button"
            onClick={() =>
              updateData((p) => ({
                ...p,
                imageUrl:
                  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
              }))
            }
            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 transition"
          >
            🌆 Shahar
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Click To Reveal Form
const ClickToRevealForm: React.FC<FormSubProps> = ({ slide, updateActiveSlide }) => {
  const content = slide.content.type === 'click-to-reveal' ? slide.content.data : ({} as ClickToRevealContent);

  const updateData = (updater: (prev: ClickToRevealContent) => ClickToRevealContent) => {
    updateActiveSlide((s) => {
      const current = s.content.type === 'click-to-reveal' ? s.content.data : ({} as ClickToRevealContent);
      return {
        ...s,
        content: {
          type: 'click-to-reveal',
          data: updater(current),
        },
      };
    });
  };

  return (
    <div className="space-y-3.5 text-xs">
      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Mavzu / Belgisi (Badge):</label>
        <input
          type="text"
          placeholder="IELTS Speaking / Challenge 🎯"
          value={content.badge || ''}
          onChange={(e) => updateData((p) => ({ ...p, badge: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200"
        />
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-purple-300">Savol (Question / Prompt):</label>
        <textarea
          rows={3}
          value={content.question || ''}
          onChange={(e) => updateData((p) => ({ ...p, question: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-purple-500/40 px-3 py-1.5 text-slate-200 resize-none font-medium"
        />
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-amber-300">Maslahat (Optional Hint):</label>
        <input
          type="text"
          value={content.hint || ''}
          onChange={(e) => updateData((p) => ({ ...p, hint: e.target.value }))}
          placeholder="O‘quvchiga yo‘nalish beruvchi maslahat..."
          className="w-full rounded-xl bg-slate-800 border border-amber-500/40 px-3 py-1.5 text-slate-200"
        />
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-emerald-400">
          Yashirin Javob (Hidden Answer - Bosganda ochiladi):
        </label>
        <input
          type="text"
          value={content.hiddenAnswer || ''}
          onChange={(e) => updateData((p) => ({ ...p, hiddenAnswer: e.target.value }))}
          placeholder="To‘g‘ri javob..."
          className="w-full rounded-xl bg-slate-800 border border-emerald-500/50 px-3 py-1.5 text-emerald-300 font-bold"
        />
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Batafsil Izoh (Explanation):</label>
        <textarea
          rows={2}
          value={content.explanation || ''}
          onChange={(e) => updateData((p) => ({ ...p, explanation: e.target.value }))}
          placeholder="Javob nima sababdan to‘g‘riligi..."
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200 resize-none"
        />
      </div>
    </div>
  );
};

// 4. Two Column Form
const TwoColumnForm: React.FC<FormSubProps> = ({ slide, updateActiveSlide }) => {
  const content = slide.content.type === 'two-column' ? slide.content.data : ({} as TwoColumnContent);

  const updateData = (updater: (prev: TwoColumnContent) => TwoColumnContent) => {
    updateActiveSlide((s) => {
      const current = s.content.type === 'two-column' ? s.content.data : ({} as TwoColumnContent);
      return {
        ...s,
        content: {
          type: 'two-column',
          data: updater(current),
        },
      };
    });
  };

  const handleAddLeftPoint = () => {
    updateData((p) => ({
      ...p,
      leftPoints: [...(p.leftPoints || []), 'Yangi band / punkt'],
    }));
  };

  const handleRemoveLeftPoint = (idx: number) => {
    updateData((p) => ({
      ...p,
      leftPoints: (p.leftPoints || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAddRightPoint = () => {
    updateData((p) => ({
      ...p,
      rightPoints: [...(p.rightPoints || []), 'Yangi band / punkt'],
    }));
  };

  const handleRemoveRightPoint = (idx: number) => {
    updateData((p) => ({
      ...p,
      rightPoints: (p.rightPoints || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Left Column Box */}
      <div className="p-3 rounded-xl bg-slate-800/80 border border-rose-500/30 space-y-2.5">
        <div className="text-[10px] font-bold text-rose-400 uppercase">Chap Ustun (Left Column):</div>
        <input
          type="text"
          placeholder="Chap sarlavha (e.g. Band 5 / Incorrect)"
          value={content.leftTitle || ''}
          onChange={(e) => updateData((p) => ({ ...p, leftTitle: e.target.value }))}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200 font-semibold"
        />
        <input
          type="text"
          placeholder="Badge (e.g. Common Mistake)"
          value={content.leftBadge || ''}
          onChange={(e) => updateData((p) => ({ ...p, leftBadge: e.target.value }))}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200"
        />

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Bandlar (Points):</span>
            <button
              type="button"
              onClick={handleAddLeftPoint}
              className="text-rose-400 hover:text-rose-300 font-semibold"
            >
              + Band qo‘shish
            </button>
          </div>
          {(content.leftPoints || []).map((pt, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                value={pt}
                onChange={(e) =>
                  updateData((p) => {
                    const leftPoints = [...p.leftPoints];
                    leftPoints[idx] = e.target.value;
                    return { ...p, leftPoints };
                  })
                }
                className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveLeftPoint(idx)}
                className="text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column Box */}
      <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/30 space-y-2.5">
        <div className="text-[10px] font-bold text-emerald-400 uppercase">O‘ng Ustun (Right Column):</div>
        <input
          type="text"
          placeholder="O‘ng sarlavha (e.g. Band 8 / Correct)"
          value={content.rightTitle || ''}
          onChange={(e) => updateData((p) => ({ ...p, rightTitle: e.target.value }))}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-emerald-300 font-semibold"
        />
        <input
          type="text"
          placeholder="Badge (e.g. Band 8+ / Natural)"
          value={content.rightBadge || ''}
          onChange={(e) => updateData((p) => ({ ...p, rightBadge: e.target.value }))}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200"
        />

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Bandlar (Points):</span>
            <button
              type="button"
              onClick={handleAddRightPoint}
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              + Band qo‘shish
            </button>
          </div>
          {(content.rightPoints || []).map((pt, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                value={pt}
                onChange={(e) =>
                  updateData((p) => {
                    const rightPoints = [...p.rightPoints];
                    rightPoints[idx] = e.target.value;
                    return { ...p, rightPoints };
                  })
                }
                className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveRightPoint(idx)}
                className="text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. Blank Form
const BlankForm: React.FC<FormSubProps> = ({ slide, updateActiveSlide }) => {
  const content = slide.content.type === 'blank' ? slide.content.data : ({} as BlankContent);

  const updateData = (updater: (prev: BlankContent) => BlankContent) => {
    updateActiveSlide((s) => {
      const current = s.content.type === 'blank' ? s.content.data : ({} as BlankContent);
      return {
        ...s,
        content: {
          type: 'blank',
          data: updater(current),
        },
      };
    });
  };

  const handleAddParagraph = () => {
    updateData((p) => ({
      ...p,
      paragraphs: [...(p.paragraphs || []), 'Yangi matn bloki...'],
    }));
  };

  const handleRemoveParagraph = (idx: number) => {
    updateData((p) => ({
      ...p,
      paragraphs: (p.paragraphs || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-3.5 text-xs">
      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Asosiy Sarlavha (Heading):</label>
        <input
          type="text"
          value={content.heading || ''}
          onChange={(e) => updateData((p) => ({ ...p, heading: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200 font-bold"
        />
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Quyi Sarlavha (Subheading):</label>
        <input
          type="text"
          value={content.subheading || ''}
          onChange={(e) => updateData((p) => ({ ...p, subheading: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-300">Matn Bloklari (Paragraphs):</label>
          <button
            type="button"
            onClick={handleAddParagraph}
            className="flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
          >
            <Plus className="h-3 w-3" />
            <span>Matn qo‘shish</span>
          </button>
        </div>

        <div className="space-y-2">
          {(content.paragraphs || []).map((para, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <textarea
                rows={2}
                value={para}
                onChange={(e) =>
                  updateData((p) => {
                    const paragraphs = [...p.paragraphs];
                    paragraphs[idx] = e.target.value;
                    return { ...p, paragraphs };
                  })
                }
                className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200 resize-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveParagraph(idx)}
                className="text-slate-500 hover:text-rose-400 pt-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-slate-300">Rasm Havolasi (Image URL):</label>
        <input
          type="text"
          placeholder="https://..."
          value={content.imageUrl || ''}
          onChange={(e) => updateData((p) => ({ ...p, imageUrl: e.target.value }))}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200"
        />
      </div>
    </div>
  );
};
