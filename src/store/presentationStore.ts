import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { PresenterTool, StudentGroup, Lesson, CalledStudentActivity } from '@/types';
import { getLessonById, saveLesson } from '@/db/dexie';
import {
  toggleFullscreenCompat,
  isFullscreenActive,
  exitFullscreenCompat,
  requestFullscreenCompat,
} from '@/lib/fullscreen';

export interface PresentationState {
  // Current active lesson
  currentLesson?: Lesson | null;

  // Session tracking & Brief
  sessionStartTime: number;
  calledStudents: CalledStudentActivity[];
  isSessionSummaryOpen: boolean;

  // Tools and Drawing
  activeTool: PresenterTool;
  penColor: string;
  penSize: number;
  highlighterColor: string;
  highlighterSize: number;
  clearCanvasTrigger: number; // Increment to signal canvas clearing

  // Navigation
  currentSlideIndex: number;
  totalSlides: number;
  revealStage: number;

  // Timer state for WebRTC & Modals
  isTimerOpen: boolean;
  isTimerRunning: boolean;
  timerSeconds: number;
  timerEndsAt: number | null;

  // Search & Pedagogical Tools (Scoreboard, Instant Navigator, Pedagogy Toolbox)
  isSlideSearchOpen: boolean;
  isScoreboardOpen: boolean;
  isPedagogyModalOpen: boolean;
  isTranslationCurtainActive: boolean;
  teamScoreA: number;
  teamScoreB: number;

  // Screen modes & Modals
  isBlackout: boolean;
  isWhiteout: boolean;
  isRandomPickerOpen: boolean;
  randomPickerTrigger: number;
  isSpeakerNotesOpen: boolean;
  isQrRemoteOpen: boolean;
  isRemoteModalOpen: boolean;
  isRemoteConnected: boolean;
  isFullscreen: boolean;
  remoteSessionId: string;

  // Classroom groups
  activeGroup: StudentGroup | null;
  studentGroups: StudentGroup[];
}

// Generate friendly 6-char session ID for remote pairing
const generateSessionId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Initial sample groups for instant classroom use
export const DEFAULT_STUDENT_GROUPS: StudentGroup[] = [
  {
    id: 'group-ielts-morning',
    name: 'IELTS Morning 09:00',
    students: [
      'Jasur Rahimov',
      'Madina Karimova',
      'Anvar Aliyev',
      'Dilnoza Olimova',
      'Shaxzod Bekmurodov',
      'Kamila Yusupova',
      'Aziz Mahmudov',
      'Malika Rustamova',
      'Bekzod Toirov',
      'Zilola Saidova'
    ],
    createdAt: Date.now()
  },
  {
    id: 'group-pre-inter',
    name: 'General English Pre-Intermediate',
    students: [
      'Sardorbek Ergashev',
      'Nodira Qosimova',
      'Javohir Nematov',
      'Gulnoza Xoliqova',
      'Ulug\'bek Jo\'rayev',
      'Shahnoza Tursunova',
      'Farrux Ahmedov',
      'Sevara Ismoilova'
    ],
    createdAt: Date.now()
  },
  {
    id: 'group-kids-starters',
    name: 'Kids English Starters',
    students: [
      'Amir',
      'Rayhon',
      'Bilol',
      'Safiya',
      'Samir',
      'Imona',
      'Ali',
      'Omina'
    ],
    createdAt: Date.now()
  }
];

const initialState: PresentationState = {
  currentLesson: null,
  activeTool: 'pointer',
  penColor: '#ef4444', // Crimson red
  penSize: 4,
  highlighterColor: '#facc15', // Vibrant yellow
  highlighterSize: 24,
  clearCanvasTrigger: 0,
  currentSlideIndex: 0,
  totalSlides: 1,
  revealStage: 0,
  isTimerOpen: false,
  isTimerRunning: false,
  timerSeconds: 120,
  timerEndsAt: null,
  isSlideSearchOpen: false,
  isScoreboardOpen: false,
  isPedagogyModalOpen: false,
  isTranslationCurtainActive: false,
  teamScoreA: 0,
  teamScoreB: 0,
  isBlackout: false,
  isWhiteout: false,
  isRandomPickerOpen: false,
  randomPickerTrigger: 0,
  isSpeakerNotesOpen: false,
  isQrRemoteOpen: false,
  isRemoteModalOpen: false,
  isRemoteConnected: false,
  isFullscreen: false,
  remoteSessionId: generateSessionId(),
  activeGroup: DEFAULT_STUDENT_GROUPS[0],
  studentGroups: DEFAULT_STUDENT_GROUPS,
  sessionStartTime: Date.now(),
  calledStudents: [],
  isSessionSummaryOpen: false,
};

export const presentationStore = new Store<PresentationState>(initialState);

// React hook helper
export function usePresentationStore<T = PresentationState>(
  selector?: (state: PresentationState) => T
): T {
  return useStore(presentationStore, selector ?? ((s) => s as unknown as T));
}

// Action helpers
export const setActiveTool = (tool: PresenterTool) => {
  presentationStore.setState((prev) => ({ ...prev, activeTool: tool }));
};

export const setTool = setActiveTool;

export const setPenColor = (color: string) => {
  presentationStore.setState((prev) => ({ ...prev, penColor: color }));
};

export const setPenSize = (size: number) => {
  presentationStore.setState((prev) => ({ ...prev, penSize: size }));
};

export const setHighlighterColor = (color: string) => {
  presentationStore.setState((prev) => ({ ...prev, highlighterColor: color }));
};

export const setHighlighterSize = (size: number) => {
  presentationStore.setState((prev) => ({ ...prev, highlighterSize: size }));
};

// Storage key helper for instant synchronous slide resume
const getStorageKey = (lessonId: string) => `tilchi_last_slide_${lessonId}`;

// Persist last slide index to Dexie database AND localStorage so teacher resumes seamlessly
export const persistSlideIndex = (lessonId: string | undefined, index: number) => {
  if (!lessonId) return;
  try {
    localStorage.setItem(getStorageKey(lessonId), String(index));
  } catch {
    // Ignore private browsing quota issues
  }
  getLessonById(lessonId)
    .then((lesson) => lesson && saveLesson({ ...lesson, lastSlideIndex: index }))
    .catch(() => {});
};

export const getPersistedSlideIndex = (lesson: Lesson | null | undefined): number => {
  if (!lesson) return 0;
  try {
    const raw = localStorage.getItem(getStorageKey(lesson.id));
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
  } catch {}
  return lesson.lastSlideIndex ?? 0;
};

export const clearCanvas = () => {
  presentationStore.setState((prev) => ({
    ...prev,
    clearCanvasTrigger: prev.clearCanvasTrigger + 1
  }));
};

export const setCurrentSlideIndex = (
  updater: number | ((prev: number) => number)
) => {
  presentationStore.setState((prev) => {
    const nextIndex = typeof updater === 'function' ? updater(prev.currentSlideIndex) : updater;
    const clamped = Math.max(0, Math.min(nextIndex, Math.max(0, prev.totalSlides - 1)));
    if (prev.currentLesson?.id) {
      persistSlideIndex(prev.currentLesson.id, clamped);
    }
    return { ...prev, currentSlideIndex: clamped, revealStage: 0 };
  });
};

export const setTotalSlides = (total: number) => {
  presentationStore.setState((prev) => ({
    ...prev,
    totalSlides: Math.max(1, total),
    currentSlideIndex: Math.min(prev.currentSlideIndex, Math.max(0, total - 1))
  }));
};

export const nextSlide = () => {
  presentationStore.setState((prev) => {
    const currentSlide = prev.currentLesson?.slides?.[prev.currentSlideIndex];
    // If click-to-reveal slide has not revealed answer yet, reveal it first!
    if (currentSlide?.template === 'click-to-reveal' && prev.revealStage === 0) {
      return { ...prev, revealStage: 1 };
    }

    if (prev.currentSlideIndex < prev.totalSlides - 1) {
      const nextIdx = prev.currentSlideIndex + 1;
      if (prev.currentLesson?.id) {
        persistSlideIndex(prev.currentLesson.id, nextIdx);
      }
      return { ...prev, currentSlideIndex: nextIdx, revealStage: 0 };
    }
    return prev;
  });
};

export const prevSlide = () => {
  presentationStore.setState((prev) => {
    // If answer is revealed, un-reveal it first before jumping slide
    if (prev.revealStage > 0) {
      return { ...prev, revealStage: 0 };
    }

    if (prev.currentSlideIndex > 0) {
      const nextIdx = prev.currentSlideIndex - 1;
      if (prev.currentLesson?.id) {
        persistSlideIndex(prev.currentLesson.id, nextIdx);
      }
      return { ...prev, currentSlideIndex: nextIdx, revealStage: 0 };
    }
    return prev;
  });
};

export const goToSlide = (index: number) => {
  setCurrentSlideIndex(index);
};

export const toggleBlackout = (force?: boolean) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isBlackout: force !== undefined ? force : !prev.isBlackout,
    isWhiteout: false // Mutual exclusion
  }));
};

export const toggleWhiteout = (force?: boolean) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isWhiteout: force !== undefined ? force : !prev.isWhiteout,
    isBlackout: false // Mutual exclusion
  }));
};

export const toggleTimer = (force?: boolean) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isTimerOpen: force !== undefined ? force : !prev.isTimerOpen
  }));
};

export const openTimer = () => toggleTimer(true);
export const closeTimer = () => toggleTimer(false);

export const startTimer = () => {
  presentationStore.setState((prev) => ({
    ...prev,
    isTimerOpen: true,
    isTimerRunning: prev.timerSeconds > 0,
    timerEndsAt: prev.timerSeconds > 0 ? Date.now() + prev.timerSeconds * 1000 : null,
  }));
};

export const pauseTimer = () => {
  presentationStore.setState((prev) => ({
    ...prev,
    isTimerRunning: false,
    timerSeconds: prev.timerEndsAt ? Math.max(0, Math.ceil((prev.timerEndsAt - Date.now()) / 1000)) : prev.timerSeconds,
    timerEndsAt: null,
  }));
};

export const resetTimer = (seconds: number = 120) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isTimerRunning: false,
    timerSeconds: seconds,
    timerEndsAt: null,
  }));
};

export const setTimerSeconds = (seconds: number) => {
  presentationStore.setState((prev) => ({
    ...prev,
    timerSeconds: Math.max(0, seconds),
    timerEndsAt: prev.isTimerRunning ? Date.now() + Math.max(0, seconds) * 1000 : null,
  }));
};

export const tickTimer = () => {
  presentationStore.setState((prev) => {
    if (!prev.isTimerRunning || !prev.timerEndsAt) return prev;
    const timerSeconds = Math.max(0, Math.ceil((prev.timerEndsAt - Date.now()) / 1000));
    return timerSeconds === 0
      ? { ...prev, timerSeconds, isTimerRunning: false, timerEndsAt: null }
      : timerSeconds === prev.timerSeconds ? prev : { ...prev, timerSeconds };
  });
};

export const toggleRandomPicker = (force?: boolean) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isRandomPickerOpen: force !== undefined ? force : !prev.isRandomPickerOpen
  }));
};

export const triggerRandomPick = () => {
  presentationStore.setState((prev) => ({
    ...prev,
    isRandomPickerOpen: true,
    randomPickerTrigger: prev.randomPickerTrigger + 1
  }));
};

export const setIsRemoteConnected = (connected: boolean) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isRemoteConnected: connected
  }));
};

export const toggleSpeakerNotes = (force?: boolean) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isSpeakerNotesOpen: force !== undefined ? force : !prev.isSpeakerNotesOpen
  }));
};

export const toggleQrRemote = (force?: boolean) => {
  presentationStore.setState((prev) => {
    const nextVal = force !== undefined ? force : !prev.isQrRemoteOpen;
    return {
      ...prev,
      isQrRemoteOpen: nextVal,
      isRemoteModalOpen: nextVal
    };
  });
};

export const toggleRemoteModal = (force?: boolean) => toggleQrRemote(force);

export const setFullscreen = (isFullscreen: boolean) => {
  presentationStore.setState((prev) => ({ ...prev, isFullscreen }));
};

export const toggleFullscreen = async (containerElement?: HTMLElement | null) => {
  try {
    const target = containerElement || document.documentElement;
    await toggleFullscreenCompat(target);
    presentationStore.setState((prev) => ({ ...prev, isFullscreen: isFullscreenActive() }));
  } catch (err) {
    console.error('Fullscreen toggle error:', err);
  }
};

export const setActiveGroup = (group: StudentGroup | null) => {
  presentationStore.setState((prev) => ({ ...prev, activeGroup: group }));
};

export const setCurrentLesson = (lesson: Lesson | null, overrideStartIndex?: number) => {
  const total = lesson?.type === 'pdf-presentation'
    ? (lesson.pdfPageCount || 1)
    : (lesson?.slides?.length || 1);

  let targetIndex = 0;
  if (overrideStartIndex !== undefined && overrideStartIndex !== null) {
    targetIndex = Math.min(Math.max(0, overrideStartIndex), Math.max(0, total - 1));
    if (lesson?.id) {
      persistSlideIndex(lesson.id, targetIndex);
    }
  } else {
    // Resume presentation from where the teacher left off
    const savedIdx = getPersistedSlideIndex(lesson);
    targetIndex = savedIdx > 0
      ? Math.min(savedIdx, Math.max(0, total - 1))
      : 0;
  }

  presentationStore.setState((prev) => ({
    ...prev,
    currentLesson: lesson,
    totalSlides: Math.max(1, total),
    currentSlideIndex: targetIndex,
    revealStage: 0,
    sessionStartTime: Date.now(),
    calledStudents: [],
    teamScoreA: 0,
    teamScoreB: 0,
    isSessionSummaryOpen: false
  }));
};

export const toggleSlideSearch = (force?: boolean) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isSlideSearchOpen: force !== undefined ? force : !prev.isSlideSearchOpen
  }));
};

export const closeSlideSearch = () => toggleSlideSearch(false);

export const toggleScoreboard = (force?: boolean) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isScoreboardOpen: force !== undefined ? force : !prev.isScoreboardOpen
  }));
};

export const closeScoreboard = () => toggleScoreboard(false);

export const togglePedagogyModal = (force?: boolean) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isPedagogyModalOpen: force !== undefined ? force : !prev.isPedagogyModalOpen
  }));
};

export const closePedagogyModal = () => togglePedagogyModal(false);

export const toggleTranslationCurtain = (force?: boolean) => {
  presentationStore.setState((prev) => ({
    ...prev,
    isTranslationCurtainActive:
      force !== undefined ? force : !prev.isTranslationCurtainActive
  }));
};

export const addTeamScore = (team: 'A' | 'B', delta: number) => {
  presentationStore.setState((prev) => {
    if (team === 'A') {
      return { ...prev, teamScoreA: Math.max(0, prev.teamScoreA + delta) };
    } else {
      return { ...prev, teamScoreB: Math.max(0, prev.teamScoreB + delta) };
    }
  });
};

export const resetTeamScore = () => {
  presentationStore.setState((prev) => ({
    ...prev,
    teamScoreA: 0,
    teamScoreB: 0
  }));
};

export const recordCalledStudent = (name: string, points = 1) => {
  presentationStore.setState((prev) => {
    const existing = prev.calledStudents.find((s) => s.name === name);
    if (existing) {
      return {
        ...prev,
        calledStudents: prev.calledStudents.map((s) =>
          s.name === name ? { ...s, pointsEarned: (s.pointsEarned || 0) + points } : s
        ),
      };
    }
    return {
      ...prev,
      calledStudents: [
        ...prev.calledStudents,
        { name, calledAt: Date.now(), pointsEarned: points, status: 'participated' },
      ],
    };
  });
};

export const openSessionSummary = () => {
  presentationStore.setState((prev) => ({ ...prev, isSessionSummaryOpen: true }));
};

export const closeSessionSummary = () => {
  presentationStore.setState((prev) => ({ ...prev, isSessionSummaryOpen: false }));
};

export const resetSessionMetrics = () => {
  presentationStore.setState((prev) => ({
    ...prev,
    sessionStartTime: Date.now(),
    calledStudents: [],
    teamScoreA: 0,
    teamScoreB: 0,
    isSessionSummaryOpen: false,
  }));
};

export const presentationActions = {
  setActiveTool,
  setTool,
  setPenColor,
  setPenSize,
  setHighlighterColor,
  setHighlighterSize,
  clearCanvas,
  setCurrentSlideIndex,
  setTotalSlides,
  nextSlide,
  prevSlide,
  goToSlide,
  toggleBlackout,
  toggleWhiteout,
  toggleTimer,
  openTimer,
  closeTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  setTimerSeconds,
  tickTimer,
  toggleRandomPicker,
  triggerRandomPick,
  setIsRemoteConnected,
  toggleSpeakerNotes,
  toggleQrRemote,
  toggleRemoteModal,
  setFullscreen,
  toggleFullscreen,
  setActiveGroup,
  setCurrentLesson,
  toggleSlideSearch,
  closeSlideSearch,
  toggleScoreboard,
  closeScoreboard,
  togglePedagogyModal,
  closePedagogyModal,
  toggleTranslationCurtain,
  addTeamScore,
  resetTeamScore,
  getPersistedSlideIndex,
  persistSlideIndex,
  recordCalledStudent,
  openSessionSummary,
  closeSessionSummary,
  resetSessionMetrics,
};
