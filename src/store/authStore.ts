import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { UserProfile } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLocked: boolean;
  currentUser: UserProfile;
  teacherLogin: string;
  teacherName: string;
  teacherRole: string;
  currentPin: string;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (userData: RegistrationData) => Promise<AuthResult>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthResult>;
  logout: () => Promise<void>;
  unlock: (pin: string) => boolean;
  lock: () => void;
  setPin: (newPin: string) => void;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  role?: string;
  institution?: string;
  bio?: string;
}

const AVATAR_PALETTE = ['#B84328', '#0E56D4', '#059669', '#7C3AED', '#D97706', '#DB2777', '#0891B2'];

const emptyUser: UserProfile = {
  id: '',
  username: '',
  fullName: '',
  role: '',
  institution: '',
  pin: '',
  bio: '',
  email: '',
  joinedDate: 0,
};

const pinStorageKey = (userId: string) => `tilchi_classroom_pin_${userId}`;

const getPin = (userId: string) => {
  try {
    return localStorage.getItem(pinStorageKey(userId)) || '';
  } catch {
    return '';
  }
};

const profileFromAuthUser = (user: { id: string; email?: string; user_metadata: Record<string, unknown>; created_at?: string }): UserProfile => ({
  id: user.id,
  email: user.email || '',
  username: typeof user.user_metadata.username === 'string' ? user.user_metadata.username : user.email || '',
  fullName: typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : user.email || '',
  role: typeof user.user_metadata.role === 'string' ? user.user_metadata.role : "Ingliz Tili O'qituvchisi",
  institution: typeof user.user_metadata.institution === 'string' ? user.user_metadata.institution : '',
  bio: typeof user.user_metadata.bio === 'string' ? user.user_metadata.bio : '',
  avatarColor: typeof user.user_metadata.avatar_color === 'string' ? user.user_metadata.avatar_color : '#0E56D4',
  pin: getPin(user.id),
  joinedDate: user.created_at ? Date.parse(user.created_at) : Date.now(),
});

const applyUser = (currentUser: UserProfile | null) => {
  authStore.setState((state) => ({
    ...state,
    isLoading: false,
    isAuthenticated: Boolean(currentUser),
    isLocked: false,
    currentUser: currentUser || emptyUser,
    teacherLogin: currentUser?.email || '',
    teacherName: currentUser?.fullName || '',
    teacherRole: currentUser?.role || '',
    currentPin: currentUser?.pin || '',
  }));
};

const loadProfile = async (user: { id: string; email?: string; user_metadata: Record<string, unknown>; created_at?: string }) => {
  const fallback = profileFromAuthUser(user);
  if (!supabase) return fallback;

  const { data } = await supabase
    .from('profiles')
    .select('full_name, role, institution, bio, avatar_color, created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!data) return fallback;
  return {
    ...fallback,
    fullName: data.full_name || fallback.fullName,
    role: data.role || fallback.role,
    institution: data.institution || '',
    bio: data.bio || '',
    avatarColor: data.avatar_color || fallback.avatarColor,
    joinedDate: data.created_at ? Date.parse(data.created_at) : fallback.joinedDate,
  };
};

export const login = async (email: string, password: string): Promise<AuthResult> => {
  if (!supabase) return { success: false, error: "Supabase sozlanmagan. Administrator bilan bog'laning." };

  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) return { success: false, error: error?.message || "Login yoki parol noto'g'ri." };

  applyUser(await loadProfile(data.user));
  return { success: true };
};

export const register = async (userData: RegistrationData): Promise<AuthResult> => {
  if (!supabase) return { success: false, error: "Supabase sozlanmagan. Administrator bilan bog'laning." };

  const fullName = userData.fullName.trim();
  const email = userData.email.trim().toLowerCase();
  if (!fullName || !email || passwordTooShort(userData.password)) {
    return { success: false, error: "Ism, email va kamida 8 belgili parol kiriting." };
  }

  const avatarColor = AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)];
  const { data, error } = await supabase.auth.signUp({
    email,
    password: userData.password,
    options: {
      data: {
        full_name: fullName,
        username: email,
        role: userData.role?.trim() || "Ingliz Tili O'qituvchisi",
        institution: userData.institution?.trim() || '',
        bio: userData.bio?.trim() || '',
        avatar_color: avatarColor,
      },
    },
  });
  if (error) return { success: false, error: error.message };
  if (!data.user) return { success: false, error: "Hisob yaratilmadi." };
  if (!data.session) return { success: true, error: "Tasdiqlash emailini ochib, keyin tizimga kiring." };

  applyUser(await loadProfile(data.user));
  return { success: true };
};

const passwordTooShort = (password: string) => password.length < 8;

export const updateProfile = async (updates: Partial<UserProfile>): Promise<AuthResult> => {
  const current = authStore.state.currentUser;
  if (!supabase || !current.id) return { success: false, error: "Tizimga qayta kiring." };

  const profile = {
    id: current.id,
    full_name: updates.fullName?.trim() ?? current.fullName,
    role: updates.role?.trim() ?? current.role,
    institution: updates.institution?.trim() ?? current.institution ?? '',
    bio: updates.bio?.trim() ?? current.bio ?? '',
    avatar_color: updates.avatarColor ?? current.avatarColor ?? '#0E56D4',
  };
  const { error } = await supabase.from('profiles').upsert(profile);
  if (error) return { success: false, error: error.message };

  const next = { ...current, ...updates, ...profile, fullName: profile.full_name, avatarColor: profile.avatar_color };
  applyUser(next);
  return { success: true };
};

export const logout = async (): Promise<void> => {
  await supabase?.auth.signOut();
  applyUser(null);
};

export const unlock = (pin: string): boolean => {
  if (pin && pin === authStore.state.currentPin) {
    authStore.setState((state) => ({ ...state, isLocked: false }));
    return true;
  }
  return false;
};

export const lock = () => authStore.setState((state) => ({ ...state, isLocked: true }));

export const setPin = (newPin: string) => {
  const user = authStore.state.currentUser;
  if (!user.id || !/^\d{4,8}$/.test(newPin)) return;
  try {
    localStorage.setItem(pinStorageKey(user.id), newPin);
  } catch {}
  applyUser({ ...user, pin: newPin });
};

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: isSupabaseConfigured,
  isLocked: false,
  currentUser: emptyUser,
  teacherLogin: '',
  teacherName: '',
  teacherRole: '',
  currentPin: '',
  login,
  register,
  updateProfile,
  logout,
  unlock,
  lock,
  setPin,
};

export const authStore = new Store<AuthState>(initialAuthState);

if (supabase) {
  supabase.auth.getSession().then(async ({ data }) => {
    applyUser(data.session?.user ? await loadProfile(data.session.user) : null);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      applyUser(null);
      return;
    }
    loadProfile(session.user).then(applyUser);
  });
}

export function useAuthStore(): AuthState;
export function useAuthStore<TSelected>(selector: (state: AuthState) => TSelected): TSelected;
export function useAuthStore<TSelected>(selector?: (state: AuthState) => TSelected): TSelected | AuthState {
  return useStore(authStore, selector as (state: AuthState) => TSelected);
}
