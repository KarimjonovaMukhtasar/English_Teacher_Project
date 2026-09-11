import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SUPPLIED_FACULTIES,
  createSuppliedFacultyLessons,
  refreshSuppliedLessonVisuals,
} from './facultyCurriculum.ts';

test('creates the supplied faculty lesson plans in their source order', () => {
  const lessons = createSuppliedFacultyLessons();

  assert.deepEqual(
    SUPPLIED_FACULTIES.map((faculty) => faculty.id),
    ['Nursing', 'Functional Diagnostics', 'Feldsherlik ishi', 'Pharmacy'],
  );
  assert.equal(lessons.length, 83);

  for (const faculty of SUPPLIED_FACULTIES) {
    const facultyLessons = lessons.filter((lesson) => lesson.unit === faculty.id);
    assert.equal(facultyLessons.length, faculty.lessonCount);
    assert.deepEqual(
      facultyLessons.map((lesson) => lesson.topicNumber),
      Array.from({ length: faculty.lessonCount }, (_, index) => index + 1),
    );
    assert.ok(facultyLessons.every((lesson) => lesson.slides?.length === 20));
  }
});

test('keeps the supplied lesson-plan handouts visible in every generated deck', () => {
  const lessons = createSuppliedFacultyLessons();
  const nursing = lessons.find((lesson) => lesson.id === 'faculty_nursing_01');
  const feldsher = lessons.find((lesson) => lesson.id === 'faculty_feldsherlik_01');
  const functional = lessons.find((lesson) => lesson.id === 'faculty_functional-diagnostics_01');
  const pharmacy = lessons.find((lesson) => lesson.id === 'faculty_pharmacy_01');

  assert.match(nursing?.title || '', /pulse\. Endoscopy/i);
  assert.match(feldsher?.title || '', /pain/i);
  assert.match(functional?.title || '', /hospital team/i);
  assert.match(pharmacy?.title || '', /hospital team/i);

  for (const lesson of [nursing, feldsher, functional, pharmacy]) {
    assert.ok(lesson);
    assert.ok(lesson.slides?.some((slide) => slide.title.includes('Visual vocabulary')));
    assert.ok(lesson.slides?.some((slide) => slide.template === 'grammar-box'));
    assert.ok(lesson.slides?.some((slide) => slide.title.includes('Reading')));
    assert.ok(lesson.slides?.some((slide) => slide.title.includes('Listening')));
    assert.ok(lesson.slides?.some((slide) => slide.title.includes('information gap')));
    assert.ok(lesson.slides?.some((slide) => slide.title.includes('Writing')));
  }

  const nursingAssessment = lessons.find((lesson) => lesson.id === 'faculty_nursing_10');
  const assessmentVocabularySlide = nursingAssessment?.slides?.find((slide) => slide.order === 2);
  assert.ok(assessmentVocabularySlide?.content.type === 'two-column');
  if (assessmentVocabularySlide?.content.type === 'two-column') {
    assert.equal(assessmentVocabularySlide.content.data.leftPoints.length, 3);
  }

  const protectedCheck = nursing?.slides?.find((slide) => slide.template === 'click-to-reveal');
  assert.match(protectedCheck?.speakerNotes || '', /Teacher-only answer/);
  const readingReview = nursing?.slides?.find((slide) => slide.title === 'Reading for evidence');
  assert.doesNotMatch(
    readingReview?.content.type === 'two-column' ? readingReview.content.data.rightPoints.join('\n') : '',
    /oesophagus|stomach|duodenum/i,
  );
});

test('gives every presentation distinct faculty and clinical illustrations', () => {
  const lessons = createSuppliedFacultyLessons();

  for (const lesson of lessons) {
    const imageUrls = (lesson.slides || []).flatMap((slide) => {
      if (slide.content.type === 'blank' && slide.content.data.imageUrl) {
        return [slide.content.data.imageUrl];
      }
      if (slide.content.type === 'vocabulary-card' && slide.content.data.imageUrl) {
        return [slide.content.data.imageUrl];
      }
      return [];
    });

    assert.ok(
      new Set(imageUrls).size >= 2,
      `${lesson.id} must use at least two distinct medical illustrations`,
    );
  }
});

test('refreshes generated visuals without replacing a teacher’s lesson edits', () => {
  const generated = createSuppliedFacultyLessons().find((lesson) => lesson.id === 'faculty_nursing_01');
  assert.ok(generated?.slides);

  const existing = structuredClone(generated);
  existing.title = 'My edited lesson title';
  existing.curriculumRevision = 'older-revision';

  const cover = existing.slides?.find((slide) => slide.order === 0);
  assert.ok(cover?.content.type === 'blank');
  if (cover?.content.type === 'blank') {
    cover.content.data.heading = 'Teacher edited heading';
    cover.content.data.paragraphs = ['Teacher edited objective'];
    cover.content.data.imageUrl = '/old-cover.png';
  }

  const vocabulary = existing.slides?.find((slide) => slide.order === 4);
  assert.ok(vocabulary?.content.type === 'vocabulary-card');
  if (vocabulary?.content.type === 'vocabulary-card') {
    vocabulary.content.data.word = 'teacher-edited-term';
    vocabulary.content.data.imageUrl = '/old-vocabulary.png';
  }

  const refreshed = refreshSuppliedLessonVisuals(existing, generated);
  const refreshedCover = refreshed.slides?.find((slide) => slide.order === 0);
  const generatedCover = generated.slides.find((slide) => slide.order === 0);
  const refreshedVocabulary = refreshed.slides?.find((slide) => slide.order === 4);
  const generatedVocabulary = generated.slides.find((slide) => slide.order === 4);

  assert.equal(refreshed.title, 'My edited lesson title');
  assert.ok(refreshedCover?.content.type === 'blank');
  assert.ok(generatedCover?.content.type === 'blank');
  if (refreshedCover?.content.type === 'blank' && generatedCover?.content.type === 'blank') {
    assert.equal(refreshedCover.content.data.heading, 'Teacher edited heading');
    assert.deepEqual(refreshedCover.content.data.paragraphs, ['Teacher edited objective']);
    assert.equal(refreshedCover.content.data.imageUrl, generatedCover.content.data.imageUrl);
    assert.equal(refreshedCover.content.data.imageAlt, generatedCover.content.data.imageAlt);
  }

  assert.ok(refreshedVocabulary?.content.type === 'vocabulary-card');
  assert.ok(generatedVocabulary?.content.type === 'vocabulary-card');
  if (refreshedVocabulary?.content.type === 'vocabulary-card' && generatedVocabulary?.content.type === 'vocabulary-card') {
    assert.equal(refreshedVocabulary.content.data.word, 'teacher-edited-term');
    assert.equal(refreshedVocabulary.content.data.imageUrl, generatedVocabulary.content.data.imageUrl);
  }

  assert.equal(refreshed.curriculumRevision, generated.curriculumRevision);
  assert.equal(refreshed.unit, generated.unit);
});
