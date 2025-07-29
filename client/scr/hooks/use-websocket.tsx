import { useEffect, useRef, useState } from "react";
import { WebSocketMessage, CollaborativeUser } from "@shared/schema";

interface UseWebSocketOptions {
  onStroke: (stroke: any) => void;
  onUserJoin: (user: CollaborativeUser) => void;
  onUserLeave: (userId: string) => void;
  onClearCanvas: () => void;
}

export function useWebSocket(roomId: string, options: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const userIdRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (!roomId || roomId === "") return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // In development, connect to the same port as the HTTP server
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      
      // Join room
      const joinMessage: WebSocketMessage = {
        type: 'user-join',
        data: { name: `User ${userIdRef.current.slice(0, 6)}` },
        roomId,
        userId: userIdRef.current,
      };
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'stroke':
            options.onStroke(message.data);
            break;
          case 'user-join':
            options.onUserJoin(message.data);
            break;
          case 'user-leave':
            options.onUserLeave(message.data.userId);
            break;
          case 'users-list':
            setConnectedUsers(message.data.length);
            break;
          case 'clear-canvas':
            options.onClearCanvas();
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConnectedUsers(0);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId, options]);

  const sendMessage = (message: Omit<WebSocketMessage, 'userId' | 'roomId'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        roomId,
        userId: userIdRef.current,
      };
      wsRef.current.send(JSON.stringify(fullMessage));
    }
  };

  return {
    isConnected,
    connectedUsers,
    sendMessage,
    userId: userIdRef.current,
  };
}
