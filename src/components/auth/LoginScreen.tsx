import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  UserPlus,
  Key,
  Building,
  GraduationCap,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const LoginScreen: React.FC = () => {
  const loginAction = useAuthStore((s) => s.login);
  const registerAction = useAuthStore((s) => s.register);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Register form state
  const [regFullName, setRegFullName] = useState<string>('');
  const [regRole, setRegRole] = useState<string>('Medical English ESP · IELTS Trainer');
  const [regInstitution, setRegInstitution] = useState<string>('Toshkent Tibbiyot Akademiyasi');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage('Iltimos, email va parolni to‘liq kiriting.');
      return;
    }
    setIsLoading(true);
    const result = await loginAction(email, password);
    setIsLoading(false);
    if (!result.success) setErrorMessage(result.error || "Email yoki parol noto'g'ri.");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!regFullName.trim() || !regEmail.trim() || regPassword.length < 8) {
      setErrorMessage('Ism, email va kamida 8 belgili parol kiriting.');
      return;
    }
    setIsLoading(true);
    const result = await registerAction({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      institution: regInstitution,
    });
    setIsLoading(false);
    if (!result.success) setErrorMessage(result.error || "Ro'yxatdan o'tishda xatolik yuz berdi.");
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-primary flex flex-col justify-between selection:bg-brand-600 selection:text-white">
      {/* Top micro-bar */}
      <header className="w-full border-b border-surface-border bg-surface-card px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-secondary">
              O'qituvchi ish maydoni
            </span>
          </div>

          <a
            href="https://tilchi.uz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition"
          >
            <span>tilchi.uz bosh sahifasi</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xl shadow-brand-600/25 mb-3 ring-4 ring-brand-600/10">
              <span className="text-3xl font-black -translate-y-[1px]">t</span>
            </div>

            <div className="flex items-center gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
                tilchi
              </h1>
              <span className="text-2xl font-black text-brand-600">.uz</span>
              <span className="ml-2 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-600 uppercase tracking-wider border border-brand-200">
                app.tilchi.uz
              </span>
            </div>

            <h2 className="mt-1 text-sm font-bold text-stone-700 tracking-wide uppercase">
              O'qituvchilar Sinf Taqdimot Tizimi
            </h2>
            <p className="mt-0.5 text-xs text-stone-500 max-w-xs">
              Mukhtasar Karimjonova metodikasi va barcha ingliz tili ustozlari uchun ochiq ta'lim platformasi
            </p>
          </div>

          {/* Card Container with Mode Tabs */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50">
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-stone-100 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition active:scale-[0.96] flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                <span>Tizimga Kirish</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition active:scale-[0.96] flex items-center justify-center gap-1.5 ${
                  authMode === 'register'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <UserPlus className="h-4 w-4 text-brand-600" />
                <span>Ro'yxatdan O'tish</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2 animate-shake">
                <span className="font-bold text-rose-600 shrink-0">!</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Parol
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-600 transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <p className="pt-1 text-xs text-stone-600">Qurilmangizdagi xavfsiz sessiya avtomatik saqlanadi.</p>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition active:scale-[0.96] disabled:opacity-50 mt-2"
                >
                  <span>{isLoading ? 'Kirilmoqda...' : 'Hisobga Kirish'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    To‘liq Ism va Familiyangiz
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Masalan: Dilnoza Karimova"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Mutaxassislik
                    </label>
                    <input
                      type="text"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      placeholder="IELTS / General / Medical"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Muassasa
                    </label>
                    <input
                      type="text"
                      value={regInstitution}
                      onChange={(e) => setRegInstitution(e.target.value)}
                      placeholder="Universitet / Maktab"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="dilnoza@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Parol
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition active:scale-[0.96] disabled:opacity-50 mt-1"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isLoading ? 'Yaratilmoqda...' : 'Ro‘yxatdan O‘tish va Boshlash'}</span>
                </button>
              </form>
            )}


          </div>

          {/* Subproject note */}
          <div className="mt-5 text-center text-xs text-stone-500">
            <p>
              Bu tizim <a href="https://tilchi.uz" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-600 hover:underline">tilchi.uz</a> platformasining darsxona taqdimot quyi tizimi hisoblanadi (<strong>app.tilchi.uz</strong>).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/40 py-3.5 px-6 text-center text-xs text-stone-400">
        <p>© 2026 tilchi.uz - Mukhtasar Karimjonova bilan online ingliz tili darslari. Barcha huquqlar himoyalangan.</p>
      </footer>
    </div>
  );
};
