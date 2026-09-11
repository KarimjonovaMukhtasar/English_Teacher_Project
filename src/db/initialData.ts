import { Lesson, StudentGroup } from '@/types';
import { deleteLesson, getLessonById, getLessons, getSettings, getStudentGroups, saveLesson, saveStudentGroup } from './dexie';
import { MEDICAL_LESSONS, MEDICAL_STUDENT_GROUPS } from './medicalCurriculum';
import { refreshSuppliedLessonVisuals } from './facultyCurriculum';

export const INITIAL_STUDENT_GROUPS: StudentGroup[] = [
  ...MEDICAL_STUDENT_GROUPS,
  {
    id: 'grp_ielts_morning_0900',
    name: 'IELTS Morning 09:00',
    students: [
      'Alisher Usmonov',
      'Dilnoza Karimova',
      'Bekzod Toshmatov',
      'Madina Rahimova',
      'Javohir Sayidov',
      'Shahlo Mirzayeva',
      'Sardor Nurmatov',
      'Kamola Rustamova',
      'Otabek Yoqubov',
      'Zarina Xolmirzayeva',
      'Bobur Azimov',
      'Nodira Qodirova',
    ],
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'grp_general_english_elem_1400',
    name: 'General English Elementary 14:00',
    students: [
      'Azizbek Ergashev',
      'Gulchehra Shokirova',
      'Farhod Temirov',
      'Laylo Vohidova',
      'Diyorbek Mahmudov',
      'Nilufar Ismoilova',
      'Jasurbek Qosimov',
      'Fotima Nazarova',
      'Zuhra Nazarova',
      'Sherzod Xoliqov',
    ],
    createdAt: Date.now() - 86400000 * 3,
  },
];

const GENERAL_INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lesson_present_simple_mastery',
    title: 'Present Simple Mastery',
    category: 'Grammar',
    level: 'Elementary',
    type: 'interactive-slides',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    slides: [
      {
        id: 'slide_ps_grammar_formula',
        title: 'Present Simple Formula',
        template: 'grammar-box',
        order: 0,
        speakerNotes: 'Point out the distinction between 3rd person singular (he/she/it) and plural subjects. Emphasize that verbs ending in -ch, -sh, -ss, -x, -o take -es.',
        content: {
          type: 'grammar-box',
          data: {
            ruleTitle: 'Present Simple: Subject + Verb(s/es) Formula',
            formula: [
              { label: 'Singular (He / She / It)', text: 'Subject + Verb + -s / -es + Object', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
              { label: 'Plural & I / You / We / They', text: 'Subject + Base Verb (V1) + Object', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              { label: 'Negative Form', text: 'Subject + do / does NOT + Base Verb', color: 'bg-rose-50 border-rose-200 text-rose-700' },
            ],
            explanation: 'We use the Present Simple for everyday habits, repeated routines, general facts, and permanent situations.',
            examples: [
              {
                sentence: 'She plays tennis every Saturday morning.',
                highlightWord: 'plays',
                translation: 'U har shanba kuni ertalab tennis o‘ynaydi.',
              },
              {
                sentence: 'He watches educational documentaries on weekends.',
                highlightWord: 'watches',
                translation: 'U dam olish kunlari ilmiy hujjatli filmlarni tomosha qiladi.',
              },
              {
                sentence: 'The sun rises in the east every morning.',
                highlightWord: 'rises',
                translation: 'Quyosh har kuni ertalab sharqdan chiqadi.',
              },
            ],
            note: 'Spelling rule: Add -es when the verb ends in -ch (watches), -sh (washes), -ss (passes), -x (fixes), or -o (goes).',
          },
        },
      },
      {
        id: 'slide_ps_vocab_always',
        title: 'Vocabulary: Always',
        template: 'vocabulary-card',
        order: 1,
        speakerNotes: 'Practice natural pronunciation: stress on the first syllable /ˈɔːl.weɪz/. Ask students what they always do in the morning.',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Always',
            phonetic: '/ˈɔːl.weɪz/',
            partOfSpeech: 'Adverb of Frequency (100%)',
            definition: 'At all times; on every occasion without exception.',
            translation: 'Doimo, har doim',
            exampleSentence: 'She always organizes her study desk before starting her homework.',
            imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'slide_ps_vocab_usually',
        title: 'Vocabulary: Usually',
        template: 'vocabulary-card',
        order: 2,
        speakerNotes: 'Pronunciation note: 3 syllables /ˈjuː.ʒu.ə.li/ with soft /ʒ/. Contrast 100% (always) with 80% (usually).',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Usually',
            phonetic: '/ˈjuː.ʒu.ə.li/',
            partOfSpeech: 'Adverb of Frequency (~80%)',
            definition: 'Under normal conditions; generally or typically.',
            translation: 'Odatda, ko‘pincha',
            exampleSentence: 'He usually takes the subway to work to avoid the morning traffic jams.',
            imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'slide_ps_vocab_rarely',
        title: 'Vocabulary: Rarely',
        template: 'vocabulary-card',
        order: 3,
        speakerNotes: 'Explain that "rarely" means almost never (~10%). It usually comes before the main verb.',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Rarely',
            phonetic: '/ˈreə.li/',
            partOfSpeech: 'Adverb of Frequency (~10%)',
            definition: 'Not often; seldom or infrequently.',
            translation: 'Kamdan-kam, kam hollarda',
            exampleSentence: 'They rarely eat fast food because they prefer nutritious home-cooked meals.',
            imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'slide_ps_exercise_1',
        title: 'Click to Reveal: Third-Person Singular',
        template: 'click-to-reveal',
        order: 4,
        speakerNotes: 'Give students 10 seconds to think or write down their answer before revealing.',
        content: {
          type: 'click-to-reveal',
          data: {
            question: 'Complete the sentence: "My brother ________ (watch) documentary movies every Sunday evening."',
            hint: 'Pay attention to the subject: "My brother" is 3rd person singular (he), and the verb ends in "-ch".',
            hiddenAnswer: 'watches',
            explanation: 'Correct answer: WATCHES. Because the subject is singular (he) and "watch" ends in "-ch", we append "-es".',
            badge: 'Grammar Quiz',
          },
        },
      },
      {
        id: 'slide_ps_exercise_2',
        title: 'Click to Reveal: Spot the Mistake',
        template: 'click-to-reveal',
        order: 5,
        speakerNotes: 'Encourage students to identify both the incorrect auxiliary and correct verb form.',
        content: {
          type: 'click-to-reveal',
          data: {
            question: 'Identify and fix the error: "Sarah don\'t like waking up early on cold winter mornings."',
            hint: 'Which auxiliary verb corresponds to third-person singular (she) in the negative?',
            hiddenAnswer: 'Sarah doesn\'t like (or does not like)',
            explanation: 'Correction: "Sarah doesn\'t like...". For he/she/it, we must use "doesn\'t", followed by the base verb "like" (without -s).',
            badge: 'Error Correction',
          },
        },
      },
    ],
  },
  {
    id: 'lesson_ielts_speaking_hometown',
    title: 'IELTS Speaking Part 1: Hometown',
    category: 'Speaking',
    level: 'Intermediate',
    type: 'interactive-slides',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    slides: [
      {
        id: 'slide_ielts_two_column_comparison',
        title: 'Band 5 vs Band 8 Comparison',
        template: 'two-column',
        order: 0,
        speakerNotes: 'Compare the repetitive vocabulary of the Band 5 answer with the natural idiomatic expressions and complex sentence structure of Band 8.',
        content: {
          type: 'two-column',
          data: {
            leftTitle: 'Band 5.0: Basic & Repetitive',
            leftBadge: 'Basic Answer',
            leftPoints: [
              'Question: "Where are you from?"',
              'Candidate: "I come from Samarkand. It is very big city. I like it because it is nice and has many old buildings."',
              'Short, repetitive sentences with elementary adjectives (nice, big, old).',
              'Relies solely on "because" without varied cohesion.',
              'Limited grammatical flexibility and flat delivery.',
            ],
            rightTitle: 'Band 8.0: Idiomatic & Natural',
            rightBadge: 'Idiomatic Band 8',
            rightPoints: [
              'Question: "Where are you from?"',
              'Candidate: "I was born and raised in Samarkand, which is a picturesque historical jewel renowned for its bustling trade routes and magnificent monuments."',
              'Sophisticated idiomatic collocations: "born and raised", "picturesque jewel", "bustling trade routes".',
              'Fluid non-defining relative clause ("which is...") demonstrating advanced grammatical range.',
              'Natural rhythm, precise descriptors, and native-like lexical resource.',
            ],
          },
        },
      },
      {
        id: 'slide_ielts_vocab_bustling',
        title: 'Advanced Adjective: Bustling',
        template: 'vocabulary-card',
        order: 1,
        speakerNotes: 'Highlight the silent "t": /ˈbʌs.lɪŋ/. Useful for IELTS Speaking Part 1 & Part 2 to describe cities and markets.',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Bustling',
            phonetic: '/ˈbʌs.lɪŋ/',
            partOfSpeech: 'Adjective (Sifat)',
            definition: 'Full of lively activity, energetic crowds, and vibrant movement.',
            translation: 'Gavjum, qizg‘in, hayot qaynagan',
            exampleSentence: 'The city center is bustling with shoppers, street performers, and energetic outdoor cafes.',
            imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'slide_ielts_vocab_picturesque',
        title: 'Advanced Adjective: Picturesque',
        template: 'vocabulary-card',
        order: 2,
        speakerNotes: 'Pronunciation: /ˌpɪk.tʃərˈesk/ with the stress on the final syllable "-esque". Ask students to describe a picturesque spot in their country.',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Picturesque',
            phonetic: '/ˌpɪk.tʃərˈesk/',
            partOfSpeech: 'Adjective (Sifat)',
            definition: 'Visually attractive and quaint, charming in a way that resembles a beautiful painting.',
            translation: 'Xushmanzara, rasmdek maftunkor, go‘zal',
            exampleSentence: 'The old quarter of the city features picturesque cobblestone streets lined with ancient sycamore trees.',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'slide_ielts_challenge',
        title: 'Speaking Challenge: Describe Your Hometown',
        template: 'click-to-reveal',
        order: 3,
        speakerNotes: 'Pick a student using the random picker or let volunteers answer in 30 seconds incorporating both target adjectives.',
        content: {
          type: 'click-to-reveal',
          data: {
            question: 'Task: Use both "bustling" and "picturesque" in a single cohesive response about your hometown.',
            hint: 'Try contrasting the lively commercial area with quiet historic or natural corners.',
            hiddenAnswer: 'Model Band 8 Answer: "What I genuinely appreciate about my hometown is the striking contrast between its bustling commercial bazaar and the picturesque, serene alleyways surrounding the ancient monuments."',
            explanation: 'Contrasting two distinct atmospheres with high-level vocabulary demonstrates Band 8+ Lexical Resource and Fluency & Coherence.',
            badge: 'Band 8 Model',
          },
        },
      },
    ],
  },
  {
    id: 'lesson_irregular_verbs_in_context',
    title: 'Essential Irregular Verbs in Context',
    category: 'Grammar',
    level: 'Pre-Intermediate',
    type: 'interactive-slides',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    slides: [
      {
        id: 'slide_irreg_comparison',
        title: 'Regular vs Irregular Verbs in Context',
        template: 'two-column',
        order: 0,
        speakerNotes: 'Explain that regular verbs simply take -ed, while irregular verbs shift their internal vowels and must be learned in meaningful contexts.',
        content: {
          type: 'two-column',
          data: {
            leftTitle: 'Regular Verbs (+ed)',
            leftBadge: 'Rule-Based',
            leftPoints: [
              'Follow a predictable formula: Base form + -ed / -d.',
              'play -> played -> played',
              'watch -> watched -> watched',
              'visit -> visited -> visited',
              'Consistent across all persons in past simple.',
            ],
            rightTitle: 'Irregular Verbs (Stem Changes)',
            rightBadge: 'Context Mastery',
            rightPoints: [
              'Undergo internal vowel changes or complete alterations.',
              'catch -> caught -> caught',
              'choose -> chose -> chosen',
              'freeze -> froze -> frozen',
              'Must be mastered through real-world example sentences.',
            ],
          },
        },
      },
      {
        id: 'slide_irreg_catch',
        title: 'Interactive Card: Catch — Caught — Caught',
        template: 'vocabulary-card',
        order: 1,
        speakerNotes: 'Pronunciation: /kɔːt/ rhymes with "bought" and "taught". Meaning: to capture or to be on time for transport.',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Catch — Caught — Caught',
            phonetic: '/kætʃ/ — /kɔːt/ — /kɔːt/',
            partOfSpeech: 'Irregular Verb (V1 - V2 - V3)',
            definition: 'To intercept and hold something moving; to be on time to board a vehicle.',
            translation: 'Ushlamoq, ilintirmoq; transportga ulgurmoq',
            exampleSentence: 'He ran quickly to the platform and caught the 8:15 express train just in time.',
            imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'slide_irreg_choose',
        title: 'Interactive Card: Choose — Chose — Chosen',
        template: 'vocabulary-card',
        order: 2,
        speakerNotes: 'Highlight vowel change: long /uː/ in present (choose) vs /əʊ/ in past (chose) vs /ˈtʃəʊ.zən/ (chosen).',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Choose — Chose — Chosen',
            phonetic: '/tʃuːz/ — /tʃəʊz/ — /ˈtʃəʊ.zən/',
            partOfSpeech: 'Irregular Verb (V1 - V2 - V3)',
            definition: 'To pick out or decide on someone or something from two or more alternatives.',
            translation: 'Tanlamoq, saylamoq',
            exampleSentence: 'After exploring several prestigious academies, she chose the intensive English immersion course.',
            imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'slide_irreg_freeze',
        title: 'Interactive Card: Freeze — Froze — Frozen',
        template: 'vocabulary-card',
        order: 3,
        speakerNotes: 'Practice both literal meaning (turning to ice) and figurative meaning (becoming motionless with surprise).',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Freeze — Froze — Frozen',
            phonetic: '/friːz/ — /frəʊz/ — /ˈfrəʊ.zən/',
            partOfSpeech: 'Irregular Verb (V1 - V2 - V3)',
            definition: 'To turn into ice through extreme cold; to become completely still or paralyzed with surprise.',
            translation: 'Muzlamoq, muzlatmoq; qotib qolmoq',
            exampleSentence: 'The surface of the mountain lake froze solid during the sub-zero winter nights.',
            imageUrl: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=600&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'slide_irreg_practice_1',
        title: 'Practice Sentence: Catch in Past Simple',
        template: 'click-to-reveal',
        order: 4,
        speakerNotes: 'Ask students to conjugate "catch" in past simple without saying "catched".',
        content: {
          type: 'click-to-reveal',
          data: {
            question: 'Fill in the blank with the correct past form: "In the final seconds of the football match, the goalkeeper ________ (catch) the ball brilliantly."',
            hint: 'The past form of "catch" is irregular and rhymes with "taught".',
            hiddenAnswer: 'caught',
            explanation: 'Correct answer: CAUGHT. Catch is an irregular verb (catch -> caught -> caught). "Catched" is incorrect.',
            badge: 'Past Simple Drill',
          },
        },
      },
      {
        id: 'slide_irreg_practice_2',
        title: 'Practice Sentence: Choose in Past Simple',
        template: 'click-to-reveal',
        order: 5,
        speakerNotes: 'Remind students of the spelling difference: "choose" has double "oo", "chose" has a single "o".',
        content: {
          type: 'click-to-reveal',
          data: {
            question: 'Fill in the blank with the correct past form: "When given the opportunity to study abroad, Aziz ________ (choose) an engineering university in Germany."',
            hint: 'Remember the spelling with a single "o".',
            hiddenAnswer: 'chose',
            explanation: 'Correct answer: CHOSE. The past simple form is spelled "chose" (pronounced /tʃəʊz/).',
            badge: 'Past Simple Drill',
          },
        },
      },
      {
        id: 'slide_irreg_practice_3',
        title: 'Practice Sentence: Freeze in Past Simple',
        template: 'click-to-reveal',
        order: 6,
        speakerNotes: 'Encourage students to produce a full spoken sentence with proper past pronunciation.',
        content: {
          type: 'click-to-reveal',
          data: {
            question: 'Fill in the blank with the correct past form: "During the harsh snowstorm last January, the water pipes in the cottage ________ (freeze) completely."',
            hint: 'The internal vowel changes from "ee" to "o".',
            hiddenAnswer: 'froze',
            explanation: 'Correct answer: FROZE. Freeze -> Froze -> Frozen. In the past simple, the correct form is "froze".',
            badge: 'Past Simple Drill',
          },
        },
      },
    ],
  },
];

export const INITIAL_LESSONS: Lesson[] = [
  ...MEDICAL_LESSONS,
  ...GENERAL_INITIAL_LESSONS,
];

const LEGACY_MEDICAL_CURRICULUM_ID = /^med_sem[12]_\d+/;
const LEGACY_COURSE_2_ID = /^med_sem3_\d+/;
const MINIMUM_COURSE_2_SLIDE_COUNT = 20;
const LEGACY_COURSE_2_ROUTE = 'Route: warm-up → vocabulary → grammar → read → listen → speak → write → feedback.';

const isUneditedLegacyCourse2Plan = (lesson: Lesson) => {
  const planSlide = lesson.slides?.find((slide) => slide.order === 0);
  return (
    planSlide?.content.type === 'blank' &&
    planSlide.content.data.paragraphs?.[1] === LEGACY_COURSE_2_ROUTE
  );
};

export async function installCourse2Curriculum(): Promise<void> {
  const existingLessons = await getLessons();
  await Promise.all(
    existingLessons
      .filter((lesson) =>
        LEGACY_MEDICAL_CURRICULUM_ID.test(lesson.id) ||
        (LEGACY_COURSE_2_ID.test(lesson.id) &&
          (lesson.curriculumRevision?.startsWith('2026-09-10-ktp') || isUneditedLegacyCourse2Plan(lesson))),
      )
      .map((lesson) => deleteLesson(lesson.id)),
  );

  for (const lesson of MEDICAL_LESSONS) {
    const existing = await getLessonById(lesson.id);
    if (!existing || (existing.slides?.length || 0) < MINIMUM_COURSE_2_SLIDE_COUNT) {
      await saveLesson(lesson);
    } else if (existing.curriculumRevision !== lesson.curriculumRevision) {
      if (isUneditedLegacyCourse2Plan(existing)) {
        const slides = existing.slides?.map((slide) =>
          slide.order === 0 ? lesson.slides?.find((candidate) => candidate.order === 0) || slide : slide,
        );
        await saveLesson({
          ...existing,
          slides,
          unit: lesson.unit,
          curriculumRevision: lesson.curriculumRevision,
        });
      } else {
        // Refresh only generated illustration fields and structural metadata.
        // Teacher-authored wording, answers and slide edits stay untouched.
        await saveLesson(refreshSuppliedLessonVisuals(existing, lesson));
      }
    } else if (existing.unit !== lesson.unit) {
      // Keep a teacher's edited slides, but migrate the course navigation to its faculty.
      await saveLesson({ ...existing, unit: lesson.unit });
    }
  }
}

export async function autoSeedDatabase(): Promise<void> {
  await installCourse2Curriculum();

  // Preserve the general-English starter lessons while the medical curriculum is refreshed above.
  for (const lesson of GENERAL_INITIAL_LESSONS) {
    const existing = await getLessonById(lesson.id);
    if (!existing) {
      await saveLesson(lesson);
    }
  }

  // Upsert all student groups if they do not already exist
  for (const group of INITIAL_STUDENT_GROUPS) {
    const existing = (await getStudentGroups()).find((savedGroup) => savedGroup.id === group.id);
    if (!existing) {
      await saveStudentGroup(group);
    }
  }

  // Ensure default teacher settings are set
  await getSettings();
}
