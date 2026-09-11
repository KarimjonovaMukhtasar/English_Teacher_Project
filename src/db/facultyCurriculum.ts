import suppliedLessonPlans from './suppliedFacultyLessonData.json' with { type: 'json' };
import type { Lesson, SlideItem } from '@/types';

type SourceVocabulary = { term: string; definition: string; translation: string };
type SourceLesson = {
  number: number;
  title: string;
  objectives: string[];
  stages: Array<{ number: number; label: string; minutes: number; detail: string }>;
  vocabulary: SourceVocabulary[];
  grammar: { title: string; notes: string[]; formula: Array<{ label: string; text: string }>; practice: string[] };
  reading: { title: string; body: string[]; questions: string[] };
  listening: { title: string; directions: string[]; questions: string[]; script: string[] };
  speaking: { outcome: string; roleA: string; roleB: string; prompts: string[] };
  culture: { title: string; notes: string[] };
  quiz: { questions: string[]; homework: string[] };
  answerKeys: Record<string, string[]>;
};

type SourceFaculty = {
  id: string;
  slug: string;
  lessonCount: number;
  formative: number[];
  summative: number[];
  lessons: SourceLesson[];
};

const sourceFaculties = suppliedLessonPlans.faculties as SourceFaculty[];
const SOURCE_DATE = Date.UTC(2026, 8, 10);

export const SUPPLIED_FACULTY_CURRICULUM_REVISION = '2026-09-10-faculty-docx-v1';

export const SUPPLIED_FACULTIES = [
  {
    id: 'Nursing',
    number: '01',
    title: 'Nursing',
    lessonCount: 21,
    description: 'Patient care, communication, hygiene, medication and assessment.',
    accent: 'Teal',
  },
  {
    id: 'Feldsherlik ishi',
    number: '02',
    title: 'Feldsherlik ishi',
    lessonCount: 20,
    description: 'Pain communication, ageing, therapy, blood and mental health.',
    accent: 'Blue',
  },
  {
    id: 'Functional Diagnostics',
    number: '03',
    title: 'Functional Diagnostics',
    lessonCount: 21,
    description: 'Hospital communication, admission, emergencies and observation.',
    accent: 'Violet',
  },
  {
    id: 'Pharmacy',
    number: '04',
    title: 'Pharmacy',
    lessonCount: 21,
    description: 'Patient safety, healthy living, medicines and professional language.',
    accent: 'Amber',
  },
] as const;

const short = (value: string, max = 330) =>
  value.replace(/\s+/g, ' ').trim().slice(0, max).replace(/\s+[^\s]*$/, '').trim();

const clean = (items: string[], max = 4, length = 260) =>
  items.map((item) => short(item, length)).filter(Boolean).slice(0, max);

const answerFor = (lesson: SourceLesson, matches: string[]) => {
  const entry = Object.entries(lesson.answerKeys).find(([key]) =>
    matches.some((match) => key.toLowerCase().includes(match)),
  );
  return entry ? clean(entry[1], 3) : [];
};

type LessonIllustration = { imageUrl: string; imageAlt: string };

const illustrationFor = (faculty: SourceFaculty, lesson: SourceLesson): LessonIllustration => {
  const topic = lesson.title.toLowerCase();
  if (/(hygiene|death|dying|palliative)/.test(topic)) {
    return {
      imageUrl: '/course2/section-3-palliative-hygiene.png',
      imageAlt: 'Medical English classroom illustration about hygiene and compassionate care',
    };
  }
  if (/(blood|medication|medicine|pharmacy|circulation)/.test(topic) || faculty.id === 'Pharmacy') {
    return {
      imageUrl: '/course2/section-4-medication-circulation.png',
      imageAlt: 'Medical English classroom illustration about medicines and circulation',
    };
  }
  if (/(pain|elderly|old age|mental|schizophrenia|therapy|tongue)/.test(topic) || faculty.id === 'Feldsherlik ishi') {
    return {
      imageUrl: '/course2/section-2-ageing-mental-health.png',
      imageAlt: 'Medical English classroom illustration about patient communication and care',
    };
  }
  return {
    imageUrl: '/course2/section-1-assessment-pain.png',
    imageAlt: 'Medical English classroom illustration about patient assessment and endoscopy',
  };
};

const sourceVocabulary = (lesson: SourceLesson): SourceVocabulary[] => {
  if (lesson.vocabulary.length) return lesson.vocabulary;

  // Assessment papers deliberately omit a glossary card. These are prompts from
  // their own assessment material, so students find meaning from the supplied
  // context rather than receiving invented medical definitions.
  const assessmentTerms = [
    ...lesson.grammar.practice,
    ...lesson.reading.body,
    ...lesson.reading.questions,
    ...lesson.listening.questions,
    lesson.speaking.outcome,
  ].join(' ').match(/[A-Za-z][A-Za-z'-]{3,}/g) || [];
  const ignored = new Set(['answer', 'assessment', 'complete', 'discussion', 'english', 'fictional', 'handout', 'lesson', 'patient', 'question', 'reading', 'sentence', 'source', 'student', 'supplied', 'teacher', 'their', 'these', 'this', 'with', 'write']);
  const uniqueTerms = [...new Set(assessmentTerms.map((term) => term.toLowerCase()))]
    .filter((term) => !ignored.has(term))
    .slice(0, 12);
  return uniqueTerms.map((term) => ({
    term,
    definition: 'Find the meaning from the supplied assessment text and explain it with evidence.',
    translation: 'Kontekstdan aniqlang',
  }));
};

const lessonSlides = (faculty: SourceFaculty, lesson: SourceLesson): SlideItem[] => {
  const vocabulary = sourceVocabulary(lesson);
  const vocabGroups = [vocabulary.slice(0, 6), vocabulary.slice(6, 12)];
  const grammarExamples = lesson.grammar.formula.length
    ? lesson.grammar.formula
    : lesson.grammar.practice.slice(0, 3).map((text, index) => ({ label: `Task ${index + 1}`, text }));
  const readingAnswers = answerFor(lesson, ['reading']);
  const listeningAnswers = answerFor(lesson, ['listening']);
  const quizAnswers = answerFor(lesson, ['mini-quiz', 'quiz']);
  const illustration = illustrationFor(faculty, lesson);
  const titlePrefix = `Lesson ${String(lesson.number).padStart(2, '0')}`;
  const sourceNotice = 'Source: supplied lesson plan and student handouts. Classroom case language is educational; it is not clinical protocol.';

  const columns = (title: string, leftTitle: string, leftPoints: string[], rightTitle: string, rightPoints: string[], order: number, notes?: string): SlideItem => ({
    id: `${faculty.slug}-${lesson.number}-${order}`,
    title,
    order,
    template: 'two-column',
    speakerNotes: notes,
    content: { type: 'two-column', data: { leftTitle, leftBadge: 'Handout', leftPoints, rightTitle, rightBadge: 'Use', rightPoints } },
  });

  const blank = (title: string, heading: string, paragraphs: string[], order: number, subheading?: string, notes?: string, image?: LessonIllustration): SlideItem => ({
    id: `${faculty.slug}-${lesson.number}-${order}`,
    title,
    order,
    template: 'blank',
    speakerNotes: notes,
    content: { type: 'blank', data: { heading, subheading, paragraphs, imageUrl: image?.imageUrl, imageAlt: image?.imageAlt } },
  });

  const check = (title: string, question: string, answer: string, explanation: string, order: number, badge: string): SlideItem => ({
    id: `${faculty.slug}-${lesson.number}-${order}`,
    title,
    order,
    template: 'click-to-reveal',
    speakerNotes: [
      'Teacher-only answer. Keep this panel closed while learners formulate their response.',
      `Answer: ${answer || 'Discuss and support your answer with the supplied text.'}`,
      `Rationale: ${explanation}`,
    ].join('\n\n'),
    content: { type: 'click-to-reveal', data: { question, hint: 'Return to the relevant supplied handout and underline the evidence.', hiddenAnswer: answer || 'Discuss and support your answer with the supplied text.', explanation, badge } },
  });

  const firstVocabulary = vocabulary[0] || {
    term: 'Assessment language',
    definition: 'Find the meaning from the supplied assessment material.',
    translation: 'Kontekstdan aniqlang',
  };
  const secondVocabulary = vocabulary[1] || firstVocabulary;
  const readingQuestion = lesson.reading.questions[0] || 'What evidence in the supplied text supports your answer?';
  const listeningQuestion = lesson.listening.questions[0] || 'What key detail did you hear?';

  return [
    blank(`${titlePrefix}: lesson plan`, lesson.title, clean(lesson.objectives, 4), 0, `${faculty.id} · 80 minutes`, sourceNotice, illustration),
    columns('Lesson route · 80 minutes', 'Plan stages 1–3', clean(lesson.stages.slice(0, 3).map((stage) => `${stage.number}. ${stage.label} · ${stage.minutes} min — ${stage.detail}`), 3), 'Plan stages 4–7', clean(lesson.stages.slice(3).map((stage) => `${stage.number}. ${stage.label} · ${stage.minutes} min — ${stage.detail}`), 4), 1, 'Follow the supplied timing. Adjust pacing only for the actual class, not the source content.'),
    columns('Visual vocabulary · set A', 'Terms 1–3', vocabGroups[0].slice(0, 3).map((item) => `${item.term} — ${item.translation}`), 'Terms 4–6', vocabGroups[0].slice(3).map((item) => `${item.term} — ${item.translation}`), 2),
    columns('Visual vocabulary · set B', 'Terms 7–9', vocabGroups[1].slice(0, 3).map((item) => `${item.term} — ${item.translation}`), 'Terms 10–12', vocabGroups[1].slice(3).map((item) => `${item.term} — ${item.translation}`), 3),
    {
      id: `${faculty.slug}-${lesson.number}-4`, title: `Vocabulary card: ${firstVocabulary.term}`, order: 4, template: 'vocabulary-card',
      speakerNotes: 'Use Handout 1 where provided. For an assessment lesson, ask learners to justify the meaning from the assessment text.',
      content: { type: 'vocabulary-card', data: { word: firstVocabulary.term, phonetic: '', partOfSpeech: lesson.vocabulary.length ? 'Handout 1 term' : 'Assessment text term', definition: short(firstVocabulary.definition), translation: firstVocabulary.translation, exampleSentence: `Use “${firstVocabulary.term}” accurately in a sentence based on this lesson’s supplied material.`, imageUrl: illustration.imageUrl } },
    },
    check('Vocabulary retrieval', `What does “${secondVocabulary.term}” mean in this lesson?`, secondVocabulary.translation || secondVocabulary.definition, secondVocabulary.definition, 5, 'Vocabulary check'),
    {
      id: `${faculty.slug}-${lesson.number}-6`, title: lesson.grammar.title || 'Grammar and professional language', order: 6, template: 'grammar-box',
      speakerNotes: clean(lesson.grammar.notes, 4).join('\n'),
      content: { type: 'grammar-box', data: { ruleTitle: lesson.grammar.title || 'Grammar and professional language', formula: grammarExamples.slice(0, 4).map((item, index) => ({ label: item.label || `Point ${index + 1}`, text: short(item.text, 180), color: index % 2 ? 'bg-cyan-100 border-cyan-300 text-cyan-950' : 'bg-teal-100 border-teal-300 text-teal-950' })), explanation: short(lesson.grammar.notes[0] || 'Use the source handout to notice the language pattern.'), examples: lesson.grammar.practice.slice(0, 3).map((sentence) => ({ sentence: short(sentence, 200), highlightWord: '', translation: '' })), note: sourceNotice } },
    },
    check('Grammar practice', lesson.grammar.practice[0] || 'Complete the first professional-language task in the supplied handout.', answerFor(lesson, ['practice a', 'grammar'])[0] || 'Compare your response with the teacher answer key.', 'Use the handout’s grammar focus and check the source answer key together.', 7, 'Grammar check'),
    blank(lesson.reading.title || 'Reading', lesson.reading.title || 'Reading', clean(lesson.reading.body, 3, 460), 8, 'Handout 3 · read for evidence'),
    columns('Reading for evidence', 'Questions', clean(lesson.reading.questions, 3), 'Answer approach', ['Underline the source sentence for each answer.', 'Compare evidence with a partner before teacher feedback.'], 9, readingAnswers.length ? `Teacher-only reading key:\n${readingAnswers.join('\n')}` : undefined),
    check('Reading check', readingQuestion, readingAnswers[0] || 'Use the supporting sentence from the reading.', 'Reveal only after learners locate the relevant evidence in the supplied reading.', 10, 'Reading'),
    blank(lesson.listening.title || 'Listening', lesson.listening.title || 'Listening', clean([...lesson.listening.directions, ...lesson.listening.questions], 5), 11, 'Handout 4 · listen twice'),
    check('Listening check', listeningQuestion, listeningAnswers[0] || 'Listen again and record the exact detail.', 'The full teacher script is retained in speaker notes for this slide.', 12, 'Listening'),
    columns('Listening reflection', 'Questions', clean(lesson.listening.questions, 3), 'After listening', ['Compare the exact words you heard.', 'Ask for one replay only after your pair has agreed.'], 13, `Teacher-only listening script:\n${lesson.listening.script.join('\n')}\n\nTeacher-only answer key:\n${listeningAnswers.join('\n')}`),
    columns('Role-play · information gap', 'Student A', [short(lesson.speaking.roleA, 430)], 'Student B', [short(lesson.speaking.roleB, 430)], 14, 'Keep the role cards separate until the exchange is complete.'),
    blank('Speaking outcome', 'Communicate, then reflect', clean([lesson.speaking.outcome, ...lesson.speaking.prompts], 4), 15, 'Handout 5'),
    blank('Writing transfer · culture / extension', lesson.culture.title || 'Writing transfer · culture / extension', clean([
      ...(lesson.culture.notes.length ? lesson.culture.notes : [lesson.speaking.outcome]),
      'Writing transfer: write 3–4 evidence-based sentences using today’s vocabulary and grammar focus.',
      'Use the lesson-plan outcome as the communication frame. Add no unsupported clinical claims.',
    ], 4), 16, 'Use only the enquiry scope supplied in the lesson plan.'),
    columns('Mini-quiz and homework', 'Check', clean(lesson.quiz.questions, 4).length ? clean(lesson.quiz.questions, 4) : ['Use the lesson’s grammar, reading and listening checks for a short retrieval round.'], 'Homework', clean(lesson.quiz.homework, 3).length ? clean(lesson.quiz.homework, 3) : ['Complete the supplied assessment task and self-check against the stated criteria.'], 17),
    check('Answer clinic', lesson.quiz.questions[0] || readingQuestion, quizAnswers[0] || readingAnswers[0] || 'Review the source answer key with your teacher.', 'Answers remain tied to the supplied teacher key; open responses use the stated assessment criteria.', 18, 'Feedback'),
    blank('Exit ticket', 'Before you leave', [
      'Name one useful term or language pattern from today’s handout.',
      'State one detail you can support with the reading or listening source.',
      lesson.speaking.outcome || 'Describe the communication outcome you achieved.',
      sourceNotice,
    ], 19, lesson.title),
  ];
};

export const createSuppliedFacultyLessons = (): Lesson[] =>
  sourceFaculties.flatMap((faculty) =>
    faculty.lessons.map((sourceLesson) => ({
      id: `faculty_${faculty.slug}_${String(sourceLesson.number).padStart(2, '0')}`,
      title: `Lesson ${String(sourceLesson.number).padStart(2, '0')}: ${sourceLesson.title}`,
      category: 'Medical English',
      level: 'Upper-Intermediate',
      type: 'interactive-slides',
      semester: 'Semester 3',
      unit: faculty.id,
      topicNumber: sourceLesson.number,
      cefrLevel: 'B2',
      clinicalDomain: faculty.id,
      assessmentType: faculty.summative.includes(sourceLesson.number) ? 'summative' : faculty.formative.includes(sourceLesson.number) ? 'formative' : 'none',
      curriculumRevision: SUPPLIED_FACULTY_CURRICULUM_REVISION,
      createdAt: SOURCE_DATE,
      updatedAt: SOURCE_DATE,
      slides: lessonSlides(faculty, sourceLesson),
    })),
  );

export const SUPPLIED_FACULTY_LESSONS = createSuppliedFacultyLessons();
