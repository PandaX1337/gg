import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colorPalette = [
  '#000000', '#EF4444', '#6366F1', '#10B981',
  '#F59E0B', '#EC4899', '#8B5CF6', '#FFFFFF',
];

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 w-20">
        <div className="text-xs text-gray-500 text-center mb-3">Colors</div>
        
        {/* Current Color Display */}
        <div 
          className="w-12 h-12 rounded-xl border-2 border-gray-300 mb-3 mx-auto"
          style={{ backgroundColor: selectedColor }}
        />

        {/* Color Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {colorPalette.map((color) => (
            <Button
              key={color}
              variant="ghost"
              size="sm"
              className={`w-6 h-6 p-0 rounded-lg border border-gray-200 hover:scale-110 transition-transform ${
                selectedColor === color ? 'ring-2 ring-blue-600' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>

        {/* Custom Color Picker */}
        <input
          type="color"
          value={customColor}
          onChange={handleCustomColorChange}
          className="w-full h-8 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-lg border border-gray-300 cursor-pointer"
          style={{ appearance: 'none', backgroundColor: 'transparent' }}
        />
      </div>
    </div>
  );
}
