import { users, batteryDiagnostics, alertThresholds, alertHistory, type User, type InsertUser, type BatteryDiagnostic, type InsertBatteryDiagnostic, type AlertThreshold, type InsertAlertThreshold, type AlertHistory } from "@shared/schema";
import crypto from "crypto";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByApiKey(apiKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDiagnostics(userId: number): Promise<BatteryDiagnostic[]>;
  createDiagnostic(userId: number, diagnostic: InsertBatteryDiagnostic): Promise<BatteryDiagnostic>;
  // New alert-related methods
  createAlertThreshold(userId: number, threshold: InsertAlertThreshold): Promise<AlertThreshold>;
  getAlertThresholds(userId: number): Promise<AlertThreshold[]>;
  updateAlertThreshold(userId: number, thresholdId: number, updates: Partial<AlertThreshold>): Promise<AlertThreshold>;
  getAlertHistory(userId: number): Promise<AlertHistory[]>;
  acknowledgeAlert(userId: number, alertId: number): Promise<AlertHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private diagnostics: Map<number, BatteryDiagnostic>;
  private alertThresholds: Map<number, AlertThreshold>;
  private alertHistories: Map<number, AlertHistory>;
  currentUserId: number;
  currentDiagnosticId: number;
  currentAlertThresholdId: number;
  currentAlertHistoryId: number;

  constructor() {
    this.users = new Map();
    this.diagnostics = new Map();
    this.alertThresholds = new Map();
    this.alertHistories = new Map();
    this.currentUserId = 1;
    this.currentDiagnosticId = 1;
    this.currentAlertThresholdId = 1;
    this.currentAlertHistoryId = 1;
  }

  // Existing methods remain unchanged
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

  // New alert-related implementations
  async createAlertThreshold(userId: number, threshold: InsertAlertThreshold): Promise<AlertThreshold> {
    const id = this.currentAlertThresholdId++;
    const newThreshold: AlertThreshold = {
      ...threshold,
      id,
      userId,
      created: new Date(),
      updated: new Date(),
    };
    this.alertThresholds.set(id, newThreshold);
    return newThreshold;
  }

  async getAlertThresholds(userId: number): Promise<AlertThreshold[]> {
    return Array.from(this.alertThresholds.values()).filter(
      (threshold) => threshold.userId === userId
    );
  }

  async updateAlertThreshold(userId: number, thresholdId: number, updates: Partial<AlertThreshold>): Promise<AlertThreshold> {
    const threshold = this.alertThresholds.get(thresholdId);
    if (!threshold || threshold.userId !== userId) {
      throw new Error("Alert threshold not found or unauthorized");
    }

    const updatedThreshold: AlertThreshold = {
      ...threshold,
      ...updates,
      updated: new Date(),
    };
    this.alertThresholds.set(thresholdId, updatedThreshold);
    return updatedThreshold;
  }

  async getAlertHistory(userId: number): Promise<AlertHistory[]> {
    return Array.from(this.alertHistories.values())
      .filter((alert) => alert.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async acknowledgeAlert(userId: number, alertId: number): Promise<AlertHistory> {
    const alert = this.alertHistories.get(alertId);
    if (!alert || alert.userId !== userId) {
      throw new Error("Alert not found or unauthorized");
    }

    const acknowledgedAlert: AlertHistory = {
      ...alert,
      acknowledged: true,
      acknowledgedAt: new Date(),
    };
    this.alertHistories.set(alertId, acknowledgedAlert);
    return acknowledgedAlert;
  }
}

export const storage = new MemStorage();