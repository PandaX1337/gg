import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Palette, Users, Plus } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const { toast } = useToast();

  const createRoomMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/rooms", { name });
      return response.json();
    },
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setLocation(`/room/${room.id}`);
      toast({
        title: "Room created successfully!",
        description: `Room "${room.name}" is ready for collaboration.`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to create room",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinRoom = async () => {
    if (!roomCode.trim()) {
      toast({
        title: "Room code required",
        description: "Please enter a room code to join.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("GET", `/api/rooms/${roomCode.trim()}`);
      const room = await response.json();
      setLocation(`/room/${room.id}`);
      toast({
        title: "Joined room successfully!",
        description: `Welcome to "${room.name}".`,
      });
    } catch (error) {
      toast({
        title: "Room not found",
        description: "Please check the room code and try again.",
        variant: "destructive",
      });
    }
  };

  const createRoom = () => {
    if (!roomName.trim()) {
      toast({
        title: "Room name required",
        description: "Please enter a name for your room.",
        variant: "destructive",
      });
      return;
    }
    createRoomMutation.mutate(roomName.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full space-y-8 my-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Palette className="text-white text-xl sm:text-2xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">CollabDraw</h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">Создавайте и рисуйте вместе в реальном времени</p>
        </div>

        {/* Join Room Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="text-blue-600" size={24} />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Присоединиться к комнате</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Введите код комнаты для совместного рисования</p>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Введите код комнаты..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                className="h-12 text-base"
              />
              <Button 
                onClick={joinRoom} 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium"
                disabled={!roomCode.trim()}
              >
                Присоединиться
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Room Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Plus className="text-purple-600" size={24} />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Создать новую комнату</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Создайте комнату и пригласите друзей для совместного творчества</p>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Название комнаты..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createRoom()}
                className="h-12 text-base"
              />
              <Button 
                onClick={createRoom} 
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-base font-medium"
                disabled={createRoomMutation.isPending || !roomName.trim()}
              >
                {createRoomMutation.isPending ? "Создаю..." : "Создать комнату"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
