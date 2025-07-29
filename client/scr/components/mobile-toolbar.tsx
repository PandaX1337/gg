import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PaintbrushVertical, Eraser, Shapes, Undo, Redo, Palette } from "lucide-react";

interface MobileToolbarProps {
  selectedTool: 'brush' | 'eraser';
  selectedColor: string;
  brushSize: number;
  onToolChange: (tool: 'brush' | 'eraser') => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const colorPalette = [
  '#000000', '#374151', '#EF4444', '#6366F1', '#10B981', '#F59E0B',
  '#EC4899', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#FFFFFF',
];

export function MobileToolbar({
  selectedTool,
  selectedColor,
  brushSize,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: MobileToolbarProps) {
  const [customColor, setCustomColor] = useState(selectedColor);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Drawing Tools */}
        <div className="flex items-center space-x-3">
          <Button
            variant={selectedTool === 'brush' ? 'default' : 'ghost'}
            size="sm"
            className="w-12 h-12 p-0 rounded-xl"
            onClick={() => onToolChange('brush')}
          >
            <PaintbrushVertical className="h-5 w-5" />
          </Button>
          <Button
            variant={selectedTool === 'eraser' ? 'default' : 'ghost'}
            size="sm"
            className="w-12 h-12 p-0 rounded-xl"
            onClick={() => onToolChange('eraser')}
          >
            <Eraser className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 rounded-xl"
            disabled
          >
            <Shapes className="h-5 w-5" />
          </Button>
        </div>

        {/* Color and Size */}
        <div className="flex items-center space-x-3">
          {/* Color Picker Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 rounded-xl border-2 border-gray-300"
                style={{ backgroundColor: selectedColor }}
              >
                {selectedColor === '#FFFFFF' && <Palette className="h-4 w-4 text-gray-600" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle>Choose Color</SheetTitle>
              </SheetHeader>
              
              <div className="py-6">
                {/* Color Grid */}
                <div className="grid grid-cols-6 gap-3 mb-6">
                  {colorPalette.map((color) => (
                    <Button
                      key={color}
                      variant="ghost"
                      size="sm"
                      className={`w-12 h-12 p-0 rounded-2xl border border-gray-200 hover:scale-110 transition-transform ${
                        selectedColor === color ? 'ring-2 ring-blue-600' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => onColorChange(color)}
                    >
                      {color === '#FFFFFF' && <Palette className="h-4 w-4 text-gray-600" />}
                    </Button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Color</label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="color" 
                      value={customColor}
                      onChange={handleCustomColorChange}
                      className="w-16 h-12 rounded-xl border border-gray-300 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          onColorChange(e.target.value);
                        }
                      }}
                      placeholder="#000000"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Brush Size Slider */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <Slider
              value={[brushSize]}
              onValueChange={(value) => onBrushSizeChange(value[0])}
              max={20}
              min={1}
              step={1}
              className="w-16"
            />
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
