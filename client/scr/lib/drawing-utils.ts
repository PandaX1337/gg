import { DrawingStroke, DrawingPoint } from "@shared/schema";

export function getEventPosition(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement): DrawingPoint {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  let clientX: number;
  let clientY: number;

  if ('touches' in e) {
    // Touch event
    const touch = e.touches[0] || e.changedTouches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    // Mouse event
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: DrawingStroke) {
  if (stroke.points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

  // Draw smooth curves between points
  for (let i = 1; i < stroke.points.length - 1; i++) {
    const current = stroke.points[i];
    const next = stroke.points[i + 1];
    const controlX = (current.x + next.x) / 2;
    const controlY = (current.y + next.y) / 2;
    ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
  }

  // Draw to the last point
  const lastPoint = stroke.points[stroke.points.length - 1];
  ctx.lineTo(lastPoint.x, lastPoint.y);

  // Apply stroke properties
  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = stroke.size * 2;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

export function smoothPath(points: DrawingPoint[]): DrawingPoint[] {
  if (points.length < 3) return points;

  const smoothed = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];

    // Simple smoothing algorithm
    smoothed.push({
      x: (prev.x + current.x + next.x) / 3,
      y: (prev.y + current.y + next.y) / 3,
    });
  }

  smoothed.push(points[points.length - 1]);
  return smoothed;
}
