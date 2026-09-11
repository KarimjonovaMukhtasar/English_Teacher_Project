import React, { useState, useEffect, useRef } from 'react';
import {
  useAuthStore,
  updateProfile,
  setPin as setClassroomPin,
  logout as logoutAuth,
} from '@/store/authStore';
import {
  X,
  User,
  Shield,
  Key,
  BarChart3,
  Download,
  Upload,
  CheckCircle2,
  Building,
  GraduationCap,
  Sparkles,
  LogOut,
  RotateCcw,
  Layers,
  Users,
  FileText,
  AlertCircle,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import {
  exportAllDatabaseToJson,
  importDatabaseFromJson,
  getDatabaseStatistics,
  getLessonSessions,
} from '@/db/dexie';
import { LessonSessionRecord } from '@/types';
import { autoSeedDatabase } from '@/db/initialData';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_COLORS = [
  { label: 'Clinical Cobalt', value: '#0E56D4', bg: 'bg-[#0E56D4]' },
  { label: 'Blue', value: '#2563EB', bg: 'bg-blue-600' },
  { label: 'Emerald', value: '#059669', bg: 'bg-emerald-600' },
  { label: 'Purple', value: '#7C3AED', bg: 'bg-purple-600' },
  { label: 'Amber', value: '#D97706', bg: 'bg-amber-600' },
  { label: 'Pink', value: '#DB2777', bg: 'bg-pink-600' },
  { label: 'Cyan', value: '#0891B2', bg: 'bg-cyan-600' },
];

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({ isOpen, onClose }) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'stats' | 'backup'>('profile');

  // Form State
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [role, setRole] = useState(currentUser.role);
  const [institution, setInstitution] = useState(currentUser.institution || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarColor, setAvatarColor] = useState(currentUser.avatarColor || '#0E56D4');
  const [pin, setPin] = useState(currentUser.pin || '1234');

  // UI state
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState<{
    totalLessons: number;
    totalGroups: number;
    totalStudents: number;
    totalSlides: number;
  }>({ totalLessons: 0, totalGroups: 0, totalStudents: 0, totalSlides: 0 });
  const [recentSessions, setRecentSessions] = useState<LessonSessionRecord[]>([]);

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when user changes
  useEffect(() => {
    setFullName(currentUser.fullName);
    setRole(currentUser.role);
    setInstitution(currentUser.institution || '');
    setBio(currentUser.bio || '');
    setAvatarColor(currentUser.avatarColor || '#0E56D4');
    setPin(currentUser.pin || '');
  }, [currentUser]);

  // Load database stats & recent sessions
  useEffect(() => {
    if (isOpen) {
      getDatabaseStatistics().then(setStats).catch(() => {});
      getLessonSessions().then((s) => setRecentSessions(s.slice(0, 6))).catch(() => {});
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile({
      fullName: fullName.trim(),
      role: role.trim(),
      institution: institution.trim(),
      bio: bio.trim(),
      avatarColor,
    });
    if (!result.success) return;
    setClassroomPin(pin.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Export database to JSON file
  const handleExportData = async () => {
    try {
      const jsonStr = await exportAllDatabaseToJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `tilchi-darslar-zaxira-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Eksport qilishda xatolik yuz berdi!');
    }
  };

  // Handle JSON file import
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('Fayl o‘qilmoqda...');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const content = reader.result as string;
        const res = await importDatabaseFromJson(content);
        setImportStatus(
          `Muvaffaqiyatli yuklandi! ${res.importedLessons} ta dars va ${res.importedGroups} ta guruh tiklandi.`
        );
        const newStats = await getDatabaseStatistics();
        setStats(newStats);
      } catch (err: any) {
        console.error('Import error:', err);
        setImportStatus(`Xatolik: ${err?.message || 'Fayl formati yaroqsiz!'}`);
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Reset/reseed initial curriculum
  const handleReseedCurriculum = async () => {
    if (
      confirm(
        '2-kurs uchun 4 fakultetdagi 83 ta Medical English darsini qayta tiklamoqchimisiz? Shaxsiy darslaringiz o‘chib ketmaydi.'
      )
    ) {
      try {
        await autoSeedDatabase();
        const newStats = await getDatabaseStatistics();
        setStats(newStats);
        setImportStatus('Barcha namunaviy darslar bazaga qayta yuklandi!');
      } catch {
        alert('Namunaviy darslarni tiklashda xatolik yuz berdi.');
      }
    }
  };

  // User Initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'TQ';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-profile-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Gradient Banner & Header */}
        <div className="relative bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-6 pt-6 pb-5 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition active:scale-[0.96]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Dynamic Avatar with chosen color */}
            <div
              style={{ backgroundColor: avatarColor }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-white font-serif text-2xl font-black shadow-lg ring-4 ring-white/10 shrink-0 select-none"
            >
              {getInitials(fullName)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  id="teacher-profile-title"
                  className="text-lg md:text-xl font-bold text-white truncate"
                >
                  {fullName || 'O‘qituvchi'}
                </h3>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
                  Faol Ustoz
                </span>
              </div>
              <p className="text-xs text-stone-300 truncate mt-0.5">{role}</p>
              {institution && (
                <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-1 truncate">
                  <Building className="h-3 w-3 shrink-0 text-stone-400" />
                  <span>{institution}</span>
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-5 border-t border-stone-700/60 pt-3 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition active:scale-[0.96] shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Profil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition active:scale-[0.96] shrink-0 ${
                activeTab === 'security'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Xavfsizlik & PIN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition active:scale-[0.96] shrink-0 ${
                activeTab === 'stats'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Statistika</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition active:scale-[0.96] shrink-0 ${
                activeTab === 'backup'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Zaxira & Ko‘chirish</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-stone-800">
          {saveSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Profil ma'lumotlari muvaffaqiyatli saqlandi!</span>
            </div>
          )}

          {/* TAB 1: Profile Info */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  To‘liq Ism va Familiyangiz
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masalan: Mukhtasar Karimjonova"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-sm font-medium text-stone-900 focus:bg-white focus:border-stone-400 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mutaxassislik / Ilmiy Unvon
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Masalan: Medical English ESP Trainer"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:border-stone-400 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ta'lim Muassasasi / Institut
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Masalan: Toshkent Tibbiyot Akademiyasi"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:border-stone-400 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  O‘qituvchi haqida (Bio / Pedagogik Shior)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="O‘quvchilaringiz va hamkasblaringiz uchun qisqacha ma'lumot..."
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:border-stone-400 focus:outline-none transition resize-none"
                />
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Profil Rangi (Avatar Palitrasi)
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setAvatarColor(c.value)}
                      title={c.label}
                      className={`h-8 w-8 rounded-full ${c.bg} transition active:scale-[0.96] flex items-center justify-center ring-2 ${
                        avatarColor === c.value ? 'ring-stone-900 ring-offset-2' : 'ring-transparent'
                      }`}
                    >
                      {avatarColor === c.value && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-2xl bg-stone-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-stone-800 shadow-md transition active:scale-[0.96]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Profilni Saqlash</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & PIN */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Classroom Projector PIN */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                    <Key className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Darsxona Tezkor PIN Kodi
                    </h4>
                    <p className="text-xs text-amber-800/90 mt-0.5">
                      Dars tanaffusida yoki talabalar oldida ekranni tezkor qulflash va ochish uchun 4 xonali PIN.
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={4}
                        pattern="[0-9]*"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-32 text-center font-mono text-xl font-black tracking-widest rounded-xl border border-amber-300 bg-white py-1.5 focus:border-amber-600 focus:outline-none"
                      />
                      <span className="text-[11px] text-amber-700 font-medium">Bu PIN faqat ushbu qurilmadagi ekran qulfidir.</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="pt-2 text-xs text-stone-600">Parolni Supabase Auth orqali yangilash alohida recovery oqimida bajariladi; u hech qachon ilovada ko‘rsatilmaydi.</p>

              <div className="pt-3 border-t border-stone-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-2xl bg-stone-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-stone-800 shadow-md transition active:scale-[0.96]"
                >
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Xavfsizlikni Saqlash</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Statistics */}
          {activeTab === 'stats' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-center">
                  <div className="text-2xl font-black font-mono tabular-nums text-stone-900">
                    {stats.totalLessons}
                  </div>
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-1">
                    Jami Darslar
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-center">
                  <div className="text-2xl font-black font-mono tabular-nums text-blue-700">
                    {stats.totalSlides}
                  </div>
                  <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mt-1">
                    Slaydlar
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
                  <div className="text-2xl font-black font-mono tabular-nums text-emerald-700">
                    {stats.totalGroups}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mt-1">
                    Guruhlar
                  </div>
                </div>

                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 text-center">
                  <div className="text-2xl font-black font-mono tabular-nums text-purple-700">
                    {stats.totalStudents}
                  </div>
                  <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider mt-1">
                    O‘quvchilar
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-2 text-xs">
                <div className="font-bold text-stone-800 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-brand-600" />
                  <span>Klinik & Pedagogik Qamrov:</span>
                </div>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Tizimda 2-kurs uchun 4 fakultetdagi 83 ta Medical English darsi hamda umumiy grammatika va IELTS modullari joylashtirilgan.
                </p>
              </div>

              {/* Recent Sessions History */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span>O‘tkazilgan Dars Sessiyalari Tarixi ({recentSessions.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">So‘nggi darslar</span>
                </div>

                {recentSessions.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {recentSessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 text-xs flex items-center justify-between shadow-xs"
                      >
                        <div className="truncate mr-3">
                          <div className="font-bold text-slate-900 truncate">{sess.lessonTitle}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {sess.groupName} · {sess.durationMinutes} daq · {sess.slidesCompleted}/{sess.totalSlides} slayd
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-brand-700 text-xs">
                            {sess.teamScores.teamA.score} : {sess.teamScores.teamB.score}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-medium font-mono">
                            {sess.calledStudents?.length || 0} talaba
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3.5 text-center text-xs text-slate-400">
                    Hozircha yakunlangan dars hisobotlari mavjud emas. Taqdimotni o‘tib, "Saqlash va Chiqish" bosilganda hisobotlar shu yerda saqlanadi.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Backup & Export/Import */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    Qurilmalararo Ko‘chirish (Export / Backup)
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Barcha darslaringiz, slaydlaringiz va guruhlaringizni bitta .json fayl qilib kompyuteringizga yuklab oling. Boshqa kompyuterda bemalol ochishingiz mumkin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800 shadow-sm transition active:scale-[0.96]"
                >
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>Darslarni Zaxiralash (Eksport JSON)</span>
                </button>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    Zaxiradan Qayta Tiklash (Import / Restore)
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Avval eksport qilingan yoki boshqa o‘qituvchidan olingan .json darslar faylini yuklang.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isImporting}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 shadow-xs transition active:scale-[0.96] disabled:opacity-50"
                >
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span>{isImporting ? 'Yuklanmoqda...' : 'Fayldan Tiklash (Import JSON)'}</span>
                </button>

                {importStatus && (
                  <div className="text-xs font-semibold text-stone-700 bg-stone-100 p-2.5 rounded-xl border border-stone-200">
                    {importStatus}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-950">
                    KTP Darslarini Qayta Yuklash
                  </div>
                  <div className="text-[11px] text-amber-800">
                    2-kurs uchun 4 fakultetdagi 83 ta Medical English darsini bazaga qayta qo‘shish
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReseedCurriculum}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold active:scale-[0.96] transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Qayta Tiklash</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm('Tizimdan chiqmoqchimisiz?')) {
                logoutAuth();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 rounded-xl hover:bg-rose-50 transition active:scale-[0.96]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Tizimdan Chiqish</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-bold text-white transition active:scale-[0.96]"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
