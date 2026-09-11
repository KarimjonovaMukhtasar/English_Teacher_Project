import Dexie, { Table } from 'dexie';
import { Lesson, StudentGroup, TeacherSettings, LessonSessionRecord } from '@/types';
import { authStore } from '@/store/authStore';

export interface SettingItem {
  key: string;
  value: unknown;
}

export const DEFAULT_SETTINGS: TeacherSettings = {
  pin: '',
  autoLockMinutes: 15,
  teacherName: '',
  theme: 'light',
};

export class EnglishTeacherDatabase extends Dexie {
  lessons!: Table<Lesson, string>;
  studentGroups!: Table<StudentGroup, string>;
  settings!: Table<SettingItem, string>;
  sessions!: Table<LessonSessionRecord, string>;

  constructor() {
    super('EnglishTeacherDB');
    this.version(1).stores({
      lessons: 'id, title, category, level, type, createdAt, updatedAt',
      studentGroups: 'id, name, createdAt',
      settings: 'key, value',
    });
    this.version(2).stores({
      lessons: 'id, title, category, level, type, semester, unit, topicNumber, createdAt, updatedAt',
    });
    this.version(3).stores({ sessions: 'id, lessonId, groupId, createdAt' });
    this.version(4).stores({
      lessons: 'id, ownerId, [ownerId+createdAt], deletedAt, title, category, level, type, semester, unit, topicNumber, createdAt, updatedAt',
      studentGroups: 'id, ownerId, [ownerId+createdAt], deletedAt, name, createdAt',
      settings: 'key',
      sessions: 'id, ownerId, [ownerId+createdAt], deletedAt, lessonId, groupId, createdAt',
    });
  }
}

export const db = new EnglishTeacherDatabase();

const ownerId = () => authStore.state.currentUser.id || null;
const owned = <T extends { ownerId?: string; deletedAt?: number }>(record: T, id: string) =>
  record.ownerId === id && !record.deletedAt;
const settingKey = (id: string) => `teacher_settings:${id}`;

export async function getLessons(): Promise<Lesson[]> {
  const id = ownerId();
  if (!id) return [];
  const lessons = await db.lessons.where('ownerId').equals(id).toArray();
  return lessons.filter((lesson) => !lesson.deletedAt).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getLessonById(id: string): Promise<Lesson | undefined> {
  const userId = ownerId();
  if (!userId) return undefined;
  const lesson = await db.lessons.get(id);
  return lesson && owned(lesson, userId) ? lesson : undefined;
}

export async function saveLesson(lesson: Lesson): Promise<void> {
  const userId = ownerId();
  if (!userId) throw new Error("Darsni saqlash uchun tizimga kiring.");
  const existing = await db.lessons.get(lesson.id);
  if (existing?.ownerId && existing.ownerId !== userId) throw new Error('Bu dars boshqa workspacega tegishli.');
  const now = Date.now();
  await db.lessons.put({ ...lesson, ownerId: userId, deletedAt: undefined, createdAt: lesson.createdAt || now, updatedAt: now });
}

export async function deleteLesson(id: string): Promise<void> {
  const lesson = await getLessonById(id);
  if (!lesson) return;
  await db.lessons.put({ ...lesson, deletedAt: Date.now(), updatedAt: Date.now() });
}

export async function getStudentGroups(): Promise<StudentGroup[]> {
  const id = ownerId();
  if (!id) return [];
  const groups = await db.studentGroups.where('ownerId').equals(id).toArray();
  return groups.filter((group) => !group.deletedAt).sort((a, b) => a.createdAt - b.createdAt);
}

export async function saveStudentGroup(group: StudentGroup): Promise<void> {
  const userId = ownerId();
  if (!userId) throw new Error("Guruhni saqlash uchun tizimga kiring.");
  const existing = await db.studentGroups.get(group.id);
  if (existing?.ownerId && existing.ownerId !== userId) throw new Error('Bu guruh boshqa workspacega tegishli.');
  const now = Date.now();
  await db.studentGroups.put({ ...group, ownerId: userId, deletedAt: undefined, createdAt: group.createdAt || now, updatedAt: now });
}

export async function deleteStudentGroup(id: string): Promise<void> {
  const userId = ownerId();
  const group = await db.studentGroups.get(id);
  if (!group || !userId || !owned(group, userId)) return;
  const now = Date.now();
  await db.studentGroups.put({ ...group, deletedAt: now, updatedAt: now });
}

export async function getSettings(): Promise<TeacherSettings> {
  const id = ownerId();
  if (!id) return DEFAULT_SETTINGS;
  const setting = await db.settings.get(settingKey(id));
  return setting?.value && typeof setting.value === 'object'
    ? { ...DEFAULT_SETTINGS, ...(setting.value as Partial<TeacherSettings>) }
    : { ...DEFAULT_SETTINGS, teacherName: authStore.state.teacherName };
}

export async function updateSettings(settings: Partial<TeacherSettings>): Promise<TeacherSettings> {
  const id = ownerId();
  if (!id) throw new Error("Sozlamalarni saqlash uchun tizimga kiring.");
  const updated = { ...(await getSettings()), ...settings };
  await db.settings.put({ key: settingKey(id), value: updated });
  return updated;
}

export const getTeacherSettings = getSettings;
export const updateTeacherSettings = updateSettings;

export async function saveLessonSession(session: LessonSessionRecord): Promise<void> {
  const userId = ownerId();
  if (!userId) throw new Error("Hisobotni saqlash uchun tizimga kiring.");
  await db.sessions.put({ ...session, ownerId: userId, deletedAt: undefined });
}

export async function getLessonSessions(groupId?: string): Promise<LessonSessionRecord[]> {
  const id = ownerId();
  if (!id) return [];
  const sessions = await db.sessions.where('ownerId').equals(id).toArray();
  return sessions
    .filter((session) => !session.deletedAt && (!groupId || session.groupId === groupId))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export interface DatabaseBackup {
  version: string;
  exportDate: string;
  app: string;
  lessons: Lesson[];
  studentGroups: StudentGroup[];
  sessions?: LessonSessionRecord[];
  stats: { totalLessons: number; totalGroups: number; totalSlides: number };
}

export async function exportAllDatabaseToJson(): Promise<string> {
  const [lessons, studentGroups, sessions] = await Promise.all([getLessons(), getStudentGroups(), getLessonSessions()]);
  const totalSlides = lessons.reduce((total, lesson) => total + (lesson.type === 'pdf-presentation' ? lesson.pdfPageCount || 1 : lesson.slides?.length || 0), 0);
  return JSON.stringify({
    version: '3.0', exportDate: new Date().toISOString(), app: 'tilchi.uz English Teacher Presentation System',
    lessons, studentGroups, sessions,
    stats: { totalLessons: lessons.length, totalGroups: studentGroups.length, totalSlides },
  } satisfies DatabaseBackup, null, 2);
}

const validLesson = (value: unknown): value is Lesson => Boolean(value) && typeof value === 'object' && typeof (value as Lesson).id === 'string' && typeof (value as Lesson).title === 'string';
const validGroup = (value: unknown): value is StudentGroup => Boolean(value) && typeof value === 'object' && typeof (value as StudentGroup).id === 'string' && typeof (value as StudentGroup).name === 'string' && Array.isArray((value as StudentGroup).students);
const validSession = (value: unknown): value is LessonSessionRecord => Boolean(value) && typeof value === 'object' && typeof (value as LessonSessionRecord).id === 'string' && typeof (value as LessonSessionRecord).lessonId === 'string';

export async function importDatabaseFromJson(jsonString: string): Promise<{ importedLessons: number; importedGroups: number }> {
  if (jsonString.length > 50 * 1024 * 1024) throw new Error("Zaxira fayli 50 MB dan katta bo'lmasligi kerak.");
  const userId = ownerId();
  if (!userId) throw new Error("Zaxirani tiklash uchun tizimga kiring.");
  const data: unknown = JSON.parse(jsonString);
  if (!data || typeof data !== 'object') throw new Error("Noto'g'ri zaxira fayl formati.");
  const backup = data as Partial<DatabaseBackup>;
  const lessons = Array.isArray(backup.lessons) ? backup.lessons : [];
  const groups = Array.isArray(backup.studentGroups) ? backup.studentGroups : [];
  const sessions = Array.isArray(backup.sessions) ? backup.sessions : [];
  if ((!lessons.length && !groups.length) || !lessons.every(validLesson) || !groups.every(validGroup) || !sessions.every(validSession)) {
    throw new Error("Zaxira faylida noto'g'ri ma'lumot bor.");
  }
  const ids = [...lessons, ...groups, ...sessions].map((record) => record.id);
  if (new Set(ids).size !== ids.length) throw new Error("Zaxirada takrorlangan ID bor.");

  await db.transaction('rw', db.lessons, db.studentGroups, db.sessions, async () => {
    const existing = await Promise.all(ids.map((id) => Promise.all([db.lessons.get(id), db.studentGroups.get(id), db.sessions.get(id)])));
    if (existing.some((records) => records.some(Boolean))) throw new Error('Zaxiradagi ID mavjud ma’lumot bilan to‘qnashdi.');
    await db.lessons.bulkAdd(lessons.map((lesson) => ({ ...lesson, ownerId: userId, deletedAt: undefined })));
    await db.studentGroups.bulkAdd(groups.map((group) => ({ ...group, ownerId: userId, deletedAt: undefined })));
    await db.sessions.bulkAdd(sessions.map((session) => ({ ...session, ownerId: userId, deletedAt: undefined })));
  });
  return { importedLessons: lessons.length, importedGroups: groups.length };
}

export async function getLegacyDataCounts(): Promise<{ lessons: number; groups: number; sessions: number }> {
  const [lessons, groups, sessions] = await Promise.all([
    db.lessons.filter((lesson) => !lesson.ownerId).count(),
    db.studentGroups.filter((group) => !group.ownerId).count(),
    db.sessions.filter((session) => !session.ownerId).count(),
  ]);
  return { lessons, groups, sessions };
}

// Legacy records predate private workspaces. The signed-in teacher must explicitly claim them.
export async function claimLegacyData(): Promise<void> {
  const userId = ownerId();
  if (!userId) throw new Error("Ma'lumotni ko‘chirish uchun tizimga kiring.");
  await db.transaction('rw', db.lessons, db.studentGroups, db.sessions, async () => {
    const [lessons, groups, sessions] = await Promise.all([
      db.lessons.filter((lesson) => !lesson.ownerId).toArray(),
      db.studentGroups.filter((group) => !group.ownerId).toArray(),
      db.sessions.filter((session) => !session.ownerId).toArray(),
    ]);
    await db.lessons.bulkPut(lessons.map((lesson) => ({ ...lesson, ownerId: userId })));
    await db.studentGroups.bulkPut(groups.map((group) => ({ ...group, ownerId: userId })));
    await db.sessions.bulkPut(sessions.map((session) => ({ ...session, ownerId: userId })));
  });
}

export async function getDatabaseStatistics(): Promise<{ totalLessons: number; totalGroups: number; totalStudents: number; totalSlides: number }> {
  const [lessons, groups] = await Promise.all([getLessons(), getStudentGroups()]);
  return {
    totalLessons: lessons.length,
    totalGroups: groups.length,
    totalStudents: groups.reduce((total, group) => total + group.students.length, 0),
    totalSlides: lessons.reduce((total, lesson) => total + (lesson.type === 'pdf-presentation' ? lesson.pdfPageCount || 1 : lesson.slides?.length || 0), 0),
  };
}
