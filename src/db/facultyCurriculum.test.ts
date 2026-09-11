import assert from 'node:assert/strict';
import test from 'node:test';
import { SUPPLIED_FACULTIES, createSuppliedFacultyLessons } from './facultyCurriculum.ts';

test('creates the supplied faculty lesson plans in their source order', () => {
  const lessons = createSuppliedFacultyLessons();

  assert.deepEqual(
    SUPPLIED_FACULTIES.map((faculty) => faculty.id),
    ['Nursing', 'Feldsherlik ishi', 'Functional Diagnostics', 'Pharmacy'],
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
    assert.ok(lesson.slides?.some((slide) => slide.title.includes('Role-play')));
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
