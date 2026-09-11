import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Layers,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  X,
  Share2,
  Save,
  RotateCcw
} from 'lucide-react';
import { Lesson, StudentGroup, LessonSessionRecord } from '@/types';
import { saveLessonSession } from '@/db/dexie';
import { usePresentationStore, closeSessionSummary, resetSessionMetrics } from '@/store/presentationStore';

interface SessionSummaryModalProps {
  isOpen: boolean;
  lesson: Lesson;
  activeGroup: StudentGroup | null;
  teacherName: string;
  onExitPresentation: () => void;
  onContinuePresentation: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  lesson,
  activeGroup,
  teacherName,
  onExitPresentation,
  onContinuePresentation,
}) => {
  const store = usePresentationStore();
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const startTime = store.sessionStartTime || Date.now();
  const endTime = Date.now();
  const durationMinutes = Math.max(1, Math.round((endTime - startTime) / 60000));
  const totalSlides = store.totalSlides;
  const slidesCompleted = Math.min(totalSlides, store.currentSlideIndex + 1);

  const teamA = { name: 'Team Alfa', score: store.teamScoreA };
  const teamB = { name: 'Team Beta', score: store.teamScoreB };

  const winnerText = teamA.score > teamB.score
    ? `${teamA.name} g‘olib bo‘ldi! 🏆`
    : teamB.score > teamA.score
    ? `${teamB.name} g‘olib bo‘ldi! 🏆`
    : teamA.score > 0
    ? 'Durrang natija! 🤝'
    : 'Jamoaviy ballar belgilanmagan';

  const calledStudents = store.calledStudents || [];
  const groupName = activeGroup?.name || 'Umumiy Guruh';

  // Format clean Telegram / Hemis clipboard message
  const generateTelegramReport = () => {
    const dateStr = new Date().toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const studentListStr = calledStudents.length > 0
      ? calledStudents.map((s, idx) => `  ${idx + 1}. ${s.name} (+${s.pointsEarned || 1} ball)`).join('\n')
      : '  (Talabalar individual belgilanmagan)';

    return `🎓 TMA — Tibbiy Ingliz Tili Dars Hisoboti
📅 Sana: ${dateStr}
👥 Guruh: ${groupName}
📖 Dars: ${lesson.title}
⏱ Davomiyligi: ${durationMinutes} daqiqa (${slidesCompleted}/${totalSlides} slayd)
🏆 Jamoaviy Bellashuv:
  • ${teamA.name}: ${teamA.score} ball
  • ${teamB.name}: ${teamB.score} ball
  • Natija: ${winnerText}

🌟 Faol Talabalar (${calledStudents.length} nafar):
${studentListStr}

O‘qituvchi: ${teacherName}
Tizim: app.tilchi.uz`;
  };

  const handleCopyReport = async () => {
    try {
      const text = generateTelegramReport();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API restricted
      alert('Hisobot matnini qo‘lda nusxalang');
    }
  };

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    try {
      const sessionRecord: LessonSessionRecord = {
        id: `session_${Date.now()}`,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        groupId: activeGroup?.id || 'default_group',
        groupName,
        teacherName,
        startTime,
        endTime,
        durationMinutes,
        slidesCompleted,
        totalSlides,
        teamScores: {
          teamA,
          teamB,
        },
        calledStudents,
        createdAt: Date.now(),
      };

      await saveLessonSession(sessionRecord);
      resetSessionMetrics();
      closeSessionSummary();
      onExitPresentation();
    } catch (err) {
      console.error('Failed to save session:', err);
      // Exit anyway to not trap user
      onExitPresentation();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-summary-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-[#0A3FA8] p-6 text-white relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 border border-white/25 shadow-inner">
                <Trophy className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold tracking-wide uppercase border border-white/30 text-white mb-1 font-mono">
                  Dars Sessiyasi Yakuni
                </span>
                <h2 id="session-summary-title" className="text-xl font-extrabold tracking-tight">
                  {lesson.title}
                </h2>
                <p className="text-xs text-blue-100 font-medium">
                  {groupName} · {teacherName}
                </p>
              </div>
            </div>

            <button
              onClick={onContinuePresentation}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-[0.96] transition-transform duration-150"
              title="Darsga qaytish"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-[#0A1128]">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-center">
              <Clock className="h-5 w-5 text-brand-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500 font-medium">Davomiyligi</div>
              <div className="text-lg font-black font-mono tabular-nums text-slate-900">
                {durationMinutes} <span className="text-xs font-semibold">daq</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-center">
              <Layers className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500 font-medium">O‘tilgan Slayd</div>
              <div className="text-lg font-black font-mono tabular-nums text-slate-900">
                {slidesCompleted} <span className="text-xs text-slate-500">/ {totalSlides}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-center">
              <Users className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500 font-medium">Faol Talabalar</div>
              <div className="text-lg font-black font-mono tabular-nums text-slate-900">
                {calledStudents.length} <span className="text-xs font-semibold">nafar</span>
              </div>
            </div>
          </div>

          {/* Team Scoreboard Banner */}
          <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 to-amber-100/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Jamoaviy Bellashuv Natijasi
                </span>
              </div>
              <span className="text-xs font-bold text-amber-800 font-mono">
                {winnerText}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl bg-white border border-amber-200/80 p-3 flex items-center justify-between shadow-xs">
                <span className="text-xs font-bold text-slate-800">{teamA.name}</span>
                <span className="text-base font-black font-mono tabular-nums text-brand-600">
                  {teamA.score} <span className="text-[10px] text-slate-400 font-normal">ball</span>
                </span>
              </div>

              <div className="rounded-xl bg-white border border-amber-200/80 p-3 flex items-center justify-between shadow-xs">
                <span className="text-xs font-bold text-slate-800">{teamB.name}</span>
                <span className="text-base font-black font-mono tabular-nums text-rose-600">
                  {teamB.score} <span className="text-[10px] text-slate-400 font-normal">ball</span>
                </span>
              </div>
            </div>
          </div>

          {/* Called Students Log */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-brand-600" />
                <span>Chaqirilgan Talabalar Jurnali ({calledStudents.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Xolis tanlov</span>
            </div>

            {calledStudents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {calledStudents.map((st, i) => (
                  <div
                    key={`${st.name}_${i}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700 font-mono">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{st.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-[10px]">
                      +{st.pointsEarned || 1} ball
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400">
                Ushbu sessiyada tasodifiy talabalar tanlovi (Random Picker) ishlatilmadi.
              </div>
            )}
          </div>
        </div>

        {/* Footer Decision-Ready Action Bar */}
        <div className="border-t border-slate-200 bg-slate-50/90 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyReport}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-transform duration-150 active:scale-[0.96] shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-brand-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-white" />
                <span>Nusxalandi! (Telegramga tayyor)</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-brand-600" />
                <span>Telegram / Hemis uchun nusxalash</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onContinuePresentation}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-[0.96] transition-transform duration-150"
            >
              Darsga Qaytish
            </button>

            <button
              type="button"
              onClick={handleSaveAndExit}
              disabled={isSaving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/25 active:scale-[0.96] transition-transform duration-150 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>Saqlash va Chiqish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
