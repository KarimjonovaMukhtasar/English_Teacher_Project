import {
  Lesson,
  SlideItem,
  GrammarRuleContent,
  VocabularyContent,
  ClickToRevealContent,
  TwoColumnContent,
  BlankContent,
} from '@/types';

export interface SlideGeneratorOptions {
  topic: string;
  level: Lesson['level'];
  category: string;
  slideCount?: number;
  focus?: 'comprehensive' | 'grammar' | 'vocabulary' | 'quiz' | 'speaking';
  customNotes?: string;
}

export interface QuickPresetTopic {
  id: string;
  title: string;
  category: string;
  level: Lesson['level'];
  description: string;
  icon: string;
  badge: string;
}

export const POPULAR_PRESET_TOPICS: QuickPresetTopic[] = [
  {
    id: 'present_simple_vs_cont',
    title: 'Present Simple vs Present Continuous',
    category: 'Grammar',
    level: 'Elementary',
    description: 'Kundalik odatlar va ayni damda sodir bo‘layotgan harakatlar farqi',
    icon: '⚡',
    badge: 'Ommabop',
  },
  {
    id: 'past_simple_irreg',
    title: 'Past Simple: Essential Irregular Verbs',
    category: 'Grammar',
    level: 'Pre-Intermediate',
    description: 'Eng ko‘p ishlatiladigan noto‘g‘ri fe’llar va ularning kontekstdagi talaffuzi',
    icon: '⏳',
    badge: 'Asosiy',
  },
  {
    id: 'present_perfect_past_simple',
    title: 'Present Perfect vs Past Simple',
    category: 'Grammar',
    level: 'Intermediate',
    description: 'Natija va o‘tgan aniq vaqt o‘rtasidagi eng muhim grammatik farq',
    icon: '🎯',
    badge: 'Muhim',
  },
  {
    id: 'conditionals_1_2',
    title: 'First & Second Conditionals (Real vs Unreal)',
    category: 'Grammar',
    level: 'Intermediate',
    description: 'Shart mayllari: real kelajak va hayoliy orzular formulasi',
    icon: '🔀',
    badge: 'B2 Level',
  },
  {
    id: 'passive_voice',
    title: 'Passive Voice in Academic English',
    category: 'Grammar',
    level: 'Upper-Intermediate',
    description: 'Majhul nisbat: ilmiy va rasmiy matnlarda ob’ektni urg‘ulash',
    icon: '🏛️',
    badge: 'Academic',
  },
  {
    id: 'ielts_band8_speaking',
    title: 'IELTS Speaking: Band 5 vs Band 8 Collocations',
    category: 'IELTS',
    level: 'Upper-Intermediate',
    description: 'Oddiy so‘zlarni tabiiy idiomalar va ravon birikmalarga aylantirish',
    icon: '⭐',
    badge: 'IELTS 7.5+',
  },
  {
    id: 'ielts_linking_words',
    title: 'IELTS Writing: Advanced Linking Devices & Cohesion',
    category: 'IELTS',
    level: 'Upper-Intermediate',
    description: 'Furthermore, Moreover, In sharp contrast kabi bog‘lovchilar',
    icon: '✍️',
    badge: 'Writing T2',
  },
  {
    id: 'daily_phrasal_verbs',
    title: 'High-Frequency Phrasal Verbs in Daily Life',
    category: 'Vocabulary',
    level: 'Intermediate',
    description: 'Kundalik so‘zlashuvda eng zarur 5 ta frazali fe’l va ularning ma’nosi',
    icon: '💬',
    badge: 'Speaking',
  },
  {
    id: 'job_interview_idioms',
    title: 'Job Interview & Professional Traits',
    category: 'Speaking',
    level: 'Intermediate',
    description: 'Ish suhbatida o‘z kuchli tomonlarini tabiiy ingliz tilida ifodalash',
    icon: '💼',
    badge: 'Career',
  },
  {
    id: 'medical_vitals_triage',
    title: 'Patient Vital Signs & Triage Communication',
    category: 'Medical English',
    level: 'Intermediate',
    description: 'Qon bosimi, puls, harorat va bemor bilan professional muloqot',
    icon: '🩺',
    badge: 'Med ESP',
  },
];

const IMAGES_BY_CATEGORY: Record<string, string[]> = {
  Grammar: [
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
  ],
  IELTS: [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  ],
  Vocabulary: [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  ],
  Speaking: [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
  ],
  'Medical English': [
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&auto=format&fit=crop&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
  ],
};

function getRandomImage(category: string, index: number = 0): string {
  const list = IMAGES_BY_CATEGORY[category] || IMAGES_BY_CATEGORY.default;
  return list[index % list.length];
}

export function generateSlidesFromTopic(options: SlideGeneratorOptions): Lesson {
  const {
    topic,
    level = 'Intermediate',
    category = 'Grammar',
    slideCount = 5,
    focus = 'comprehensive',
  } = options;

  const normalizedTopic = topic.trim();
  const lowerTopic = normalizedTopic.toLowerCase();

  const matchedLesson = getDeepCuratedLesson(lowerTopic, level, category, slideCount);
  if (matchedLesson) {
    return matchedLesson;
  }

  return buildCustomCurriculum(normalizedTopic, level, category, slideCount, focus);
}

function getDeepCuratedLesson(
  topicLower: string,
  level: Lesson['level'],
  category: string,
  slideCount: number
): Lesson | null {
  const now = Date.now();

  // 1. Present Simple vs Continuous
  if (
    topicLower.includes('present simple') ||
    topicLower.includes('continuous') ||
    topicLower.includes('hozirgi zamon')
  ) {
    const slides: SlideItem[] = [
      {
        id: 'gen_slide_1',
        title: 'Present Simple vs Present Continuous Formula',
        template: 'grammar-box',
        order: 0,
        speakerNotes: 'Ta\'kidlang: Simple - doimiy odatlar (facts, habits), Continuous - ayni damda (now, at the moment).',
        content: {
          type: 'grammar-box',
          data: {
            ruleTitle: 'Present Simple vs Continuous: Contrasting Tenses',
            formula: [
              { label: 'Routine (Simple)', text: 'Subject + V1(s/es)', color: 'blue' },
              { label: 'Time Signal', text: 'every day / always', color: 'emerald' },
              { label: 'Action Now (Cont.)', text: 'Subject + am/is/are + V-ing', color: 'purple' },
              { label: 'Time Signal', text: 'right now / currently', color: 'amber' },
            ],
            explanation: 'Present Simple kundalik takrorlanuvchi odatlar va umumiy faktlar uchun ishlatiladi. Present Continuous esa ayni nutq paytida sodir bo‘layotgan yoki vaqtinchalik harakatlar uchun qo‘llaniladi.',
            examples: [
              {
                sentence: 'She usually drinks green tea in the morning, but today she is having coffee.',
                highlightWord: 'drinks ... is having',
                translation: 'U odatda ertalab ko‘k choy ichadi, ammo bugun qahva ichmoqda.',
              },
              {
                sentence: 'The climate is getting warmer due to global emissions.',
                highlightWord: 'is getting',
                translation: 'Global chiqindilar sababli iqlim tobora isib bormoqda.',
              },
              {
                sentence: 'Water boils at 100 degrees Celsius.',
                highlightWord: 'boils',
                translation: 'Suv 100 daraja Selsiyda qaynaydi (tabiat qonuni).',
              },
            ],
            note: 'Eslatma: Hissiyot va aqliy faoliyat fe’llari (stative verbs: like, know, understand, believe) odatda Continuous shaklida kelmaydi.',
          },
        },
      },
      {
        id: 'gen_slide_2',
        title: 'Vocabulary: Simultaneously',
        template: 'vocabulary-card',
        order: 1,
        speakerNotes: 'Pronunciation: /ˌsɪm.əlˈteɪ.ni.əs.li/. Urg‘u uchinchi bo‘g‘inda. 2 ta harakat bir vaqtda sodir bo‘lganda ishlatiladi.',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Simultaneously',
            phonetic: '/ˌsɪm.əlˈteɪ.ni.əs.li/',
            partOfSpeech: 'adverb',
            definition: 'At the exact same time; happening concurrently without delay.',
            translation: 'Bir vaqtning o‘zida, parallel ravishda',
            exampleSentence: 'The surgeon was operating while the monitor was simultaneously recording the patient\'s vitals.',
            imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'gen_slide_3',
        title: 'Vocabulary: Temporary',
        template: 'vocabulary-card',
        order: 2,
        speakerNotes: 'Permanent (Simple) vs Temporary (Continuous) tushunchalarini o\'quvchilarga taqqoslab bering.',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Temporary',
            phonetic: '/ˈtem.pər.ər.i/',
            partOfSpeech: 'adjective',
            definition: 'Lasting for only a limited period of time; not permanent.',
            translation: 'Vaqtinchalik, o‘tkinchi',
            exampleSentence: 'He is staying at a hotel as a temporary arrangement until his apartment is renovated.',
            imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'gen_slide_4',
        title: 'Interactive Quiz: Spot the Tense Error',
        template: 'click-to-reveal',
        order: 3,
        speakerNotes: 'O\'quvchilardan "look!" signali nima ma\'no anglatishini so\'rang.',
        content: {
          type: 'click-to-reveal',
          data: {
            badge: 'Grammar Challenge 🎯',
            question: 'Identify and fix the mistake: "Look at that boy over there! He climbs the high wall!"',
            hint: '"Look!" signali harakat ayni damda ko‘z o‘ngimizda kechayotganini bildiradi.',
            hiddenAnswer: 'He is climbing the high wall',
            explanation: '"Look!" yoki "Listen!" kabi undov so‘zlar harakat ayni soniyada sodir bo‘layotganligini ko‘rsatgani uchun Present Continuous (is climbing) talab etiladi.',
          },
        },
      },
      {
        id: 'gen_slide_5',
        title: 'Comparison: Habitual vs In-Progress Actions',
        template: 'two-column',
        order: 4,
        speakerNotes: 'Doskada yoki slaydda har ikki ustunni o‘quvchilar bilan birgalikda tahlil qiling.',
        content: {
          type: 'two-column',
          data: {
            leftTitle: 'Present Simple (Permanent)',
            leftBadge: 'Routines & Facts',
            leftPoints: [
              'Used for lifelong truths: "Doctors treat patients."',
              'Habitual routines: "I work out every morning at 7:00."',
              'Stative verbs: "I believe you" (NOT: I am believing).',
              'Keywords: Always, usually, seldom, on weekends.',
            ],
            rightTitle: 'Present Continuous (Temporary)',
            rightBadge: 'Now & Trends',
            rightPoints: [
              'Happening right now: "The nurse is administering medicine."',
              'Temporary ongoing projects: "I am studying for IELTS this month."',
              'Developing trends: "Medical technology is advancing rapidly."',
              'Keywords: At the moment, currently, right now, look!.',
            ],
          },
        },
      },
    ];

    return {
      id: 'lesson_gen_' + now,
      title: 'Present Simple vs Present Continuous Mastery',
      category: 'Grammar',
      level,
      type: 'interactive-slides',
      createdAt: now,
      updatedAt: now,
      slides: slides.slice(0, slideCount),
    };
  }

  // 2. Conditionals (Real vs Unreal)
  if (topicLower.includes('conditional') || topicLower.includes('if clause') || topicLower.includes('shart')) {
    const slides: SlideItem[] = [
      {
        id: 'gen_cond_1',
        title: 'First vs Second Conditional Formula',
        template: 'grammar-box',
        order: 0,
        speakerNotes: '1-shart mayli: haqiqiy kelajak ehtimoli (Real possibility). 2-shart mayli: hayoliy/norasmiy orzu (Unreal present).',
        content: {
          type: 'grammar-box',
          data: {
            ruleTitle: 'First & Second Conditionals: Real vs Unreal',
            formula: [
              { label: 'First (Real)', text: 'If + Present Simple, will + V1', color: 'emerald' },
              { label: 'Second (Unreal)', text: 'If + Past Simple, would + V1', color: 'purple' },
              { label: 'Pronoun Tip', text: 'If I WERE you...', color: 'amber' },
            ],
            explanation: '1-shart mayli kelajakda amalga oshishi mumkin bo‘lgan real vaziyatlar uchun qo‘llanadi. 2-shart mayli esa ayni damdagi norasmiy, hayoliy yoki ehtimoli juda past holatlarda ishlatiladi.',
            examples: [
              {
                sentence: 'If you study diligently every day, you will achieve Band 7.5+ in IELTS.',
                highlightWord: 'study ... will achieve',
                translation: 'Agar har kuni qunt bilan o‘qisangiz, IELTS dan 7.5+ natijaga erishasiz (Real).',
              },
              {
                sentence: 'If I had more leisure time, I would learn Spanish and travel across Europe.',
                highlightWord: 'had ... would learn',
                translation: 'Agar bo‘sh vaqtim ko‘proq bo‘lganida, ispan tilini o‘rganib, Yevropa bo‘ylab sayohat qilgan bo‘lardim (Hayoliy).',
              },
            ],
            note: 'Rasmiy ingliz tilida 2-shart maylida barcha shaxslar uchun "were" ishlatiladi: "If I were you, I would consult a specialist."',
          },
        },
      },
      {
        id: 'gen_cond_2',
        title: 'Vocabulary: Hypothetical',
        template: 'vocabulary-card',
        order: 1,
        speakerNotes: 'Talaffuz: /ˌhaɪ.pəˈθet.ɪ.kəl/. IELTS Writing va Speaking uchun yuqori darajadagi akademik so‘z.',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Hypothetical',
            phonetic: '/ˌhaɪ.pəˈθet.ɪ.kəl/',
            partOfSpeech: 'adjective',
            definition: 'Based on possible ideas or situations rather than actual facts; imagined.',
            translation: 'Gipotetik, taxminiy, hayoliy',
            exampleSentence: 'The professor presented a hypothetical clinical scenario to test the students\' emergency response.',
            imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'gen_cond_3',
        title: 'Vocabulary: Feasible',
        template: 'vocabulary-card',
        order: 2,
        speakerNotes: 'Feasible = possible to do easily. "It is feasible to complete this project in 2 weeks."',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Feasible',
            phonetic: '/ˈfiː.zə.bəl/',
            partOfSpeech: 'adjective',
            definition: 'Possible to do easily or conveniently; realistic and practical.',
            translation: 'Amalga oshirib bo‘ladigan, maqsadga muvofiq, imkonli',
            exampleSentence: 'With consistent daily practice, achieving fluency within six months is entirely feasible.',
            imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'gen_cond_4',
        title: 'Interactive Quiz: Choose the Correct Conditional',
        template: 'click-to-reveal',
        order: 3,
        speakerNotes: 'O\'quvchilarga e\'tibor qaratish: gapda "won the lottery" past simple shaklda turibdi.',
        content: {
          type: 'click-to-reveal',
          data: {
            badge: 'Conditional Challenge 🎯',
            question: 'Complete the sentence: "If she won the international scholarship, she ________ (travel) to Oxford."',
            hint: 'Shart qismida fe\'l o\'tgan zamonda (won), demak bu ikkinchi shart mayli (unreal scenario).',
            hiddenAnswer: 'would travel',
            explanation: 'Ikkinchi shart mayli qoidasiga ko‘ra (If + Past Simple, would + V1), to‘g‘ri javob "would travel" bo‘ladi.',
          },
        },
      },
      {
        id: 'gen_cond_5',
        title: 'Comparison: 1st vs 2nd Conditional',
        template: 'two-column',
        order: 4,
        speakerNotes: 'Taqdimotda ikki ustun o\'rtasidagi mantiqiy va grammatik farqni ko\'rsating.',
        content: {
          type: 'two-column',
          data: {
            leftTitle: '1st Conditional (Likely / Real)',
            leftBadge: 'Realistic Future',
            leftPoints: [
              'If it rains tomorrow, we will stay indoors.',
              'High probability of occurrence (70-90%).',
              'Formula: If + Present Simple, will + Base Verb.',
              'Used for promises, warnings, and real consequences.',
            ],
            rightTitle: '2nd Conditional (Unlikely / Unreal)',
            rightBadge: 'Hypothetical / Dream',
            rightPoints: [
              'If I were a billionaire, I would build modern hospitals.',
              'Very low or zero probability in current reality.',
              'Formula: If + Past Simple, would + Base Verb.',
              'Used for advice ("If I were you") and imaginative dreams.',
            ],
          },
        },
      },
    ];

    return {
      id: 'lesson_gen_' + now,
      title: 'First & Second Conditionals: Real vs Unreal',
      category: 'Grammar',
      level,
      type: 'interactive-slides',
      createdAt: now,
      updatedAt: now,
      slides: slides.slice(0, slideCount),
    };
  }

  // 3. IELTS Speaking / Writing Collocations
  if (topicLower.includes('ielts') || topicLower.includes('band 8') || topicLower.includes('collocation')) {
    const slides: SlideItem[] = [
      {
        id: 'gen_ielts_1',
        title: 'Band 5 vs Band 8 Lexical Range',
        template: 'two-column',
        order: 0,
        speakerNotes: 'IELTS baholovchi mezonlari (Lexical Resource, Grammatical Range) asosida farqni tushuntiring.',
        content: {
          type: 'two-column',
          data: {
            leftTitle: 'Band 5.0 (Basic & Overused)',
            leftBadge: 'Elementary Vocabulary',
            leftPoints: [
              'Simple adjectives: "very good", "nice", "bad", "big".',
              'Repetitive sentence structures: "I like it because..."',
              'Hesitation due to limited vocabulary recall.',
              'Frequent reliance on informal spoken fillers.',
            ],
            rightTitle: 'Band 8.0+ (Idiomatic & Natural)',
            rightBadge: 'Academic & Nuanced',
            rightPoints: [
              'Precise collocations: "profound impact", "picturesque scenery".',
              'Complex cohesive transitions: "Notwithstanding the fact that..."',
              'Effortless idiomatic phrasing without forced idioms.',
              'Flawless control of grammar and stylistic tone.',
            ],
          },
        },
      },
      {
        id: 'gen_ielts_2',
        title: 'Vocabulary: Invaluable',
        template: 'vocabulary-card',
        order: 1,
        speakerNotes: 'E\'tibor bering: "Invaluable" - bahosiz degani emas, "juda qimmatli/baho yetmas" degani!',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Invaluable',
            phonetic: '/ɪnˈvæl.jʊ.ə.bəl/',
            partOfSpeech: 'adjective',
            definition: 'Extremely useful, indispensable, and beyond monetary value.',
            translation: 'Beqiyos, nihoyatda qimmatli, bahosi yo‘q',
            exampleSentence: 'Her clinical mentorship provided invaluable hands-on guidance for all apprentice nurses.',
            imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'gen_ielts_3',
        title: 'Vocabulary: Disproportionate',
        template: 'vocabulary-card',
        order: 2,
        speakerNotes: 'IELTS Writing Task 1 & 2 da statistik ma\'lumotlarni tahlil qilishda ideal so\'z.',
        content: {
          type: 'vocabulary-card',
          data: {
            word: 'Disproportionate',
            phonetic: '/ˌdɪs.prəˈpɔː.ʃən.ət/',
            partOfSpeech: 'adjective',
            definition: 'Too large or too small in comparison with something else; out of proportion.',
            translation: 'Nomutanosib, haddan ziyod ko‘p yoki kam',
            exampleSentence: 'A disproportionate number of healthcare resources are concentrated in metropolitan medical centers.',
            imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
          },
        },
      },
      {
        id: 'gen_ielts_4',
        title: 'Interactive Challenge: Paraphrase to Band 8',
        template: 'click-to-reveal',
        order: 3,
        speakerNotes: 'Talabalarga ushbu gapni akademik tilda o\'zgartirish uchun 30 soniya bering.',
        content: {
          type: 'click-to-reveal',
          data: {
            badge: 'IELTS Paraphrasing Challenge 🎯',
            question: 'Upgrade this Band 5 sentence to Band 8+: "Technology helps students a lot with their studies."',
            hint: '"Helps a lot" o‘rniga "substantially facilitates" yoki "profoundly enhances" birikmasini qo‘llang.',
            hiddenAnswer: 'Cutting-edge technology substantially facilitates academic research and enhances students\' learning outcomes.',
            explanation: '"Cutting-edge technology", "substantially facilitates" va "learning outcomes" kabi akademik birikmalar nomzodning so‘z boyligini Band 8+ darajasiga ko‘taradi.',
          },
        },
      },
      {
        id: 'gen_ielts_5',
        title: 'IELTS Speaking Speaking Prompts & Model Practice',
        template: 'blank',
        order: 4,
        speakerNotes: 'Sinfdagi talabalarni juftliklarga bo\'lib, 2 daqiqadan so\'zlashuv mashqini bajartiring.',
        content: {
          type: 'blank',
          data: {
            heading: 'IELTS Speaking Part 2 & 3 Discussion Framework',
            subheading: 'Fluency, Coherence & Lexical Precision',
            paragraphs: [
              '🎯 Prompt: Describe an invaluable experience that profoundly altered your personal worldview or career aspiration.',
              '🔑 Key collocations to use: "born and raised", "pivotal milestone", "invaluable insight", "broadened my horizons".',
              '⏱️ Timing Strategy: 1 minute preparation, 2 minutes continuous fluent speech with zero filler pauses.',
              '💡 Assessment Tip: Use at least two non-defining relative clauses ("which allowed me to...") and one conditional structure.',
            ],
            imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
          },
        },
      },
    ];

    return {
      id: 'lesson_gen_' + now,
      title: 'IELTS Band 8+ Lexical Precision & Speaking Masterclass',
      category: 'IELTS',
      level: 'Upper-Intermediate',
      type: 'interactive-slides',
      createdAt: now,
      updatedAt: now,
      slides: slides.slice(0, slideCount),
    };
  }

  return null;
}

function buildCustomCurriculum(
  topic: string,
  level: Lesson['level'],
  category: string,
  slideCount: number,
  focus: string
): Lesson {
  const now = Date.now();
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);

  const slides: SlideItem[] = [];

  // Slide 1: Concept & Formula
  slides.push({
    id: `slide_gen_${now}_1`,
    title: `${capitalizedTopic}: Asosiy Qoida va Tuzilma`,
    template: 'grammar-box',
    order: 0,
    speakerNotes: `Explain the fundamental concept of ${capitalizedTopic}. Break down each component with the class.`,
    content: {
      type: 'grammar-box',
      data: {
        ruleTitle: `${capitalizedTopic}: Asosiy Grammatik Formula`,
        formula: [
          { label: 'Starter / Subject', text: 'Subject / Pattern', color: 'blue' },
          { label: 'Core Action', text: 'Target Structure', color: 'emerald' },
          { label: 'Complement', text: 'Context / Object', color: 'amber' },
        ],
        explanation: `Ushbu mavzu (${capitalizedTopic}) doirasida asosiy grammatik va leksik qonuniyatlar o‘rganiladi. O‘quvchilar gap tuzilishidagi tartibga va zamon moslashuviga e'tibor qaratishlari lozim.`,
        examples: [
          {
            sentence: `Mastering ${capitalizedTopic.toLowerCase()} enables learners to communicate with greater natural fluency and precision.`,
            highlightWord: 'enables ... communicate',
            translation: `${capitalizedTopic} mavzusini puxta o‘rganish o‘quvchilarga yanada ravon va aniq muloqot qilish imkonini beradi.`,
          },
          {
            sentence: `Students consistently apply these key structures throughout their daily spoken and written exercises.`,
            highlightWord: 'apply',
            translation: `O‘quvchilar ushbu asosiy tuzilmalarni kundalik yozma va og‘zaki mashqlarda muntazam qo‘llashadi.`,
          },
        ],
        note: `Eslatma: ${capitalizedTopic} bo‘yicha gap tuzishda kontekst va so‘zlarning birikish qonuniyatlariga (collocations) qat'iy rioya qiling.`,
      },
    },
  });

  // Slide 2: Target Vocabulary 1
  slides.push({
    id: `slide_gen_${now}_2`,
    title: `Key Term: Comprehensive`,
    template: 'vocabulary-card',
    order: 1,
    speakerNotes: `Practice pronunciation with students: stress on the first syllable /ˌkɒm.prɪˈhen.sɪv/.`,
    content: {
      type: 'vocabulary-card',
      data: {
        word: 'Comprehensive',
        phonetic: '/ˌkɒm.prɪˈhen.sɪv/',
        partOfSpeech: 'adjective',
        definition: 'Including or dealing with all or nearly all elements or aspects of something; thorough.',
        translation: 'Keng qamrovli, har tomonlama to‘liq',
        exampleSentence: `The textbook provides a comprehensive overview of ${capitalizedTopic.toLowerCase()} with practical drills.`,
        imageUrl: getRandomImage(category, 0),
      },
    },
  });

  // Slide 3: Target Vocabulary 2
  slides.push({
    id: `slide_gen_${now}_3`,
    title: `Key Term: Proficient`,
    template: 'vocabulary-card',
    order: 2,
    speakerNotes: `Explain that "proficient" implies high skill gained through dedicated study and practice.`,
    content: {
      type: 'vocabulary-card',
      data: {
        word: 'Proficient',
        phonetic: '/prəˈfɪʃ.ənt/',
        partOfSpeech: 'adjective',
        definition: 'Competent or skilled in doing or using something through training and practice.',
        translation: 'Tajribali, mohir, ustasi bo‘lgan',
        exampleSentence: `With regular practice, all students will become proficient in applying ${capitalizedTopic.toLowerCase()}.`,
        imageUrl: getRandomImage(category, 1),
      },
    },
  });

  // Slide 4: Interactive Challenge
  slides.push({
    id: `slide_gen_${now}_4`,
    title: `Interactive Challenge: ${capitalizedTopic}`,
    template: 'click-to-reveal',
    order: 3,
    speakerNotes: `Give students 30 seconds to formulate their answer before clicking to reveal.`,
    content: {
      type: 'click-to-reveal',
      data: {
        badge: `${category} Challenge 🎯`,
        question: `Question: What is the primary functional purpose of using ${capitalizedTopic.toLowerCase()} in real-world communication?`,
        hint: `Think about how this structure helps deliver clarity, precision, and natural expression.`,
        hiddenAnswer: `Accurate formulation & natural pragmatic fluency`,
        explanation: `Using ${capitalizedTopic.toLowerCase()} correctly prevents communication breakdowns and demonstrates advanced linguistic competence.`,
      },
    },
  });

  // Slide 5: Comparison
  slides.push({
    id: `slide_gen_${now}_5`,
    title: `${capitalizedTopic}: Common Mistakes vs Best Practice`,
    template: 'two-column',
    order: 4,
    speakerNotes: `Review the common errors on the left and contrast with the natural solutions on the right.`,
    content: {
      type: 'two-column',
      data: {
        leftTitle: 'Common Errors / Weak Usage',
        leftBadge: 'Incorrect / Fragile',
        leftPoints: [
          `Direct word-for-word translation from Uzbek without English syntax.`,
          `Over-simplification and repeating identical starter words.`,
          `Omitting auxiliary markers or tense agreement.`,
        ],
        rightTitle: 'Recommended / Native Usage',
        rightBadge: 'Correct / Strong',
        rightPoints: [
          `Applying natural collocations and idiomatic pairings.`,
          `Varying grammatical structures with confident rhythm.`,
          `Accurate precision in formal and informal conversational registers.`,
        ],
      },
    },
  });

  // Slide 6: Summary Workshop
  slides.push({
    id: `slide_gen_${now}_6`,
    title: `${capitalizedTopic}: Summary & Practice`,
    template: 'blank',
    order: 5,
    speakerNotes: `Conduct the speaking pair activity with the class. Monitor and give immediate feedback.`,
    content: {
      type: 'blank',
      data: {
        heading: `${capitalizedTopic}: Amaliy Mashg‘ulot`,
        subheading: 'Xulosa va Juftlikda Mashq',
        paragraphs: [
          `📌 Asosiy xulosa: ${capitalizedTopic} mavzusini o‘zlashtirish orqali nutqingizdagi grammatik ravonlik yangi bosqichga ko‘tariladi.`,
          `🗣️ Juftlikda ishlash mashqi: Partnyoringiz bilan birgalikda bugun o‘rganilgan qoidalardan foydalanib 3 ta murakkab gap tuzing.`,
          `📝 Uy vazifasi: O‘zingizning kundalik tajribangiz asosida ushbu mavzuni qamrab oluvchi 5 ta namunali gap yozib keling.`,
        ],
        imageUrl: getRandomImage(category, 2),
      },
    },
  });

  return {
    id: `lesson_gen_${now}`,
    title: `${capitalizedTopic} Masterclass`,
    category,
    level,
    type: 'interactive-slides',
    createdAt: now,
    updatedAt: now,
    slides: slides.slice(0, Math.min(slideCount, slides.length)),
  };
}

export function parseNotesToSlides(notesText: string, lessonTitle: string = 'Generated Lesson'): SlideItem[] {
  const lines = notesText.split('\n').map((l) => l.trim()).filter(Boolean);
  const slides: SlideItem[] = [];
  let currentOrder = 0;

  if (lines.length === 0) {
    return [
      {
        id: 'parsed_slide_1',
        title: lessonTitle,
        template: 'blank',
        order: 0,
        content: {
          type: 'blank',
          data: {
            heading: lessonTitle,
            subheading: 'Dars mazmuni',
            paragraphs: ['Dars matni bu yerda aks etadi.'],
          },
        },
      },
    ];
  }

  const sep = ['-', ':', '\u2013', '\u2014'].join('');
  const vocabRegex = new RegExp(`^([a-zA-Z\\s'-]+)\\s*[${sep}]\\s*(.+)$`);
  const quizRegex = /^(Q|Savol|Question):\s*(.+)$/i;

  let currentParagraphs: string[] = [];

  lines.forEach((line) => {
    const quizMatch = line.match(quizRegex);
    if (quizMatch) {
      if (currentParagraphs.length > 0) {
        slides.push({
          id: `parsed_slide_${Date.now()}_${currentOrder}`,
          title: `Mavzu Mazmuni ${currentOrder + 1}`,
          template: 'blank',
          order: currentOrder++,
          content: {
            type: 'blank',
            data: {
              heading: lessonTitle,
              paragraphs: [...currentParagraphs],
            },
          },
        });
        currentParagraphs = [];
      }

      slides.push({
        id: `parsed_slide_${Date.now()}_${currentOrder}`,
        title: `Savol-Javob Challenge`,
        template: 'click-to-reveal',
        order: currentOrder++,
        content: {
          type: 'click-to-reveal',
          data: {
            badge: 'Interactive Quiz 🎯',
            question: quizMatch[2],
            hint: 'Eslab ko‘ring va javob bering',
            hiddenAnswer: 'To‘g‘ri javob matni',
            explanation: 'Darslik qoidasi asosida izoh',
          },
        },
      });
      return;
    }

    const vocabMatch = line.match(vocabRegex);
    if (vocabMatch && vocabMatch[1].split(' ').length <= 4) {
      const word = vocabMatch[1].trim();
      const translation = vocabMatch[2].trim();

      slides.push({
        id: `parsed_slide_${Date.now()}_${currentOrder}`,
        title: `Lug‘at: ${word}`,
        template: 'vocabulary-card',
        order: currentOrder++,
        content: {
          type: 'vocabulary-card',
          data: {
            word,
            phonetic: `/${word.toLowerCase()}/`,
            partOfSpeech: 'vocabulary',
            definition: translation,
            translation: translation,
            exampleSentence: `Practice using "${word}" naturally in a full sentence.`,
            imageUrl: getRandomImage('Vocabulary', currentOrder),
          },
        },
      });
      return;
    }

    currentParagraphs.push(line);
    if (currentParagraphs.length >= 4) {
      slides.push({
        id: `parsed_slide_${Date.now()}_${currentOrder}`,
        title: `Asosiy Mavzu ${currentOrder + 1}`,
        template: 'blank',
        order: currentOrder++,
        content: {
          type: 'blank',
          data: {
            heading: lessonTitle,
            paragraphs: [...currentParagraphs],
          },
        },
      });
      currentParagraphs = [];
    }
  });

  if (currentParagraphs.length > 0) {
    slides.push({
      id: `parsed_slide_${Date.now()}_${currentOrder}`,
      title: `Xulosa va Ko‘rsatmalar`,
      template: 'blank',
      order: currentOrder++,
      content: {
        type: 'blank',
        data: {
          heading: lessonTitle,
          paragraphs: currentParagraphs,
        },
      },
    });
  }

  return slides;
}
