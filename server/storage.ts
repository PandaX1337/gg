import { type Room, type InsertRoom, type Stroke, type InsertStroke, type DrawingStroke } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Room operations
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  getAllRooms(): Promise<Room[]>;
  
  // Drawing strokes operations
  getStrokes(roomId: string): Promise<Stroke[]>;
  saveStroke(stroke: InsertStroke): Promise<Stroke>;
  clearRoomStrokes(roomId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private strokes: Map<string, Stroke[]>; // roomId -> strokes

  constructor() {
    this.rooms = new Map();
    this.strokes = new Map();
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = { 
      ...insertRoom, 
      id,
      createdAt: new Date()
    };
    this.rooms.set(id, room);
    this.strokes.set(id, []); // Initialize empty strokes array for room
    return room;
  }

  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async getStrokes(roomId: string): Promise<Stroke[]> {
    return this.strokes.get(roomId) || [];
  }

  async saveStroke(insertStroke: InsertStroke): Promise<Stroke> {
    const id = randomUUID();
    const stroke: Stroke = {
      ...insertStroke,
      id,
      createdAt: new Date()
    };

    const roomStrokes = this.strokes.get(insertStroke.roomId) || [];
    roomStrokes.push(stroke);
    this.strokes.set(insertStroke.roomId, roomStrokes);

    return stroke;
  }

  async clearRoomStrokes(roomId: string): Promise<void> {
    this.strokes.set(roomId, []);
  }
}

export const storage = new MemStorage();
