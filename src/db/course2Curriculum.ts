import type { Lesson, SlideItem } from '@/types';

type Course2Blueprint = {
  topicNumber: number;
  title: string;
  section: string;
  domain: string;
  assessmentType?: Lesson['assessmentType'];
  objective: string;
  clinicalFrame: string;
  vocabulary: {
    word: string;
    phonetic: string;
    partOfSpeech: string;
    definition: string;
    translation: string;
    exampleSentence: string;
  };
  grammar: {
    title: string;
    formula: Array<{ label: string; text: string; color: string }>;
    explanation: string;
    examples: Array<{ sentence: string; highlightWord: string; translation: string }>;
    note: string;
  };
  reading: {
    title: string;
    text: string;
    checkQuestion: string;
    checkAnswer: string;
    checkExplanation: string;
  };
  listening: {
    script: string;
    question: string;
    answer: string;
    explanation: string;
  };
  speaking: {
    roleA: string;
    roleB: string;
    outcome: string;
  };
  writing: {
    prompt: string;
    languageSupport: string;
  };
  exit: {
    question: string;
    answer: string;
  };
  source: {
    label: string;
    url: string;
  };
};

type KtpLessonPlan = {
  cultureProject: string;
  activities: string[];
  assessment: string;
};

const COURSE_DATE = Date.UTC(2026, 8, 1);

export const COURSE_2_CURRICULUM_REVISION = '2026-09-10-ktp-v2';

export const COURSE_2_FACULTIES = [
  {
    id: 'Nursing',
    number: '01',
    title: 'Nursing',
    description: 'Patient-centred care, mental health, palliative care and infection prevention.',
  },
  {
    id: 'Feldsherlik ishi',
    number: '02',
    title: 'Feldsherlik ishi',
    description: 'History taking, pain communication and safe first clinical decisions.',
  },
  {
    id: 'Functional Diagnostics',
    number: '03',
    title: 'Functional Diagnostics',
    description: 'Pulse, observation charts, endoscopy and circulation explanations.',
  },
  {
    id: 'Pharmacy',
    number: '04',
    title: 'Pharmacy',
    description: 'Medication histories, patient counselling and medicine safety.',
  },
] as const;

type Course2FacultyId = (typeof COURSE_2_FACULTIES)[number]['id'];

const FACULTY_BY_TOPIC: Record<number, Course2FacultyId> = {
  1: 'Functional Diagnostics',
  2: 'Feldsherlik ishi',
  3: 'Feldsherlik ishi',
  4: 'Feldsherlik ishi',
  5: 'Nursing',
  6: 'Nursing',
  7: 'Nursing',
  8: 'Nursing',
  9: 'Nursing',
  10: 'Nursing',
  11: 'Nursing',
  12: 'Nursing',
  13: 'Nursing',
  14: 'Nursing',
  15: 'Nursing',
  16: 'Nursing',
  17: 'Pharmacy',
  18: 'Pharmacy',
  19: 'Functional Diagnostics',
  20: 'Functional Diagnostics',
  21: 'Pharmacy',
};

const facultyForTopic = (topicNumber: number): Course2FacultyId => {
  const faculty = FACULTY_BY_TOPIC[topicNumber];
  if (!faculty) {
    throw new Error('Course 2 faculty is missing for topic ' + topicNumber);
  }
  return faculty;
};

// III-semester KTP, Hamshiralik ishi. These entries preserve the supplied
// lesson-plan route while the presentation supplies the requested four skills,
// vocabulary and grammar practice around that route.
const COURSE_2_KTP_PLANS: Record<number, KtpLessonPlan> = {
  1: {
    cultureProject: 'The history and development of traditional medicine',
    activities: ['Discuss the new topic', 'teach new vocabulary', 'read the text and discuss it'],
    assessment: 'Joriy nazorat',
  },
  2: {
    cultureProject: 'Traditional European medicine',
    activities: ['Listening task', 'develop the conversation', 'read the text'],
    assessment: 'Joriy nazorat',
  },
  3: {
    cultureProject: 'Traditional medicine',
    activities: ['Discuss the topic', 'teach new vocabulary', 'read the text', 'strengthen the grammar focus'],
    assessment: 'Joriy nazorat',
  },
  4: {
    cultureProject: 'Traditional medicine',
    activities: ['Discuss the topic', 'teach new vocabulary', 'read the text', 'strengthen the grammar focus'],
    assessment: 'Joriy nazorat',
  },
  5: {
    cultureProject: 'Traditional European medicine',
    activities: ['Listening task', 'develop the conversation', 'read the text'],
    assessment: 'Joriy nazorat',
  },
  6: {
    cultureProject: 'Traditional Unani medicine',
    activities: ['Teach new vocabulary', 'complete a listening task', 'read for the general idea', 'practise vocabulary in speech'],
    assessment: 'Joriy nazorat',
  },
  7: {
    cultureProject: 'Traditional African medicine',
    activities: ['Discuss a laboratory test paper', 'complete a writing task', 'use academic word-list language'],
    assessment: 'Joriy nazorat',
  },
  8: {
    cultureProject: 'Traditional Asian medicine',
    activities: ['Teach new vocabulary', 'discuss endoscopy instruments', 'read the text'],
    assessment: 'Joriy nazorat',
  },
  9: {
    cultureProject: 'Islamic medicine',
    activities: ['Teach new vocabulary', 'discuss the topic', 'complete the exercise'],
    assessment: 'Joriy nazorat',
  },
  10: {
    cultureProject: 'Course revision',
    activities: ['Write an essay', 'complete a control task', 'review key course language'],
    assessment: 'Oraliq nazorat',
  },
  11: {
    cultureProject: 'Traditional Indian medicine',
    activities: ['Teach new vocabulary', 'discuss the topic', 'complete the exercise'],
    assessment: 'Joriy nazorat',
  },
  12: {
    cultureProject: 'Siddha medicine',
    activities: ['Teach new vocabulary', 'discuss the topic', 'use the academic word list'],
    assessment: 'Joriy nazorat',
  },
  13: {
    cultureProject: 'Siddha medicine',
    activities: ['Teach new vocabulary', 'discuss the topic', 'read the text'],
    assessment: 'Joriy nazorat',
  },
  14: {
    cultureProject: 'Siddha medicine',
    activities: ['Teach new vocabulary', 'discuss the topic', 'use the academic word list'],
    assessment: 'Joriy nazorat',
  },
  15: {
    cultureProject: 'Traditional Asian medicine',
    activities: ['Teach new vocabulary', 'discuss the topic', 'complete the exercise'],
    assessment: 'Joriy nazorat',
  },
  16: {
    cultureProject: 'Urinotherapy',
    activities: ['Teach new vocabulary', 'discuss the topic', 'complete the exercise'],
    assessment: 'Joriy nazorat',
  },
  17: {
    cultureProject: 'Aromatherapy',
    activities: ['Teach new vocabulary', 'discuss the topic', 'complete the exercise'],
    assessment: 'Joriy nazorat',
  },
  18: {
    cultureProject: 'Homeopathy',
    activities: ['Teach new vocabulary', 'discuss the topic', 'complete the exercise'],
    assessment: 'Joriy nazorat',
  },
  19: {
    cultureProject: 'Mineral therapy',
    activities: ['Teach new vocabulary', 'discuss the topic', 'complete the exercise'],
    assessment: 'Joriy nazorat',
  },
  20: {
    cultureProject: 'Sound therapy',
    activities: ['Teach new vocabulary', 'discuss the topic', 'complete the exercise'],
    assessment: 'Joriy nazorat',
  },
  21: {
    cultureProject: 'Course revision',
    activities: ['Complete the final test', 'review integrated clinical English', 'give feedback on next steps'],
    assessment: 'Yakuniy nazorat',
  },
};

const ktpPlanForTopic = (topicNumber: number): KtpLessonPlan => {
  const plan = COURSE_2_KTP_PLANS[topicNumber];
  if (!plan) {
    throw new Error('Course 2 KTP plan is missing for topic ' + topicNumber);
  }
  return plan;
};

const sourceNote = (lesson: Course2Blueprint) =>
  [
    'Authentic source: ' + lesson.source.label,
    lesson.source.url,
    'Language has been adapted for a B2 Medical English classroom. It is not a local clinical protocol.',
  ].join('\n');

const lessonPlanNotes = (lesson: Course2Blueprint) => {
  const ktpPlan = ktpPlanForTopic(lesson.topicNumber);

  return [
    sourceNote(lesson),
    '',
    'KTP source: HI KTP (3).docx, III semester, Hamshiralik ishi.',
    'Format: Practical, collective lesson.',
    'Culture project: ' + ktpPlan.cultureProject + '.',
    'KTP activities: ' + ktpPlan.activities.join('. ') + '.',
    'Assessment: ' + ktpPlan.assessment + '.',
    '',
    '80-minute lesson plan',
    '0–5 min: Introduce the clinical frame and the lesson outcome.',
    '5–12 min: Warm-up prediction in pairs; collect two ideas without correcting yet.',
    '12–24 min: Teach and practise the core vocabulary in context.',
    '24–36 min: Notice the grammar pattern; students produce one relevant sentence.',
    '36–48 min: Reading for the main message and one safe clinical action.',
    '48–58 min: Teacher-led listening handover; read the script twice at natural pace.',
    '58–70 min: Role-play with a clarification question and patient-centred phrase.',
    '70–78 min: Individual concise clinical writing; give feedback on clarity before accuracy.',
    '78–80 min: Peer feedback and exit ticket.',
    'Materials: presentation, board, student notebooks, and the source link on the final slide.',
    'Differentiation: give a language-support frame first; ask confident pairs to add a reason and next action.',
    'Culture projects are for historical and language discussion. They are not treatment recommendations.',
  ].join('\n');
};

const FACULTY_ILLUSTRATIONS: Record<Course2FacultyId, string> = {
  Nursing: '/course2/section-3-palliative-hygiene.png',
  'Feldsherlik ishi': '/course2/section-2-ageing-mental-health.png',
  'Functional Diagnostics': '/course2/section-1-assessment-pain.png',
  Pharmacy: '/course2/section-4-medication-circulation.png',
};

const course2Slides = (lesson: Course2Blueprint): SlideItem[] => {
  const lessonId = 'med_sem3_' + String(lesson.topicNumber).padStart(2, '0');
  const faculty = facultyForTopic(lesson.topicNumber);
  const ktpPlan = ktpPlanForTopic(lesson.topicNumber);
  const notes = sourceNote(lesson);
  const planNotes = lessonPlanNotes(lesson);

  const coreSlides: SlideItem[] = [
    {
      id: lessonId + '_s02',
      title: 'Core vocabulary',
      template: 'vocabulary-card',
      order: 1,
      speakerNotes: notes + '\n\nAsk students to predict the Uzbek meaning before revealing it.',
      content: {
        type: 'vocabulary-card',
        data: lesson.vocabulary,
      },
    },
    {
      id: lessonId + '_s03',
      title: 'Language focus',
      template: 'grammar-box',
      order: 2,
      speakerNotes: notes,
      content: {
        type: 'grammar-box',
        data: {
          ruleTitle: lesson.grammar.title,
          formula: lesson.grammar.formula,
          explanation: lesson.grammar.explanation,
          examples: lesson.grammar.examples,
          note: lesson.grammar.note,
        },
      },
    },
    {
      id: lessonId + '_s04',
      title: 'Read an evidence-based brief',
      template: 'blank',
      order: 3,
      speakerNotes: notes + '\n\nReading task: students underline one clinical action, one risk, and one patient-centred phrase.',
      content: {
        type: 'blank',
        data: {
          heading: lesson.reading.title,
          subheading: 'Reading | Read for the main idea, then for one safe clinical action.',
          paragraphs: [
            lesson.reading.text,
            'Pair task: identify the key message, then explain why it matters for a nurse or patient.',
          ],
        },
      },
    },
    {
      id: lessonId + '_s05',
      title: 'Reading check',
      template: 'click-to-reveal',
      order: 4,
      speakerNotes: notes,
      content: {
        type: 'click-to-reveal',
        data: {
          question: lesson.reading.checkQuestion,
          hint: 'Return to the evidence-based brief and locate the clinical reason.',
          hiddenAnswer: lesson.reading.checkAnswer,
          explanation: lesson.reading.checkExplanation,
          badge: 'Reading',
        },
      },
    },
    {
      id: lessonId + '_s06',
      title: 'Listen to the handover',
      template: 'blank',
      order: 5,
      speakerNotes: notes + '\n\nListening script. Read twice at a natural pace:\n' + lesson.listening.script,
      content: {
        type: 'blank',
        data: {
          heading: 'Listen: clinical handover',
          subheading: 'Listening | The teacher reads the short handover from Speaker Notes twice.',
          paragraphs: [
            'First listen: write the clinical situation in three words.',
            'Second listen: listen for the action, the reason, and one safety detail.',
            'Do not show the script until students have compared their notes.',
          ],
        },
      },
    },
    {
      id: lessonId + '_s07',
      title: 'Listening check',
      template: 'click-to-reveal',
      order: 6,
      speakerNotes: notes,
      content: {
        type: 'click-to-reveal',
        data: {
          question: lesson.listening.question,
          hint: 'Listen for the action word and the reason for it.',
          hiddenAnswer: lesson.listening.answer,
          explanation: lesson.listening.explanation,
          badge: 'Listening',
        },
      },
    },
    {
      id: lessonId + '_s08',
      title: 'Clinical speaking',
      template: 'two-column',
      order: 7,
      speakerNotes: notes + '\n\nGive pairs 90 seconds, then switch roles once.',
      content: {
        type: 'two-column',
        data: {
          leftTitle: 'Role A',
          leftBadge: 'Speak',
          leftPoints: [lesson.speaking.roleA, 'Use one clarification question.', 'Use one patient-centred phrase.'],
          rightTitle: 'Role B',
          rightBadge: 'Respond',
          rightPoints: [lesson.speaking.roleB, 'Give one relevant detail.', 'Confirm the agreed next step.'],
        },
      },
    },
    {
      id: lessonId + '_s09',
      title: 'Clinical writing',
      template: 'blank',
      order: 8,
      speakerNotes: notes + '\n\nCollect a short sample from two pairs and give feedback on clarity before accuracy.',
      content: {
        type: 'blank',
        data: {
          heading: 'Write: concise and safe',
          subheading: 'Writing | 70 to 90 words, or a short structured clinical note.',
          paragraphs: [
            lesson.writing.prompt,
            'Language support: ' + lesson.writing.languageSupport,
            'Checklist: clear purpose, accurate key term, respectful tone, and one next action.',
          ],
        },
      },
    },
    {
      id: lessonId + '_s10',
      title: 'Evidence and exit ticket',
      template: 'two-column',
      order: 9,
      speakerNotes: notes,
      content: {
        type: 'two-column',
        data: {
          leftTitle: 'Evidence base',
          leftBadge: 'Source',
          leftPoints: [lesson.source.label, lesson.source.url, 'Adapted for language learning, not a clinical protocol.'],
          rightTitle: 'Exit ticket',
          rightBadge: '1 minute',
          rightPoints: [lesson.exit.question, 'Expected idea: ' + lesson.exit.answer, 'Name one phrase you can use in practice.'],
        },
      },
    },
  ];

  const positionSlide = (slide: SlideItem, position: number): SlideItem => ({
    ...slide,
    id: lessonId + '_s' + String(position).padStart(2, '0'),
    order: position - 1,
  });

  return [
    {
      id: lessonId + '_s01',
      title: 'Lesson plan',
      template: 'blank',
      order: 0,
      speakerNotes: planNotes,
      content: {
        type: 'blank',
        data: {
          heading: 'Lesson plan: ' + lesson.title,
          subheading: '80 minutes | Practical collective lesson | Faculty: ' + faculty + ' | B2 Medical English',
          paragraphs: [
            'Outcome: ' + lesson.objective,
            'KTP activity focus: ' + ktpPlan.activities.join('. ') + '.',
            'Culture project: ' + ktpPlan.cultureProject + '. Assessment: ' + ktpPlan.assessment + '.',
          ],
          imageUrl: FACULTY_ILLUSTRATIONS[faculty],
        },
      },
    },
    {
      id: lessonId + '_s02',
      title: 'Learning focus',
      template: 'two-column',
      order: 1,
      speakerNotes: notes + '\n\nRead the success criteria aloud. Ask students to choose one criterion they want to improve today.',
      content: {
        type: 'two-column',
        data: {
          leftTitle: 'Today’s clinical frame',
          leftBadge: 'Context',
          leftPoints: [lesson.clinicalFrame, 'Work in pairs, then explain one decision to the class.'],
          rightTitle: 'Success criteria',
          rightBadge: 'By the end',
          rightPoints: [
            'I can use ' + lesson.vocabulary.word + ' accurately.',
            'I can read and listen for a safe clinical action.',
            'I can speak and write a clear, patient-centred response.',
          ],
        },
      },
    },
    {
      id: lessonId + '_s03',
      title: 'Warm-up: predict the clinical need',
      template: 'blank',
      order: 2,
      speakerNotes: notes + '\n\nThink–pair–share for 3 minutes. Accept ideas first; use the vocabulary slide for corrections afterwards.',
      content: {
        type: 'blank',
        data: {
          heading: 'Warm-up: what does the patient need?',
          subheading: 'Speaking preparation | Think alone, then compare in pairs.',
          paragraphs: [
            lesson.clinicalFrame,
            'Predict: what information, reassurance, or next action could be needed?',
            'Use one phrase: “I would first ask about…” or “A safe next step may be…”.',
          ],
        },
      },
    },
    positionSlide(coreSlides[0], 4),
    {
      id: lessonId + '_s05',
      title: 'Vocabulary in clinical context',
      template: 'two-column',
      order: 4,
      speakerNotes: notes + '\n\nHave students underline the word form, then say where they could use it in the clinical frame.',
      content: {
        type: 'two-column',
        data: {
          leftTitle: lesson.vocabulary.word,
          leftBadge: lesson.vocabulary.partOfSpeech,
          leftPoints: [lesson.vocabulary.definition, 'Uzbek: ' + lesson.vocabulary.translation],
          rightTitle: 'Use it in context',
          rightBadge: 'Say it',
          rightPoints: [
            lesson.vocabulary.exampleSentence,
            'Replace one detail with the patient in today’s clinical frame.',
            'Ask your partner one follow-up question using the same word.',
          ],
        },
      },
    },
    {
      id: lessonId + '_s06',
      title: 'Vocabulary check',
      template: 'click-to-reveal',
      order: 5,
      speakerNotes: notes + '\n\nGive pairs 30 seconds to justify their answer before revealing it.',
      content: {
        type: 'click-to-reveal',
        data: {
          question: 'When would you use “' + lesson.vocabulary.word + '” in today’s clinical situation?',
          hint: 'Use the definition and the clinical frame, not only a dictionary translation.',
          hiddenAnswer: lesson.vocabulary.definition,
          explanation: 'Say one complete sentence connected to the patient scenario before moving on.',
          badge: 'Vocabulary',
        },
      },
    },
    positionSlide(coreSlides[1], 7),
    {
      id: lessonId + '_s08',
      title: 'Grammar: guided clinical practice',
      template: 'two-column',
      order: 7,
      speakerNotes: notes + '\n\nModel one sentence, then ask each pair to adapt a pattern to the clinical frame.',
      content: {
        type: 'two-column',
        data: {
          leftTitle: 'Notice the pattern',
          leftBadge: 'Grammar',
          leftPoints: lesson.grammar.formula.map((item) => item.label + ': ' + item.text),
          rightTitle: 'Make it clinical',
          rightBadge: 'Practise',
          rightPoints: [
            lesson.grammar.examples[0]?.sentence || 'Create one accurate sentence about the patient.',
            lesson.grammar.examples[1]?.sentence || 'Create one accurate sentence about the patient.',
            'Add one reason or next action.',
          ],
        },
      },
    },
    positionSlide(coreSlides[2], 9),
    {
      id: lessonId + '_s10',
      title: 'Reading strategy: locate evidence',
      template: 'two-column',
      order: 9,
      speakerNotes: notes + '\n\nGive students one minute to scan, then ask them to point to the exact phrase that supports their answer.',
      content: {
        type: 'two-column',
        data: {
          leftTitle: 'Read first for meaning',
          leftBadge: 'Skim',
          leftPoints: [
            'What is the main clinical message?',
            'Who needs to act?',
            'Which action is safe and appropriate?',
          ],
          rightTitle: 'Read again for language',
          rightBadge: 'Scan',
          rightPoints: [
            'Find “' + lesson.vocabulary.word + '” or a related clinical idea.',
            'Notice one example of: ' + lesson.grammar.title,
            'Explain the evidence to a partner in one sentence.',
          ],
        },
      },
    },
    positionSlide(coreSlides[3], 11),
    {
      id: lessonId + '_s12',
      title: 'Listening: predict the handover',
      template: 'blank',
      order: 11,
      speakerNotes: notes + '\n\nDo not read the script yet. Ask students to predict the action, reason and safety detail they may hear.',
      content: {
        type: 'blank',
        data: {
          heading: 'Listen: predict before you hear',
          subheading: 'Listening preparation | 2 minutes',
          paragraphs: [
            lesson.clinicalFrame,
            'Predict one action the clinician may take and one reason for it.',
            'Listen for the situation, the action, and one safety detail.',
          ],
        },
      },
    },
    positionSlide(coreSlides[4], 13),
    positionSlide(coreSlides[5], 14),
    {
      id: lessonId + '_s15',
      title: 'Speaking language bank',
      template: 'two-column',
      order: 14,
      speakerNotes: notes + '\n\nChoral-practise the opening lines once, then give pairs one minute to choose two phrases for their role-play.',
      content: {
        type: 'two-column',
        data: {
          leftTitle: 'Clarify and check',
          leftBadge: 'Useful phrases',
          leftPoints: [
            'Could you tell me more about…?',
            'Let me check that I understood correctly.',
            'What matters most to you right now?',
          ],
          rightTitle: 'Explain a next step',
          rightBadge: 'Patient-centred',
          rightPoints: [
            'A safe next step is to…',
            'We can discuss this with the responsible team.',
            'Use “' + lesson.vocabulary.word + '” and one grammar pattern accurately.',
          ],
        },
      },
    },
    positionSlide(coreSlides[6], 16),
    {
      id: lessonId + '_s17',
      title: 'Writing: plan before you write',
      template: 'blank',
      order: 16,
      speakerNotes: notes + '\n\nGive students two minutes to plan in note form before they write full sentences.',
      content: {
        type: 'blank',
        data: {
          heading: 'Plan: clear, respectful, useful',
          subheading: 'Writing preparation | Build a short clinical response.',
          paragraphs: [
            'Purpose: who will read your note or message?',
            'Include: key concern, relevant detail, safe next action.',
            'Language: use “' + lesson.vocabulary.word + '” and one pattern from today’s grammar focus.',
          ],
        },
      },
    },
    positionSlide(coreSlides[7], 18),
    {
      id: lessonId + '_s19',
      title: 'Formative lesson check',
      template: 'two-column',
      order: 18,
      speakerNotes: notes + '\n\nUse this slide for peer feedback first, then record one observable strength and one next step for the class.',
      content: {
        type: 'two-column',
        data: {
          leftTitle: 'Peer feedback',
          leftBadge: '2 minutes',
          leftPoints: [
            'Was the clinical message clear?',
            'Was one key vocabulary item used accurately?',
            'Was the language respectful and patient-centred?',
          ],
          rightTitle: 'Teacher evidence',
          rightBadge: 'Observe',
          rightPoints: [
            'Reading/listening: learner identifies a safe action.',
            'Speaking: learner asks or answers clearly.',
            'Writing: learner includes a relevant next action.',
          ],
        },
      },
    },
    positionSlide(coreSlides[8], 20),
  ];
};

const COURSE_2_BLUEPRINTS: Course2Blueprint[] = [
  {
    topicNumber: 1,
    title: 'How to Take the Pulse and Upper GI Endoscopy',
    section: 'Section 1: Assessment & Pain',
    domain: 'Vital signs and diagnostic procedures',
    objective: 'explain a basic pulse check and prepare a patient to discuss an upper GI endoscopy.',
    clinicalFrame: 'A nurse checks a resting pulse, then explains why the patient must discuss medicines before an endoscopy.',
    vocabulary: {
      word: 'pulse',
      phonetic: '/pʌls/',
      partOfSpeech: 'noun',
      definition: 'the regular beat felt in an artery as the heart pumps blood.',
      translation: 'puls, yurak urishi',
      exampleSentence: 'The nurse recorded the patient’s pulse after a short rest.',
    },
    grammar: {
      title: 'Clear procedure instructions',
      formula: [
        { label: 'Step', text: 'First, place...', color: 'blue' },
        { label: 'Reason', text: 'so that we can...', color: 'emerald' },
        { label: 'Safety', text: 'Please tell us if...', color: 'amber' },
      ],
      explanation: 'Use sequencing words and polite imperatives to explain a short, safe procedure.',
      examples: [
        { sentence: 'First, rest quietly before we count your pulse.', highlightWord: 'First', translation: 'Avval pulsni sanashdan oldin tinch dam oling.' },
        { sentence: 'Please tell us about any medicines before the procedure.', highlightWord: 'Please tell us', translation: 'Muolajadan oldin dorilaringiz haqida ayting.' },
      ],
      note: 'Avoid giving individual fasting or medication instructions. Refer the patient to the clinical team’s protocol.',
    },
    reading: {
      title: 'Read: a safe preparation conversation',
      text: 'Vital signs include pulse, breathing rate, temperature and blood pressure. Before an upper GI endoscopy, a patient should discuss their medical history and medicines with the clinical team. The exact preparation plan comes from that team.',
      checkQuestion: 'Why should a patient discuss medicines before an upper GI endoscopy?',
      checkAnswer: 'Some medicines may need individual review or adjustment before the procedure.',
      checkExplanation: 'The lesson teaches communication, not a universal medication instruction.',
    },
    listening: {
      script: 'Mr Karim has rested for five minutes. His pulse is regular, so I will record it. Before tomorrow’s endoscopy, he will speak with the nurse about his medicines and arrange a safe ride home if sedation is planned.',
      question: 'What two actions are mentioned before the endoscopy?',
      answer: 'Discuss medicines with the nurse and arrange a safe ride home if sedation is planned.',
      explanation: 'Both actions are part of safe preparation communication.',
    },
    speaking: {
      roleA: 'You are the nurse. Explain how you will check a resting pulse and ask about medicines.',
      roleB: 'You are the patient. Ask why the endoscopy team needs this information.',
      outcome: 'The pair agrees on who will give the final procedure instructions.',
    },
    writing: {
      prompt: 'Write a 70-word patient-friendly message that explains a pulse check and asks the patient to bring an up-to-date medicines list.',
      languageSupport: 'First..., Please..., This helps us..., If you are unsure...',
    },
    exit: {
      question: 'Which detail must come from the clinical team rather than this lesson?',
      answer: 'The patient’s individual preparation, fasting and medication plan.',
    },
    source: {
      label: 'MedlinePlus: Vital signs; NIDDK: Upper GI Endoscopy',
      url: 'https://medlineplus.gov/ency/article/002341.htm | https://www.niddk.nih.gov/health-information/diagnostic-tests/upper-gi-endoscopy',
    },
  },
  {
    topicNumber: 2,
    title: 'Chronic Pain: Describing Impact and Duration',
    section: 'Section 1: Assessment & Pain',
    domain: 'Pain communication and rehabilitation',
    objective: 'describe chronic pain respectfully and ask about its effect on everyday function.',
    clinicalFrame: 'A patient reports back pain that affects sleep and walking.',
    vocabulary: {
      word: 'persistent',
      phonetic: '/pəˈsɪstənt/',
      partOfSpeech: 'adjective',
      definition: 'continuing for a long time or repeatedly occurring.',
      translation: 'davomli, uzoq saqlanadigan',
      exampleSentence: 'The patient described persistent pain that affected sleep.',
    },
    grammar: {
      title: 'Open questions about function',
      formula: [
        { label: 'Question', text: 'How does ... affect ...?', color: 'blue' },
        { label: 'Follow-up', text: 'Could you tell me more about ...?', color: 'emerald' },
        { label: 'Empathy', text: 'That sounds difficult.', color: 'amber' },
      ],
      explanation: 'Open questions help patients describe impact without forcing a yes-or-no answer.',
      examples: [
        { sentence: 'How does the pain affect your sleep?', highlightWord: 'How does', translation: 'Og‘riq uyquingizga qanday ta’sir qiladi?' },
        { sentence: 'Could you tell me more about walking at work?', highlightWord: 'Could you tell me more', translation: 'Ishda yurish haqida batafsilroq ayta olasizmi?' },
      ],
      note: 'Do not minimise pain. Focus on function, goals and referral to the responsible clinician.',
    },
    reading: {
      title: 'Read: pain and daily life',
      text: 'Long-term health conditions can limit function and participation. Rehabilitation can help people develop self-management strategies and address pain or complications. A useful first step is to ask what activities matter most to the patient.',
      checkQuestion: 'What does the text suggest asking before discussing a plan?',
      checkAnswer: 'Ask which daily activities matter most and how pain affects them.',
      checkExplanation: 'Function and participation make the conversation patient-centred.',
    },
    listening: {
      script: 'Ms Aliyeva says the pain is worse after standing at work. She is worried because she cannot sleep well. The nurse asks which activity she most wants to return to and records the answer for the care team.',
      question: 'What patient goal does the nurse explore?',
      answer: 'The activity the patient most wants to return to.',
      explanation: 'The handover connects symptoms to meaningful function.',
    },
    speaking: {
      roleA: 'You are the nurse. Ask two open questions about pain and daily activities.',
      roleB: 'You are the patient. Describe one effect on sleep or mobility.',
      outcome: 'Agree on one clear point to report to the care team.',
    },
    writing: {
      prompt: 'Write a brief, respectful handover note about pain impact. Include duration, one affected activity and one patient goal.',
      languageSupport: 'The patient reports..., This affects..., Their priority is...',
    },
    exit: {
      question: 'Why is “What do you want to return to?” a useful question?',
      answer: 'It centres the patient’s meaningful function rather than only a pain score.',
    },
    source: {
      label: 'WHO: Rehabilitation',
      url: 'https://www.who.int/news-room/fact-sheets/detail/rehabilitation',
    },
  },
  {
    topicNumber: 3,
    title: 'Chronic Pain, Nutrition and Obesity',
    section: 'Section 1: Assessment & Pain',
    domain: 'Nutrition communication and stigma-free care',
    objective: 'use person-first language when discussing nutrition, weight and chronic pain.',
    clinicalFrame: 'A patient wants advice about eating patterns while managing chronic knee pain.',
    vocabulary: {
      word: 'balanced',
      phonetic: '/ˈbælənst/',
      partOfSpeech: 'adjective',
      definition: 'including the right amounts of different things in a healthy proportion.',
      translation: 'muvozanatli',
      exampleSentence: 'A balanced eating pattern can support overall health.',
    },
    grammar: {
      title: 'Respectful recommendations',
      formula: [
        { label: 'Permission', text: 'Would it be okay to discuss...?', color: 'blue' },
        { label: 'Option', text: 'One option could be...', color: 'emerald' },
        { label: 'Choice', text: 'What feels realistic for you?', color: 'amber' },
      ],
      explanation: 'Use collaborative, person-first language. Avoid blame and promises of a “quick fix”.',
      examples: [
        { sentence: 'Would it be okay to discuss your usual meals?', highlightWord: 'Would it be okay', translation: 'Odatdagi ovqatlaringiz haqida gaplashsak maylimi?' },
        { sentence: 'What feels realistic for you this week?', highlightWord: 'What feels realistic', translation: 'Bu hafta siz uchun nima realroq tuyuladi?' },
      ],
      note: 'Students practise language, not individual diet prescriptions.',
    },
    reading: {
      title: 'Read: healthy diet principles',
      text: 'Healthy diets vary across people and cultures, but WHO describes four broad principles: adequacy, balance, moderation and diversity. Obesity is a chronic, complex condition, so respectful care avoids blame and focuses on realistic support.',
      checkQuestion: 'Which four principles are named in the text?',
      checkAnswer: 'Adequacy, balance, moderation and diversity.',
      checkExplanation: 'The principles are a discussion frame, not a one-size-fits-all diet.',
    },
    listening: {
      script: 'The patient says, “I do not want to be judged.” The nurse replies, “Thank you for telling me. Would it be okay to discuss what meals are practical when your pain is worse?”',
      question: 'How does the nurse reduce stigma?',
      answer: 'By acknowledging the concern and asking permission before discussing food.',
      explanation: 'Permission and non-judgemental language protect trust.',
    },
    speaking: {
      roleA: 'You are the nurse. Ask permission to discuss one eating habit without giving blame.',
      roleB: 'You are the patient. Say what is difficult on a painful day.',
      outcome: 'Choose one realistic question for the next appointment.',
    },
    writing: {
      prompt: 'Write a supportive 80-word follow-up message. Include one healthy-diet principle and one non-judgemental question.',
      languageSupport: 'Thank you for sharing..., Would it be okay..., One practical option...',
    },
    exit: {
      question: 'What is the difference between support and blame in this topic?',
      answer: 'Support asks about context and choices; blame assumes the patient is at fault.',
    },
    source: {
      label: 'WHO: Healthy diet; WHO: Obesity and overweight',
      url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet | https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight',
    },
  },
  {
    topicNumber: 4,
    title: 'Chronic Pain and Typhoid Fever: Taking a Safe History',
    section: 'Section 1: Assessment & Pain',
    domain: 'Infection history and escalation',
    objective: 'separate chronic symptoms from new red flags and use clear escalation language.',
    clinicalFrame: 'A patient with long-term pain develops fever after recent travel.',
    vocabulary: {
      word: 'exposure',
      phonetic: '/ɪkˈspəʊʒə(r)/',
      partOfSpeech: 'noun',
      definition: 'contact with something that may affect health, such as an infection risk.',
      translation: 'ta’sirlanish, xavf manbasi bilan aloqa',
      exampleSentence: 'The nurse asked about recent travel and possible exposure.',
    },
    grammar: {
      title: 'Clarifying a history',
      formula: [
        { label: 'Time', text: 'When did ... begin?', color: 'blue' },
        { label: 'Change', text: 'Has ... become worse?', color: 'emerald' },
        { label: 'Context', text: 'Have you recently ...?', color: 'amber' },
      ],
      explanation: 'Use precise time and context questions when a new symptom may need escalation.',
      examples: [
        { sentence: 'When did the fever begin?', highlightWord: 'When did', translation: 'Isitma qachon boshlandi?' },
        { sentence: 'Have you recently travelled?', highlightWord: 'Have you recently', translation: 'Yaqinda sayohat qilganmisiz?' },
      ],
      note: 'Fever with possible infection risk needs clinical assessment, not classroom diagnosis.',
    },
    reading: {
      title: 'Read: a new symptom needs attention',
      text: 'Typhoid fever and paratyphoid fever are serious illnesses caused by Salmonella bacteria. In a clinical history, a new fever, travel and other relevant exposure details should be passed promptly to the responsible clinician.',
      checkQuestion: 'Which details should the nurse clarify in this scenario?',
      checkAnswer: 'When the fever began, recent travel and other relevant exposure details.',
      checkExplanation: 'These details help the clinical team assess a possible infection risk.',
    },
    listening: {
      script: 'Mr Yusupov has chronic back pain, but today he also reports fever. He returned from travel last week. The nurse documents the new symptom and contacts the clinician rather than assuming it is part of the chronic pain.',
      question: 'Why does the nurse contact the clinician?',
      answer: 'Because fever after travel is a new symptom that may need assessment.',
      explanation: 'New red flags should not be explained away by an existing chronic condition.',
    },
    speaking: {
      roleA: 'You are the nurse. Ask three concise history questions about the new fever.',
      roleB: 'You are the patient. Give travel timing and symptom details.',
      outcome: 'State one sentence you would use to escalate the history.',
    },
    writing: {
      prompt: 'Write a short SBAR-style note that distinguishes chronic pain from the new fever and travel history.',
      languageSupport: 'Background..., New concern..., The patient reports..., Please review...',
    },
    exit: {
      question: 'What must not happen when a patient has a chronic condition and a new fever?',
      answer: 'The new fever must not be assumed to be part of the chronic condition.',
    },
    source: {
      label: 'CDC: About Typhoid Fever and Paratyphoid Fever',
      url: 'https://www.cdc.gov/typhoid-fever/about/index.html',
    },
  },
  {
    topicNumber: 5,
    title: 'Secrets of a Long Life: Healthy Ageing',
    section: 'Section 2: Healthy Ageing & Mental Health',
    domain: 'Healthy ageing and patient goals',
    objective: 'discuss healthy ageing without stereotypes and identify a patient’s strengths.',
    clinicalFrame: 'An older adult wants to remain active and independent at home.',
    vocabulary: {
      word: 'independence',
      phonetic: '/ˌɪndɪˈpendəns/',
      partOfSpeech: 'noun',
      definition: 'the ability to make choices and manage everyday life without unnecessary help.',
      translation: 'mustaqillik',
      exampleSentence: 'The care plan supports the patient’s independence at home.',
    },
    grammar: {
      title: 'Strength-based descriptions',
      formula: [
        { label: 'Strength', text: 'She is able to...', color: 'blue' },
        { label: 'Goal', text: 'He would like to...', color: 'emerald' },
        { label: 'Support', text: 'What would help you...?', color: 'amber' },
      ],
      explanation: 'Describe what a person can do and what they value, not only their limitations.',
      examples: [
        { sentence: 'She is able to prepare her own meals.', highlightWord: 'is able to', translation: 'U o‘z ovqatini tayyorlay oladi.' },
        { sentence: 'What would help you keep walking safely?', highlightWord: 'What would help you', translation: 'Xavfsiz yurishni davom ettirishingizga nima yordam beradi?' },
      ],
      note: 'Older adults are diverse. Avoid treating age as a diagnosis.',
    },
    reading: {
      title: 'Read: no “typical” older person',
      text: 'Ageing changes are not the same for every person. WHO notes that health in older age is influenced by physical and social environments as well as personal factors. Good communication asks what a person values and what support is useful.',
      checkQuestion: 'Why is “typical older patient” a poor phrase?',
      checkAnswer: 'Older people have very different strengths, needs and environments.',
      checkExplanation: 'Person-centred care avoids age-based assumptions.',
    },
    listening: {
      script: 'Mrs Rahimova says, “I still enjoy visiting my friends, but the stairs worry me.” The nurse asks what support would help her continue the activity safely and records her goal.',
      question: 'What does the nurse focus on?',
      answer: 'The patient’s valued activity and the support needed to continue it safely.',
      explanation: 'The focus is capability and participation, not age alone.',
    },
    speaking: {
      roleA: 'You are the nurse. Ask about one valued activity and one barrier.',
      roleB: 'You are the patient. Explain what independence means to you.',
      outcome: 'Agree on a clear goal to share with the team.',
    },
    writing: {
      prompt: 'Write a 70-word care-plan goal using a strength, a valued activity and a support need.',
      languageSupport: 'The patient is able to..., They would like to..., Support may include...',
    },
    exit: {
      question: 'What makes an ageing conversation person-centred?',
      answer: 'It starts with the person’s goals, strengths and environment.',
    },
    source: {
      label: 'WHO: Ageing and health',
      url: 'https://www.who.int/news-room/fact-sheets/detail/ageing-and-health',
    },
  },
  {
    topicNumber: 6,
    title: 'Healthy Ageing Grammar: Advice and Shared Decisions',
    section: 'Section 2: Healthy Ageing & Mental Health',
    domain: 'Shared decision-making',
    objective: 'give clear, respectful advice using modals and shared-decision language.',
    clinicalFrame: 'A patient asks how to stay active while managing several long-term conditions.',
    vocabulary: {
      word: 'preference',
      phonetic: '/ˈprefrəns/',
      partOfSpeech: 'noun',
      definition: 'something a person would choose because it suits their values or situation.',
      translation: 'afzallik, tanlov istagi',
      exampleSentence: 'The clinician asked about the patient’s preference before making a plan.',
    },
    grammar: {
      title: 'Advice without commands',
      formula: [
        { label: 'Option', text: 'You could...', color: 'blue' },
        { label: 'Check', text: 'Would that work for you?', color: 'emerald' },
        { label: 'Plan', text: 'Let us decide together.', color: 'amber' },
      ],
      explanation: 'Could and would can make advice collaborative while keeping the next step clear.',
      examples: [
        { sentence: 'You could discuss this option with your clinician.', highlightWord: 'could', translation: 'Bu variantni shifokoringiz bilan muhokama qilishingiz mumkin.' },
        { sentence: 'Would that work for you at home?', highlightWord: 'Would that work', translation: 'Bu sizga uyda mos keladimi?' },
      ],
      note: 'Advice in the lesson is language practice, not a substitute for clinical assessment.',
    },
    reading: {
      title: 'Read: environments matter',
      text: 'Healthy ageing is supported by more than personal effort. Safe, accessible homes and communities can help people continue activities they value. Shared decisions should consider the person’s preferences and local environment.',
      checkQuestion: 'What two areas should shared decisions consider?',
      checkAnswer: 'The person’s preferences and their physical or social environment.',
      checkExplanation: 'A realistic plan fits the person’s life, not only a general recommendation.',
    },
    listening: {
      script: 'The nurse says, “You could try a shorter walk with a neighbour. Would that work for you?” The patient replies that the route has poor lighting, so they agree to discuss a safer option with the team.',
      question: 'Why is the first plan changed?',
      answer: 'The patient explains that the route has poor lighting.',
      explanation: 'The environment changes what is realistic and safe.',
    },
    speaking: {
      roleA: 'You are the nurse. Offer one option and ask if it suits the patient.',
      roleB: 'You are the patient. Explain one practical barrier or preference.',
      outcome: 'Agree on a shared next step rather than a command.',
    },
    writing: {
      prompt: 'Write a short message that gives one option, asks about preference and invites a follow-up conversation.',
      languageSupport: 'You could..., Would that work for you?, Let us discuss...',
    },
    exit: {
      question: 'Why is “Would that work for you?” clinically useful language?',
      answer: 'It checks whether the plan fits the person’s preferences and situation.',
    },
    source: {
      label: 'WHO: Ageing and health',
      url: 'https://www.who.int/news-room/fact-sheets/detail/ageing-and-health',
    },
  },
  {
    topicNumber: 7,
    title: 'Healthy Ageing: Evaluating Health Claims',
    section: 'Section 2: Healthy Ageing & Mental Health',
    domain: 'Health literacy and evidence-informed self-care',
    objective: 'question unsupported treatment claims and guide a patient toward reliable health information.',
    clinicalFrame: 'A patient asks whether an online “miracle cure” can replace their prescribed care.',
    vocabulary: {
      word: 'evidence',
      phonetic: '/ˈevɪdəns/',
      partOfSpeech: 'noun',
      definition: 'information that supports or does not support a claim.',
      translation: 'dalil, isbot',
      exampleSentence: 'The nurse explained that strong claims need reliable evidence.',
    },
    grammar: {
      title: 'Evaluating claims politely',
      formula: [
        { label: 'Question', text: 'What is the source of...?', color: 'blue' },
        { label: 'Caution', text: 'We cannot assume that...', color: 'emerald' },
        { label: 'Redirect', text: 'Let us check this with...', color: 'amber' },
      ],
      explanation: 'Use neutral questions to avoid shaming a patient while checking a health claim.',
      examples: [
        { sentence: 'What is the source of this claim?', highlightWord: 'source', translation: 'Bu da’voning manbasi nima?' },
        { sentence: 'We cannot assume that online advice is safe for everyone.', highlightWord: 'cannot assume', translation: 'Onlayn maslahat hamma uchun xavfsiz deb taxmin qila olmaymiz.' },
      ],
      note: 'Do not promote unproven treatments. Encourage discussion with the appropriate clinical team.',
    },
    reading: {
      title: 'Read: self-care with professional support',
      text: 'Self-care can include healthy habits and informed choices, but people often need clear information and professional support. A dramatic claim is not enough evidence that a product is safe, effective or right for one individual.',
      checkQuestion: 'What is missing when a claim is only dramatic?',
      checkAnswer: 'Reliable evidence and individual clinical context.',
      checkExplanation: 'A person’s condition, medicines and risks matter.',
    },
    listening: {
      script: 'The patient shows a social-media video that promises to cure joint pain in three days. The nurse says, “I can see why that sounds hopeful. Let us check the source and discuss it with your clinician before you change anything.”',
      question: 'What does the nurse do instead of rejecting the patient?',
      answer: 'Acknowledges the hope, checks the source and suggests clinical discussion.',
      explanation: 'Respectful health literacy protects trust and safety.',
    },
    speaking: {
      roleA: 'You are the nurse. Ask two neutral questions about an online health claim.',
      roleB: 'You are the patient. Explain why the claim appealed to you.',
      outcome: 'Agree to verify the source before changing care.',
    },
    writing: {
      prompt: 'Write a 75-word reply to an online health claim. Be respectful, name one uncertainty and suggest a safe next step.',
      languageSupport: 'It is understandable that..., The source is unclear..., Please discuss...',
    },
    exit: {
      question: 'What is a safer alternative to saying “That is nonsense”?',
      answer: 'Ask about the source and invite a clinical discussion before changes are made.',
    },
    source: {
      label: 'WHO: Self-care for health and well-being',
      url: 'https://www.who.int/news-room/fact-sheets/detail/self-care-health-interventions',
    },
  },
  {
    topicNumber: 8,
    title: 'Schizophrenia: Person-Centred Communication',
    section: 'Section 2: Healthy Ageing & Mental Health',
    domain: 'Mental health and stigma-free language',
    objective: 'use respectful, person-centred language when discussing schizophrenia.',
    clinicalFrame: 'A patient is admitted for assessment and their family asks how to speak supportively.',
    vocabulary: {
      word: 'stigma',
      phonetic: '/ˈstɪɡmə/',
      partOfSpeech: 'noun',
      definition: 'negative attitudes or discrimination directed at a person or group.',
      translation: 'tamg‘alash, stigma',
      exampleSentence: 'Stigma can make it harder for people to seek care.',
    },
    grammar: {
      title: 'Person-first language',
      formula: [
        { label: 'Person', text: 'a person with...', color: 'blue' },
        { label: 'Experience', text: 'is experiencing...', color: 'emerald' },
        { label: 'Respect', text: 'How would you like us to...?', color: 'amber' },
      ],
      explanation: 'Put the person before the condition and describe observations without labels or blame.',
      examples: [
        { sentence: 'She is a person living with schizophrenia.', highlightWord: 'person living with', translation: 'U shizofreniya bilan yashayotgan inson.' },
        { sentence: 'How would you like us to explain the plan?', highlightWord: 'How would you like', translation: 'Rejani qanday tushuntirishimizni xohlaysiz?' },
      ],
      note: 'Avoid defining a person by a diagnosis or assuming risk from a label.',
    },
    reading: {
      title: 'Read: care and human rights',
      text: 'Schizophrenia can affect how a person perceives reality and can cause significant distress or disability. Stigma and discrimination are common. Effective care options exist, and respectful communication supports access to care and dignity.',
      checkQuestion: 'Why is respectful language important in this setting?',
      checkAnswer: 'It supports dignity, reduces stigma and can improve access to care.',
      checkExplanation: 'Language shapes whether people feel safe seeking help.',
    },
    listening: {
      script: 'The nurse says, “Mr Karim is experiencing distress today. Let us speak calmly, ask what support he prefers and share observations with the mental-health team.”',
      question: 'Which three approaches does the nurse name?',
      answer: 'Speak calmly, ask about preferred support and share observations with the team.',
      explanation: 'The handover focuses on behaviour and support rather than judgement.',
    },
    speaking: {
      roleA: 'You are the nurse. Introduce yourself and ask how the patient prefers to be addressed.',
      roleB: 'You are the patient or family member. Explain one communication preference.',
      outcome: 'Practise one calm, respectful clarification question.',
    },
    writing: {
      prompt: 'Rewrite a stigmatising sentence into a neutral observation and add a respectful next action.',
      languageSupport: 'The patient reports..., The patient appears..., We will ask...',
    },
    exit: {
      question: 'What should a clinical handover describe instead of a label?',
      answer: 'Relevant observations, the patient’s needs and the agreed support.',
    },
    source: {
      label: 'WHO: Schizophrenia',
      url: 'https://www.who.int/news-room/fact-sheets/detail/schizophrenia',
    },
  },
  {
    topicNumber: 9,
    title: 'Schizophrenia: Monitoring and Escalation',
    section: 'Section 2: Healthy Ageing & Mental Health',
    domain: 'Mental-health observations and team communication',
    objective: 'report observable changes clearly and know when to seek support from the responsible team.',
    clinicalFrame: 'During a ward shift, a patient becomes more withdrawn and stops eating.',
    vocabulary: {
      word: 'observe',
      phonetic: '/əbˈzɜːv/',
      partOfSpeech: 'verb',
      definition: 'to watch or notice carefully and record relevant facts.',
      translation: 'kuzatmoq',
      exampleSentence: 'The nurse observed a change in the patient’s appetite.',
    },
    grammar: {
      title: 'Objective observation language',
      formula: [
        { label: 'Fact', text: 'I observed...', color: 'blue' },
        { label: 'Time', text: 'since this morning...', color: 'emerald' },
        { label: 'Request', text: 'Could you review...?', color: 'amber' },
      ],
      explanation: 'Record what was observed, when it changed and what support is requested. Avoid guessing motives.',
      examples: [
        { sentence: 'I observed reduced food intake since this morning.', highlightWord: 'observed', translation: 'Bugun ertalabdan ovqat iste’moli kamayganini kuzatdim.' },
        { sentence: 'Could you review the patient today?', highlightWord: 'Could you review', translation: 'Bugun bemorni ko‘rib chiqishingiz mumkinmi?' },
      ],
      note: 'Follow local escalation and safeguarding procedures in real practice.',
    },
    reading: {
      title: 'Read: observations are not diagnoses',
      text: 'Mental-health care works best when people receive respectful, person-centred support. A nurse can contribute by recording observable changes, listening to the person and communicating timely concerns to the appropriate team.',
      checkQuestion: 'Which is more objective: “He is difficult” or “He has eaten very little since morning”?',
      checkAnswer: '“He has eaten very little since morning.”',
      checkExplanation: 'It reports an observable change that the team can assess.',
    },
    listening: {
      script: 'At 14:00, the patient declined lunch and stayed in the room. At 16:00, they said they felt unsafe. The nurse remains calm, stays within local policy and contacts the responsible clinician.',
      question: 'What makes this handover useful?',
      answer: 'It includes time, observable facts, the patient’s words and the escalation action.',
      explanation: 'Specific facts support safe team communication.',
    },
    speaking: {
      roleA: 'You are the nurse. Give a 30-second objective handover.',
      roleB: 'You are the clinician. Ask one clarifying question about time or behaviour.',
      outcome: 'End with a clearly stated next action.',
    },
    writing: {
      prompt: 'Write a four-line observation note with time, observed change, patient words and escalation request.',
      languageSupport: 'At..., I observed..., The patient said..., Please review...',
    },
    exit: {
      question: 'Why should a note include time?',
      answer: 'It helps the team understand change over time and respond appropriately.',
    },
    source: {
      label: 'WHO: Schizophrenia',
      url: 'https://www.who.int/news-room/fact-sheets/detail/schizophrenia',
    },
  },
  {
    topicNumber: 10,
    title: 'Formative Assessment: Clinical Communication Checkpoint',
    section: 'Section 2: Healthy Ageing & Mental Health',
    domain: 'Integrated assessment',
    assessmentType: 'formative',
    objective: 'demonstrate accurate, respectful language across assessment, pain, ageing and mental-health scenarios.',
    clinicalFrame: 'Students rotate through four short clinical communication stations.',
    vocabulary: {
      word: 'clarify',
      phonetic: '/ˈklærɪfaɪ/',
      partOfSpeech: 'verb',
      definition: 'to make information easier to understand by asking or explaining more clearly.',
      translation: 'aniqlashtirmoq',
      exampleSentence: 'The nurse asked a question to clarify the patient’s concern.',
    },
    grammar: {
      title: 'Clarification toolkit',
      formula: [
        { label: 'Check', text: 'Do you mean...?', color: 'blue' },
        { label: 'Confirm', text: 'Let me check that I understood.', color: 'emerald' },
        { label: 'Summarise', text: 'So the next step is...', color: 'amber' },
      ],
      explanation: 'Clarification protects accuracy in every clinical conversation.',
      examples: [
        { sentence: 'Let me check that I understood your concern.', highlightWord: 'Let me check', translation: 'Xavotiringizni to‘g‘ri tushunganimni tekshirib olay.' },
        { sentence: 'So the next step is to speak with the clinician.', highlightWord: 'next step', translation: 'Demak, keyingi qadam shifokor bilan gaplashish.' },
      ],
      note: 'Use the rubric to assess communication, not medical diagnosis.',
    },
    reading: {
      title: 'Read: assessment rubric',
      text: 'A strong clinical-language response is clear, respectful and specific. It describes an observation or concern, asks a relevant question and ends with an agreed next step. Accuracy matters more than dramatic vocabulary.',
      checkQuestion: 'What three qualities define a strong response?',
      checkAnswer: 'Clear, respectful and specific.',
      checkExplanation: 'These qualities can be observed and assessed in a short role-play.',
    },
    listening: {
      script: 'Station one: explain a pulse check. Station two: ask about pain impact. Station three: respond to an online health claim. Station four: report an objective mental-health observation.',
      question: 'What is the common skill across all four stations?',
      answer: 'Clear, respectful clinical communication with an appropriate next step.',
      explanation: 'The topic changes, but the communication structure stays useful.',
    },
    speaking: {
      roleA: 'You are the assessor. Give one scenario and ask one follow-up question.',
      roleB: 'You are the student. Respond using clarification and a safe next step.',
      outcome: 'Use the peer rubric: clear, respectful, specific.',
    },
    writing: {
      prompt: 'Choose one station and write a 70-word response that could be used as a model answer.',
      languageSupport: 'I understand..., Could you tell me..., The next step is...',
    },
    exit: {
      question: 'Which response is stronger: complex vocabulary or a clear safe next step?',
      answer: 'A clear safe next step, supported by respectful accurate language.',
    },
    source: {
      label: 'Integrated review of course evidence sources',
      url: 'https://www.who.int/news-room/fact-sheets/detail/schizophrenia | https://medlineplus.gov/ency/article/002341.htm',
    },
  },
  {
    topicNumber: 11,
    title: 'Schizophrenia Grammar: Reporting Observations',
    section: 'Section 2: Healthy Ageing & Mental Health',
    domain: 'Clinical documentation',
    objective: 'use present and past forms to report observations without judgement.',
    clinicalFrame: 'A nurse needs to distinguish what is happening now from what changed earlier in the shift.',
    vocabulary: {
      word: 'withdrawn',
      phonetic: '/wɪðˈdrɔːn/',
      partOfSpeech: 'adjective',
      definition: 'less willing to communicate or take part than usual.',
      translation: 'o‘zini chetga tortgan',
      exampleSentence: 'The patient appeared more withdrawn than earlier in the shift.',
    },
    grammar: {
      title: 'Present state and past change',
      formula: [
        { label: 'Now', text: 'The patient is...', color: 'blue' },
        { label: 'Earlier', text: 'Earlier, the patient...', color: 'emerald' },
        { label: 'Since', text: 'Since 10:00, ... has...', color: 'amber' },
      ],
      explanation: 'Use time markers to show what is current, what happened earlier and what has changed.',
      examples: [
        { sentence: 'The patient is quiet at present.', highlightWord: 'is', translation: 'Bemor hozir tinch.' },
        { sentence: 'Since 10:00, food intake has reduced.', highlightWord: 'has reduced', translation: 'Soat 10:00 dan beri ovqat iste’moli kamaygan.' },
      ],
      note: 'Record observations and direct words where possible; avoid unsupported conclusions.',
    },
    reading: {
      title: 'Read: precise time supports care',
      text: 'A short note becomes more useful when it says what was observed and when. “The patient is quiet” describes the present. “The patient became quieter after lunch” adds a change that the care team can explore.',
      checkQuestion: 'Which sentence contains both an observation and a time-linked change?',
      checkAnswer: '“The patient became quieter after lunch.”',
      checkExplanation: 'The phrase identifies a change and when it happened.',
    },
    listening: {
      script: 'At the start of the shift, Ms Saida was talking with staff. Since lunch, she has stayed in her room and has not joined the group activity. I will document this and ask the responsible nurse to review.',
      question: 'What changed after lunch?',
      answer: 'She stayed in her room and did not join the group activity.',
      explanation: 'The note compares earlier and later observations.',
    },
    speaking: {
      roleA: 'You are the nurse. Give one present observation and one time-linked change.',
      roleB: 'You are the colleague. Repeat the information back to confirm accuracy.',
      outcome: 'Use one sentence with “since” or “after”.',
    },
    writing: {
      prompt: 'Turn three vague notes into objective, time-linked observations.',
      languageSupport: 'At present..., Earlier..., Since..., The patient said...',
    },
    exit: {
      question: 'Why is “difficult patient” not a useful observation?',
      answer: 'It is a judgement, not a specific fact the team can assess.',
    },
    source: {
      label: 'WHO: Schizophrenia',
      url: 'https://www.who.int/news-room/fact-sheets/detail/schizophrenia',
    },
  },
  {
    topicNumber: 12,
    title: 'Death and Dying: Compassionate Conversations',
    section: 'Section 3: Patient Safety, Palliative Care & Hygiene',
    domain: 'Palliative communication',
    objective: 'use compassionate language when discussing serious illness and patient priorities.',
    clinicalFrame: 'A patient with a life-threatening illness wants to talk about comfort and family support.',
    vocabulary: {
      word: 'comfort',
      phonetic: '/ˈkʌmfət/',
      partOfSpeech: 'noun',
      definition: 'physical or emotional ease and relief from distress.',
      translation: 'qulaylik, taskin',
      exampleSentence: 'The team asked what would bring the patient more comfort.',
    },
    grammar: {
      title: 'Compassionate invitations',
      formula: [
        { label: 'Permission', text: 'Would you like to talk about...?', color: 'blue' },
        { label: 'Priority', text: 'What matters most to you?', color: 'emerald' },
        { label: 'Support', text: 'We are here to support...', color: 'amber' },
      ],
      explanation: 'Use calm invitations and allow the patient to decide how much they want to discuss.',
      examples: [
        { sentence: 'Would you like to talk about what matters most today?', highlightWord: 'Would you like', translation: 'Bugun siz uchun eng muhim narsa haqida gaplashishni xohlaysizmi?' },
        { sentence: 'We are here to support you and your family.', highlightWord: 'support', translation: 'Sizni va oilangizni qo‘llab-quvvatlash uchun shu yerdamiz.' },
      ],
      note: 'Follow local policy and the responsible team for any real end-of-life conversation.',
    },
    reading: {
      title: 'Read: palliative care is whole-person care',
      text: 'Palliative care aims to improve quality of life for people and families facing life-threatening illness. It addresses pain and other physical, psychosocial and spiritual concerns through a team approach.',
      checkQuestion: 'Which areas can palliative care address besides physical symptoms?',
      checkAnswer: 'Psychological, social and spiritual concerns.',
      checkExplanation: 'Whole-person care includes the patient and family, not symptoms alone.',
    },
    listening: {
      script: 'The patient says, “I am worried about my children.” The nurse replies, “Thank you for telling me. Would you like me to ask a member of the team to talk with you and your family?”',
      question: 'What does the nurse offer?',
      answer: 'To involve an appropriate team member in a conversation with the patient and family.',
      explanation: 'The nurse acknowledges concern and offers team support.',
    },
    speaking: {
      roleA: 'You are the nurse. Use one compassionate invitation and one support phrase.',
      roleB: 'You are the patient. Name one concern or priority.',
      outcome: 'End by agreeing who will be involved next.',
    },
    writing: {
      prompt: 'Write a respectful two-part note: patient priority and the support request shared with the team.',
      languageSupport: 'The patient shared..., They would like..., I will ask...',
    },
    exit: {
      question: 'What makes a question compassionate rather than intrusive?',
      answer: 'It asks permission and lets the patient choose how much to share.',
    },
    source: {
      label: 'WHO: Palliative care',
      url: 'https://www.who.int/en/news-room/fact-sheets/detail/palliative-care',
    },
  },
  {
    topicNumber: 13,
    title: 'Death and Dying: The Palliative Care Team',
    section: 'Section 3: Patient Safety, Palliative Care & Hygiene',
    domain: 'Interprofessional collaboration',
    objective: 'describe team roles and make a clear referral request in palliative care.',
    clinicalFrame: 'A family asks who can help with symptoms, practical needs and emotional support.',
    vocabulary: {
      word: 'caregiver',
      phonetic: '/ˈkeəɡɪvə(r)/',
      partOfSpeech: 'noun',
      definition: 'a person who provides regular care or support to someone who is ill or needs help.',
      translation: 'parvarishlovchi, qarovchi',
      exampleSentence: 'The caregiver also needs clear information and support.',
    },
    grammar: {
      title: 'Making a team referral',
      formula: [
        { label: 'Need', text: 'The patient needs support with...', color: 'blue' },
        { label: 'Request', text: 'Could we involve...?', color: 'emerald' },
        { label: 'Purpose', text: 'so that the family can...', color: 'amber' },
      ],
      explanation: 'State the need, name the appropriate support and explain the purpose.',
      examples: [
        { sentence: 'Could we involve the palliative-care team?', highlightWord: 'Could we involve', translation: 'Palliativ yordam jamoasini jalb qilsak bo‘ladimi?' },
        { sentence: 'The family needs support with practical questions.', highlightWord: 'needs support', translation: 'Oila amaliy savollarda yordamga muhtoj.' },
      ],
      note: 'Team roles vary by setting; use the local referral pathway.',
    },
    reading: {
      title: 'Read: care is collaborative',
      text: 'Palliative care can be delivered by physicians, nurses, support workers, pharmacists, physiotherapists and other contributors. Each role can support the patient and family in different but connected ways.',
      checkQuestion: 'Why is palliative care described as a team approach?',
      checkAnswer: 'Patients and families may have physical, emotional, social and practical needs at the same time.',
      checkExplanation: 'No one professional role covers every need alone.',
    },
    listening: {
      script: 'The nurse reports that the patient’s pain is affecting sleep and the daughter is exhausted. The team agrees to review symptom support and ask a social-support colleague to contact the family.',
      question: 'What two needs are shared in the handover?',
      answer: 'Pain affecting sleep and caregiver exhaustion.',
      explanation: 'The handover includes both patient and family needs.',
    },
    speaking: {
      roleA: 'You are the nurse. Make a concise referral request to a colleague.',
      roleB: 'You are the colleague. Ask which need is most urgent today.',
      outcome: 'Name one team role and the purpose of involving it.',
    },
    writing: {
      prompt: 'Write a 75-word team message that states a patient need, a caregiver need and an appropriate referral request.',
      languageSupport: 'The patient needs..., The caregiver reports..., Could we involve...',
    },
    exit: {
      question: 'Whose needs should a palliative-care handover consider?',
      answer: 'Both the patient’s and the family or caregiver’s needs.',
    },
    source: {
      label: 'WHO: Palliative care',
      url: 'https://www.who.int/en/news-room/fact-sheets/detail/palliative-care',
    },
  },
  {
    topicNumber: 14,
    title: 'Death and Dying Grammar: Sensitive Documentation',
    section: 'Section 3: Patient Safety, Palliative Care & Hygiene',
    domain: 'Respectful documentation',
    objective: 'write sensitive, factual notes about concerns, preferences and agreed support.',
    clinicalFrame: 'A nurse documents a patient’s wish to have a family member present during a team discussion.',
    vocabulary: {
      word: 'preference',
      phonetic: '/ˈprefrəns/',
      partOfSpeech: 'noun',
      definition: 'a choice a person expresses about what they would like.',
      translation: 'tanlov istagi',
      exampleSentence: 'The patient’s preference was recorded and shared with the team.',
    },
    grammar: {
      title: 'Reported wishes and agreements',
      formula: [
        { label: 'Wish', text: 'The patient would like...', color: 'blue' },
        { label: 'Agreement', text: 'It was agreed that...', color: 'emerald' },
        { label: 'Follow-up', text: 'The team will...', color: 'amber' },
      ],
      explanation: 'Use neutral wording to record a person’s expressed wishes and the team’s agreed follow-up.',
      examples: [
        { sentence: 'The patient would like a family member present.', highlightWord: 'would like', translation: 'Bemor oila a’zosi yonida bo‘lishini xohlaydi.' },
        { sentence: 'It was agreed that the team will review the request.', highlightWord: 'It was agreed', translation: 'Jamoa so‘rovni ko‘rib chiqishi kelishildi.' },
      ],
      note: 'Document facts, preferences and agreed actions. Do not infer wishes that were not expressed.',
    },
    reading: {
      title: 'Read: clear notes protect continuity',
      text: 'Sensitive care depends on continuity between people and shifts. A short note should distinguish the patient’s own words, the family’s concerns and the action agreed with the team.',
      checkQuestion: 'What three elements should a sensitive note distinguish?',
      checkAnswer: 'The patient’s words, family concerns and the agreed team action.',
      checkExplanation: 'Clear attribution prevents confusion and respects each voice.',
    },
    listening: {
      script: 'The patient said, “I want my sister to hear the plan.” The daughter asked about visiting arrangements. The nurse documented both statements and said the responsible team would discuss the requests.',
      question: 'What does the nurse document separately?',
      answer: 'The patient’s wish and the daughter’s question.',
      explanation: 'Separate attribution makes the record accurate and respectful.',
    },
    speaking: {
      roleA: 'You are the nurse. Summarise a patient wish using neutral language.',
      roleB: 'You are the colleague. Confirm the requested follow-up.',
      outcome: 'Practise one sentence with “It was agreed that...”.',
    },
    writing: {
      prompt: 'Write three factual sentences: a patient preference, a family concern and an agreed action.',
      languageSupport: 'The patient said..., The family asked..., It was agreed that...',
    },
    exit: {
      question: 'Why is attribution important in a sensitive note?',
      answer: 'It makes clear whose words or concern are being recorded.',
    },
    source: {
      label: 'WHO: Palliative care',
      url: 'https://www.who.int/en/news-room/fact-sheets/detail/palliative-care',
    },
  },
  {
    topicNumber: 15,
    title: 'Hand Hygiene: Preventing Healthcare-Associated Infection',
    section: 'Section 3: Patient Safety, Palliative Care & Hygiene',
    domain: 'Infection prevention and control',
    objective: 'explain why hand hygiene matters and use clear safety language.',
    clinicalFrame: 'Before wound care, a nurse explains a simple infection-prevention action to a patient.',
    vocabulary: {
      word: 'transmission',
      phonetic: '/trænzˈmɪʃn/',
      partOfSpeech: 'noun',
      definition: 'the spread of germs or disease from one person, place or object to another.',
      translation: 'yuqish, tarqalish',
      exampleSentence: 'Hand hygiene helps reduce the transmission of harmful germs.',
    },
    grammar: {
      title: 'Explaining prevention',
      formula: [
        { label: 'Action', text: 'We clean our hands before...', color: 'blue' },
        { label: 'Purpose', text: 'to reduce the risk of...', color: 'emerald' },
        { label: 'Invite', text: 'Please remind us if...', color: 'amber' },
      ],
      explanation: 'A clear action-and-purpose sentence helps patients understand infection prevention.',
      examples: [
        { sentence: 'We clean our hands before touching the wound.', highlightWord: 'before', translation: 'Yaraga tegishdan oldin qo‘llarimizni tozalaymiz.' },
        { sentence: 'This helps reduce the risk of infection.', highlightWord: 'reduce the risk', translation: 'Bu infeksiya xavfini kamaytirishga yordam beradi.' },
      ],
      note: 'Follow the local hand-hygiene procedure in clinical practice.',
    },
    reading: {
      title: 'Read: a core safety measure',
      text: 'WHO identifies hand hygiene as the most important measure to avoid transmission of harmful germs and prevent healthcare-associated infections. It is a routine action with a direct patient-safety purpose.',
      checkQuestion: 'What does hand hygiene help prevent?',
      checkAnswer: 'Transmission of harmful germs and healthcare-associated infections.',
      checkExplanation: 'The action is simple, but it supports a major safety outcome.',
    },
    listening: {
      script: 'Before the dressing change, the nurse says, “I will clean my hands now. This reduces the chance of moving germs to the wound. Please ask if you do not see me do it.”',
      question: 'What invitation does the nurse give the patient?',
      answer: 'To ask if they do not see the nurse clean their hands.',
      explanation: 'Patient involvement can support safer care.',
    },
    speaking: {
      roleA: 'You are the nurse. Explain one hand-hygiene action and its purpose.',
      roleB: 'You are the patient. Ask one respectful question about safety.',
      outcome: 'Use one phrase that invites patient participation.',
    },
    writing: {
      prompt: 'Write a 70-word patient-friendly explanation of why hand hygiene happens before a care task.',
      languageSupport: 'Before..., This helps..., Please tell us if...',
    },
    exit: {
      question: 'Why should a nurse explain hand hygiene aloud?',
      answer: 'It makes the safety action visible and invites patient understanding.',
    },
    source: {
      label: 'WHO: Hand Hygiene - Why, How & When?',
      url: 'https://www.who.int/publications/m/item/hand-hygiene-why-how-when',
    },
  },
  {
    topicNumber: 16,
    title: 'Hygiene Equipment: Instructions and Sequencing',
    section: 'Section 3: Patient Safety, Palliative Care & Hygiene',
    domain: 'Infection-prevention communication',
    objective: 'give and check clear sequential instructions for hygiene equipment.',
    clinicalFrame: 'A student explains how to prepare a care area using local infection-prevention procedures.',
    vocabulary: {
      word: 'disposable',
      phonetic: '/dɪˈspəʊzəbl/',
      partOfSpeech: 'adjective',
      definition: 'intended to be used once and then safely discarded.',
      translation: 'bir martalik',
      exampleSentence: 'Use the disposable item according to the local procedure.',
    },
    grammar: {
      title: 'Sequencing a safe task',
      formula: [
        { label: 'Start', text: 'First,...', color: 'blue' },
        { label: 'Continue', text: 'Next,...', color: 'emerald' },
        { label: 'Check', text: 'Finally, confirm that...', color: 'amber' },
      ],
      explanation: 'Sequencing words make instructions easier to follow and check.',
      examples: [
        { sentence: 'First, prepare the clean area.', highlightWord: 'First', translation: 'Avval toza joyni tayyorlang.' },
        { sentence: 'Finally, confirm that the equipment is ready.', highlightWord: 'Finally', translation: 'Oxirida jihozlar tayyorligini tasdiqlang.' },
      ],
      note: 'Specific equipment and disposal rules must follow the local infection-prevention protocol.',
    },
    reading: {
      title: 'Read: instructions need a purpose',
      text: 'Hygiene equipment supports infection prevention only when people understand the sequence and purpose. A useful instruction names the action, the safety reason and the point at which the person should ask for help.',
      checkQuestion: 'What three parts make an instruction useful?',
      checkAnswer: 'The action, the safety reason and when to ask for help.',
      checkExplanation: 'A sequence without a reason is easy to forget or misapply.',
    },
    listening: {
      script: 'First, we prepare the clean area. Next, we use the required equipment according to local procedure. Finally, we check that used items are handled through the correct local route and ask a supervisor if anything is unclear.',
      question: 'When should the student ask for help?',
      answer: 'When any equipment or disposal step is unclear.',
      explanation: 'The handover does not replace local protocol.',
    },
    speaking: {
      roleA: 'You are the student nurse. Give a three-step explanation without inventing local rules.',
      roleB: 'You are the supervisor. Ask why one step matters.',
      outcome: 'Use first, next and finally accurately.',
    },
    writing: {
      prompt: 'Write a three-step checklist for preparing a hygiene task. Include one safety reason and one escalation point.',
      languageSupport: 'First..., Next..., Finally..., If unsure...',
    },
    exit: {
      question: 'Why should a student avoid guessing an equipment rule?',
      answer: 'Local infection-prevention procedures determine the safe method.',
    },
    source: {
      label: 'WHO: Hand Hygiene - Why, How & When?',
      url: 'https://www.who.int/publications/m/item/hand-hygiene-why-how-when',
    },
  },
  {
    topicNumber: 17,
    title: 'Medications: History, Labels and Safety',
    section: 'Section 4: Medication Safety & Circulation',
    domain: 'Medication safety',
    objective: 'take a clear medication history and recognise why complete information matters.',
    clinicalFrame: 'A patient arrives with prescription medicines, supplements and an incomplete list.',
    vocabulary: {
      word: 'medication history',
      phonetic: '/ˌmedɪˈkeɪʃn ˈhɪstri/',
      partOfSpeech: 'noun phrase',
      definition: 'a record of medicines, supplements and relevant information a person uses or has used.',
      translation: 'dori vositalari tarixi',
      exampleSentence: 'A complete medication history supports safer care.',
    },
    grammar: {
      title: 'Asking about medicines',
      formula: [
        { label: 'Open', text: 'What medicines do you take...?', color: 'blue' },
        { label: 'Include', text: 'including vitamins or supplements?', color: 'emerald' },
        { label: 'Verify', text: 'May I check the label with you?', color: 'amber' },
      ],
      explanation: 'Ask broadly and include non-prescription products without judgement.',
      examples: [
        { sentence: 'What medicines do you take regularly?', highlightWord: 'What medicines', translation: 'Qaysi dorilarni muntazam qabul qilasiz?' },
        { sentence: 'May I check the label with you?', highlightWord: 'check the label', translation: 'Yorliqni siz bilan tekshirsam bo‘ladimi?' },
      ],
      note: 'Do not change, stop or advise on a medicine in this lesson. Refer medication decisions to authorised clinicians.',
    },
    reading: {
      title: 'Read: medication harm is often preventable',
      text: 'WHO’s Medication Without Harm work focuses on avoiding preventable medication-related harm. Clear information matters during high-risk situations, multiple medicines and transitions between care settings.',
      checkQuestion: 'Which three situations receive particular attention in the WHO work?',
      checkAnswer: 'High-risk situations, polypharmacy and transitions of care.',
      checkExplanation: 'A complete history helps the team identify and manage risk.',
    },
    listening: {
      script: 'The patient says, “I only take one tablet.” When the nurse asks about vitamins and herbal products, the patient adds two more items. The nurse records all products and asks the pharmacist or clinician to review the list.',
      question: 'Why does the list change after the second question?',
      answer: 'The nurse asks specifically about vitamins and herbal products.',
      explanation: 'Broad, non-judgemental questions improve the history.',
    },
    speaking: {
      roleA: 'You are the nurse. Take a brief medication history using two follow-up questions.',
      roleB: 'You are the patient. Mention one prescribed medicine and one supplement.',
      outcome: 'State who will review the completed list.',
    },
    writing: {
      prompt: 'Write a concise medication-history note that includes prescription medicines, supplements and a review request.',
      languageSupport: 'The patient reports..., They also use..., Please review...',
    },
    exit: {
      question: 'Why should a medication history include supplements?',
      answer: 'They can be relevant to safe medication use and need the team’s review.',
    },
    source: {
      label: 'WHO: Medication without harm - Policy brief',
      url: 'https://www.who.int/publications/i/item/9789240062764/',
    },
  },
  {
    topicNumber: 18,
    title: 'Medications: Patient Counselling and Questions',
    section: 'Section 4: Medication Safety & Circulation',
    domain: 'Patient engagement for medication safety',
    objective: 'support a patient to ask clear questions about medicines and follow-up.',
    clinicalFrame: 'Before discharge, a patient wants to understand a new prescription.',
    vocabulary: {
      word: 'side effect',
      phonetic: '/ˈsaɪd ɪˌfekt/',
      partOfSpeech: 'noun phrase',
      definition: 'an unwanted effect that may happen when a medicine is used.',
      translation: 'nojo‘ya ta’sir',
      exampleSentence: 'The patient asked which side effects should be reported.',
    },
    grammar: {
      title: 'Teach-back and safety questions',
      formula: [
        { label: 'Explain', text: 'Could you tell me in your own words...?', color: 'blue' },
        { label: 'Ask', text: 'What should I do if...?', color: 'emerald' },
        { label: 'Confirm', text: 'Who can I contact...?', color: 'amber' },
      ],
      explanation: 'Teach-back checks understanding without testing or blaming the patient.',
      examples: [
        { sentence: 'Could you tell me in your own words what the plan is?', highlightWord: 'in your own words', translation: 'Rejani o‘z so‘zlaringiz bilan ayta olasizmi?' },
        { sentence: 'Who can I contact if I am worried?', highlightWord: 'Who can I contact', translation: 'Xavotirda bo‘lsam kim bilan bog‘lanaman?' },
      ],
      note: 'Use the actual discharge instructions and local contact route in real care.',
    },
    reading: {
      title: 'Read: patients are part of medication safety',
      text: 'Medication safety improves when patients and caregivers are involved in their care. Questions at admission, transfer, discharge and home use can help identify misunderstandings before harm happens.',
      checkQuestion: 'At which points can medication-safety questions matter?',
      checkAnswer: 'At admission, transfer, discharge and during use at home.',
      checkExplanation: 'Safety depends on clear information across the whole care journey.',
    },
    listening: {
      script: 'The nurse says, “I have explained the discharge plan. Could you tell me what you will do if you miss a dose or feel worried?” The patient repeats the plan and asks for the contact number.',
      question: 'What technique does the nurse use?',
      answer: 'Teach-back: asking the patient to explain the plan in their own words.',
      explanation: 'Teach-back reveals what needs clearer explanation.',
    },
    speaking: {
      roleA: 'You are the nurse. Use teach-back after a fictional discharge explanation.',
      roleB: 'You are the patient. Ask two questions about follow-up and worries.',
      outcome: 'Agree on one safe contact point without inventing a local number.',
    },
    writing: {
      prompt: 'Write a patient question checklist for a new medicine: purpose, use, worries and contact point.',
      languageSupport: 'What is this for?, How should I..., What should I do if..., Who can I contact...?',
    },
    exit: {
      question: 'Why is teach-back better than “Do you understand?”',
      answer: 'It checks actual understanding without making the patient feel tested.',
    },
    source: {
      label: 'WHO: Medication Without Harm',
      url: 'https://www.who.int/initiatives/medication-without-harm',
    },
  },
  {
    topicNumber: 19,
    title: 'Blood Circulation: Reading an Observation Chart',
    section: 'Section 4: Medication Safety & Circulation',
    domain: 'Circulatory system and vital-sign communication',
    objective: 'use core circulation vocabulary to explain what a pulse observation represents.',
    clinicalFrame: 'A student links a pulse observation to the heart and blood vessels without diagnosing a condition.',
    vocabulary: {
      word: 'artery',
      phonetic: '/ˈɑːtəri/',
      partOfSpeech: 'noun',
      definition: 'a blood vessel that carries blood away from the heart.',
      translation: 'arteriya',
      exampleSentence: 'An artery carries blood away from the heart.',
    },
    grammar: {
      title: 'Cause and function',
      formula: [
        { label: 'Function', text: '... carries blood away from...', color: 'blue' },
        { label: 'Link', text: 'This means that...', color: 'emerald' },
        { label: 'Limit', text: 'This observation does not diagnose...', color: 'amber' },
      ],
      explanation: 'Use simple present to explain a body-system function and make the limit of an observation clear.',
      examples: [
        { sentence: 'Arteries carry blood away from the heart.', highlightWord: 'carry', translation: 'Arteriyalar qonni yurakdan olib ketadi.' },
        { sentence: 'This observation does not diagnose a condition by itself.', highlightWord: 'does not diagnose', translation: 'Bu kuzatuvning o‘zi kasallik tashxisini qo‘ymaydi.' },
      ],
      note: 'Interpret vital signs only within the responsible clinical team’s assessment process.',
    },
    reading: {
      title: 'Read: how circulation connects',
      text: 'The circulatory system links the heart to the body through blood vessels. Veins bring blood to the heart, and arteries take blood away. Heart valves help keep blood moving in the right direction.',
      checkQuestion: 'What is the basic difference between arteries and veins in the text?',
      checkAnswer: 'Arteries take blood away from the heart; veins bring blood to it.',
      checkExplanation: 'The direction is defined in relation to the heart.',
    },
    listening: {
      script: 'The student says, “The pulse is felt in an artery because the heart pumps blood through the circulatory system.” The nurse adds, “Record the observation accurately and share concerns through the local pathway.”',
      question: 'What is the student asked to do after recording the observation?',
      answer: 'Share concerns through the local pathway.',
      explanation: 'Physiology language must connect to safe communication.',
    },
    speaking: {
      roleA: 'You are the student nurse. Explain artery and vein in two clear sentences.',
      roleB: 'You are the patient. Ask what a pulse observation can and cannot tell you.',
      outcome: 'Use one sentence that states a limit of the observation.',
    },
    writing: {
      prompt: 'Write a short note that records a fictional pulse observation and states that it requires clinical context.',
      languageSupport: 'The pulse was..., This is one observation..., It should be reviewed with...',
    },
    exit: {
      question: 'Why should a student avoid diagnosing from one observation?',
      answer: 'A single observation needs clinical context and appropriate assessment.',
    },
    source: {
      label: 'NHLBI: How Blood Flows through the Heart',
      url: 'https://www.nhlbi.nih.gov/health/heart/blood-flow',
    },
  },
  {
    topicNumber: 20,
    title: 'Blood Circulation: Explaining Blood Flow',
    section: 'Section 4: Medication Safety & Circulation',
    domain: 'Cardiovascular communication',
    objective: 'explain the main path of oxygen-poor and oxygen-rich blood in clear sequence.',
    clinicalFrame: 'A student explains circulation to a patient using simple, accurate language.',
    vocabulary: {
      word: 'valve',
      phonetic: '/vælv/',
      partOfSpeech: 'noun',
      definition: 'a structure that helps keep blood flowing in one direction through the heart.',
      translation: 'klapan',
      exampleSentence: 'Heart valves help blood flow in the correct direction.',
    },
    grammar: {
      title: 'Sequencing a body process',
      formula: [
        { label: 'Start', text: 'Blood enters...', color: 'blue' },
        { label: 'Then', text: 'It is pumped to...', color: 'emerald' },
        { label: 'Result', text: 'After that, ... returns...', color: 'amber' },
      ],
      explanation: 'Sequence markers make a complex physiological process understandable.',
      examples: [
        { sentence: 'Blood enters the right side of the heart, then travels to the lungs.', highlightWord: 'then', translation: 'Qon yurakning o‘ng tomoniga kiradi, so‘ng o‘pkaga boradi.' },
        { sentence: 'After that, oxygen-rich blood returns to the left side of the heart.', highlightWord: 'After that', translation: 'Shundan keyin kislorodga boy qon yurakning chap tomoniga qaytadi.' },
      ],
      note: 'Use a diagram or local teaching model for anatomy; this slide practises explanation language.',
    },
    reading: {
      title: 'Read: a simplified circulation route',
      text: 'Oxygen-poor blood returns from the body to the right side of the heart and is pumped to the lungs. After the lungs add oxygen, oxygen-rich blood returns to the left side of the heart and is pumped to the body through the aorta.',
      checkQuestion: 'Where does blood receive oxygen in this simplified route?',
      checkAnswer: 'In the lungs.',
      checkExplanation: 'The lungs add oxygen before blood returns to the left side of the heart.',
    },
    listening: {
      script: 'First, oxygen-poor blood returns to the right side of the heart. Then it goes to the lungs. After oxygen is added, blood returns to the left side and is pumped to the body. The valves help keep this flow moving in the right direction.',
      question: 'What is the role of the valves in the script?',
      answer: 'They help keep blood flowing in the right direction.',
      explanation: 'The script links sequence with the valve’s function.',
    },
    speaking: {
      roleA: 'You are the student nurse. Explain the four-step blood-flow route.',
      roleB: 'You are the patient. Stop the explanation once and ask for clarification.',
      outcome: 'Use first, then and after that in order.',
    },
    writing: {
      prompt: 'Write four linked sentences that explain the blood-flow route in plain English.',
      languageSupport: 'First..., Then..., After that..., Finally...',
    },
    exit: {
      question: 'Why are sequence words useful in a physiology explanation?',
      answer: 'They make the order of a complex process easier to follow.',
    },
    source: {
      label: 'NHLBI: How Blood Flows through the Heart',
      url: 'https://www.nhlbi.nih.gov/health/heart/blood-flow',
    },
  },
  {
    topicNumber: 21,
    title: 'Summative Assessment: Second-Course Clinical English',
    section: 'Section 4: Medication Safety & Circulation',
    domain: 'Integrated clinical communication',
    assessmentType: 'summative',
    objective: 'demonstrate integrated reading, listening, speaking and writing through evidence-led clinical scenarios.',
    clinicalFrame: 'Students complete a short assessment using patient-safety, communication and physiology tasks.',
    vocabulary: {
      word: 'summarise',
      phonetic: '/ˈsʌməraɪz/',
      partOfSpeech: 'verb',
      definition: 'to give the main points of information in a short, clear form.',
      translation: 'xulosa qilmoq',
      exampleSentence: 'The student summarised the concern and the next safe action.',
    },
    grammar: {
      title: 'Integrated response structure',
      formula: [
        { label: 'Fact', text: 'The patient reports...', color: 'blue' },
        { label: 'Meaning', text: 'This may need...', color: 'emerald' },
        { label: 'Action', text: 'The next step is...', color: 'amber' },
      ],
      explanation: 'A strong assessment response separates fact, meaning and the appropriate next action.',
      examples: [
        { sentence: 'The patient reports a new fever after travel.', highlightWord: 'reports', translation: 'Bemor sayohatdan keyin yangi isitma borligini aytadi.' },
        { sentence: 'The next step is to share the concern with the responsible clinician.', highlightWord: 'next step', translation: 'Keyingi qadam - xavotirni mas’ul klinitsist bilan baham ko‘rish.' },
      ],
      note: 'Assess communication quality and source use. Do not assess students on independent diagnosis.',
    },
    reading: {
      title: 'Read: assessment instructions',
      text: 'Read the scenario, identify the key safety concern, choose respectful language and state the appropriate next step. Use course source slides to justify your answer. Clear reasoning earns more credit than a long answer.',
      checkQuestion: 'What is assessed more than a long answer?',
      checkAnswer: 'Clear reasoning, respectful language and an appropriate next step.',
      checkExplanation: 'The assessment measures usable clinical English, not invented complexity.',
    },
    listening: {
      script: 'Your listening task contains a short handover. Write the main concern, one observed fact and one next action. Your speaking task asks you to clarify information. Your writing task asks for a concise, respectful note.',
      question: 'Which three elements should students capture from the listening task?',
      answer: 'The main concern, one observed fact and one next action.',
      explanation: 'The same structure supports safe communication across skills.',
    },
    speaking: {
      roleA: 'You are the student nurse. Respond to an assessment scenario using fact, meaning and action.',
      roleB: 'You are the assessor. Ask one question that tests clarification.',
      outcome: 'Use a source-based reason for your chosen next step.',
    },
    writing: {
      prompt: 'Write an 80-word integrated answer: key concern, source-informed reason, respectful language and next action.',
      languageSupport: 'The patient reports..., According to the course source..., The next step is...',
    },
    exit: {
      question: 'What is the purpose of the final assessment?',
      answer: 'To show safe, respectful, evidence-led clinical communication across all four skills.',
    },
    source: {
      label: 'Integrated course sources: WHO, CDC, NIH and MedlinePlus',
      url: 'https://www.who.int/ | https://www.cdc.gov/typhoid-fever/ | https://www.nhlbi.nih.gov/health/heart/blood-flow | https://medlineplus.gov/ency/article/002341.htm',
    },
  },
];

export const COURSE_2_LESSONS: Lesson[] = COURSE_2_BLUEPRINTS.map((lesson) => ({
  id: 'med_sem3_' + String(lesson.topicNumber).padStart(2, '0'),
  title: 'Mavzu ' + lesson.topicNumber + ': ' + lesson.title,
  category: 'Medical English',
  level: 'Upper-Intermediate',
  type: 'interactive-slides',
  semester: 'Semester 3',
  unit: facultyForTopic(lesson.topicNumber),
  topicNumber: lesson.topicNumber,
  cefrLevel: 'B2',
  clinicalDomain: lesson.domain,
  assessmentType: lesson.assessmentType || 'none',
  curriculumRevision: COURSE_2_CURRICULUM_REVISION,
  createdAt: COURSE_DATE + lesson.topicNumber,
  updatedAt: COURSE_DATE + lesson.topicNumber,
  slides: course2Slides(lesson),
}));
