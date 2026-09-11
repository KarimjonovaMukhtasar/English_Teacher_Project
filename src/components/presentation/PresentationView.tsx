import React, { useEffect, useRef, useCallback } from 'react';
import { usePresentationStore, presentationActions } from '@/store';
import { Lesson, StudentGroup } from '@/types';
import { saveLesson } from '@/db/dexie';
import { SlideViewer } from '@/components/builder/SlideViewer';
import { PDFPresentationView } from './PDFPresentationView';
import { AnnotationCanvas } from './AnnotationCanvas';
import { LaserSpotlight } from './LaserSpotlight';
import { PresenterToolbar } from './PresenterToolbar';
import { TimerModal } from './TimerModal';
import { RandomPickerModal } from './RandomPickerModal';
import { SlideSearchModal } from './SlideSearchModal';
import { TeamScoreboardModal } from './TeamScoreboardModal';
import { ClassroomPedagogyModal } from './ClassroomPedagogyModal';
import { RemotePairingModal } from '@/components/remote/RemotePairingModal';
import { SessionSummaryModal } from './SessionSummaryModal';
import { webrtcManager } from '@/lib/webrtc';
import {
  addFullscreenChangeListener,
  isFullscreenActive,
  exitFullscreenCompat,
} from '@/lib/fullscreen';
import { X } from 'lucide-react';

interface PresentationViewProps {
  lesson: Lesson;
  studentGroups: StudentGroup[];
  activeGroup: StudentGroup | null;
  teacherName: string;
  onExit: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  lesson,
  studentGroups,
  activeGroup,
  teacherName,
  onExit,
}) => {
  const store = usePresentationStore();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep track of current slide index for persistence on unmount/exit
  const currentSlideIndexRef = useRef(store.currentSlideIndex);
  useEffect(() => {
    currentSlideIndexRef.current = store.currentSlideIndex;
  }, [store.currentSlideIndex]);

  // Initialize lesson in presentationStore with persisted/last slide index
  useEffect(() => {
    presentationActions.setCurrentLesson(lesson, lesson.lastSlideIndex);
    presentationActions.setActiveGroup(activeGroup);
  }, [lesson, activeGroup]);

  // Persist current slide index on unmount
  useEffect(() => {
    return () => {
      presentationActions.persistSlideIndex(lesson.id, currentSlideIndexRef.current);
    };
  }, [lesson.id]);

  const handleExit = useCallback(() => {
    presentationActions.openSessionSummary();
  }, []);

  const handleForceExit = useCallback(() => {
    presentationActions.persistSlideIndex(lesson.id, currentSlideIndexRef.current);
    if (isFullscreenActive()) {
      exitFullscreenCompat().catch(() => {});
    }
    onExit();
  }, [lesson.id, onExit]);

  // WebRTC Host and Fullscreen synchronization lifecycle
  useEffect(() => {
    // Initialize WebRTC host for mobile remote pairing
    webrtcManager.initHost(store.remoteSessionId);

    // Sync fullscreen state with cross-browser events (Safari, Chrome, Firefox)
    const cleanupFs = addFullscreenChangeListener((isFs) => {
      presentationActions.setFullscreen(isFs);
    });

    return () => {
      cleanupFs();
      if (isFullscreenActive()) {
        exitFullscreenCompat().catch(() => {});
      }
      webrtcManager.destroy();
    };
  }, []);

  // Sync state with mobile phone whenever slide or timer changes
  useEffect(() => {
    webrtcManager.sendHostState();
  }, [store.currentSlideIndex, store.isTimerRunning, store.timerSeconds, store.isBlackout]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input or textarea unless it's Escape
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key !== 'Escape') return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ': // Spacebar
          // Do not navigate slides if an interactive overlay modal is currently open
          if (
            store.isTimerOpen ||
            store.isRandomPickerOpen ||
            store.isPedagogyModalOpen ||
            store.isSlideSearchOpen ||
            store.isScoreboardOpen ||
            store.isRemoteModalOpen
          ) {
            return;
          }
          e.preventDefault();
          presentationActions.nextSlide();
          break;

        case 'ArrowLeft':
        case 'PageUp':
          if (
            store.isTimerOpen ||
            store.isRandomPickerOpen ||
            store.isPedagogyModalOpen ||
            store.isSlideSearchOpen ||
            store.isScoreboardOpen ||
            store.isRemoteModalOpen
          ) {
            return;
          }
          e.preventDefault();
          presentationActions.prevSlide();
          break;

        case 'b':
        case 'B':
          presentationActions.toggleBlackout();
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          presentationActions.toggleFullscreen();
          break;

        case 'w':
        case 'W':
          presentationActions.toggleWhiteout();
          break;

        case 'l':
        case 'L':
          presentationActions.setTool(store.activeTool === 'laser' ? 'pointer' : 'laser');
          break;

        case 'p':
        case 'P':
          presentationActions.setTool(store.activeTool === 'pen' ? 'pointer' : 'pen');
          break;

        case 'h':
        case 'H':
          presentationActions.setTool(store.activeTool === 'highlighter' ? 'pointer' : 'highlighter');
          break;

        case 'e':
        case 'E':
          presentationActions.setTool(store.activeTool === 'eraser' ? 'pointer' : 'eraser');
          break;

        case 'c':
        case 'C':
          e.preventDefault();
          presentationActions.clearCanvas();
          break;

        case 't':
        case 'T':
          if (store.isTimerOpen) {
            presentationActions.closeTimer();
          } else {
            presentationActions.openTimer();
          }
          break;

        case 's':
        case 'S':
          presentationActions.toggleSpeakerNotes();
          break;

        case '/':
          e.preventDefault();
          presentationActions.toggleSlideSearch();
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          presentationActions.togglePedagogyModal();
          break;

        case 'u':
        case 'U':
          e.preventDefault();
          presentationActions.toggleTranslationCurtain();
          break;

        case 'Escape':
          e.preventDefault();
          // Priority order for Escape key to prevent abrupt lesson exit
          if (store.isSessionSummaryOpen) {
            presentationActions.closeSessionSummary();
            return;
          }
          if (store.isSlideSearchOpen) {
            presentationActions.closeSlideSearch();
            return;
          }
          if (store.isPedagogyModalOpen) {
            presentationActions.closePedagogyModal();
            return;
          }
          if (store.isScoreboardOpen) {
            presentationActions.closeScoreboard();
            return;
          }
          if (store.isTimerOpen) {
            presentationActions.closeTimer();
            return;
          }
          if (store.isRandomPickerOpen) {
            presentationActions.toggleRandomPicker(false);
            return;
          }
          if (store.isSpeakerNotesOpen) {
            presentationActions.toggleSpeakerNotes(false);
            return;
          }
          if (store.isRemoteModalOpen || store.isQrRemoteOpen) {
            presentationActions.toggleQrRemote(false);
            return;
          }
          if (store.isBlackout) {
            presentationActions.toggleBlackout(false);
            return;
          }
          if (store.isWhiteout) {
            presentationActions.toggleWhiteout(false);
            return;
          }
          if (isFullscreenActive()) {
            exitFullscreenCompat().catch(() => {});
            return;
          }
          if (store.activeTool !== 'pointer') {
            presentationActions.setActiveTool('pointer');
            return;
          }
          handleExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    store.activeTool,
    store.isTimerOpen,
    store.isRandomPickerOpen,
    store.isSlideSearchOpen,
    store.isScoreboardOpen,
    store.isPedagogyModalOpen,
    store.isBlackout,
    store.isWhiteout,
    store.isSpeakerNotesOpen,
    store.isRemoteModalOpen,
    handleExit,
  ]);

  const currentSlide = lesson.slides?.[store.currentSlideIndex];
  const totalSlides = lesson.type === 'pdf-presentation'
    ? (lesson.pdfPageCount || 1)
    : (lesson.slides?.length || 1);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 flex h-[100dvh] w-full min-h-[100dvh] flex-col overflow-hidden bg-slate-950 select-none antialiased"
    >
      {/* Slide & PDF Presentation Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {lesson.type === 'pdf-presentation' && lesson.pdfDataUrl ? (
          <PDFPresentationView
            pdfDataUrl={lesson.pdfDataUrl}
            currentPage={store.currentSlideIndex + 1}
            onPageCountLoaded={(count) => {
              presentationActions.setTotalSlides(count);
              if (lesson.pdfPageCount !== count) {
                saveLesson({ ...lesson, pdfPageCount: count }).catch(() => {});
              }
            }}
          />
        ) : currentSlide ? (
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 pb-20 sm:pb-24">
            <div className="relative w-full max-w-[calc((100dvh-5.5rem)*16/9)] max-h-[calc(100dvh-5.5rem)] aspect-video flex items-center justify-center shadow-2xl rounded-2xl">
              <SlideViewer
                slide={currentSlide}
                mode="presentation"
                revealStage={store.revealStage}
                footerText={
                  lesson.clinicalDomain
                    ? `ESP Medical English — ${lesson.clinicalDomain}`
                    : `${lesson.category || 'English'} • ${lesson.level || 'Intermediate'}`
                }
              />
            </div>
          </div>
        ) : (
          <div className="text-white text-sm">Slaydlar mavjud emas</div>
        )}

        {/* 60 FPS Annotation Canvas overlay */}
        <AnnotationCanvas />

        {/* Laser Spotlight overlay */}
        <LaserSpotlight />

        {/* Blackout Full Screen Overlay ('B') */}
        {store.isBlackout && (
          <div
            onClick={() => presentationActions.toggleBlackout()}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black cursor-pointer"
          >
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Qora ekran (Chiqish uchun bosing yoki 'B' tugmasi)
            </span>
          </div>
        )}

        {/* Whiteout Full Screen Overlay ('W') */}
        {store.isWhiteout && (
          <div
            onClick={() => presentationActions.toggleWhiteout()}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Oq ekran (Chiqish uchun bosing yoki 'W' tugmasi)
            </span>
          </div>
        )}
      </div>

      {/* Floating Presenter Toolbar */}
      <PresenterToolbar
        totalSlides={totalSlides}
        onExit={handleExit}
      />

      {/* Floating Interactive Timer Modal */}
      <TimerModal />

      {/* Floating Random Student Picker Modal */}
      <RandomPickerModal studentGroups={studentGroups} />

      {/* Floating Instant Slide Search & Quick Jump Modal */}
      <SlideSearchModal />

      {/* Floating Classroom Team Scoreboard Gamification Widget */}
      <TeamScoreboardModal />

      {/* Floating Pedagogical Tools (Attention Bell, Dice, Coin, Traffic Light, Curtain) */}
      <ClassroomPedagogyModal />

      {/* QR Code Smartphone Remote Modal */}
      <RemotePairingModal
        isOpen={store.isRemoteModalOpen}
        onClose={() => presentationActions.toggleRemoteModal()}
        sessionId={store.remoteSessionId}
        isConnected={store.isRemoteConnected}
      />

      {/* Floating Private Speaker Notes Box */}
      {store.isSpeakerNotesOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 rounded-2xl border border-slate-700 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md text-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              O'qituvchi Eslatmasi (Speaker Notes)
            </span>
            <button
              onClick={() => presentationActions.toggleSpeakerNotes()}
              className="min-w-[36px] min-h-[36px] rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Yopish"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
            {currentSlide?.speakerNotes || "Ushbu slayd uchun maxfiy eslatma yozilmagan."}
          </p>
        </div>
      )}

      {/* Session Decision Brief Modal (Workflow 2: Live Classroom Delivery) */}
      <SessionSummaryModal
        isOpen={store.isSessionSummaryOpen}
        lesson={lesson}
        activeGroup={store.activeGroup}
        teacherName={teacherName}
        onExitPresentation={handleForceExit}
        onContinuePresentation={() => presentationActions.closeSessionSummary()}
      />
    </div>
  );
};
