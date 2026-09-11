import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Plus,
  UploadCloud,
  Search,
  Users,
  Lock,
  BookOpen,
  Trash2,
  Edit3,
  Sparkles,
  FileText,
  Clock,
  Layers,
  Stethoscope,
  GraduationCap,
  RotateCcw,
  Award,
  FileQuestion,
  CheckCircle2,
  LogOut,
  ExternalLink,
  X,
  Download,
  LoaderCircle,
  Upload,
  User,
} from 'lucide-react';
import { Lesson, StudentGroup } from '@/types';
import { getPersistedSlideIndex, persistSlideIndex } from '@/store/presentationStore';
import { saveLesson } from '@/db';
import { SlideGeneratorModal } from '@/components/builder/SlideGeneratorModal';
import { TeacherProfileModal } from '@/components/profile/TeacherProfileModal';
import { useAuthStore } from '@/store/authStore';
import { exportAllDatabaseToJson, importDatabaseFromJson } from '@/db/dexie';
import { SUPPLIED_FACULTIES, SUPPLIED_FACULTY_CURRICULUM_REVISION } from '@/db/facultyCurriculum';
import { downloadLessonPowerPoint } from '@/lib/presentationExport';

interface DashboardProps {
  lessons: Lesson[];
  studentGroups: StudentGroup[];
  activeGroupId: string | null;
  teacherName: string;
  onStartPresentation: (lesson: Lesson) => void;
  onEditLesson: (lesson: Lesson) => void;
  onCreateLesson: () => void;
  onUploadPdfLesson: (title: string, category: string, level: Lesson['level'], pdfDataUrl: string) => Promise<void>;
  onDeleteLesson: (id: string) => Promise<void>;
  onOpenGroupManager: () => void;
  onLockScreen: () => void;
  onLogout?: () => void;
}

const CATEGORIES = ['Barchasi', 'Medical English', 'Grammar', 'IELTS', 'Vocabulary', 'Speaking', 'General English'];
const LEVELS = ['Barchasi', 'B2', 'C1', 'Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced'];

const SEMESTER_TABS = [
  { id: 'course1', label: '1-kurs · Tez orada', icon: Clock },
  { id: 'Semester 3', label: '2-kurs · Medical English', icon: Stethoscope },
  { id: 'all', label: 'Barcha Darslar', icon: Layers },
  { id: 'general', label: 'Umumiy Ingliz Tili', icon: GraduationCap },
];

const COURSE_2_ASSESSMENT_FILTERS = [
  { id: 'all', label: 'Barcha taqdimotlar' },
  { id: 'on', label: 'Oraliq baholash' },
  { id: 'yan', label: 'Yakuniy baholash' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  lessons,
  studentGroups,
  activeGroupId,
  teacherName,
  onStartPresentation,
  onEditLesson,
  onCreateLesson,
  onUploadPdfLesson,
  onDeleteLesson,
  onOpenGroupManager,
  onLockScreen,
  onLogout,
}) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [selectedLevel, setSelectedLevel] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState<boolean>(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const [pdfCategory, setPdfCategory] = useState<string>('Grammar');
  const [pdfLevel, setPdfLevel] = useState<Lesson['level']>('Intermediate');
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [downloadingLessonId, setDownloadingLessonId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Global search shortcut (Cmd+K / Ctrl+K or '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPdfUploadModalOpen) {
        setIsPdfUploadModalOpen(false);
        return;
      }
      // If modal is open, do not trigger global search
      if (isPdfUploadModalOpen || isGeneratorOpen) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPdfUploadModalOpen, isGeneratorOpen]);

  const [selectedSemester, setSelectedSemester] = useState<string>('Semester 3');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  const handleLessonGenerated = async (generatedLesson: Lesson, startImmediately?: boolean) => {
    try {
      await saveLesson(generatedLesson);
      setIsGeneratorOpen(false);
      if (startImmediately) {
        onStartPresentation(generatedLesson);
      } else {
        onEditLesson(generatedLesson);
      }
    } catch (err) {
      console.error('Failed to save generated lesson:', err);
      alert('Slaydlarni saqlashda xatolik yuz berdi.');
    }
  };

  const handlePowerPointDownload = async (lesson: Lesson) => {
    if (lesson.type !== 'interactive-slides' || !lesson.slides?.length) return;

    setDownloadingLessonId(lesson.id);
    try {
      await downloadLessonPowerPoint(lesson);
    } catch (error) {
      console.error('PowerPoint export failed:', error);
      alert('PowerPoint faylini tayyorlashda xatolik yuz berdi. Iltimos, yana urinib ko‘ring.');
    } finally {
      setDownloadingLessonId(null);
    }
  };

  // Count by semester
  const semesterCounts = {
    all: lessons.length,
    course1: 0,
    'Semester 3': lessons.filter((l) => l.semester === 'Semester 3' && l.curriculumRevision === SUPPLIED_FACULTY_CURRICULUM_REVISION).length,
    general: lessons.filter((l) => !l.semester).length,
  };

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    // Semester filter
    if (selectedSemester === 'course1') return false;
    if (selectedSemester === 'Semester 3' && (lesson.semester !== 'Semester 3' || lesson.curriculumRevision !== SUPPLIED_FACULTY_CURRICULUM_REVISION)) return false;
    if (selectedSemester === 'general' && Boolean(lesson.semester)) return false;

    // Unit / Assessment filter
    if (selectedUnit !== 'all') {
      if (selectedUnit === 'on') {
        if (lesson.assessmentType !== 'formative') return false;
      } else if (selectedUnit === 'yan') {
        if (lesson.assessmentType !== 'summative') return false;
      } else {
        if (lesson.unit !== selectedUnit) return false;
      }
    }

    // Category filter
    const matchesCategory = selectedCategory === 'Barchasi' || lesson.category === selectedCategory;
    if (!matchesCategory) return false;

    // Level filter
    const matchesLevel =
      selectedLevel === 'Barchasi' ||
      lesson.level === selectedLevel ||
      lesson.cefrLevel === selectedLevel;
    if (!matchesLevel) return false;

    // Search query filter (deep search in title, clinical domain, unit, and slide contents)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = lesson.title.toLowerCase().includes(q);
      const domainMatch = lesson.clinicalDomain?.toLowerCase().includes(q) || false;
      const topicMatch = lesson.topicNumber
        ? `mavzu ${lesson.topicNumber}`.includes(q) || `${lesson.topicNumber}` === q
        : false;
      const catMatch = lesson.category.toLowerCase().includes(q);
      const unitMatch = lesson.unit?.toLowerCase().includes(q) || false;

      const slideMatch = (lesson.slides || []).some((s) => {
        if (s.title.toLowerCase().includes(q)) return true;
        if (s.content?.type === 'vocabulary-card') {
          return (
            s.content.data.word?.toLowerCase().includes(q) ||
            s.content.data.translation?.toLowerCase().includes(q) ||
            s.content.data.definition?.toLowerCase().includes(q)
          );
        }
        if (s.content?.type === 'grammar-box') {
          return (
            s.content.data.ruleTitle?.toLowerCase().includes(q) ||
            s.content.data.explanation?.toLowerCase().includes(q)
          );
        }
        if (s.content?.type === 'click-to-reveal') {
          return (
            s.content.data.question?.toLowerCase().includes(q) ||
            s.content.data.hiddenAnswer?.toLowerCase().includes(q)
          );
        }
        return false;
      });

      if (!titleMatch && !domainMatch && !topicMatch && !catMatch && !unitMatch && !slideMatch) {
        return false;
      }
    }

    return true;
  });

  // Sort lessons: within same semester, order by topicNumber ascending
  const sortedLessons = [...filteredLessons].sort((a, b) => {
    if (a.semester && b.semester && a.semester === b.semester) {
      if (a.topicNumber !== undefined && b.topicNumber !== undefined) {
        return a.topicNumber - b.topicNumber;
      }
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const selectedFaculty = SUPPLIED_FACULTIES.find((faculty) => faculty.id === selectedUnit);

  const activeGroup = studentGroups.find((g) => g.id === activeGroupId) || studentGroups[0];

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        alert("PDF fayl hajmi 50 MB dan oshmasligi kerak!");
        e.target.value = '';
        return;
      }
      setSelectedPdfFile(file);
      if (!pdfTitle) {
        setPdfTitle(file.name.replace(/\.pdf$/i, ''));
      }
    }
  };

  const handlePdfUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPdfFile || !pdfTitle.trim()) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        await onUploadPdfLesson(pdfTitle.trim(), pdfCategory, pdfLevel, dataUrl);
        setIsPdfUploadModalOpen(false);
        setSelectedPdfFile(null);
        setPdfTitle('');
      } catch (err) {
        console.error('Failed to save PDF lesson:', err);
        alert('PDF darsini saqlashda xatolik yuz berdi.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert('Faylni o\'qishda xatolik yuz berdi.');
    };
    reader.readAsDataURL(selectedPdfFile);
  };

  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportAllDatabaseToJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `tilchi-darslar-zaxira-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Darslarni eksport qilishda xatolik yuz berdi!');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const res = await importDatabaseFromJson(text);
        alert(`Muvaffaqiyatli tiklandi! ${res.importedLessons} ta dars va ${res.importedGroups} ta guruh yuklandi.`);
      } catch (err: any) {
        console.error('Import error:', err);
        alert(`Xatolik: ${err?.message || 'Fayl formati noto‘g‘ri!'}`);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const getInitials = (name: string) => {
    const parts = (name || '').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name || '').slice(0, 2).toUpperCase() || 'TQ';
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-primary pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-surface-border bg-surface-card px-6 py-3.5 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Tilchi Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/20 ring-2 ring-brand-600/10">
              <span className="text-2xl font-black">t</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight text-stone-900">
                  tilchi
                </h1>
                <span className="text-lg font-black text-brand-600">.uz</span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 uppercase tracking-wide border border-brand-200">
                  app.tilchi.uz
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Tilchi Presenter - O'qituvchi boshqaruv paneli
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* Direct Link to tilchi.uz */}
            <a
              href="https://tilchi.uz"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50 transition shadow-xs"
              title="tilchi.uz asosiy saytiga o'tish"
            >
              <span>tilchi.uz</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {/* Quick Export JSON Backup Button */}
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 sm:px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition active:scale-[0.96] shadow-xs"
              title="Barcha darslar va guruhlarni zaxiralash (Eksport JSON)"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden md:inline">Zaxiralash</span>
            </button>

            {/* Quick Import JSON Backup Button with hidden file input */}
            <input
              ref={backupInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 sm:px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition active:scale-[0.96] shadow-xs"
              title="Zaxiradan qayta tiklash (Import JSON)"
            >
              <Upload className="h-3.5 w-3.5 text-brand-600" />
              <span className="hidden md:inline">Tiklash</span>
            </button>

            {/* Active Group Indicator */}
            <button
              type="button"
              onClick={onOpenGroupManager}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-stone-200 bg-stone-50/80 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition active:scale-[0.96] shadow-xs shrink-0"
              title="O'quvchilar guruhini tanlash yoki o'zgartirish"
            >
              <Users className="h-3.5 w-3.5 text-brand-600 shrink-0" />
              <span className="flex items-center gap-1">
                <span className="hidden lg:inline text-stone-500">Guruh:</span>
                <strong className="text-stone-900 max-w-[70px] sm:max-w-[110px] truncate">
                  {activeGroup?.name || 'Guruh'}
                </strong>
              </span>
            </button>

            {/* Quick Lock Button */}
            <button
              type="button"
              onClick={onLockScreen}
              className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-2.5 sm:px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition active:scale-[0.96] shadow-xs shrink-0"
              title="Proyektorda ekranni PIN kod bilan qulflash"
            >
              <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">Qulflash</span>
            </button>

            {/* Interactive Teacher Profile Button */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 pl-2 border-l border-stone-200 hover:opacity-90 transition active:scale-[0.96] text-left cursor-pointer"
              title="O'qituvchi profili, xavfsizlik va sozlamalar"
            >
              <div
                style={{ backgroundColor: currentUser?.avatarColor || '#0F766E' }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shadow-xs ring-2 ring-stone-200/60 shrink-0"
              >
                {getInitials(currentUser?.fullName || teacherName)}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="block text-xs font-bold text-stone-800 truncate max-w-[120px]">
                  {currentUser?.fullName || teacherName}
                </span>
                <span className="block text-[10px] text-brand-600 font-semibold truncate max-w-[120px]">
                  {currentUser?.role || 'Pedagog'}
                </span>
              </div>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-2 text-xs font-semibold text-stone-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition active:scale-[0.96] shadow-xs"
                title="Tizimdan chiqish (Logout)"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-6 pt-8">
        {/* Banner with Welcome & Actions */}
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 p-8 text-white shadow-xl shadow-brand-600/15">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white mb-3 border border-white/30">
                {currentUser?.role || 'Ingliz tili metodikasi va interaktiv darslar'}
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Xush kelibsiz, {currentUser?.fullName || teacherName}!
              </h2>
              <p className="mt-2 text-sm text-white/90 leading-relaxed">
                app.tilchi.uz orqali istalgan kompyuterda to‘liq ekran rejimida dars o‘ting. 2-kurs Medical English uchun 4 fakultetdagi 83 ta manbali, 20 slaydli lesson-plan darslar tayyor.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="flex items-center gap-2.5 rounded-2xl bg-white px-5 py-3.5 text-sm font-extrabold text-brand-700 shadow-xl hover:bg-brand-50 active:scale-[0.96] transition-transform duration-150 ring-4 ring-white/20 group"
              >
                <Sparkles className="h-4 w-4 text-amber-600 fill-amber-500 group-hover:rotate-12 transition-transform" />
                <span>Slaydni rejalash</span>
              </button>
              <button
                onClick={onCreateLesson}
                className="flex items-center gap-2 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md px-4 py-3.5 text-sm font-semibold text-white hover:bg-white/25 active:scale-[0.96] transition-transform duration-150"
              >
                <Plus className="h-4 w-4" />
                <span>Qo‘lda Yaratish</span>
              </button>
              <button
                onClick={() => setIsPdfUploadModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md px-4 py-3.5 text-sm font-semibold text-white hover:bg-white/25 active:scale-[0.96] transition-transform duration-150"
              >
                <UploadCloud className="h-4 w-4" />
                <span>PDF Taqdimot</span>
              </button>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </div>

        {/* Semester Segmented Tabs */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl backdrop-blur-sm border border-slate-200/80">
            {SEMESTER_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = selectedSemester === tab.id;
              const count = semesterCounts[tab.id as keyof typeof semesterCounts] ?? 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedSemester(tab.id);
                    setSelectedUnit('all');
                  }}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-xs font-bold active:scale-[0.96] transition-transform duration-150 ${
                    isSelected
                      ? 'bg-white text-brand-700 shadow-md shadow-slate-300/50'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  <TabIcon className={`h-4 w-4 ${isSelected ? 'text-brand-600' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold font-mono tabular-nums ${
                      isSelected
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-stone-300/60 text-stone-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Course 2 faculty navigation */}
        {selectedSemester === 'Semester 3' && (
          <section className="mt-5" aria-labelledby="course-2-sections-title">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Course 2 · CEFR B2</p>
                <h2 id="course-2-sections-title" className="mt-1 text-lg font-bold text-slate-900">
                  4 ta fakultet
                </h2>
              </div>
              <p className="text-xs leading-5 text-slate-600">
                Har bir taqdimot: dars rejasi, vocabulary, grammar va 4 ko‘nikma.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {SUPPLIED_FACULTIES.map((faculty) => {
                const facultyLessons = lessons.filter(
                  (lesson) => lesson.semester === 'Semester 3' && lesson.curriculumRevision === SUPPLIED_FACULTY_CURRICULUM_REVISION && lesson.unit === faculty.id,
                );
                const presentationCount = facultyLessons.length;
                const slideCount = facultyLessons.reduce((total, lesson) => total + (lesson.slides?.length || 0), 0);
                const isSelected = selectedUnit === faculty.id;

                return (
                  <button
                    key={faculty.id}
                    type="button"
                    onClick={() => setSelectedUnit(faculty.id)}
                    aria-pressed={isSelected}
                    aria-label={faculty.number + '-fakultet: ' + faculty.title + '. ' + presentationCount + ' taqdimot, ' + slideCount + ' slayd.'}
                    className={
                      'min-h-48 rounded-2xl border p-4 text-left transition duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/20 ' +
                      (isSelected
                        ? 'border-brand-600 bg-brand-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-surface-inset')
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={
                        'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 font-mono text-xs font-bold ' +
                        (isSelected ? 'border-brand-200 bg-white text-brand-800' : 'border-slate-200 bg-slate-50 text-slate-600')
                      }>
                        {faculty.number}
                      </span>
                      <span className={
                        'text-xs font-semibold ' + (isSelected ? 'text-brand-700' : 'text-slate-500')
                      }>
                        {isSelected ? 'Ko‘rsatilmoqda' : 'Fakultetni ochish'}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold leading-snug text-slate-900">{faculty.title}</h3>
                    <p className="mt-2 min-h-10 text-xs leading-5 text-slate-600">{faculty.description}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                      <div>
                        <dt className="text-[11px] font-medium text-slate-500">Taqdimot</dt>
                        <dd className="mt-0.5 font-mono text-sm font-bold text-slate-900">{presentationCount}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-medium text-slate-500">Jami slayd</dt>
                        <dd className="mt-0.5 font-mono text-sm font-bold text-slate-900">{slideCount}</dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-[11px] font-semibold text-brand-800">
                      {faculty.lessonCount} dars · Vocabulary · Grammar · 4 ko‘nikma
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Course 2 ko‘rinishini filtrlash">
              {COURSE_2_ASSESSMENT_FILTERS.map((filter) => {
                const isSelected = selectedUnit === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setSelectedUnit(filter.id)}
                    aria-pressed={isSelected}
                    className={
                      'min-h-11 rounded-xl border px-3.5 py-2 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-brand-500/20 ' +
                      (isSelected
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50')
                    }
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Search & Filters */}
        <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mavzu nomi, raqami (masalan: 1, 10, 21) yoki klinik soha..."
              className="w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-16 py-2.5 text-sm placeholder-stone-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none shadow-sm transition"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                  title="Qidiruvni tozalash"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-stone-200/80 border border-stone-300 text-[10px] font-mono font-medium text-stone-600 select-none shadow-2xs">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Level Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Daraja:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm focus:border-brand-600 focus:outline-none"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-brand-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Lesson Cards Grid */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 font-bold">
              {selectedFaculty ? selectedFaculty.title + ' darslari' : 'Darslar'} (<span className="font-mono tabular-nums">{sortedLessons.length}</span>)
            </h3>
          </div>

          {sortedLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              {selectedSemester === 'course1' ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-3">
                    <Clock className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">1-kurs tizimi tez orada e’lon qilinadi</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">
                    Bu joy ataylab bo‘sh qoldirildi. Hozir 2-kurs Medical English darslari foydalanishga tayyor.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-3">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">Hech qanday dars topilmadi</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">
                    Qidiruv so‘zini o‘zgartiring yoki yangi dars yaratib, taqdimotni yuklang.
                  </p>
                  <div className="mt-4 flex items-center gap-2.5">
                    <button
                      onClick={() => setIsGeneratorOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 active:scale-[0.96] transition-transform duration-150"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                  Slaydni rejalash
                </button>
                <button
                  onClick={onCreateLesson}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 active:scale-[0.96] transition-transform duration-150"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Qo‘lda Yaratish
                </button>
              </div>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedLessons.map((lesson) => {
                const isFormative = lesson.assessmentType === 'formative';
                const isSummative = lesson.assessmentType === 'summative';
                const isDownloading = downloadingLessonId === lesson.id;

                return (
                  <div
                    key={lesson.id}
                    className="group flex flex-col justify-between rounded-3xl border border-slate-300/80 bg-white p-5 shadow-sm hover:shadow-xl hover:border-brand-200 transition-[border-color,box-shadow,transform] duration-150 relative overflow-hidden"
                  >
                    {/* Top Badges */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isFormative && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                              <FileQuestion className="h-3 w-3 text-amber-600" />
                              Oraliq Nazorat (ON)
                            </span>
                          )}
                          {isSummative && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-bold text-purple-800">
                              <Award className="h-3 w-3 text-purple-600" />
                              Yakuniy Nazorat (YaN)
                            </span>
                          )}
                          {lesson.topicNumber !== undefined && (
                            <span className="rounded-lg bg-sky-50 border border-sky-200 px-2.5 py-1 text-[11px] font-bold text-sky-800">
                              Mavzu #{lesson.topicNumber}
                            </span>
                          )}
                          {lesson.semester && (
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                              {lesson.semester === 'Semester 3' ? '2-kurs' : lesson.semester}
                            </span>
                          )}
                          {!lesson.semester && (
                            <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600 border border-brand-100">
                              {lesson.category}
                            </span>
                          )}
                        </div>

                        <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                          {lesson.cefrLevel ? `CEFR ${lesson.cefrLevel} Med` : lesson.level}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug">
                        {lesson.title}
                      </h4>

                      {/* Clinical Domain & Unit Subtitles */}
                      {lesson.clinicalDomain && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Stethoscope className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" />
                          <span className="truncate">{lesson.clinicalDomain}</span>
                        </div>
                      )}
                      {lesson.unit && (
                        <div className="mt-1 text-[11px] font-medium text-slate-500">
                          Fakultet: {lesson.unit}
                        </div>
                      )}

                      {/* Metadata stats */}
                      <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          {lesson.type === 'pdf-presentation' ? (
                            <>
                              <FileText className="h-3.5 w-3.5 text-rose-500" />
                              <span className="font-medium text-slate-600">PDF Taqdimot</span>
                            </>
                          ) : (
                            <>
                              <Layers className="h-3.5 w-3.5 text-brand-500" />
                              <span className="font-medium text-slate-600">
                                <span className="font-mono tabular-nums">{lesson.slides?.length || 0}</span> ta slayd
                              </span>
                            </>
                          )}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Klinik Yoritilgan (16:9)</span>
                        </div>
                        {(() => {
                          const savedIdx = getPersistedSlideIndex(lesson);
                          return savedIdx > 0 ? (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                <span className="font-mono tabular-nums">{savedIdx + 1}</span>-slaydda qolgan
                              </span>
                            </>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {lesson.type === 'interactive-slides' && (
                      <button
                        type="button"
                        onClick={() => handlePowerPointDownload(lesson)}
                        disabled={isDownloading}
                        aria-busy={isDownloading}
                        className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs font-bold text-brand-800 transition hover:border-brand-300 hover:bg-brand-100 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:cursor-wait disabled:opacity-70"
                        title="Tahrirlanadigan PowerPoint taqdimotini yuklab olish"
                      >
                        {isDownloading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Download className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span>{isDownloading ? 'PPTX tayyorlanmoqda…' : 'PPTX yuklab olish'}</span>
                      </button>
                    )}

                    {/* Bottom Action Buttons */}
                    <div className="mt-6 flex items-center justify-between gap-2 pt-4 border-t border-stone-100">
                      {(() => {
                        const savedIdx = getPersistedSlideIndex(lesson);
                        const hasProgress = savedIdx > 0;
                        return (
                          <>
                            <button
                              onClick={() => {
                                const targetLesson = { ...lesson, lastSlideIndex: savedIdx };
                                onStartPresentation(targetLesson);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-brand-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 active:scale-[0.96] transition-transform duration-150 whitespace-nowrap"
                            >
                              <Play className="h-3.5 w-3.5 fill-current translate-x-[1px] shrink-0" />
                              {hasProgress ? (
                                <>
                                  <span className="whitespace-nowrap font-mono tabular-nums">{savedIdx + 1}-slayd:</span>{' '}
                                  <span className="whitespace-nowrap">Davom etish</span>
                                </>
                              ) : (
                                <span className="whitespace-nowrap">Darsni Boshlash</span>
                              )}
                            </button>

                            {hasProgress && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  persistSlideIndex(lesson.id, 0);
                                  const resetLesson = { ...lesson, lastSlideIndex: 0 };
                                  onStartPresentation(resetLesson);
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-brand-600 active:scale-[0.96] transition-transform duration-150"
                                title="1-slayddan boshidan boshlash"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        );
                      })()}

                      {lesson.type === 'interactive-slides' && (
                        <button
                          onClick={() => onEditLesson(lesson)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-brand-600 active:scale-[0.96] transition-transform duration-150"
                          title="Tahrirlash"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`"${lesson.title}" darsini o'chirmoqchimisiz?`)) {
                            onDeleteLesson(lesson.id);
                          }
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-[0.96] transition-transform duration-150"
                        title="O'chirish"
                      >
                        <Trash2 className="h-4 w-4 translate-y-[0.5px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* PDF Upload Modal */}
      {isPdfUploadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-upload-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPdfUploadModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsPdfUploadModalOpen(false)}
              aria-label="Yopish"
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition active:scale-[0.96]"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 id="pdf-upload-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-brand-600" />
              PDF Taqdimot Yuklash
            </h3>
            <p className="mt-1 text-xs text-slate-500 pr-6">
              PowerPoint (PPTX) taqdimotingizni 'Save as PDF' qilib yuklang. Dizayn 100% asl holatida saqlanadi.
            </p>

            <form onSubmit={handlePdfUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Dars nomi
                </label>
                <input
                  type="text"
                  required
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="Masalan: Past Continuous Tense"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Toifa
                  </label>
                  <select
                    value={pdfCategory}
                    onChange={(e) => setPdfCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-brand-500 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'Barchasi').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Daraja
                  </label>
                  <select
                    value={pdfLevel}
                    onChange={(e) => setPdfLevel(e.target.value as Lesson['level'])}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-brand-500 focus:outline-none"
                  >
                    {LEVELS.filter((l) => l !== 'Barchasi').map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PDF file drag/drop or select */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  PDF faylni tanlang
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={handlePdfFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 transition"
                >
                  <UploadCloud className="h-8 w-8 text-brand-500 mb-2" />
                  {selectedPdfFile ? (
                    <span className="text-xs font-bold text-brand-700 truncate max-w-[280px]">
                      {selectedPdfFile.name} (<span className="font-mono tabular-nums">{(selectedPdfFile.size / 1024 / 1024).toFixed(2)} MB</span>)
                    </span>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-slate-700">
                        PDF faylni tanlash uchun bosing
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Maksimal hajm: 50 MB
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPdfUploadModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedPdfFile}
                  className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  {isUploading ? 'Yuklanmoqda...' : 'Yuklash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Slide Generator Modal */}
      <SlideGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onLessonGenerated={handleLessonGenerated}
      />

      {/* World-Class Teacher Profile & Settings Modal */}
      <TeacherProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};
