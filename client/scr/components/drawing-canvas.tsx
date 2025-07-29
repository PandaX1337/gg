import { useRef, useEffect, useCallback } from "react";
import { DrawingStroke, CollaborativeUser, DrawingPoint } from "@shared/schema";
import { drawStroke, getEventPosition } from "@/lib/drawing-utils";

interface DrawingCanvasProps {
  roomId: string;
  selectedTool: 'brush' | 'eraser';
  selectedColor: string;
  brushSize: number;
  strokes: DrawingStroke[];
  collaborativeUsers: CollaborativeUser[];
  onStrokeComplete?: (stroke: DrawingStroke) => void;
}

export function DrawingCanvas({
  roomId,
  selectedTool,
  selectedColor,
  brushSize,
  strokes,
  collaborativeUsers,
  onStrokeComplete,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<DrawingPoint[]>([]);

  // Redraw canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
  }, [strokes]);

  // Resize canvas to fit container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // Redraw existing strokes after resize
    strokes.forEach(stroke => {
      if (ctx) drawStroke(ctx, stroke);
    });
  }, [strokes]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    isDrawing.current = true;
    const point = getEventPosition(e, canvas);
    currentStroke.current = [point];

    // Send cursor update to other users
    // This would be handled by the drawing hook
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getEventPosition(e, canvas);
    currentStroke.current.push(point);

    // Draw current stroke locally for immediate feedback
    const ctx = canvas.getContext('2d');
    if (ctx && currentStroke.current.length > 1) {
      const lastPoint = currentStroke.current[currentStroke.current.length - 2];
      
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      
      if (selectedTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize * 2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = brushSize;
      }
      
      ctx.stroke();
    }
  }, [selectedTool, selectedColor, brushSize]);

  const stopDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;

    isDrawing.current = false;

    if (currentStroke.current.length > 0) {
      const stroke: DrawingStroke = {
        id: crypto.randomUUID(),
        points: [...currentStroke.current],
        color: selectedColor,
        size: brushSize,
        tool: selectedTool,
        timestamp: Date.now(),
      };

      // Send stroke via callback
      onStrokeComplete?.(stroke);
    }

    currentStroke.current = [];
  }, [selectedColor, brushSize, selectedTool, onStrokeComplete]);

  return (
    <div className="absolute inset-0 bg-white" style={{ top: '80px' }}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
      />

      {/* Collaborative Cursors */}
      {collaborativeUsers.map(user => (
        user.cursor && (
          <div 
            key={user.id}
            className="absolute pointer-events-none z-10"
            style={{
              left: user.cursor.x,
              top: user.cursor.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            <div className="relative">
              <div 
                className="w-4 h-4 rotate-12"
                style={{ 
                  clipPath: 'polygon(0 0, 100% 70%, 70% 100%)',
                  backgroundColor: '#EC4899'
                }}
              />
              <div className="absolute top-4 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {user.name}
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  );
}
