import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  apiKey: text("api_key").notNull().unique(),
  password: text("password").notNull(),
});

export const batteryDiagnostics = pgTable("battery_diagnostics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  batteryType: text("battery_type").notNull(), // Li-ion, LiFePO₄, Lead-acid
  stateOfHealth: decimal("state_of_health").notNull(), // 0-100%
  stateOfCharge: decimal("state_of_charge").notNull(), // 0-100%
  capacity: decimal("capacity").notNull(), // Ah
  internalResistance: decimal("internal_resistance").notNull(), // mΩ
  temperature: decimal("temperature").notNull(), // °C
  voltage: decimal("voltage").notNull(), // V
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  faultRisk: decimal("fault_risk").notNull(), // 0-100%
  hasWarning: boolean("has_warning").notNull(),
});

// New Alert-related schemas
export const alertThresholds = pgTable("alert_thresholds", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  parameterName: text("parameter_name").notNull(), // voltage, temperature, soc, etc.
  minValue: decimal("min_value"), // Minimum threshold
  maxValue: decimal("max_value"), // Maximum threshold
  isEnabled: boolean("is_enabled").notNull().default(true),
  severity: text("severity").notNull(), // info, warning, critical
  notificationMethod: text("notification_method").notNull(), // email, dashboard, both
  created: timestamp("created").notNull().defaultNow(),
  updated: timestamp("updated").notNull().defaultNow(),
});

export const alertHistory = pgTable("alert_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  thresholdId: integer("threshold_id").notNull(),
  parameterName: text("parameter_name").notNull(),
  value: decimal("value").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Schema for inserting diagnostics
export const insertDiagnosticSchema = createInsertSchema(batteryDiagnostics).pick({
  batteryType: true,
  stateOfHealth: true,
  stateOfCharge: true,
  capacity: true, 
  internalResistance: true,
  temperature: true,
  voltage: true,
  faultRisk: true,
  hasWarning: true,
});

// New schema for alert thresholds
export const insertAlertThresholdSchema = createInsertSchema(alertThresholds).pick({
  parameterName: true,
  minValue: true,
  maxValue: true,
  isEnabled: true,
  severity: true,
  notificationMethod: true,
});

// Enum for parameter names
export const AlertParameterEnum = z.enum([
  'voltage',
  'temperature',
  'stateOfCharge',
  'stateOfHealth',
  'internalResistance',
  'capacity',
  'faultRisk'
]);

// Enum for severity levels
export const AlertSeverityEnum = z.enum(['info', 'warning', 'critical']);

// Enum for notification methods
export const NotificationMethodEnum = z.enum(['email', 'dashboard', 'both']);

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BatteryDiagnostic = typeof batteryDiagnostics.$inferSelect;
export type InsertBatteryDiagnostic = z.infer<typeof insertDiagnosticSchema>;
export type AlertThreshold = typeof alertThresholds.$inferSelect;
export type InsertAlertThreshold = z.infer<typeof insertAlertThresholdSchema>;
export type AlertHistory = typeof alertHistory.$inferSelect;