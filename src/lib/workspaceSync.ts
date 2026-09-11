import { Lesson, LessonSessionRecord, StudentGroup } from '@/types';
import { db } from '@/db/dexie';
import { supabase, isSupabaseConfigured } from './supabase';

interface RemoteLesson {
  id: string;
  legacy_id: string;
  title: string;
  category: string;
  level: Lesson['level'];
  type: Lesson['type'];
  content: Lesson;
  pdf_path: string | null;
  pdf_page_count: number;
  last_slide_index: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RemoteGroup {
  id: string;
  legacy_id: string;
  name: string;
  students: string[];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RemoteSession {
  id: string;
  legacy_id: string;
  record: LessonSessionRecord;
  created_at: string;
  updated_at: string;
}

const remoteTime = (value: string) => Date.parse(value);
const dataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

async function uploadPdf(client: NonNullable<typeof supabase>, ownerId: string, lesson: Lesson): Promise<string | null> {
  if (!lesson.pdfDataUrl) return null;
  const path = `${ownerId}/${lesson.id}.pdf`;
  const response = await fetch(lesson.pdfDataUrl);
  if (!response.ok) throw new Error('PDF faylini o‘qib bo‘lmadi.');
  const { error } = await client.storage.from('lesson-pdfs').upload(path, await response.blob(), {
    upsert: true,
    contentType: 'application/pdf',
  });
  if (error) throw error;
  return path;
}

async function restorePdf(client: NonNullable<typeof supabase>, path: string | null): Promise<string | undefined> {
  if (!path) return undefined;
  const { data, error } = await client.storage.from('lesson-pdfs').download(path);
  if (error) throw error;
  return dataUrl(data);
}

export async function syncWorkspace(): Promise<void> {
  const client = supabase;
  if (!client || !isSupabaseConfigured || !navigator.onLine) return;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return;

  const [localLessons, localGroups, localSessions, remoteLessonsResult, remoteGroupsResult, remoteSessionsResult] = await Promise.all([
    db.lessons.where('ownerId').equals(user.id).toArray(),
    db.studentGroups.where('ownerId').equals(user.id).toArray(),
    db.sessions.where('ownerId').equals(user.id).toArray(),
    client.from('lessons').select('*'),
    client.from('student_groups').select('*'),
    client.from('lesson_sessions').select('*'),
  ]);
  if (remoteLessonsResult.error) throw remoteLessonsResult.error;
  if (remoteGroupsResult.error) throw remoteGroupsResult.error;
  if (remoteSessionsResult.error) throw remoteSessionsResult.error;

  const remoteLessons = remoteLessonsResult.data as RemoteLesson[];
  const remoteGroups = remoteGroupsResult.data as RemoteGroup[];
  const remoteSessions = remoteSessionsResult.data as RemoteSession[];
  const lessonByLegacyId = new Map(remoteLessons.map((lesson) => [lesson.legacy_id, lesson]));
  const groupByLegacyId = new Map(remoteGroups.map((group) => [group.legacy_id, group]));
  const sessionByLegacyId = new Map(remoteSessions.map((session) => [session.legacy_id, session]));

  // Pull first. For a solo teacher, newer timestamp wins across offline devices.
  for (const remote of remoteLessons) {
    const local = localLessons.find((lesson) => lesson.id === remote.legacy_id);
    if (!local || remoteTime(remote.updated_at) > local.updatedAt) {
      const pdfDataUrl = remote.type === 'pdf-presentation' ? await restorePdf(client, remote.pdf_path) : undefined;
      await db.lessons.put({
        ...remote.content,
        id: remote.legacy_id,
        ownerId: user.id,
        pdfDataUrl,
        pdfPageCount: remote.pdf_page_count,
        lastSlideIndex: remote.last_slide_index,
        createdAt: remoteTime(remote.created_at),
        updatedAt: remoteTime(remote.updated_at),
        deletedAt: remote.deleted_at ? remoteTime(remote.deleted_at) : undefined,
      });
    }
  }
  for (const remote of remoteGroups) {
    const local = localGroups.find((group) => group.id === remote.legacy_id);
    if (!local || remoteTime(remote.updated_at) > (local.updatedAt || local.createdAt)) {
      await db.studentGroups.put({
        id: remote.legacy_id,
        ownerId: user.id,
        name: remote.name,
        students: remote.students,
        createdAt: remoteTime(remote.created_at),
        updatedAt: remoteTime(remote.updated_at),
        deletedAt: remote.deleted_at ? remoteTime(remote.deleted_at) : undefined,
      });
    }
  }
  for (const remote of remoteSessions) {
    if (!localSessions.some((session) => session.id === remote.legacy_id)) {
      await db.sessions.put({ ...remote.record, id: remote.legacy_id, ownerId: user.id, createdAt: remoteTime(remote.created_at) });
    }
  }

  for (const lesson of await db.lessons.where('ownerId').equals(user.id).toArray()) {
    const remote = lessonByLegacyId.get(lesson.id);
    if (remote && remoteTime(remote.updated_at) >= lesson.updatedAt) continue;
    const pdfPath = lesson.type === 'pdf-presentation'
      ? lesson.pdfDataUrl ? await uploadPdf(client, user.id, lesson) : remote?.pdf_path || null
      : null;
    const { pdfDataUrl, ...content } = lesson;
    const payload = {
      owner_id: user.id,
      legacy_id: lesson.id,
      title: lesson.title,
      category: lesson.category,
      level: lesson.level,
      type: lesson.type,
      content,
      pdf_path: pdfPath,
      pdf_page_count: lesson.pdfPageCount || 1,
      last_slide_index: lesson.lastSlideIndex || 0,
      deleted_at: lesson.deletedAt ? new Date(lesson.deletedAt).toISOString() : null,
    };
    const result = remote
      ? await client.from('lessons').update(payload).eq('id', remote.id)
      : await client.from('lessons').insert(payload);
    if (result.error) throw result.error;
  }

  for (const group of await db.studentGroups.where('ownerId').equals(user.id).toArray()) {
    const remote = groupByLegacyId.get(group.id);
    if (remote && remoteTime(remote.updated_at) >= (group.updatedAt || group.createdAt)) continue;
    const payload = {
      owner_id: user.id,
      legacy_id: group.id,
      name: group.name,
      students: group.students,
      deleted_at: group.deletedAt ? new Date(group.deletedAt).toISOString() : null,
    };
    const result = remote
      ? await client.from('student_groups').update(payload).eq('id', remote.id)
      : await client.from('student_groups').insert(payload);
    if (result.error) throw result.error;
  }

  for (const session of await db.sessions.where('ownerId').equals(user.id).toArray()) {
    if (sessionByLegacyId.has(session.id)) continue;
    const { error } = await client.from('lesson_sessions').insert({
      owner_id: user.id,
      legacy_id: session.id,
      record: session,
    });
    if (error) throw error;
  }
}
