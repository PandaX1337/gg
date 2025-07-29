import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Palette, Eraser, Trash2, Home, Share } from "lucide-react";
import { useLocation } from "wouter";

export default function RoomSimple() {
  const { id: roomId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Canvas refs and state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<'brush' | 'eraser'>('brush');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [brushSize, setBrushSize] = useState(4);
  
  // Room data
  const { data: room, isLoading } = useQuery({
    queryKey: ["/api/rooms", roomId],
    enabled: !!roomId,
  });

  // Simple functions for canvas operations
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    toast({
      title: "Холст очищен",
      description: "Все рисунки удалены",
    });
  };

  const shareRoom = async () => {
    if (!room) return;
    
    const shareUrl = `${window.location.origin}/room/${room?.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Ссылка скопирована!",
        description: "Поделитесь этой ссылкой с друзьями для совместного рисования",
      });
    } catch (error) {
      toast({
        title: "Не удалось скопировать ссылку",
        description: "Скопируйте URL из адресной строки браузера",
        variant: "destructive",
      });
    }
  };

  const goHome = () => {
    setLocation("/");
  };

  // Initialize canvas with proper drawing setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to fill container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Fill with white background
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Simple drawing based on your HTML example
    let drawing = false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial drawing properties
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const startDrawing = (e: MouseEvent) => {
      drawing = true;
      ctx.beginPath();
      
      // Set tool properties
      if (selectedTool === 'brush') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = brushSize;
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize * 2;
      }
      
      ctx.moveTo(e.offsetX, e.offsetY);
    };

    const draw = (e: MouseEvent) => {
      if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }
    };

    const stopDrawing = () => {
      drawing = false;
      ctx.closePath();
    };

    // Touch support
    const startDrawingTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      drawing = true;
      ctx.beginPath();
      
      if (selectedTool === 'brush') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = brushSize;
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize * 2;
      }
      
      ctx.moveTo(x, y);
    };

    const drawTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (!drawing) return;
      
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawingTouch = (e: TouchEvent) => {
      e.preventDefault();
      drawing = false;
      ctx.closePath();
    };

    // Add event listeners exactly like your HTML example
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', startDrawingTouch);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('touchend', stopDrawingTouch);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawingTouch);
      canvas.removeEventListener('touchmove', drawTouch);
      canvas.removeEventListener('touchend', stopDrawingTouch);
    };
  }, [selectedTool, selectedColor, brushSize, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-64 w-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Комната не найдена</h1>
          <p className="text-gray-600 mb-4">Комната, которую вы ищете, не существует.</p>
          <Button onClick={goHome}>На главную</Button>
        </div>
      </div>
    );
  }

  const colors = [
    '#6366F1', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">CollabDraw</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Комната: {room.name}</span>
              </div>

              <Button onClick={shareRoom} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Share className="text-sm mr-2" />
                Поделиться
              </Button>

              <Button onClick={goHome} variant="outline" className="px-4 py-2">
                <Home className="text-sm mr-2" />
                На главную
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Room Info */}
        <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Комната: {room.name}</span>
          </div>
        </div>
      </header>

      {/* Main drawing area */}
      <main className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair bg-white border border-gray-300 shadow-sm"
          style={{ touchAction: 'none' }}
        />

        {/* Toolbar */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-3">
          {/* Tool Selection */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={selectedTool === 'brush' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('brush')}
            >
              <Palette className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={selectedTool === 'eraser' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('eraser')}
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>

          {/* Brush Size */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Размер: {brushSize}px</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-lg border-2 ${
                  selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={clearCanvas}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}