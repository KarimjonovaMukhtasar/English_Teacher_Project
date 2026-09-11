import assert from 'node:assert/strict';
import test from 'node:test';
import { SUPPLIED_FACULTY_LESSONS } from '../db/facultyCurriculum.ts';
import type { Lesson } from '../types/index.ts';
import { buildPowerPointExportPlan, presentationFileName } from './presentationExport.ts';

const lesson: Lesson = {
  id: 'lesson-01',
  title: 'Mavzu 1: Pulse / X-Ray',
  category: 'Medical English',
  level: 'Upper-Intermediate',
  type: 'interactive-slides',
  createdAt: 1,
  updatedAt: 1,
  slides: [
    {
      id: 'slide-1',
      title: 'Lesson plan',
      order: 0,
      template: 'blank',
      content: {
        type: 'blank',
        data: {
          heading: 'Lesson plan: Pulse',
          subheading: '80 minutes',
          paragraphs: ['KTP activity: vocabulary and reading'],
        },
      },
    },
    {
      id: 'slide-2',
      title: 'Vocabulary',
      order: 1,
      template: 'vocabulary-card',
      content: {
        type: 'vocabulary-card',
        data: {
          word: 'pulse',
          phonetic: '/pʌls/',
          partOfSpeech: 'noun',
          definition: 'the beat felt in an artery',
          translation: 'puls',
          exampleSentence: 'The nurse recorded the pulse.',
        },
      },
    },
  ],
};

test('creates an ordered editable PowerPoint export plan from every lesson slide', () => {
  const plan = buildPowerPointExportPlan(lesson);

  assert.equal(plan.title, lesson.title);
  assert.equal(plan.slides.length, 2);
  assert.deepEqual(plan.slides.map((slide) => slide.number), [1, 2]);
  assert.match(plan.slides[0].body.join('\n'), /KTP activity/);
  assert.match(plan.slides[1].body.join('\n'), /the beat felt in an artery/);
});

test('uses a safe and recognisable PPTX filename', () => {
  assert.equal(
    presentationFileName(lesson),
    'mavzu-1-pulse-x-ray-lesson-01.pptx',
  );
});

test('keeps every supplied faculty lesson as a downloadable 20-slide presentation', () => {
  assert.equal(SUPPLIED_FACULTY_LESSONS.length, 83);
  assert.ok(SUPPLIED_FACULTY_LESSONS.every((courseLesson) => courseLesson.slides?.length === 20));
  assert.ok(
    SUPPLIED_FACULTY_LESSONS.every((courseLesson) => buildPowerPointExportPlan(courseLesson).slides.length === 20),
  );
  assert.ok(
    SUPPLIED_FACULTY_LESSONS.every((courseLesson) => {
      const imageUrls = buildPowerPointExportPlan(courseLesson).slides
        .map((slide) => slide.imageUrl)
        .filter(Boolean);
      return new Set(imageUrls).size >= 2;
    }),
  );
});

test('does not print a click-to-reveal answer into the student-facing PowerPoint slide', () => {
  const protectedCheck: Lesson = {
    ...lesson,
    slides: [
      {
        id: 'slide-protected-answer',
        title: 'Protected answer',
        order: 0,
        template: 'click-to-reveal',
        content: {
          type: 'click-to-reveal',
          data: {
            question: 'What is the correct response?',
            hiddenAnswer: 'Teacher-only response',
            explanation: 'This explanation must remain controlled by the teacher.',
          },
        },
      },
    ],
  };

  const exportSlide = buildPowerPointExportPlan(protectedCheck).slides[0];
  assert.doesNotMatch(exportSlide.body.join('\n'), /Teacher-only response/);
  assert.match(exportSlide.body.join('\n'), /Teacher-controlled answer/);
});
