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
      // Mock data for demonstration
      res.json({
        voltage: 48.2 + (Math.random() * 0.4 - 0.2), // Add some variation
        nominalVoltage: 48.0,
        stateOfCharge: 85,
        estimatedRange: 150,
        temperature: 25 + (Math.random() * 2 - 1),
        temperatureStatus: "Normal"
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/v1/diagnostics/cell-balance", async (req, res) => {
    try {
      // Mock data with some variation
      const baseVoltage = 3.95;
      const cellVoltages = Array.from({ length: 8 }, () => 
        baseVoltage + (Math.random() * 0.04 - 0.02)
      );

      res.json({
        cellVoltages,
        maxImbalance: Math.max(...cellVoltages) - Math.min(...cellVoltages),
        balanceStatus: "Good"
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/v1/diagnostics/history", async (req, res) => {
    try {
      const now = Date.now();
      const history = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now - i * 3600000).toISOString(),
        charge: 2 + Math.random() * 3,
        discharge: 1 + Math.random() * 2
      })).reverse();

      res.json({
        cycleCount: 245,
        lastCharged: new Date(now - 3600000).toISOString(),
        chargeHistory: history
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