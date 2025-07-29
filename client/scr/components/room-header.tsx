import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Room } from "@shared/schema";
import { Share, MoreVertical, Palette, Users, Home, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

interface RoomHeaderProps {
  room: Room;
  connectedUsers: number;
  onClearCanvas: () => void;
}

export function RoomHeader({ room, connectedUsers, onClearCanvas }: RoomHeaderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const shareRoom = async () => {
    const shareUrl = `${window.location.origin}/room/${room.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Room link copied!",
        description: "Share this link with others to collaborate.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please copy the URL manually from your browser.",
        variant: "destructive",
      });
    }
  };

  const handleClearCanvas = async () => {
    try {
      await apiRequest("DELETE", `/api/rooms/${room.id}/strokes`);
      onClearCanvas();
      toast({
        title: "Canvas cleared",
        description: "All drawings have been removed.",
      });
    } catch (error) {
      toast({
        title: "Failed to clear canvas",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const leaveRoom = () => {
    setLocation("/");
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-50">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">CollabDraw</h1>
            </div>

            {/* Room Info */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Room: {room.name}</span>
                <span className="text-xs text-gray-500">({connectedUsers} online)</span>
              </div>

              {/* Share Button */}
              <Button 
                onClick={shareRoom}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Share className="text-sm" />
                <span className="hidden sm:inline">Share</span>
              </Button>

              {/* Settings Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={leaveRoom}>
                    <Home className="mr-2 h-4 w-4" />
                    New Room
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleClearCanvas}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Canvas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={leaveRoom} className="text-red-600">
                    Leave Room
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Room Info Bar */}
        <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Комната: {room.name}</span>
            <span className="text-xs text-gray-500">({connectedUsers} онлайн)</span>
          </div>
          <Button 
            onClick={leaveRoom}
            variant="ghost" 
            size="sm" 
            className="text-xs p-2"
          >
            <Home className="h-3 w-3 mr-1" />
            На главную
          </Button>
        </div>
      </header>
    </>
  );
}
