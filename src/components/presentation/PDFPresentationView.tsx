import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { addFullscreenChangeListener } from '@/lib/fullscreen';

// Set local bundled worker source for 100% offline PWA support
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFPresentationViewProps {
  pdfDataUrl: string;
  currentPage: number;
  onPageCountLoaded?: (count: number) => void;
}

export const PDFPresentationView: React.FC<PDFPresentationViewProps> = ({
  pdfDataUrl,
  currentPage,
  onPageCountLoaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? Math.max(400, window.innerHeight - 84) : 1000,
  });

  // Listen for resize and fullscreen changes to re-render PDF crisply
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        w: window.innerWidth,
        h: Math.max(400, window.innerHeight - 84),
      });
    };
    window.addEventListener('resize', handleResize);
    const cleanupFs = addFullscreenChangeListener(handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanupFs();
    };
  }, []);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument(pdfDataUrl);
    loadingTask.promise
      .then((loadedDoc) => {
        if (!isCancelled) {
          setPdfDoc(loadedDoc);
          setIsLoading(false);
          if (onPageCountLoaded) {
            onPageCountLoaded(loadedDoc.numPages);
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Failed to load PDF:', err);
          setError('PDF faylni yuklashda xatolik yuz berdi. Iltimos qayta tekshiring.');
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [pdfDataUrl]);

  // Render Page to Canvas with concurrency cancellation protection
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;
    let renderTask: any = null;

    pdfDoc
      .getPage(currentPage)
      .then((page: any) => {
        if (isCancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Calculate viewport to fit screen while preserving 16:9 or native aspect ratio
        const unscaledViewport = page.getViewport({ scale: 1 });
        const containerWidth = window.innerWidth;
        const containerHeight = Math.max(400, window.innerHeight - 84);

        const scaleX = containerWidth / unscaledViewport.width;
        const scaleY = containerHeight / unscaledViewport.height;
        const baseScale = Math.min(scaleX, scaleY) * 0.96; // slightly inset for aesthetic breathing room

        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: baseScale * dpr });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        return renderTask.promise.catch((err: any) => {
          if (err?.name !== 'RenderingCancelledException') {
            console.warn('PDF render warning:', err);
          }
        });
      })
      .catch((err: any) => {
        if (!isCancelled) {
          console.warn('Failed to load page:', err);
        }
      });

    return () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, currentPage, viewportSize]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-300">PDF Taqdimot yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-950 text-rose-400 p-8 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`PDF Taqdimot Slaydi — Sahifa ${currentPage} / ${pdfDoc.numPages}`}
        className="rounded-2xl shadow-2xl transition-transform duration-200"
      />
    </div>
  );
};
