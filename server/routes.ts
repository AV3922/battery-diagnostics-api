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
      const response = await fetch('http://0.0.0.0:5001/health');
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(503).json({ 
        status: "error",
        message: "FastAPI service unavailable"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}