import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drawingStrokes = pgTable("drawing_strokes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  strokeData: jsonb("stroke_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
});

export const insertStrokeSchema = createInsertSchema(drawingStrokes).omit({
  id: true,
  createdAt: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertStroke = z.infer<typeof insertStrokeSchema>;
export type Stroke = typeof drawingStrokes.$inferSelect;

// Drawing-related types
export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  size: number;
  tool: 'brush' | 'eraser';
  timestamp: number;
}

export interface CollaborativeUser {
  id: string;
  name: string;
  cursor?: DrawingPoint;
  isDrawing: boolean;
}

export interface WebSocketMessage {
  type: 'stroke' | 'cursor' | 'user-join' | 'user-leave' | 'clear-canvas' | 'undo' | 'redo' | 'users-list';
  data: any;
  roomId: string;
  userId: string;
}
