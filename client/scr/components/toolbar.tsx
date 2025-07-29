import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PaintbrushVertical, Eraser, Shapes, Type, Undo, Redo } from "lucide-react";

interface ToolbarProps {
  selectedTool: 'brush' | 'eraser';
  brushSize: number;
  onToolChange: (tool: 'brush' | 'eraser') => void;
  onBrushSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({
  selectedTool,
  brushSize,
  onToolChange,
  onBrushSizeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const brushSizes = [2, 4, 8, 12];

  return (
    <aside className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 space-y-3 w-16">
        {/* Drawing Tools */}
        <div className="space-y-2">
          <Button
            variant={selectedTool === 'brush' ? 'default' : 'ghost'}
            size="sm"
            className="w-10 h-10 p-0 rounded-xl"
            onClick={() => onToolChange('brush')}
          >
            <PaintbrushVertical className="h-4 w-4" />
          </Button>

          <Button
            variant={selectedTool === 'eraser' ? 'default' : 'ghost'}
            size="sm"
            className="w-10 h-10 p-0 rounded-xl"
            onClick={() => onToolChange('eraser')}
          >
            <Eraser className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-xl"
            disabled
          >
            <Shapes className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-xl"
            disabled
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Brush Size */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 text-center">Size</div>
          <div className="flex flex-col space-y-1">
            {brushSizes.map((size) => (
              <Button
                key={size}
                variant={brushSize === size ? 'default' : 'ghost'}
                size="sm"
                className="w-10 h-8 p-0 rounded-lg"
                onClick={() => onBrushSizeChange(size)}
              >
                <div 
                  className={`rounded-full ${
                    brushSize === size ? 'bg-white' : 'bg-gray-700'
                  }`}
                  style={{
                    width: Math.min(size * 2, 16),
                    height: Math.min(size * 2, 16),
                  }}
                />
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Undo/Redo */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-xl"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-xl"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
