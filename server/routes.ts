import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDiagnosticSchema } from "@shared/schema";
import { ZodError } from "zod";

// Add custom type for Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const authenticate = async (req: Request, res: Response, next: Function) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ message: "API key required" });
    }

    const user = await storage.getUserByApiKey(apiKey as string);
    if (!user) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    req.user = user;
    next();
  };

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ apiKey: user.apiKey });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: err.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Battery diagnostics routes
  app.post("/api/diagnostics", authenticate, async (req, res) => {
    try {
      const diagnosticData = insertDiagnosticSchema.parse(req.body);
      const diagnostic = await storage.createDiagnostic(req.user.id, diagnosticData);
      res.json(diagnostic);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: err.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Dashboard specific endpoints
  app.get("/api/v1/diagnostics/voltage", async (req, res) => {
    try {
      // Simulate real-time voltage data with natural variations
      const baseVoltage = 48.2;
      const variation = Math.random() * 0.4 - 0.2;
      const temperature = 25 + (Math.random() * 2 - 1);
      const efficiency = 94.8 + (Math.random() * 1 - 0.5);

      res.json({
        voltage: baseVoltage + variation,
        nominalVoltage: 48.0,
        stateOfCharge: 85 + (Math.random() * 2 - 1),
        estimatedRange: 150 + Math.floor(Math.random() * 10 - 5),
        temperature,
        temperatureStatus: temperature < 30 ? "Normal" : "Warning",
        efficiency: efficiency.toFixed(1),
        powerOutput: (baseVoltage * 10).toFixed(1),
        cellHealth: 97.2,
        predictedLifetime: "2.3 years"
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/v1/diagnostics/cell-balance", async (req, res) => {
    try {
      // Generate realistic cell voltage data
      const baseVoltage = 3.95;
      const cellCount = 8;
      const cellVoltages = Array.from({ length: cellCount }, () =>
        baseVoltage + (Math.random() * 0.04 - 0.02)
      );

      // Calculate statistics
      const maxVoltage = Math.max(...cellVoltages);
      const minVoltage = Math.min(...cellVoltages);
      const avgVoltage = cellVoltages.reduce((a, b) => a + b, 0) / cellCount;

      res.json({
        cellVoltages,
        maxImbalance: (maxVoltage - minVoltage).toFixed(3),
        balanceStatus: (maxVoltage - minVoltage) < 0.05 ? "Good" : "Needs Balancing",
        statistics: {
          max: maxVoltage.toFixed(3),
          min: minVoltage.toFixed(3),
          average: avgVoltage.toFixed(3),
          standardDeviation: Math.sqrt(
            cellVoltages.reduce((sq, n) => sq + Math.pow(n - avgVoltage, 2), 0) / cellCount
          ).toFixed(3)
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/v1/diagnostics/history", async (req, res) => {
    try {
      const now = Date.now();
      // Generate more realistic charge/discharge patterns
      const history = Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        // Simulate higher usage during day hours (8-20)
        const isDayTime = hour >= 8 && hour <= 20;
        const baseCharge = isDayTime ? 2 : 1;
        const baseDischarge = isDayTime ? 3 : 0.5;

        return {
          timestamp: new Date(now - i * 3600000).toISOString(),
          charge: baseCharge + Math.random() * 1.5,
          discharge: baseDischarge + Math.random() * 1,
          efficiency: 94 + Math.random() * 2,
          temperature: 25 + Math.random() * 5
        };
      }).reverse();

      res.json({
        cycleCount: 245,
        lastCharged: new Date(now - 3600000).toISOString(),
        chargeHistory: history,
        analytics: {
          averageEfficiency: 95.2,
          peakPower: 2300,
          totalEnergyToday: 45.6,
          predictedCycles: 1200
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/diagnostics", authenticate, async (req, res) => {
    try {
      const diagnostics = await storage.getDiagnostics(req.user.id);
      res.json(diagnostics);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Proxy health check to FastAPI
  app.get("/health", async (req, res) => {
    try {
      console.log("Proxying health check to FastAPI...");
      const response = await fetch('http://0.0.0.0:5000/health', {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`FastAPI responded with status: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("FastAPI health check failed:", err);
      res.status(503).json({
        status: "error",
        message: "FastAPI service unavailable",
        error: err instanceof Error ? err.message : String(err)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}