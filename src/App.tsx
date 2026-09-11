import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  getLessons,
  getStudentGroups,
  saveLesson,
  deleteLesson,
  saveStudentGroup,
  deleteStudentGroup,
  getLegacyDataCounts,
  claimLegacyData,
} from './db/dexie';
import { installCourse2Curriculum } from './db/initialData';
import { Lesson } from './types';
import { useAuthStore, lock as lockScreen, unlock as unlockScreen, logout as logoutAuth } from './store/authStore';
import { syncWorkspace } from './lib/workspaceSync';
import {
  isFullscreenActive,
  requestFullscreenCompat,
  exitFullscreenCompat,
} from './lib/fullscreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { PinLockScreen } from './components/dashboard/PinLockScreen';
import { GroupManagerModal } from './components/dashboard/GroupManagerModal';
import { PresentationView } from './components/presentation/PresentationView';
import { SlideBuilderModal } from './components/builder/SlideBuilderModal';
import { MobileRemoteView } from './components/remote/MobileRemoteView';

export function App() {
  // Check if opened as Mobile Remote via URL parameter
  const [remoteSessionId, setRemoteSessionId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const remoteId = urlParams.get('remote');
    if (remoteId) {
      setRemoteSessionId(remoteId);
    }
  }, []);

  // Auth State
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoadingAuth = useAuthStore((s) => s.isLoading);
  const isLocked = useAuthStore((s) => s.isLocked);
  const teacherName = useAuthStore((s) => s.teacherName);
  const currentUserId = useAuthStore((s) => s.currentUser.id);
  const legacyMigrationAsked = useRef<string | null>(null);
  const curriculumInstalledFor = useRef<string | null>(null);

  useEffect(() => {
    if (!currentUserId) return;
    const sync = async () => {
      try {
        if (curriculumInstalledFor.current !== currentUserId) {
          await installCourse2Curriculum();
          curriculumInstalledFor.current = currentUserId;
        }
        await syncWorkspace();
      } catch (error) {
        console.warn('Workspace sync failed:', error);
      }
    };
    void sync();
    window.addEventListener('online', sync);
    const interval = window.setInterval(sync, 60_000);
    return () => {
      window.removeEventListener('online', sync);
      window.clearInterval(interval);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || legacyMigrationAsked.current === currentUserId) return;
    legacyMigrationAsked.current = currentUserId;
    getLegacyDataCounts().then(({ lessons, groups, sessions }) => {
      if (!lessons && !groups && !sessions) return;
      const message = `Bu brauzerda eski darslar topildi: ${lessons} dars, ${groups} guruh, ${sessions} sessiya. Ularni faqat sizning private workspace’ingizga ko‘chirasizmi?`;
      if (window.confirm(message)) claimLegacyData().then(syncWorkspace).catch(() => {});
    }).catch(() => {});
  }, [currentUserId]);

  // Database Queries
  const lessons = useLiveQuery(() => getLessons(), [currentUserId]) || [];
  const studentGroups = useLiveQuery(() => getStudentGroups(), [currentUserId]) || [];

  // Navigation State
  const [view, setView] = useState<'dashboard' | 'presenting' | 'builder'>('dashboard');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);

  // Set initial active group when loaded
  useEffect(() => {
    if (!activeGroupId && studentGroups.length > 0) {
      setActiveGroupId(studentGroups[0].id);
    }
  }, [studentGroups, activeGroupId]);

  if (isLoadingAuth) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 text-sm font-semibold text-white">Yuklanmoqda...</main>;
  }

  // 1. Primary Login & Password Authentication Screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Mobile Remote Smartphone Interface requires the same signed-in teacher.
  if (remoteSessionId) {
    return <MobileRemoteView sessionId={remoteSessionId} />;
  }

  // 2. Classroom PIN Lock Screen (Quick-lock for projector breaks)
  if (isLocked) {
    return (
      <PinLockScreen
        teacherName={teacherName}
        onUnlock={(pin) => unlockScreen(pin)}
        onSwitchToLogin={() => logoutAuth()}
      />
    );
  }

  // Presentation View (Full Screen)
  if (view === 'presenting' && activeLesson) {
    return (
      <PresentationView
        lesson={activeLesson}
        studentGroups={studentGroups}
        activeGroup={studentGroups.find((group) => group.id === activeGroupId) || null}
        teacherName={teacherName}
        onExit={() => {
          if (isFullscreenActive()) {
            exitFullscreenCompat().catch(() => {});
          }
          setView('dashboard');
        }}
      />
    );
  }

  const handleStartPresentation = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setView('presenting');
    if (!isFullscreenActive()) {
      requestFullscreenCompat().catch((err) => {
        console.log('Fullscreen notice:', err);
      });
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setView('builder');
  };

  const handleCreateLesson = () => {
    const newLesson: Lesson = {
      id: 'lesson_' + Date.now(),
      title: 'Yangi Ingliz Tili Darsi',
      category: 'Grammar',
      level: 'Elementary',
      type: 'interactive-slides',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slides: [
        {
          id: 'slide_1',
          title: 'Asosiy Qoida',
          template: 'grammar-box',
          order: 0,
          content: {
            type: 'grammar-box',
            data: {
              ruleTitle: 'Grammar Rule Formula',
              formula: [
                { label: 'Subject', text: 'I / You / We / They', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { label: 'Verb', text: 'Base Form (V1)', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              ],
              explanation: 'Qoidaning qisqacha tushuntirishi bu yerda bo\'ladi.',
              examples: [
                { sentence: 'They speak English fluently in class.', highlightWord: 'speak', translation: 'Ular sinfda inglizcha ravon gapirishadi.' },
              ],
            },
          },
        },
      ],
    };

    setEditingLesson(newLesson);
    setView('builder');
  };

  const handleUploadPdfLesson = async (
    title: string,
    category: string,
    level: Lesson['level'],
    pdfDataUrl: string
  ) => {
    const newPdfLesson: Lesson = {
      id: 'pdf_lesson_' + Date.now(),
      title,
      category,
      level,
      type: 'pdf-presentation',
      pdfDataUrl,
      pdfPageCount: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveLesson(newPdfLesson);
  };

  const handleDeleteLesson = async (id: string) => {
    await deleteLesson(id);
  };

  return (
    <>
      <Dashboard
        lessons={lessons}
        studentGroups={studentGroups}
        activeGroupId={activeGroupId}
        teacherName={teacherName}
        onStartPresentation={handleStartPresentation}
        onEditLesson={handleEditLesson}
        onCreateLesson={handleCreateLesson}
        onUploadPdfLesson={handleUploadPdfLesson}
        onDeleteLesson={handleDeleteLesson}
        onOpenGroupManager={() => setIsGroupModalOpen(true)}
        onLockScreen={() => lockScreen()}
        onLogout={() => logoutAuth()}
      />

      {/* Slide Builder Modal */}
      {view === 'builder' && (
        <SlideBuilderModal
          isOpen={true}
          initialLesson={editingLesson}
          onClose={() => setView('dashboard')}
          onSave={async (savedLesson) => {
            await saveLesson(savedLesson);
            setView('dashboard');
          }}
        />
      )}

      {/* Student Group Manager Modal */}
      <GroupManagerModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        groups={studentGroups}
        activeGroupId={activeGroupId}
        onSelectActiveGroup={(grpId) => setActiveGroupId(grpId)}
        onSaveGroup={async (group) => {
          await saveStudentGroup(group);
        }}
        onDeleteGroup={async (grpId) => {
          await deleteStudentGroup(grpId);
          if (activeGroupId === grpId && studentGroups.length > 1) {
            const remaining = studentGroups.filter((g) => g.id !== grpId);
            setActiveGroupId(remaining[0]?.id || null);
          }
        }}
      />
    </>
  );
}

export default App;
