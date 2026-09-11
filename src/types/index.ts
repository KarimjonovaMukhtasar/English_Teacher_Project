export type TemplateType =
  | 'grammar-box'
  | 'vocabulary-card'
  | 'click-to-reveal'
  | 'two-column'
  | 'blank';

export interface GrammarRuleContent {
  ruleTitle: string;
  formula: { label: string; text: string; color: string }[];
  explanation: string;
  examples: { sentence: string; highlightWord: string; translation?: string }[];
  note?: string;
}

export interface VocabularyContent {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  translation: string;
  exampleSentence: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface ClickToRevealContent {
  question: string;
  hint?: string;
  hiddenAnswer: string;
  explanation: string;
  badge?: string;
}

export interface TwoColumnContent {
  leftTitle: string;
  leftBadge: string;
  leftPoints: string[];
  rightTitle: string;
  rightBadge: string;
  rightPoints: string[];
}

export interface BlankContent {
  heading: string;
  subheading?: string;
  paragraphs: string[];
  imageUrl?: string;
  imageAlt?: string;
}

export type SlideContent =
  | { type: 'grammar-box'; data: GrammarRuleContent }
  | { type: 'vocabulary-card'; data: VocabularyContent }
  | { type: 'click-to-reveal'; data: ClickToRevealContent }
  | { type: 'two-column'; data: TwoColumnContent }
  | { type: 'blank'; data: BlankContent };

export interface SlideItem {
  id: string;
  title: string;
  template: TemplateType;
  content: SlideContent;
  speakerNotes?: string;
  order: number;
}

export type LessonType = 'interactive-slides' | 'pdf-presentation';

export interface Lesson {
  id: string;
  title: string;
  category: string; // e.g., 'Grammar', 'IELTS', 'Vocabulary', 'Speaking', 'General English', 'Medical English'
  level: 'Beginner' | 'Elementary' | 'Pre-Intermediate' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced';
  type: LessonType;
  semester?: 'Semester 1' | 'Semester 2' | 'Semester 3';
  unit?: string;
  topicNumber?: number;
  cefrLevel?: 'B2' | 'C1';
  clinicalDomain?: string;
  assessmentType?: 'none' | 'formative' | 'summative';
  curriculumRevision?: string;
  pdfDataUrl?: string; // base64 or blob URL for uploaded PDF
  pdfPageCount?: number;
  lastSlideIndex?: number; // resume presentation progress
  slides?: SlideItem[];
  thumbnailUrl?: string;
  createdAt: number;
  updatedAt: number;
  ownerId?: string;
  deletedAt?: number;
}

export interface StudentGroup {
  id: string;
  name: string; // e.g. 'IELTS Morning 09:00', 'Kids Beginner A'
  students: string[];
  createdAt: number;
  updatedAt?: number;
  ownerId?: string;
  deletedAt?: number;
}

export type PresenterTool = 'pointer' | 'pen' | 'highlighter' | 'eraser' | 'laser';

export interface DrawingPath {
  tool: 'pen' | 'highlighter';
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

export interface TeacherSettings {
  pin: string; // 4-digit PIN, default '1234'
  loginUsername?: string;
  loginPassword?: string;
  autoLockMinutes: number; // 0 for off, default 15
  teacherName: string;
  theme: 'light' | 'dark' | 'system';
}

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: string; // e.g., 'Medical English ESP · IELTS 7.0 Trainer', 'Senior Lecturer'
  institution?: string; // e.g., 'Toshkent Tibbiyot Akademiyasi'
  pin: string; // 4-digit PIN
  avatarColor?: string; // e.g. '#0E56D4' or gradient
  bio?: string;
  email?: string;
  joinedDate: number;
}

export interface RemoteCommand {
  type:
    | 'NEXT_SLIDE'
    | 'PREV_SLIDE'
    | 'GO_TO_SLIDE'
    | 'START_TIMER'
    | 'PAUSE_TIMER'
    | 'RESET_TIMER'
    | 'TOGGLE_BLACKOUT'
    | 'TOGGLE_WHITEOUT'
    | 'PICK_STUDENT'
    | 'RESET_DRAWING'
    | 'TOGGLE_PEDAGOGY'
    | 'TOGGLE_TRANSLATION_CURTAIN'
    | 'TRIGGER_CHIME'
    | 'GET_HOST_STATE';
  payload?: unknown;
}

export interface RemoteHostState {
  lessonTitle: string;
  currentSlideIndex: number;
  totalSlides: number;
  isTimerRunning: boolean;
  timerSeconds: number;
  isTimerOpen: boolean;
  isBlackout: boolean;
  isWhiteout: boolean;
  isPedagogyModalOpen?: boolean;
  isTranslationCurtainActive?: boolean;
  selectedStudent: string | null;
  activeTool?: PresenterTool;
}

export type PeerConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface CalledStudentActivity {
  name: string;
  calledAt: number;
  pointsEarned?: number;
  status?: 'correct' | 'partial' | 'participated';
}

export interface LessonSessionRecord {
  id: string; // session_timestamp
  lessonId: string;
  lessonTitle: string;
  groupId: string;
  groupName: string;
  teacherName: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  slidesCompleted: number;
  totalSlides: number;
  teamScores: {
    teamA: { name: string; score: number };
    teamB: { name: string; score: number };
  };
  calledStudents: CalledStudentActivity[];
  createdAt: number;
  ownerId?: string;
  deletedAt?: number;
}
