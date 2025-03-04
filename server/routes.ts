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
  app.get("/api/v1/diagnostics/voltage", authenticate, async (req, res) => {
    try {
      // Mock data for demonstration
      res.json({
        voltage: 48.2,
        nominalVoltage: 48.0,
        stateOfCharge: 85,
        estimatedRange: 150,
        temperature: 25,
        temperatureStatus: "Normal"
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/v1/diagnostics/cell-balance", authenticate, async (req, res) => {
    try {
      // Mock data for demonstration
      res.json({
        cellVoltages: [3.95, 3.97, 3.96, 3.94, 3.95, 3.96, 3.97, 3.95],
        maxImbalance: 0.03,
        balanceStatus: "Good"
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/v1/diagnostics/history", authenticate, async (req, res) => {
    try {
      // Mock data for demonstration
      const now = Date.now();
      const history = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now - i * 3600000).toISOString(),
        charge: Math.random() * 5,
        discharge: Math.random() * 3
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