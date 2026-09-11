import React, { useState, useRef, useEffect } from 'react';
import {
  usePresentationStore,
  togglePedagogyModal,
  toggleTranslationCurtain,
} from '@/store/presentationStore';
import {
  Bell,
  Dices,
  CircleDot,
  Eye,
  EyeOff,
  Sparkles,
  X,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Volume2,
  Flame,
  Timer,
  Play,
  Pause,
  Shuffle,
  BookOpen,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// -------------------------------------------------------------
// Pedagogical ESL / EFL Data Structures & Constants
// -------------------------------------------------------------

export interface TongueTwister {
  id: string;
  category: string;
  phoneticFocus: string;
  text: string;
  meaningUz: string;
  level: 'Boshlang\'ich' | 'O\'rta' | 'Murakkab';
  highlight: string;
}

export const TONGUE_TWISTERS: TongueTwister[] = [
  {
    id: 'th-s',
    category: '/θ/ vs /s/',
    phoneticFocus: "Tishlararo /θ/ va hushtak /s/ minimal juftligi",
    text: "Thirty-three thousand feathers on a thrush's throat.",
    meaningUz: "Sayroqi qush tomog'idagi 33 ming pat.",
    level: "O'rta",
    highlight: "Th / S kontrasti",
  },
  {
    id: 'w-v',
    category: '/w/ vs /v/',
    phoneticFocus: "Lab-lab /w/ va lab-tish /v/ artikulyatsiyasi",
    text: "Which wristwatches are Swiss wristwatches?",
    meaningUz: "Qaysi qo'l soatlari Shveysariya soatlari?",
    level: "Boshlang'ich",
    highlight: "W / V kontrasti",
  },
  {
    id: 'sh-s',
    category: '/ʃ/ vs /s/',
    phoneticFocus: "Palato-alveolyar /ʃ/ va alveolyar /s/ tovushlari",
    text: "She sells seashells by the seashore.",
    meaningUz: "U dengiz qirg'og'ida chig'anoqlar sotadi.",
    level: "O'rta",
    highlight: "Sh / S kontrasti",
  },
  {
    id: 'r-l',
    category: '/r/ vs /l/',
    phoneticFocus: "Inglizcha sirg'aluvchi /r/ va yon /l/ tovushlari",
    text: "Red lorry, yellow lorry, red lorry, yellow lorry.",
    meaningUz: "Qizil yuk mashinasi, sariq yuk mashinasi.",
    level: "Murakkab",
    highlight: "R / L almashinishi",
  },
  {
    id: 'p-b',
    category: '/p/ vs /b/',
    phoneticFocus: "Aspiratsiyali jarangsiz /p/ va jarangli /b/ portlovchi tovushlari",
    text: "Peter Piper picked a peck of pickled peppers.",
    meaningUz: "Piter Payper bir savat tuzlangan qalampir terdi.",
    level: "Murakkab",
    highlight: "P / B aspiratsiyasi",
  },
  {
    id: 'ch-sh',
    category: '/tʃ/ vs /ʃ/',
    phoneticFocus: "Jarangsiz afrikata /tʃ/ va sirg'aluvchi /ʃ/ farqi",
    text: "Charlie cheers cheerfully while washing cheap shirts.",
    meaningUz: "Charli arzon ko'ylaklarni yuvayotib quvnoq hayqiradi.",
    level: "O'rta",
    highlight: "Ch / Sh artikulyatsiyasi",
  },
  {
    id: 'dh-z',
    category: '/ð/ vs /z/',
    phoneticFocus: "Jarangli tishlararo /ð/ va jarangli /z/ tovushi",
    text: "These thousand brothers breathe smoother than those others.",
    meaningUz: "Bu mingta aka-uka boshqalarga qaraganda yengilroq nafas oladi.",
    level: "Murakkab",
    highlight: "Th / Z jarangli kontrast",
  },
];

export interface SpeakingPrompt {
  id: string;
  prompt: string;
  promptUz: string;
  duration: number; // in seconds: 15, 20, 30
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
}

export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  {
    id: 'morning-routine',
    prompt: "Describe your morning routine in 30 seconds without saying 'um' or 'er'!",
    promptUz: "Ertalabki rejimingizni 30 soniyada 'um' yoki 'er' demasdan tasvirlab bering!",
    duration: 30,
    category: 'Fluency & Daily Life',
    difficulty: 'Easy',
  },
  {
    id: 'must-have-to',
    prompt: "Explain the difference between 'must' and 'have to' in 20 seconds!",
    promptUz: "'Must' (ichki xohish/majburiyat) va 'Have to' (tashqi qoida) farqini 20 soniyada tushuntiring!",
    duration: 20,
    category: 'Grammar Precision',
    difficulty: 'Medium',
  },
  {
    id: 'medical-instruments',
    prompt: "Name 5 medical instruments or professions in 15 seconds!",
    promptUz: "15 soniya ichida 5 ta tibbiy asbob yoki kasb nomini ayting!",
    duration: 15,
    category: 'Speed Vocabulary',
    difficulty: 'Easy',
  },
  {
    id: 'english-uzbekistan',
    prompt: "Give 3 arguments why learning English is essential in Uzbekistan!",
    promptUz: "O'zbekistonda ingliz tilini o'rganish nima uchun zarurligiga 3 ta aniq sabab keltiring!",
    duration: 30,
    category: 'Critical Thinking',
    difficulty: 'Medium',
  },
  {
    id: 'sell-broken-pen',
    prompt: "Sell a broken pen to your teacher with 2 creative reasons in 30 seconds!",
    promptUz: "O'qituvchingizga ishlamaydigan ruchkani 2 ta ijodiy sabab bilan 30 soniyada soting!",
    duration: 30,
    category: 'Creativity & Persuasion',
    difficulty: 'Challenging',
  },
  {
    id: 'borrow-vs-lend',
    prompt: "Give 2 clear examples showing the exact difference between 'Borrow' and 'Lend' in 20 seconds!",
    promptUz: "'Borrow' (qarzga olish) va 'Lend' (qarzga berish) farqiga 20 soniyada 2 ta misol keltiring!",
    duration: 20,
    category: 'Grammar Precision',
    difficulty: 'Medium',
  },
  {
    id: 'uzbek-food',
    prompt: "Describe your favorite Uzbek meal without using the words 'rice', 'meat', or 'delicious' in 30 seconds!",
    promptUz: "Sevimli milliy taomingizni 'guruch', 'go'sht' va 'mazali' so'zlarisiz 30 soniyada tasvirlang!",
    duration: 30,
    category: 'Vocabulary Constraint',
    difficulty: 'Challenging',
  },
  {
    id: 'five-classroom-rules',
    prompt: "Name 4 golden rules of this English classroom in 15 seconds!",
    promptUz: "15 soniya ichida ushbu darsxona uchun 4 ta oltin qoidani sanab bering!",
    duration: 15,
    category: 'Speed Fluency',
    difficulty: 'Easy',
  },
];

export interface CCQItem {
  id: string;
  type: string;
  titleUz: string;
  icon: string;
  questionFormula: string;
  description: string;
  targetSentence: string;
  meaning: string;
  badQuestion: string;
  goodCCQs: { q: string; a: string }[];
}

export const CCQ_ITEMS: CCQItem[] = [
  {
    id: 'time-check',
    type: 'Time Check',
    titleUz: 'Vaqtni Tekshirish (Time Reference)',
    icon: '⏳',
    questionFormula: "Is it happening now, in the past, or regularly?",
    description: "Harakatning zamon o'qida qachon sodir bo'lganini aniqlash uchun.",
    targetSentence: "I was having dinner when the telephone rang.",
    meaning: "Telefon jiringlaganda kechki ovqat davom etayotgan edi (tomonlar bir paytda).",
    badQuestion: "'Past continuous qoidasini tushundingizmi?'",
    goodCCQs: [
      { q: "Did dinner start before the phone rang?", a: "Yes" },
      { q: "Was dinner finished when the phone rang?", a: "No (in progress)" },
      { q: "Did both actions happen in the past?", a: "Yes" },
    ],
  },
  {
    id: 'fact-check',
    type: 'Fact / State Check',
    titleUz: 'Fakt & Tugallanganlik (Completion & State)',
    icon: '🎯',
    questionFormula: "Is this action completed or still continuing?",
    description: "Harakat to'liq tugaganmi yoki hozirgacha davom etmoqdami?",
    targetSentence: "She has worked at this clinic for 5 years.",
    meaning: "U ushbu klinikada 5 yildan beri ishlaydi (hozir ham ishlamoqda).",
    badQuestion: "'Present Perfect Continuous nimaligini bildingizmi?'",
    goodCCQs: [
      { q: "Did she start working here 5 years ago?", a: "Yes" },
      { q: "Does she still work here today?", a: "Yes" },
      { q: "Is the action completed?", a: "No, it is still continuing" },
    ],
  },
  {
    id: 'reality-check',
    type: 'Reality / Modality Check',
    titleUz: 'Haqiqat yoki Faraz (Real vs Hypothetical)',
    icon: '🔮',
    questionFormula: "Is this real or hypothetical (imaginary)?",
    description: "Harakat haqiqatda mavjudmi yoki faqat tasavvur/xayolmi?",
    targetSentence: "If I won a million dollars, I would build a hospital.",
    meaning: "Agar 1 million dollar yutib olsam, shifoxona qurardim (hozirda xayoliy orzu).",
    badQuestion: "'Second conditional formulasini tushundingizmi?'",
    goodCCQs: [
      { q: "Do I have a million dollars right now?", a: "No" },
      { q: "Did I win the lottery?", a: "No" },
      { q: "Is this a real fact or an imaginary wish?", a: "Imaginary (Hypothetical)" },
    ],
  },
  {
    id: 'obligation-check',
    type: 'Obligation & Permission',
    titleUz: 'Majburiyat & Ruxsat (Obligation Check)',
    icon: '🚦',
    questionFormula: "Is it compulsory, optional, or forbidden?",
    description: "Modal fe'llar ma'nosini (majburiy, taqiqlangan yoki ixtiyoriy) tekshirish.",
    targetSentence: "You don't have to wear a white coat in the lecture hall.",
    meaning: "Ma'ruzalar zalida oq xalat kiyish shart emas (lekin taqiqlanmagan ham).",
    badQuestion: "'Don't have to qoidasini tushundingizmi?'",
    goodCCQs: [
      { q: "Is wearing a white coat compulsory?", a: "No" },
      { q: "Is it forbidden or prohibited?", a: "No" },
      { q: "Do you have a personal choice?", a: "Yes (It is optional)" },
    ],
  },
];

export const ClassroomPedagogyModal: React.FC = () => {
  const isOpen = usePresentationStore((s) => s.isPedagogyModalOpen);
  const isTranslationCurtainActive = usePresentationStore((s) => s.isTranslationCurtainActive);

  const [activeTab, setActiveTab] = useState<'warmup' | 'tools' | 'traffic' | 'dice'>('warmup');
  const [warmupSubTab, setWarmupSubTab] = useState<'twisters' | 'hotseat' | 'ccq'>('twisters');

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const diceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      if (diceIntervalRef.current) clearInterval(diceIntervalRef.current);
      if (coinTimeoutRef.current) clearTimeout(coinTimeoutRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        togglePedagogyModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  // 1. Attention Chime / Crystal Bell Sound
  const [isChiming, setIsChiming] = useState(false);
  const playAttentionChime = () => {
    setIsChiming(true);
    setTimeout(() => setIsChiming(false), 1200);

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const playTone = (freq: number, start: number, duration: number, gainVal: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(gainVal, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      // High-register crystal chime: E6 (1318.5Hz) -> A6 (1760Hz) -> E7 (2637Hz)
      playTone(1318.5, now, 1.2, 0.35);
      playTone(1760, now + 0.15, 1.4, 0.4);
      playTone(2637, now + 0.3, 1.6, 0.25);
    } catch (e) {
      console.warn('Chime sound error:', e);
    }
  };

  // 2. Classroom Dice Roll (1 to 6)
  const [diceNumber, setDiceNumber] = useState<number>(6);
  const [isRollingDice, setIsRollingDice] = useState(false);

  const rollDice = () => {
    if (isRollingDice) return;
    setIsRollingDice(true);

    try {
      const ctx = getAudioContext();
      if (ctx) {
        // Wooden dice clatter clicks
        for (let i = 0; i < 6; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400 + Math.random() * 300, ctx.currentTime + i * 0.06);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.06);
          osc.stop(ctx.currentTime + i * 0.06 + 0.04);
        }
      }
    } catch {}

    if (diceIntervalRef.current) clearInterval(diceIntervalRef.current);
    let rolls = 0;
    diceIntervalRef.current = setInterval(() => {
      setDiceNumber(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 10) {
        if (diceIntervalRef.current) clearInterval(diceIntervalRef.current);
        const finalNum = Math.floor(Math.random() * 6) + 1;
        setDiceNumber(finalNum);
        setIsRollingDice(false);
      }
    }, 60);
  };

  // 3. Coin Flipper (Student A vs Student B / Heads vs Tails)
  const [coinResult, setCoinResult] = useState<'A' | 'B' | null>(null);
  const [isFlippingCoin, setIsFlippingCoin] = useState(false);
  const [coinLabelA, setCoinLabelA] = useState('Student A (Doktor)');
  const [coinLabelB, setCoinLabelB] = useState('Student B (Bemor)');

  const flipCoin = () => {
    if (isFlippingCoin) return;
    setIsFlippingCoin(true);
    setCoinResult(null);

    try {
      const ctx = getAudioContext();
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}

    if (coinTimeoutRef.current) clearTimeout(coinTimeoutRef.current);
    coinTimeoutRef.current = setTimeout(() => {
      const pick: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
      setCoinResult(pick);
      setIsFlippingCoin(false);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
      });
    }, 650);
  };

  // 4. Traffic Light Comprehension Poll
  const [greenCount, setGreenCount] = useState(0);
  const [yellowCount, setYellowCount] = useState(0);
  const [redCount, setRedCount] = useState(0);

  const resetTraffic = () => {
    setGreenCount(0);
    setYellowCount(0);
    setRedCount(0);
  };

  const totalTraffic = greenCount + yellowCount + redCount;
  const greenPct = totalTraffic > 0 ? Math.round((greenCount / totalTraffic) * 100) : 0;
  const yellowPct = totalTraffic > 0 ? Math.round((yellowCount / totalTraffic) * 100) : 0;
  const redPct = totalTraffic > 0 ? Math.round((redCount / totalTraffic) * 100) : 0;

  // -----------------------------------------------------------
  // Sound Effects (Web Audio API)
  // -----------------------------------------------------------
  const playRandomPopSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {}
  };

  const playTickSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  };

  const playSuccessSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.15, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.22);
      });
    } catch {}
  };

  // -----------------------------------------------------------
  // Speech Challenge Timer (15s / 20s / 30s)
  // -----------------------------------------------------------
  const [challengeTime, setChallengeTime] = useState<number>(15);
  const [initialDuration, setInitialDuration] = useState<number>(15);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setChallengeTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            playSuccessSound();
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.6 },
            });
            return 0;
          }
          if (prev <= 4) {
            playTickSound();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const handleStartPauseTimer = () => {
    if (challengeTime === 0) {
      setChallengeTime(initialDuration);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const handleResetTimer = (seconds?: number) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsTimerRunning(false);
    const dur = seconds ?? initialDuration;
    setInitialDuration(dur);
    setChallengeTime(dur);
  };

  // -----------------------------------------------------------
  // Tongue Twisters State
  // -----------------------------------------------------------
  const [selectedTwisterIndex, setSelectedTwisterIndex] = useState<number>(0);
  const [twisterFilter, setTwisterFilter] = useState<string>('all');

  const filteredTwisters = twisterFilter === 'all'
    ? TONGUE_TWISTERS
    : TONGUE_TWISTERS.filter((t) => t.category === twisterFilter);

  const currentTwister = TONGUE_TWISTERS[selectedTwisterIndex] || TONGUE_TWISTERS[0];

  const handleRandomTwister = () => {
    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * TONGUE_TWISTERS.length);
    } while (nextIndex === selectedTwisterIndex && TONGUE_TWISTERS.length > 1);

    setSelectedTwisterIndex(nextIndex);
    playRandomPopSound();
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.6 },
    });
  };

  const playTwisterSpeech = (slow = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(currentTwister.text);
      u.lang = 'en-US';
      u.rate = slow ? 0.75 : 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentTwister.id]);

  // -----------------------------------------------------------
  // Rapid-Fire Hot Seat State
  // -----------------------------------------------------------
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(0);
  const currentPrompt = SPEAKING_PROMPTS[selectedPromptIndex] || SPEAKING_PROMPTS[0];

  const handleRandomPrompt = () => {
    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * SPEAKING_PROMPTS.length);
    } while (nextIndex === selectedPromptIndex && SPEAKING_PROMPTS.length > 1);

    setSelectedPromptIndex(nextIndex);
    handleResetTimer(SPEAKING_PROMPTS[nextIndex].duration);
    playRandomPopSound();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  // -----------------------------------------------------------
  // CCQ Pedagogical State
  // -----------------------------------------------------------
  const [expandedCCQ, setExpandedCCQ] = useState<string | null>('time-check');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pedagogik Interaktiv Asboblar"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={() => togglePedagogyModal(false)}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/90 shadow-2xl p-6 text-white animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Pedagogik Interaktiv Asboblar</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ESL / ESP Toolbox
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Darsni qiziqarli, interaktiv va boshqariladigan qilish uchun pedagogik qurollar
              </p>
            </div>
          </div>

          <button
            onClick={() => togglePedagogyModal(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-[0.96] transition-transform duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (4 Tabs) */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/70 rounded-2xl my-3 border border-slate-800/80">
          <button
            onClick={() => setActiveTab('warmup')}
            title="Til Sindirish & Warm-up (Tongue Twisters & CCQs)"
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center justify-center gap-1.5 active:scale-[0.96] ${
              activeTab === 'warmup'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Warm-up & CCQs</span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            title="Qo'ng'iroq & Qura (Chime & Coin Toss)"
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center justify-center gap-1.5 active:scale-[0.96] ${
              activeTab === 'tools'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Qo'ng'iroq & Qura</span>
          </button>
          <button
            onClick={() => setActiveTab('traffic')}
            title="Svetofor (Tushunarlilik darajasi)"
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center justify-center gap-1.5 active:scale-[0.96] ${
              activeTab === 'traffic'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Svetofor</span>
          </button>
          <button
            onClick={() => setActiveTab('dice')}
            title="Zar & Lug'at Pardasi"
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center justify-center gap-1.5 active:scale-[0.96] ${
              activeTab === 'dice'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Dices className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Zar & Parda</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2">
          {/* Tab 0: Warm-up & CCQs */}
          {activeTab === 'warmup' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Warm-up Sub-navigation Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
                <button
                  onClick={() => {
                    setWarmupSubTab('twisters');
                    handleResetTimer(15);
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.96] ${
                    warmupSubTab === 'twisters'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Til Sindirish (Twisters)</span>
                </button>

                <button
                  onClick={() => {
                    setWarmupSubTab('hotseat');
                    handleResetTimer(currentPrompt.duration);
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.96] ${
                    warmupSubTab === 'hotseat'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Tezkor Nutq (Hot Seat)</span>
                </button>

                <button
                  onClick={() => setWarmupSubTab('ccq')}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.96] ${
                    warmupSubTab === 'ccq'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">CCQs Cheat-Sheet</span>
                </button>
              </div>

              {/* Sub-tab 1: Tongue Twisters */}
              {warmupSubTab === 'twisters' && (
                <div className="space-y-3">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <button
                      onClick={() => setTwisterFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition active:scale-[0.96] ${
                        twisterFilter === 'all'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      Barchasi ({TONGUE_TWISTERS.length})
                    </button>
                    {TONGUE_TWISTERS.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTwisterIndex(idx);
                          setTwisterFilter(t.category);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold shrink-0 transition active:scale-[0.96] ${
                          currentTwister.id === t.id
                            ? 'bg-indigo-600 text-white ring-1 ring-indigo-400 shadow-xs'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t.category}
                      </button>
                    ))}
                  </div>

                  {/* Twister Display Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/40 p-4 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          {currentTwister.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {currentTwister.phoneticFocus}
                        </span>
                      </div>

                      <button
                        onClick={handleRandomTwister}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-[0.96] transition flex items-center gap-1.5"
                        title="Tasodifiy Til Sindirish"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Tasodifiy Til Sindirish</span>
                      </button>
                    </div>

                    {/* Main Tongue Twister Text */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30 text-center space-y-2.5">
                      <p className="text-base sm:text-lg font-mono font-bold text-amber-300 tracking-wide leading-relaxed">
                        "{currentTwister.text}"
                      </p>

                      {/* Native pronunciation audio controls */}
                      <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => playTwisterSpeech(false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 active:scale-[0.96] transition"
                          title="Talaffuzni tinglash (Normal tezlik)"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Talaffuzni Tinglash</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => playTwisterSpeech(true)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-700 active:scale-[0.96] transition"
                          title="Sekin tezlikda tinglash (0.75x)"
                        >
                          <span>Sekin (0.75x)</span>
                        </button>
                      </div>
                    </div>

                    {/* Uzbek Meaning & Target Note */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-medium">Ma'nosi: </span>
                        <span className="italic">{currentTwister.meaningUz}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 self-start sm:self-auto">
                        🎯 Challenge: 3 marta tez va xatosiz o'qish!
                      </div>
                    </div>
                  </div>

                  {/* Speech Challenge Timer Bar */}
                  <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                        <Timer className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Nutq Tezligi Taymeri</span>
                          <span className="text-[10px] text-slate-400 font-normal">(15s / 30s)</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          O'quvchi tez va ravon o'qishi uchun vaqt o'lchagich
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 15s preset */}
                      <button
                        onClick={() => handleResetTimer(15)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-[0.96] ${
                          initialDuration === 15 && !isTimerRunning
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        15 soniya
                      </button>

                      {/* 30s preset */}
                      <button
                        onClick={() => handleResetTimer(30)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-[0.96] ${
                          initialDuration === 30 && !isTimerRunning
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        30 soniya
                      </button>

                      {/* Countdown Digits */}
                      <div
                        className={`min-w-[48px] text-center font-mono font-black text-sm px-2 py-1 rounded-lg border ${
                          challengeTime <= 3 && isTimerRunning
                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                            : 'bg-slate-950 border-slate-700 text-amber-400'
                        }`}
                      >
                        {challengeTime}s
                      </div>

                      {/* Play / Pause */}
                      <button
                        onClick={handleStartPauseTimer}
                        className={`p-2 rounded-xl text-slate-950 font-bold active:scale-[0.96] transition shadow-md ${
                          isTimerRunning
                            ? 'bg-amber-400 hover:bg-amber-300'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                        }`}
                        title={isTimerRunning ? 'Pauza' : 'Boshlash'}
                      >
                        {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      {/* Reset */}
                      <button
                        onClick={() => handleResetTimer()}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-[0.96] transition"
                        title="Qayta boshlash"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: 30-Second Rapid-Fire Speaking Hot Seat */}
              {warmupSubTab === 'hotseat' && (
                <div className="space-y-3">
                  {/* Hot Seat Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/40 p-4 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>Hot Seat Challenge</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {currentPrompt.category}
                        </span>
                      </div>

                      <button
                        onClick={handleRandomPrompt}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-[0.96] transition flex items-center gap-1.5"
                        title="Tasodifiy Mavzu"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Tasodifiy Mavzu</span>
                      </button>
                    </div>

                    {/* Main Speaking Prompt */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30">
                      <p className="text-base sm:text-lg font-extrabold text-white leading-relaxed">
                        "{currentPrompt.prompt}"
                      </p>
                      <p className="text-xs text-amber-300/80 mt-2 font-medium">
                        O'zbekcha yo'naltirish: {currentPrompt.promptUz}
                      </p>
                    </div>

                    {/* Rules & Guidance */}
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Oltin qoida: "Um", "Er" demasdan va to'xtamasdan gapiring!</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        Tavsiya: {currentPrompt.duration} soniya
                      </span>
                    </div>
                  </div>

                  {/* Hot Seat Timer Bar */}
                  <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg border transition-all ${
                          challengeTime <= 4 && isTimerRunning
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-bounce'
                            : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        }`}
                      >
                        {challengeTime}s
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {isTimerRunning ? 'Nutq davom etmoqda...' : 'Nutqni boshlashga tayyor'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Belgilangan vaqt ichida o'quvchi fikrini to'xtovsiz bayon qilishi kerak
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 15s */}
                      <button
                        onClick={() => handleResetTimer(15)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-[0.96] ${
                          initialDuration === 15 && !isTimerRunning
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        15s
                      </button>
                      {/* 20s */}
                      <button
                        onClick={() => handleResetTimer(20)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-[0.96] ${
                          initialDuration === 20 && !isTimerRunning
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        20s
                      </button>
                      {/* 30s */}
                      <button
                        onClick={() => handleResetTimer(30)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-[0.96] ${
                          initialDuration === 30 && !isTimerRunning
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        30s
                      </button>

                      {/* Start / Pause */}
                      <button
                        onClick={handleStartPauseTimer}
                        className={`px-3 py-2 rounded-xl text-xs font-black active:scale-[0.96] transition flex items-center gap-1.5 shadow-md ${
                          isTimerRunning
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                            : 'bg-emerald-500 text-white hover:bg-emerald-400'
                        }`}
                      >
                        {isTimerRunning ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pauza</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Boshlash</span>
                          </>
                        )}
                      </button>

                      {/* Reset */}
                      <button
                        onClick={() => handleResetTimer()}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-[0.96] transition"
                        title="Qayta sozlash"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: CCQs Pedagogical Cheat-Sheet */}
              {warmupSubTab === 'ccq' && (
                <div className="space-y-3">
                  {/* Intro Callout */}
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>CCQs: Concept Checking Questions Metodikasi</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            CELTA / DELTA Standard
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          Hech qachon <em>"Tushundingizmi?"</em> deb so'ramang — o'quvchilar tushunmasa ham "Ha" deyishadi.
                          Haqiqiy tushunishni qisqa (Yes/No yoki 1-so'zli) CCQ savollari bilan tekshiring!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Pillars of CCQs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CCQ_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setExpandedCCQ(expandedCCQ === item.id ? null : item.id)}
                        className={`rounded-2xl border p-3.5 cursor-pointer transition-all duration-150 ${
                          expandedCCQ === item.id
                            ? 'bg-slate-800/90 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/30'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{item.icon}</span>
                            <span className="text-xs font-bold text-white">{item.titleUz}</span>
                          </div>
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                            {item.type}
                          </span>
                        </div>

                        {/* Formula */}
                        <div className="mt-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Formula:</div>
                          <div className="text-xs font-bold text-amber-300 font-mono mt-0.5">
                            "{item.questionFormula}"
                          </div>
                        </div>

                        {/* Target sentence */}
                        <div className="mt-2 text-[11px] text-slate-300">
                          <span className="text-slate-500 font-medium">Target: </span>
                          <span className="font-semibold text-white">"{item.targetSentence}"</span>
                        </div>

                        {/* Good CCQs List (Shown when active or compact) */}
                        {expandedCCQ === item.id && (
                          <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2 animate-in fade-in duration-150">
                            <div className="text-[11px] text-rose-400/90 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">
                              ❌ <em>Noto'g'ri:</em> {item.badQuestion}
                            </div>

                            <div className="text-[11px] text-slate-300">
                              <div className="font-bold text-emerald-400 mb-1">✅ To'g'ri CCQ savollari:</div>
                              <ul className="space-y-1 pl-1">
                                {item.goodCCQs.map((ccq, cIdx) => (
                                  <li key={cIdx} className="flex items-start justify-between gap-1 text-[11px] bg-slate-950/40 p-1.5 rounded-md">
                                    <span className="text-slate-200">"{ccq.q}"</span>
                                    <span className="font-mono font-bold text-emerald-400 shrink-0">➔ {ccq.a}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 3 Golden Rules Footer Card */}
                  <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">💡 CCQ Oltin Qoidasi:</span>
                      <span>1) Qisqa javob (Yes/No) bo'lsin. 2) Yangi grammatik atamani savolda ishlatmang.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 1: Attention Chime & Coin Flipper */}
          {activeTab === 'tools' && (
          <div className="space-y-4 my-2">
            {/* Attention Chime Card */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/30 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl transition-all ${
                    isChiming
                      ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg shadow-amber-500/50'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  <Bell className={`w-6 h-6 ${isChiming ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Sinf Diqqat Qo'ng'irog'i (Attention Chime)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Baqirmasdan butun sinf e'tiborini doskaga qaratish uchun sokin kristal ovoz
                  </p>
                </div>
              </div>

              <button
                onClick={playAttentionChime}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition flex items-center gap-1.5 shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>Jaranglatish</span>
              </button>
            </div>

            {/* Coin Flipper for Pair Work (Student A vs Student B) */}
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <CircleDot className="w-4 h-4 text-indigo-400" />
                  <span>Juftlikda Kim Boshlaydi? (Qura tashlash)</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Student A yoki B</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={coinLabelA}
                  onChange={(e) => setCoinLabelA(e.target.value)}
                  placeholder="Student A"
                  className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-hidden"
                />
                <input
                  type="text"
                  value={coinLabelB}
                  onChange={(e) => setCoinLabelB(e.target.value)}
                  placeholder="Student B"
                  className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              {/* Coin flip box */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-lg transition-transform duration-300 ${
                      isFlippingCoin
                        ? 'animate-spin border-amber-400 bg-amber-500/20 text-amber-300'
                        : coinResult === 'A'
                        ? 'bg-blue-600 border-blue-400 text-white scale-105'
                        : coinResult === 'B'
                        ? 'bg-purple-600 border-purple-400 text-white scale-105'
                        : 'bg-slate-700 border-slate-600 text-slate-400'
                    }`}
                  >
                    {isFlippingCoin ? '?' : coinResult || 'A/B'}
                  </div>

                  <div>
                    <div className="text-xs text-slate-400">Natija:</div>
                    <div className="text-sm font-bold text-white">
                      {isFlippingCoin
                        ? 'Tashlanmoqda...'
                        : coinResult === 'A'
                        ? `🎉 ${coinLabelA}`
                        : coinResult === 'B'
                        ? `🎉 ${coinLabelB}`
                        : 'Qura tashlang'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={flipCoin}
                  disabled={isFlippingCoin}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition"
                >
                  Tanga Tashlash
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Traffic Light Comprehension Poll */}
        {activeTab === 'traffic' && (
          <div className="space-y-4 my-2">
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Svetofor: Darsni Tushunish Darajasi (Comprehension Check)
                  </h4>
                  <p className="text-xs text-slate-400">
                    O'quvchilardan qo'l ko'tarishni so'rab, tushunganlik darajasini qayd qiling
                  </p>
                </div>
                {totalTraffic > 0 && (
                  <button
                    onClick={resetTraffic}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                    title="Qayta o'rnatish"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Traffic light voting buttons */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                {/* Green */}
                <button
                  onClick={() => setGreenCount((c) => c + 1)}
                  className="flex flex-col items-center p-3 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 hover:bg-emerald-900/40 active:scale-[0.96] transition-transform duration-150 text-center shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold mb-1.5 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-black text-emerald-300">Tushunarli</span>
                  <span className="text-[10px] text-emerald-400/80 mt-0.5">I got it!</span>
                  <span className="mt-2 text-xl font-black font-mono tabular-nums text-white">
                    {greenCount} {totalTraffic > 0 && `(${greenPct}%)`}
                  </span>
                </button>

                {/* Yellow */}
                <button
                  onClick={() => setYellowCount((c) => c + 1)}
                  className="flex flex-col items-center p-3 rounded-2xl bg-amber-950/40 border-2 border-amber-500/50 hover:bg-amber-900/40 active:scale-[0.96] transition-transform duration-150 text-center shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold mb-1.5 shadow-sm">
                    <HelpCircle className="w-5 h-5 text-slate-950" />
                  </div>
                  <span className="text-xs font-black text-amber-300">Savolim bor</span>
                  <span className="text-[10px] text-amber-400/80 mt-0.5">A bit unsure</span>
                  <span className="mt-2 text-xl font-black font-mono tabular-nums text-white">
                    {yellowCount} {totalTraffic > 0 && `(${yellowPct}%)`}
                  </span>
                </button>

                {/* Red */}
                <button
                  onClick={() => setRedCount((c) => c + 1)}
                  className="flex flex-col items-center p-3 rounded-2xl bg-rose-950/40 border-2 border-rose-500/50 hover:bg-rose-900/40 active:scale-[0.96] transition-transform duration-150 text-center shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold mb-1.5 shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-rose-300">Qaytaraylik</span>
                  <span className="text-[10px] text-rose-400/80 mt-0.5">Need review</span>
                  <span className="mt-2 text-xl font-black font-mono tabular-nums text-white">
                    {redCount} {totalTraffic > 0 && `(${redPct}%)`}
                  </span>
                </button>
              </div>

              {/* Visual Multi-bar progress */}
              {totalTraffic > 0 && (
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex mt-2 border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 transition-[width] duration-300 ease-out"
                    style={{ width: `${greenPct}%` }}
                  />
                  <div
                    className="h-full bg-amber-500 transition-[width] duration-300 ease-out"
                    style={{ width: `${yellowPct}%` }}
                  />
                  <div
                    className="h-full bg-rose-500 transition-[width] duration-300 ease-out"
                    style={{ width: `${redPct}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Dice & Translation Curtain */}
        {activeTab === 'dice' && (
          <div className="space-y-4 my-2">
            {/* Classroom Dice */}
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700/70 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-lg border border-indigo-400/40 transition-transform ${
                    isRollingDice ? 'animate-spin' : ''
                  }`}
                >
                  {diceNumber}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sinf Zari (Classroom Dice 1-6)</h4>
                  <p className="text-xs text-slate-400">
                    Doskadagi savol yoki mashq raqamini tasodifiy tanlash uchun
                  </p>
                </div>
              </div>

              <button
                onClick={rollDice}
                disabled={isRollingDice}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center gap-1.5"
              >
                <Dices className="w-4 h-4" />
                <span>Zar Tashlash</span>
              </button>
            </div>

            {/* Translation Curtain Toggle */}
            <div className="rounded-2xl bg-gradient-to-r from-sky-950/40 to-slate-900 border border-sky-500/30 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400">
                  {isTranslationCurtainActive ? (
                    <EyeOff className="w-6 h-6 text-amber-400" />
                  ) : (
                    <Eye className="w-6 h-6 text-sky-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">
                      Lug'at Pardasi (Translation Curtain)
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isTranslationCurtainActive
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isTranslationCurtainActive ? 'YASHIRILGAN' : 'OCHIQ'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    O'quvchilar xotirasini faollashtirish uchun o'zbekcha tarjimalarni yashirish
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleTranslationCurtain()}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition active:scale-95 shadow-md flex items-center gap-1.5 ${
                  isTranslationCurtainActive
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
                }`}
              >
                {isTranslationCurtainActive ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Tarjimani Ko'rsatish</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Tarjimani Yashirish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[11px] text-slate-400">
          <span>
            💡 <em>Maslahat:</em> Dars boshida Til Sindirish va Hot Seat orqali o'quvchilar nutq apparatini qizdiring.
          </span>
          <button
            onClick={() => togglePedagogyModal(false)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-[0.96]"
          >
            Yopish (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
