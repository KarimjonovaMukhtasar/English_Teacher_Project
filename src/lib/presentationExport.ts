import type { Lesson, SlideItem } from '../types/index.ts';

type ExportColumn = {
  title: string;
  badge?: string;
  points: string[];
};

export type PowerPointExportSlide = {
  number: number;
  title: string;
  eyebrow?: string;
  body: string[];
  columns?: [ExportColumn, ExportColumn];
  imageUrl?: string;
  imageAlt?: string;
  teacherNotes?: string;
};

export type PowerPointExportPlan = {
  title: string;
  slides: PowerPointExportSlide[];
};

const WIDE_HEIGHT = 7.5;
const PRIMARY = '0891B2';
const DEEP = '164E63';
const CYAN = '67E8F9';
const INK = '12343B';
const MUTED = '4C6B73';
const SURFACE = 'ECFEFF';

const cleanLine = (value: string | undefined) => value?.trim() || '';

const nonEmptyLines = (lines: Array<string | undefined>) =>
  lines.map(cleanLine).filter(Boolean);

const exportSlideFrom = (slide: SlideItem, number: number): PowerPointExportSlide => {
  switch (slide.content.type) {
    case 'blank': {
      const { heading, subheading, paragraphs, imageUrl, imageAlt } = slide.content.data;
      return {
        number,
        title: cleanLine(heading) || slide.title,
        eyebrow: cleanLine(subheading),
        body: nonEmptyLines(paragraphs),
        imageUrl,
        imageAlt,
        teacherNotes: cleanLine(slide.speakerNotes),
      };
    }
    case 'vocabulary-card': {
      const { word, phonetic, partOfSpeech, definition, translation, exampleSentence, imageUrl } = slide.content.data;
      return {
        number,
        title: `Vocabulary: ${word}`,
        eyebrow: nonEmptyLines([phonetic, partOfSpeech]).join(', '),
        body: nonEmptyLines([
          `Meaning: ${definition}`,
          `Uzbek: ${translation}`,
          `Example: ${exampleSentence}`,
        ]),
        imageUrl,
        imageAlt: `Medical vocabulary illustration for ${word}`,
        teacherNotes: cleanLine(slide.speakerNotes),
      };
    }
    case 'grammar-box': {
      const { ruleTitle, explanation, formula, examples, note } = slide.content.data;
      return {
        number,
        title: cleanLine(ruleTitle) || slide.title,
        eyebrow: 'Grammar focus',
        body: nonEmptyLines([
          explanation,
          ...formula.map((part) => `${part.label}: ${part.text}`),
          ...examples.map((example) => `Example: ${example.sentence}${example.translation ? ` (${example.translation})` : ''}`),
          note ? `Teacher note: ${note}` : '',
        ]),
        teacherNotes: cleanLine(slide.speakerNotes),
      };
    }
    case 'click-to-reveal': {
      const { question, hint, hiddenAnswer, explanation, badge } = slide.content.data;
      return {
        number,
        title: slide.title,
        eyebrow: cleanLine(badge),
        body: nonEmptyLines([
          `Question: ${question}`,
          hint ? `Hint: ${hint}` : '',
          'Teacher-controlled answer: reveal it in Tilchi Presenter or teacher notes.',
        ]),
        teacherNotes: cleanLine(slide.speakerNotes),
      };
    }
    case 'two-column': {
      const { leftTitle, leftBadge, leftPoints, rightTitle, rightBadge, rightPoints } = slide.content.data;
      return {
        number,
        title: slide.title,
        body: [],
        columns: [
          { title: leftTitle, badge: leftBadge, points: nonEmptyLines(leftPoints) },
          { title: rightTitle, badge: rightBadge, points: nonEmptyLines(rightPoints) },
        ],
        teacherNotes: cleanLine(slide.speakerNotes),
      };
    }
  }
};

export function buildPowerPointExportPlan(lesson: Lesson): PowerPointExportPlan {
  const slides = [...(lesson.slides || [])]
    .sort((first, second) => first.order - second.order)
    .map((slide, index) => exportSlideFrom(slide, index + 1));

  return {
    title: lesson.title,
    slides,
  };
}

export function presentationFileName(lesson: Lesson): string {
  const title = lesson.title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  const lessonId = lesson.id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${title || 'tilchi-presentation'}-${lessonId || 'lesson'}.pptx`;
}

const bodyFontSize = (body: string[]) => {
  const longestLine = Math.max(0, ...body.map((line) => line.length));
  if (longestLine > 220 || body.length > 7) return 13;
  if (longestLine > 150 || body.length > 5) return 14;
  return 16;
};

const bulletText = (points: string[]) => points.map((point) => `• ${point}`).join('\n\n');

const addHeader = (
  slide: any,
  lessonTitle: string,
  exportedSlide: PowerPointExportSlide,
  totalSlides: number,
) => {
  slide.addText('TILCHI MEDICAL ENGLISH', {
    x: 0.65,
    y: 0.35,
    w: 4.2,
    h: 0.2,
    fontFace: 'Aptos Display',
    fontSize: 9,
    bold: true,
    color: CYAN,
    charSpace: 1.2,
    margin: 0,
  });
  slide.addText(lessonTitle, {
    x: 0.65,
    y: 0.62,
    w: 8.8,
    h: 0.24,
    fontFace: 'Aptos',
    fontSize: 10,
    color: 'E7F7F4',
    margin: 0,
  });
  slide.addText(`${exportedSlide.number} / ${totalSlides}`, {
    x: 11.8,
    y: 0.44,
    w: 0.9,
    h: 0.2,
    align: 'right',
    fontFace: 'Aptos',
    fontSize: 10,
    color: 'E7F7F4',
    margin: 0,
  });
};

const addStandardSlideContent = (
  slide: any,
  exportedSlide: PowerPointExportSlide,
  imageData?: string,
) => {
  const hasImage = Boolean(imageData);
  slide.addShape('roundRect', {
    x: 0.55,
    y: 1.02,
    w: 12.23,
    h: 5.95,
    rectRadius: 0.08,
    fill: { color: 'FFFFFF' },
    line: { color: 'B7D9D4', transparency: 25 },
  });
  slide.addShape('rect', {
    x: 0.55,
    y: 1.02,
    w: 0.12,
    h: 5.95,
    fill: { color: PRIMARY },
    line: { color: PRIMARY },
  });
  slide.addText(exportedSlide.title, {
    x: 0.65,
    y: 1.15,
    w: 12,
    h: 0.55,
    fontFace: 'Aptos Display',
    fontSize: 27,
    bold: true,
    color: INK,
    margin: 0,
    breakLine: false,
    fit: 'shrink',
  });

  const contentTop = exportedSlide.eyebrow ? 2.15 : 1.95;
  if (exportedSlide.eyebrow) {
    slide.addText(exportedSlide.eyebrow, {
      x: 0.65,
      y: 1.83,
      w: 12,
      h: 0.25,
      fontFace: 'Aptos',
      fontSize: 12,
      bold: true,
      color: PRIMARY,
      margin: 0,
      fit: 'shrink',
    });
  }

  slide.addText(bulletText(exportedSlide.body), {
    x: 0.8,
    y: contentTop,
    w: hasImage ? 7.25 : 11.75,
    h: 4.45,
    fontFace: 'Aptos',
    fontSize: bodyFontSize(exportedSlide.body),
    color: INK,
    breakLine: false,
    breakLineOnOverflow: false,
    valign: 'top',
    paraSpaceAfterPt: 9,
    margin: 0.04,
    fit: 'shrink',
  });

  if (imageData) {
    slide.addShape('roundRect', {
      x: 8.35,
      y: 2.02,
      w: 3.95,
      h: 3.15,
      rectRadius: 0.08,
      fill: { color: SURFACE },
      line: { color: 'A5E4EA' },
    });
    slide.addImage({
      data: imageData,
      x: 8.43,
      y: 2.1,
      w: 3.79,
      h: 2.99,
      sizing: { type: 'contain', x: 8.43, y: 2.1, w: 3.79, h: 2.99 },
      altText: exportedSlide.imageAlt || 'Medical lesson illustration',
    });
  }
};

const addTwoColumnSlideContent = (slide: any, exportedSlide: PowerPointExportSlide) => {
  const columns = exportedSlide.columns;
  if (!columns) return;

  slide.addText(exportedSlide.title, {
    x: 0.65,
    y: 1.15,
    w: 12,
    h: 0.55,
    fontFace: 'Aptos Display',
    fontSize: 27,
    bold: true,
    color: INK,
    margin: 0,
    fit: 'shrink',
  });

  columns.forEach((column, index) => {
    const x = index === 0 ? 0.75 : 6.95;
    slide.addShape('roundRect', {
      x: x - 0.15,
      y: 1.82,
      w: 5.75,
      h: 4.95,
      rectRadius: 0.08,
      fill: { color: index === 0 ? 'FFFFFF' : DEEP },
      line: { color: index === 0 ? 'B7D9D4' : DEEP },
    });
    slide.addText(column.title, {
      x,
      y: 2.05,
      w: 5.55,
      h: 0.3,
      fontFace: 'Aptos Display',
      fontSize: 18,
      bold: true,
      color: index === 0 ? PRIMARY : 'FFFFFF',
      margin: 0,
      fit: 'shrink',
    });
    if (column.badge) {
      slide.addText(column.badge, {
        x,
        y: 2.42,
        w: 5.55,
        h: 0.2,
        fontFace: 'Aptos',
        fontSize: 10,
        bold: true,
        color: index === 0 ? MUTED : CYAN,
        margin: 0,
        fit: 'shrink',
      });
    }
    slide.addText(bulletText(column.points), {
      x,
      y: 2.85,
      w: 5.55,
      h: 3.75,
      fontFace: 'Aptos',
      fontSize: bodyFontSize(column.points),
      color: index === 0 ? INK : 'F4FFFD',
      valign: 'top',
      paraSpaceAfterPt: 8,
      margin: 0.04,
      fit: 'shrink',
    });
  });
};

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error || new Error('Rasmni o‘qib bo‘lmadi.'));
  reader.readAsDataURL(blob);
});

const webpToJpegDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const sourceUrl = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const maxWidth = 1600;
    const scale = Math.min(1, maxWidth / image.naturalWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error('Rasmni PowerPoint formatiga tayyorlab bo‘lmadi.'));
      return;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(sourceUrl);
    resolve(canvas.toDataURL('image/jpeg', 0.9));
  };
  image.onerror = () => {
    URL.revokeObjectURL(sourceUrl);
    reject(new Error('WebP rasmni PowerPoint formatiga o‘tkazib bo‘lmadi.'));
  };
  image.src = sourceUrl;
});

const loadPresentationImages = async (plan: PowerPointExportPlan) => {
  const urls = [...new Set(plan.slides.map((slide) => slide.imageUrl).filter((url): url is string => Boolean(url)))];
  const imageData = new Map<string, string>();

  await Promise.all(urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const dataUrl = blob.type === 'image/webp'
        ? await webpToJpegDataUrl(blob)
        : await blobToDataUrl(blob);
      imageData.set(url, dataUrl);
    } catch (error) {
      console.warn(`PowerPoint rasmi yuklanmadi: ${url}`, error);
    }
  }));

  return imageData;
};

export async function downloadLessonPowerPoint(lesson: Lesson): Promise<string> {
  const plan = buildPowerPointExportPlan(lesson);
  if (plan.slides.length === 0) {
    throw new Error('Bu darsda yuklab olinadigan slaydlar yo‘q.');
  }

  const { default: PptxGenJS } = await import('pptxgenjs');
  const imageData = await loadPresentationImages(plan);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Tilchi.uz';
  pptx.company = 'Tilchi.uz';
  pptx.subject = 'Medical English lesson presentation';
  pptx.title = lesson.title;

  plan.slides.forEach((exportedSlide) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'E6F7FA' };
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.96,
      fill: { color: DEEP },
      line: { color: DEEP },
    });
    addHeader(slide, plan.title, exportedSlide, plan.slides.length);
    if (exportedSlide.columns) {
      addTwoColumnSlideContent(slide, exportedSlide);
    } else {
      addStandardSlideContent(
        slide,
        exportedSlide,
        exportedSlide.imageUrl ? imageData.get(exportedSlide.imageUrl) : undefined,
      );
    }
    if (exportedSlide.teacherNotes) {
      slide.addNotes(exportedSlide.teacherNotes);
    }
    slide.addText('Tahrirlanadigan o‘qituvchi nusxasi', {
      x: 0.65,
      y: WIDE_HEIGHT - 0.48,
      w: 4,
      h: 0.16,
      fontFace: 'Aptos',
      fontSize: 8,
      color: MUTED,
      margin: 0,
    });
  });

  const fileName = presentationFileName(lesson);
  await pptx.writeFile({ fileName });
  return fileName;
}
