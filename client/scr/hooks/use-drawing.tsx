import { useState, useCallback, useRef } from "react";
import { DrawingStroke, CollaborativeUser } from "@shared/schema";

export function useDrawing(roomId: string, initialStrokes: any[] = [], sendMessage?: (message: any) => void) {
  const [selectedTool, setSelectedTool] = useState<'brush' | 'eraser'>('brush');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [brushSize, setBrushSize] = useState(4);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [collaborativeUsers, setCollaborativeUsers] = useState<CollaborativeUser[]>([]);
  const [history, setHistory] = useState<DrawingStroke[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addStroke = useCallback((stroke: DrawingStroke) => {
    setStrokes(prev => {
      const newStrokes = [...prev, stroke];
      
      // Add to history for undo/redo
      setHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(newStrokes);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
      
      return newStrokes;
    });
    
    // Send stroke via WebSocket
    if (sendMessage) {
      sendMessage({
        type: 'stroke',
        data: stroke
      });
    }
  }, [historyIndex, sendMessage]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setStrokes(history[historyIndex - 1] || []);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setStrokes(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const clearCanvas = useCallback(() => {
    setStrokes([]);
    setHistory([[]]);
    setHistoryIndex(0);
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleRemoteStroke = useCallback((stroke: DrawingStroke) => {
    setStrokes(prev => [...prev, stroke]);
  }, []);

  return {
    selectedTool,
    selectedColor,
    brushSize,
    strokes,
    collaborativeUsers,
    setSelectedTool,
    setSelectedColor,
    setBrushSize,
    addStroke,
    handleRemoteStroke,
    undo,
    redo,
    clearCanvas,
    canUndo,
    canRedo,
  };
}
