import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { DrawingCanvas } from "@/components/drawing-canvas";
import { Toolbar } from "@/components/toolbar";
import { ColorPicker } from "@/components/color-picker";
import { MobileToolbar } from "@/components/mobile-toolbar";
import { RoomHeader } from "@/components/room-header";
import { useWebSocket } from "@/hooks/use-websocket";
import { useDrawing } from "@/hooks/use-drawing";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

export default function Room() {
  const { id: roomId } = useParams<{ id: string }>();
  const isMobile = useIsMobile();

  // Всегда вызываем хуки с постоянными значениями
  const {
    selectedTool,
    selectedColor,
    brushSize,
    setSelectedTool,
    setSelectedColor,
    setBrushSize,
    strokes,
    collaborativeUsers,
    addStroke,
    handleRemoteStroke,
    undo,
    redo,
    clearCanvas,
    canUndo,
    canRedo,
  } = useDrawing(roomId || "", [], undefined);

  const { isConnected, connectedUsers, sendMessage } = useWebSocket(roomId || "", {
    onStroke: handleRemoteStroke,
    onUserJoin: (user) => {
      // Handle user joining
    },
    onUserLeave: (userId) => {
      // Handle user leaving  
    },
    onClearCanvas: clearCanvas,
  });

  const { data: room, isLoading } = useQuery({
    queryKey: ["/api/rooms", roomId],
    enabled: !!roomId,
  });

  const { data: initialStrokes } = useQuery({
    queryKey: ["/api/rooms", roomId, "strokes"],
    enabled: !!roomId,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
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
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Room not found</h1>
          <p className="text-gray-600">The room you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    document.body.classList.add('drawing-room');
    return () => {
      document.body.classList.remove('drawing-room');
    };
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <RoomHeader 
        room={room}
        connectedUsers={connectedUsers}
        onClearCanvas={clearCanvas}
      />
      
      <main className="flex-1 relative">
        <DrawingCanvas
          roomId={roomId!}
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          brushSize={brushSize}
          strokes={strokes}
          collaborativeUsers={collaborativeUsers}
          onStrokeComplete={addStroke}
        />

        {/* Desktop Tools */}
        {!isMobile && (
          <>
            <Toolbar
              selectedTool={selectedTool}
              brushSize={brushSize}
              onToolChange={setSelectedTool}
              onBrushSizeChange={setBrushSize}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
          </>
        )}

        {/* Mobile Toolbar */}
        {isMobile && (
          <MobileToolbar
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            brushSize={brushSize}
            onToolChange={setSelectedTool}
            onColorChange={setSelectedColor}
            onBrushSizeChange={setBrushSize}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        )}
      </main>
    </div>
  );
}
