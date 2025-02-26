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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BatteryDiagnostic = typeof batteryDiagnostics.$inferSelect;
export type InsertBatteryDiagnostic = z.infer<typeof insertDiagnosticSchema>;
