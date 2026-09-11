import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { addFullscreenChangeListener } from '@/lib/fullscreen';

export interface StrokePoint {
  x: number;
  y: number;
}

export interface CanvasStroke {
  id: string;
  tool: 'pen' | 'highlighter';
  color: string;
  size: number;
  points: StrokePoint[];
}

// Distance from point to line segment
function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

export const AnnotationCanvas: React.FC = () => {
  const activeTool = usePresentationStore((s) => s.activeTool);
  const penColor = usePresentationStore((s) => s.penColor);
  const penSize = usePresentationStore((s) => s.penSize);
  const highlighterColor = usePresentationStore((s) => s.highlighterColor);
  const highlighterSize = usePresentationStore((s) => s.highlighterSize);
  const currentSlideIndex = usePresentationStore((s) => s.currentSlideIndex);
  const clearCanvasTrigger = usePresentationStore((s) => s.clearCanvasTrigger);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const strokesRef = useRef<CanvasStroke[]>([]);
  const currentStrokeRef = useRef<CanvasStroke | null>(null);
  const isInteractingRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  // For eraser cursor preview
  const [eraserPos, setEraserPos] = useState<{ x: number; y: number } | null>(null);
  const ERASER_RADIUS = 16;

  // Render all strokes with smooth curves at 60 FPS
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Reset transform to identity and clear entire buffer
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reapply DPR scaling
    ctx.scale(dpr, dpr);

    const drawSingleStroke = (stroke: CanvasStroke) => {
      const pts = stroke.points;
      if (pts.length === 0) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.size;

      if (stroke.tool === 'highlighter') {
        // High-end realistic translucent highlighter
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = stroke.color;
      } else {
        // Crisp pen stroke
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = stroke.color;
      }

      ctx.beginPath();
      if (pts.length === 1) {
        ctx.fillStyle = stroke.color;
        ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const midX = (pts[i].x + pts[i + 1].x) / 2;
          const midY = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw completed strokes
    for (const stroke of strokesRef.current) {
      drawSingleStroke(stroke);
    }

    // Draw in-progress stroke
    if (currentStrokeRef.current) {
      drawSingleStroke(currentStrokeRef.current);
    }
  }, []);

  const scheduleRender = useCallback(() => {
    if (animFrameIdRef.current !== null) return;
    animFrameIdRef.current = requestAnimationFrame(() => {
      animFrameIdRef.current = null;
      renderCanvas();
    });
  }, [renderCanvas]);

  // Adjust canvas size to parent container with DPI scaling
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const targetWidth = Math.max(1, Math.floor(rect.width * dpr));
    const targetHeight = Math.max(1, Math.floor(rect.height * dpr));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      renderCanvas();
    }
  }, [renderCanvas]);

  useEffect(() => {
    resizeCanvas();
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);

    const cleanupFullscreen = addFullscreenChangeListener(() => {
      resizeCanvas();
    });

    window.addEventListener('resize', resizeCanvas);
    return () => {
      resizeObserver.disconnect();
      cleanupFullscreen();
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [resizeCanvas]);

  // Clears drawing automatically when currentSlideIndex changes (doska effekti)
  useEffect(() => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    renderCanvas();
  }, [currentSlideIndex, renderCanvas]);

  // Clear when toolbar trigger fires
  useEffect(() => {
    if (clearCanvasTrigger > 0) {
      strokesRef.current = [];
      currentStrokeRef.current = null;
      renderCanvas();
    }
  }, [clearCanvasTrigger, renderCanvas]);

  // Check and erase strokes touched by (px, py)
  const eraseAt = useCallback(
    (px: number, py: number) => {
      let erasedAny = false;
      const threshold = ERASER_RADIUS;

      const remainingStrokes = strokesRef.current.filter((stroke) => {
        const pts = stroke.points;
        if (pts.length === 1) {
          const dist = Math.hypot(px - pts[0].x, py - pts[0].y);
          if (dist <= threshold + stroke.size / 2) {
            erasedAny = true;
            return false;
          }
          return true;
        }

        for (let i = 0; i < pts.length - 1; i++) {
          const dist = distanceToSegment(
            px,
            py,
            pts[i].x,
            pts[i].y,
            pts[i + 1].x,
            pts[i + 1].y
          );
          if (dist <= threshold + stroke.size / 2) {
            erasedAny = true;
            return false;
          }
        }
        return true;
      });

      if (erasedAny) {
        strokesRef.current = remainingStrokes;
        scheduleRender();
      }
    },
    [scheduleRender]
  );

  // Pointer event handlers with accurate CSS scaling
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'pen' && activeTool !== 'highlighter' && activeTool !== 'eraser') {
      return;
    }

    // Only respond to primary button (left click / touch / pen tip)
    if (e.button !== 0) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if capture unsupported
    }

    isInteractingRef.current = true;
    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      currentStrokeRef.current = {
        id: Math.random().toString(36).slice(2, 10),
        tool: activeTool,
        color: activeTool === 'pen' ? penColor : highlighterColor,
        size: activeTool === 'pen' ? penSize : highlighterSize,
        points: [{ x, y }]
      };
      scheduleRender();
    } else if (activeTool === 'eraser') {
      setEraserPos({ x, y });
      eraseAt(x, y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'eraser') {
      setEraserPos({ x, y });
    }

    if (!isInteractingRef.current) return;

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      if (currentStrokeRef.current) {
        const pts = currentStrokeRef.current.points;
        const lastPt = pts[pts.length - 1];
        // Skip tiny micro-jitter for smoother paths and high framerates
        if (!lastPt || Math.hypot(x - lastPt.x, y - lastPt.y) > 1.5) {
          pts.push({ x, y });
          scheduleRender();
        }
      }
    } else if (activeTool === 'eraser') {
      eraseAt(x, y);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isInteractingRef.current) return;
    isInteractingRef.current = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }

    if (currentStrokeRef.current) {
      if (currentStrokeRef.current.points.length > 0) {
        strokesRef.current.push(currentStrokeRef.current);
      }
      currentStrokeRef.current = null;
      scheduleRender();
    }
  };

  const handlePointerLeave = () => {
    if (activeTool === 'eraser') {
      setEraserPos(null);
    }
    if (isInteractingRef.current && (activeTool === 'pen' || activeTool === 'highlighter')) {
      if (currentStrokeRef.current) {
        if (currentStrokeRef.current.points.length > 0) {
          strokesRef.current.push(currentStrokeRef.current);
        }
        currentStrokeRef.current = null;
        scheduleRender();
      }
      isInteractingRef.current = false;
    }
  };

  const isDrawingTool =
    activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser';

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 select-none overflow-hidden ${
        isDrawingTool ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        zIndex: 30
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={`w-full h-full block touch-none ${
          activeTool === 'pen' || activeTool === 'highlighter'
            ? 'cursor-crosshair'
            : activeTool === 'eraser'
            ? 'cursor-none'
            : 'cursor-default'
        }`}
      />

      {/* Floating custom eraser radius outline */}
      {activeTool === 'eraser' && eraserPos && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-700 bg-white/40 shadow-sm backdrop-blur-xs transition-transform duration-75 ease-out"
          style={{
            left: eraserPos.x,
            top: eraserPos.y,
            width: ERASER_RADIUS * 2,
            height: ERASER_RADIUS * 2
          }}
        />
      )}
    </div>
  );
};
