import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertRoomSchema, insertStrokeSchema, type WebSocketMessage, type CollaborativeUser } from "@shared/schema";
import { z } from "zod";

// Store active connections by room
const roomConnections = new Map<string, Map<string, { ws: WebSocket; user: CollaborativeUser }>>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server setup - must be before other routes
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Room routes
  app.post("/api/rooms", async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ error: "Invalid room data" });
    }
  });

  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });

  app.get("/api/rooms/:id/strokes", async (req, res) => {
    try {
      const strokes = await storage.getStrokes(req.params.id);
      res.json(strokes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch strokes" });
    }
  });

  app.delete("/api/rooms/:id/strokes", async (req, res) => {
    try {
      await storage.clearRoomStrokes(req.params.id);
      
      // Broadcast clear to all clients in the room
      const connections = roomConnections.get(req.params.id);
      if (connections) {
        const message: WebSocketMessage = {
          type: 'clear-canvas',
          data: {},
          roomId: req.params.id,
          userId: 'server'
        };
        connections.forEach(({ ws }) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
          }
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear strokes" });
    }
  });

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocket, req) => {
    let userId: string;
    let roomId: string;

    ws.on('message', async (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        
        if (message.type === 'user-join') {
          userId = message.userId;
          roomId = message.roomId;
          
          // Add user to room
          if (!roomConnections.has(roomId)) {
            roomConnections.set(roomId, new Map());
          }
          
          const user: CollaborativeUser = {
            id: userId,
            name: message.data.name || `User ${userId.slice(0, 6)}`,
            isDrawing: false
          };
          
          roomConnections.get(roomId)!.set(userId, { ws, user });
          
          // Broadcast user join to other users in room
          broadcastToRoom(roomId, {
            type: 'user-join',
            data: user,
            roomId,
            userId
          }, userId);
          
          // Send current users list to new user
          const currentUsers = Array.from(roomConnections.get(roomId)!.values())
            .map(({ user }) => user);
          
          ws.send(JSON.stringify({
            type: 'users-list',
            data: currentUsers,
            roomId,
            userId: 'server'
          }));
          
          return;
        }

        if (message.type === 'stroke') {
          // Save stroke to storage
          await storage.saveStroke({
            roomId: message.roomId,
            strokeData: message.data
          });
          
          // Broadcast stroke to all other users in room
          broadcastToRoom(message.roomId, message, message.userId);
        } else if (message.type === 'cursor') {
          // Update user cursor position
          const connections = roomConnections.get(message.roomId);
          if (connections && connections.has(message.userId)) {
            const userConnection = connections.get(message.userId)!;
            userConnection.user.cursor = message.data.cursor;
            userConnection.user.isDrawing = message.data.isDrawing;
          }
          
          // Broadcast cursor position to other users
          broadcastToRoom(message.roomId, message, message.userId);
        } else if (message.type === 'clear-canvas') {
          await storage.clearRoomStrokes(message.roomId);
          broadcastToRoom(message.roomId, message, message.userId);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId && roomId) {
        // Remove user from room
        const connections = roomConnections.get(roomId);
        if (connections) {
          connections.delete(userId);
          
          // Broadcast user leave
          broadcastToRoom(roomId, {
            type: 'user-leave',
            data: { userId },
            roomId,
            userId
          }, userId);
          
          // Clean up empty rooms
          if (connections.size === 0) {
            roomConnections.delete(roomId);
          }
        }
      }
    });
  });

  function broadcastToRoom(roomId: string, message: WebSocketMessage, excludeUserId?: string) {
    const connections = roomConnections.get(roomId);
    if (!connections) return;

    connections.forEach(({ ws }, connUserId) => {
      if (connUserId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}
