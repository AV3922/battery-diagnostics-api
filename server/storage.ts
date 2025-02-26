import { users, batteryDiagnostics, type User, type InsertUser, type BatteryDiagnostic, type InsertBatteryDiagnostic } from "@shared/schema";
import crypto from "crypto";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByApiKey(apiKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDiagnostics(userId: number): Promise<BatteryDiagnostic[]>;
  createDiagnostic(userId: number, diagnostic: InsertBatteryDiagnostic): Promise<BatteryDiagnostic>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private diagnostics: Map<number, BatteryDiagnostic>;
  currentUserId: number;
  currentDiagnosticId: number;

  constructor() {
    this.users = new Map();
    this.diagnostics = new Map();
    this.currentUserId = 1;
    this.currentDiagnosticId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.apiKey === apiKey,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const apiKey = crypto.randomBytes(32).toString('hex');
    const user: User = { ...insertUser, id, apiKey };
    this.users.set(id, user);
    return user;
  }

  async getDiagnostics(userId: number): Promise<BatteryDiagnostic[]> {
    return Array.from(this.diagnostics.values()).filter(
      (diagnostic) => diagnostic.userId === userId,
    );
  }

  async createDiagnostic(userId: number, insertDiagnostic: InsertBatteryDiagnostic): Promise<BatteryDiagnostic> {
    const id = this.currentDiagnosticId++;
    const diagnostic: BatteryDiagnostic = {
      ...insertDiagnostic,
      id,
      userId,
      timestamp: new Date(),
    };
    this.diagnostics.set(id, diagnostic);
    return diagnostic;
  }
}

export const storage = new MemStorage();
