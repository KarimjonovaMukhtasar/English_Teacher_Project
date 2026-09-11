import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  Wand2,
  FileText,
  Layers,
  ArrowRight,
  CheckCircle2,
  Check,
  Zap,
  HelpCircle,
  Stethoscope,
  GraduationCap,
  Play,
  Edit3,
  RotateCcw,
  Search,
  Filter,
  Upload,
} from 'lucide-react';
import { Lesson, SlideItem } from '@/types';
import {
  POPULAR_PRESET_TOPICS,
  QuickPresetTopic,
  generateSlidesFromTopic,
  parseNotesToSlides,
} from '@/lib/slideGenerator';
import { MEDICAL_LESSONS } from '@/db/medicalCurriculum';

interface SlideGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonGenerated: (lesson: Lesson, startImmediately?: boolean) => void;
}

const CATEGORIES = ['Grammar', 'IELTS', 'Vocabulary', 'Speaking', 'Medical English', 'General English'];
const LEVELS: Lesson['level'][] = [
  'Beginner',
  'Elementary',
  'Pre-Intermediate',
  'Intermediate',
  'Upper-Intermediate',
  'Advanced',
];

export const SlideGeneratorModal: React.FC<SlideGeneratorModalProps> = ({
  isOpen,
  onClose,
  onLessonGenerated,
}) => {
  const [activeTab, setActiveTab] = useState<'topic' | 'curriculum' | 'presets' | 'text'>('topic');
  const [topicInput, setTopicInput] = useState('');
  const [category, setCategory] = useState<string>('Grammar');
  const [level, setLevel] = useState<Lesson['level']>('Intermediate');
  const [slideCount, setSlideCount] = useState<number>(5);
  const [notesInput, setNotesInput] = useState('');
  const [notesTitle, setNotesTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // Push-Right Checkpoint: Generated Brief state
  const [generatedLesson, setGeneratedLesson] = useState<Lesson | null>(null);

  // Curriculum tab filters
  const [curriculumSearch, setCurriculumSearch] = useState('');
  const [curriculumSemester, setCurriculumSemester] = useState<'all' | 'Semester 3'>('all');

  // Keyboard shortcut: Escape to close or back out of brief
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (generatedLesson) {
          setGeneratedLesson(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, generatedLesson, onClose]);

  if (!isOpen) return null;

  const handleGenerateFromTopic = () => {
    if (!topicInput.trim()) return;

    setIsGenerating(true);
    setGenerationStep('Mavzu tahlil qilinmoqda...');

    setTimeout(() => {
      setGenerationStep('Grammatik formula va qoidalar tuzilmoqda...');
    }, 250);

    setTimeout(() => {
      setGenerationStep('Xalqaro IPA transkripsiya va audio tayyorlanmoqda...');
    }, 500);

    setTimeout(() => {
      setGenerationStep('Interaktiv test va savollar generatsiya qilinmoqda...');
    }, 750);

    setTimeout(() => {
      const lesson = generateSlidesFromTopic({
        topic: topicInput.trim(),
        category,
        level,
        slideCount,
      });

      setIsGenerating(false);
      setGeneratedLesson(lesson);
    }, 1000);
  };

  const handleSelectPreset = (preset: QuickPresetTopic) => {
    setIsGenerating(true);
    setGenerationStep(`"${preset.title}" darsligi tayyorlanmoqda...`);

    setTimeout(() => {
      const lesson = generateSlidesFromTopic({
        topic: preset.title,
        category: preset.category,
        level: preset.level,
        slideCount,
      });

      setIsGenerating(false);
      setGeneratedLesson(lesson);
    }, 600);
  };

  const handleSelectCurriculumLesson = (lesson: Lesson) => {
    setIsGenerating(true);
    setGenerationStep(`KTP: "${lesson.title}" darslik slaydlari yuklanmoqda...`);

    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedLesson(lesson);
    }, 400);
  };

  const handleGenerateFromNotes = () => {
    if (!notesInput.trim()) return;

    setIsGenerating(true);
    setGenerationStep('Matn qismlari slayd shablonlariga ajratilmoqda...');

    setTimeout(() => {
      const parsedSlides = parseNotesToSlides(
        notesInput,
        notesTitle.trim() || 'Konspekt asosidagi dars'
      );

      const lesson: Lesson = {
        id: 'lesson_notes_' + Date.now(),
        title: notesTitle.trim() || 'Konspektdan Yaratilgan Dars',
        category,
        level,
        type: 'interactive-slides',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        slides: parsedSlides,
      };

      setIsGenerating(false);
      setGeneratedLesson(lesson);
    }, 600);
  };

  const handleLoadSampleNotes = () => {
    setNotesTitle('Unit 6: Essential Clinical Vital Signs');
    setCategory('Medical English');
    setLevel('Intermediate');
    setNotesInput(`Hypertension - Qon bosimining normadan yuqori ko'tarilishi (Arterial bosim > 140/90 mmHg)
Hypotension - Qon bosimining me'yordan pasayishi
Tachycardia - Yurak qisqarishlar sonining minutiga 100 tadan oshishi
Bradycardia - Yurak qisqarishlar sonining minutiga 60 tadan kamayishi
Dyspnea - Bemorning nafas qisishi yoki havo yetishmasligi hissi
Q: Bemorning normal tana harorati qancha deb qabul qilingan?
Javob: 36.5°C dan 37.2°C gacha bo'lgan oraliq me'yori hisoblanadi.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    if (!notesTitle.trim()) {
      setNotesTitle(baseName);
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setNotesInput(content);
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be reloaded if needed
    e.target.value = '';
  };

  // Filtered medical curriculum lessons
  const filteredCurriculumLessons = MEDICAL_LESSONS.filter((lesson) => {
    const matchesSemester =
      curriculumSemester === 'all' || lesson.semester === curriculumSemester;
    const query = curriculumSearch.toLowerCase().trim();
    const matchesQuery =
      !query ||
      lesson.title.toLowerCase().includes(query) ||
      (lesson.clinicalDomain && lesson.clinicalDomain.toLowerCase().includes(query)) ||
      (lesson.unit && lesson.unit.toLowerCase().includes(query));
    return matchesSemester && matchesQuery;
  });

  const getSlideIcon = (template: SlideItem['template']) => {
    switch (template) {
      case 'grammar-box':
        return <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'vocabulary-card':
        return <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'click-to-reveal':
        return <HelpCircle className="h-4 w-4 text-purple-500 shrink-0" />;
      case 'two-column':
        return <Layers className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <FileText className="h-4 w-4 text-rose-500 shrink-0" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slide-generator-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white text-slate-900 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-gradient-to-r from-stone-50 via-white to-brand-50/40">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-600 text-white shadow-md shadow-brand-600/25">
              <Wand2 className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="slide-generator-title" className="text-lg font-bold font-serif text-stone-900">
                  Aqlli Slayd Generatori
                </h3>
                <span className="rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[11px] font-bold text-brand-600 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  1-Chertishda
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Mavzu, KTP rejasi yoki konspektdan interaktiv darsliklar yaratish
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 active:scale-[0.96] transition-transform duration-150"
            title="Yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: GENERATED LESSON BRIEF (PUSH-RIGHT CHECKPOINT)        */}
        {/* ------------------------------------------------------------- */}
        {generatedLesson ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              <div>
                <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Dars Slaydlari Muvaffaqiyatli Tayyorlandi (Brief)
                </span>
                <h4 className="text-base font-bold text-stone-900 mt-1 font-serif">
                  {generatedLesson.title}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-xs font-semibold text-stone-700">
                    {generatedLesson.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-xs font-semibold text-stone-700">
                    Daraja: {generatedLesson.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold font-mono tabular-nums">
                    {(generatedLesson.slides || []).length} ta slayd
                  </span>
                </div>
              </div>
            </div>

            {/* Slide Breakdown List */}
            <div>
              <span className="text-xs font-bold text-stone-700 block mb-2">
                Yaratilgan slaydlar ketma-ketligi:
              </span>
              <div className="space-y-2">
                {(generatedLesson.slides || []).map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/80 hover:bg-white transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-stone-200 text-xs font-bold font-mono tabular-nums text-stone-700">
                        {idx + 1}
                      </span>
                      {getSlideIcon(slide.template)}
                      <div className="truncate">
                        <span className="text-xs font-semibold text-stone-800 truncate block">
                          {slide.title || `Slayd ${idx + 1}`}
                        </span>
                        <span className="text-[10px] text-stone-400 capitalize">
                          {slide.template.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions for the Brief */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => setGeneratedLesson(null)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 active:scale-[0.96] transition-transform duration-150"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Boshqa dars tanlash</span>
              </button>

              <div className="flex-1 w-full flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLessonGenerated(generatedLesson, false);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-bold text-stone-800 shadow-xs active:scale-[0.96] transition-transform duration-150"
                >
                  <Edit3 className="h-4 w-4 text-stone-600" />
                  <span>Tahrirlash rejimida ochish</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onLessonGenerated(generatedLesson, true);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white shadow-md shadow-brand-600/25 active:scale-[0.96] transition-transform duration-150"
                >
                  <Play className="h-4 w-4 fill-current translate-x-[1px]" />
                  <span>Proyektorda Boshlash</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ----------------------------------------------------------- */
          /* VIEW 2: GENERATION INPUT MODES (TABS)                       */
          /* ----------------------------------------------------------- */
          <>
            {/* Segmented Mode Tabs (4 Tabs) */}
            <div className="px-6 pt-4 pb-2 border-b border-stone-100 bg-stone-50/60">
              <div className="grid grid-cols-4 gap-1 p-1 bg-stone-200/70 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setActiveTab('topic')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-[10px] active:scale-[0.96] transition-transform duration-150 ${
                    activeTab === 'topic'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span className="truncate">Mavzudan</span>
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-[10px] active:scale-[0.96] transition-transform duration-150 ${
                    activeTab === 'curriculum'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span className="truncate">Tibbiyot KTP</span>
                </button>
                <button
                  onClick={() => setActiveTab('presets')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-[10px] active:scale-[0.96] transition-transform duration-150 ${
                    activeTab === 'presets'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="truncate">Shablonlar</span>
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-[10px] active:scale-[0.96] transition-transform duration-150 ${
                    activeTab === 'text'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="truncate">Konspektdan</span>
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: By Topic */}
              {activeTab === 'topic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Dars Mavzusi yoki Asosiy Savol:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        placeholder="Masalan: Present Perfect Continuous, Job Interview, Cardiovascular Anatomy..."
                        className="w-full rounded-2xl border-2 border-stone-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 px-4 py-3 text-sm font-medium text-stone-900 placeholder-stone-400 focus:outline-none shadow-sm transition"
                        autoFocus
                      />
                      {topicInput && (
                        <button
                          onClick={() => setTopicInput('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Suggestions */}
                  <div>
                    <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                      Tezkor tavsiya etilgan mavzular:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Present Simple vs Continuous',
                        'Past Simple Irregular Verbs',
                        'First & Second Conditionals',
                        'IELTS Speaking: Travel & Hometown',
                        'Passive Voice in Academic English',
                        'Cardiovascular System Anatomy',
                        'Doctor-Patient Communication (Med)',
                      ].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            setTopicInput(sug);
                            if (sug.includes('IELTS')) setCategory('IELTS');
                            else if (sug.includes('Doctor') || sug.includes('Cardio')) setCategory('Medical English');
                            else setCategory('Grammar');
                          }}
                          className="text-xs px-3 py-1 rounded-xl bg-stone-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-stone-200 text-stone-700 font-medium active:scale-[0.96] transition-transform duration-150"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category, Level & Slide Count */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Toifa (Category):
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-800 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none bg-stone-50"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Daraja (CEFR Level):
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as Lesson['level'])}
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-800 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none bg-stone-50"
                      >
                        {LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Slaydlar soni:
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[3, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setSlideCount(num)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-xl border active:scale-[0.96] transition-transform duration-150 ${
                              slideCount === num
                                ? 'bg-brand-600 text-white border-brand-600'
                                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-brand-50'
                            }`}
                          >
                            {num} ta
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Output spec explanation */}
                  <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3.5 text-xs space-y-1.5">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-amber-600" />
                      <span>Avtomatik yaratiladigan pedagogik slaydlar zanjiri:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-stone-700 text-[11px] pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span>Grammatik formula va tushuntirish</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>IPA transkripsiyali lug‘at va tarjima</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        <span>Click-to-reveal interaktiv test</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span>2 ustunli differensial taqqoslash</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Medical Curriculum (KTP) */}
              {activeTab === 'curriculum' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                      <input
                        type="text"
                        value={curriculumSearch}
                        onChange={(e) => setCurriculumSearch(e.target.value)}
                        placeholder="2-kurs KTP bo‘yicha qidirish: Pulse, Schizophrenia, Circulation..."
                        className="w-full rounded-xl border border-stone-200 pl-9 pr-4 py-2 text-xs font-medium focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-xl border border-stone-200 text-xs">
                      {(['all', 'Semester 3'] as const).map((sem) => (
                        <button
                          key={sem}
                          onClick={() => setCurriculumSemester(sem)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                            curriculumSemester === sem
                              ? 'bg-brand-600 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {sem === 'all' ? 'Barchasi' : '2-kurs'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    2-kurs Medical English KTP darsliklaridan birini tanlang (Jami: {filteredCurriculumLessons.length} ta dars):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {filteredCurriculumLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => handleSelectCurriculumLesson(lesson)}
                        className="group cursor-pointer rounded-2xl border border-stone-200 bg-white p-3 hover:border-brand-600 hover:shadow-md active:scale-[0.96] transition-transform duration-150 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {lesson.semester || 'KTP'}
                            </span>
                            <span className="text-[10px] font-bold text-stone-400 font-mono tabular-nums">
                              {(lesson.slides || []).length} slayd
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-stone-900 group-hover:text-brand-600 transition line-clamp-1">
                            {lesson.title}
                          </h4>
                          {lesson.clinicalDomain && (
                            <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                              {lesson.clinicalDomain}
                            </p>
                          )}
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                          <span>{lesson.cefrLevel || 'B2 Level'}</span>
                          <span className="font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                            Ochish <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Presets */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-600">
                    Grammatika va IELTS bo‘yicha standart darsliklar shabloni:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {POPULAR_PRESET_TOPICS.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className="group cursor-pointer rounded-2xl border border-stone-200 bg-white p-3.5 hover:border-brand-600 hover:shadow-md active:scale-[0.96] transition-transform duration-150 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-lg">{preset.icon}</span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                              {preset.badge}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-stone-900 group-hover:text-brand-600 transition line-clamp-1">
                            {preset.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {preset.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                          <span>{preset.level}</span>
                          <span className="font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                            Tanlash <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Text / Notes */}
              {activeTab === 'text' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-700">
                      Dars nomi:
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="text-[11px] font-semibold text-stone-600 hover:text-brand-600 flex items-center gap-1 cursor-pointer active:scale-[0.96] transition-transform duration-150">
                        <Upload className="h-3 w-3 text-stone-500" />
                        <span>Fayl yuklash (.txt, .md)</span>
                        <input
                          type="file"
                          accept=".txt,.md,.text"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadSampleNotes}
                        className="text-[11px] font-semibold text-brand-600 hover:underline flex items-center gap-1 active:scale-[0.96] transition-transform duration-150"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Misol konspekt</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={notesTitle}
                    onChange={(e) => setNotesTitle(e.target.value)}
                    placeholder="Masalan: Unit 4 - Medical Abbreviations"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Matn yoki Lug‘at ro‘yxatini kiriting:
                    </label>
                    <textarea
                      rows={6}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder={`Konspekt matnini bu yerga qo'ying. Masalan:\n\nHypertension - Qon bosimining ortishi\nHypotension - Qon bosimining pasayishi\nQ: Bemorning normal yurak urishi minutiga necha marta bo'ladi?\nJavob: 60 dan 100 gacha`}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-xs text-stone-800 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Generating Progress State */}
              {isGenerating && (
                <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center gap-3 animate-in fade-in">
                  <Sparkles className="h-5 w-5 text-amber-400 animate-spin" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-300 block">Slaydlar tayyorlanmoqda...</span>
                    <span className="text-stone-300 text-[11px]">{generationStep}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Input View) */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/70 active:scale-[0.96] transition-transform duration-150"
              >
                Bekor qilish
              </button>

              <div className="flex items-center gap-2">
                {activeTab === 'topic' && (
                  <button
                    type="button"
                    disabled={isGenerating || !topicInput.trim()}
                    onClick={handleGenerateFromTopic}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white shadow-md shadow-brand-600/25 disabled:opacity-40 active:scale-[0.96] transition-transform duration-150"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Slaydlarni Generatsiya Qilish</span>
                  </button>
                )}

                {activeTab === 'text' && (
                  <button
                    type="button"
                    disabled={isGenerating || !notesInput.trim()}
                    onClick={handleGenerateFromNotes}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white shadow-md shadow-brand-600/25 disabled:opacity-40 active:scale-[0.96] transition-transform duration-150"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Matndan Slayd Yaratish</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
