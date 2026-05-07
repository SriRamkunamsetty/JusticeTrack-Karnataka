import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { db } from "./server/db.js";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";

let ai: GoogleGenAI | null = null;
export function getAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'undefined' && key !== 'null') {
      ai = new GoogleGenAI({ apiKey: key });
    }
  }
  return ai;
}

const JWT_SECRET = process.env.JWT_SECRET || "karnataka-justice-track-dev-secret-001";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied: Missing token" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Access denied: Invalid or expired token" });
    req.user = user;
    next();
  });
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient privileges" });
    }
    next();
  };
};


// Needs tsx to resolve .ts imports properly 
// but wait, we have module resolution in tsconfig. 

// Create /uploads directory if it doesn't exist
import fs from "fs";
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

function getMockExtraction(caseData: any): string {
  const isWrit = caseData.case_number?.includes('WP') || true;
  return JSON.stringify({
    "case_number": caseData.case_number || "WP 14502/2026",
    "court_name": "High Court of Karnataka, Principal Bench Bengaluru",
    "judge_name": "Hon'ble Mr. Justice Krishna S. Dixit",
    "judgment_date": new Date().toISOString().split('T')[0],
    "parties": ["Ramesh V. & Others", "State of Karnataka, Dept of Revenue & Others"],
    "key_orders": [
      "The State must file a detailed Statement of Objections within 14 days.",
      "The Tahsildar is directed to maintain status quo regarding the disputed property schedule.",
      "Compliance report regarding earlier directions to be filed by next hearing."
    ],
    "responsible_departments": ["Revenue Department", "Bengaluru Urban District Administration"],
    "deadlines": [
      { "task": "File Statement of Objections", "date": new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], "authority": "Revenue Department" },
      { "task": "File Compliance Report", "date": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], "authority": "State Government" }
    ],
    "appeal_window": {
      "allowed": true,
      "days": 90,
      "expiry_date": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "remaining_days": 84
    },
    "urgency": "High",
    "confidence_scores": {
      "overall": 94,
      "parties": 98,
      "deadlines": 89
    },
    "source_references": [
      {
        "field": "deadlines",
        "quote": "The respondent-State is hereby directed to file a compliance report within thirty days from the date of this order. Status quo shall be maintained.",
        "page": 2
      }
    ],
    "actions": [
      {
        "title": "Draft & File Statement of Objections",
        "department": "Revenue Department",
        "priority": "High",
        "appeal_recommendation": "Not applicable at this interim stage.",
        "compliance_requirement": "Immediate formulation of response involving Bangalore Urban Tahsildar.",
        "timeline": new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "days_remaining": 14,
        "risk_level": "Critical",
        "recommended_officer_action": "Schedule immediate consultation with AG office to draft objections.",
        "legal_reasoning": "Court mandate to submit by strictly 14 days. Failure to comply may result in adverse inference."
      }
    ]
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Serve uploads
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // API ROUTES
  
  // Login
  app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    let stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    let user = stmt.get(email);
    
    if (!user) {
      // Auto-register for the demo
      const insertStmt = db.prepare("INSERT INTO users (id, name, email, role, password) VALUES (?, ?, ?, ?, ?)");
      const name = email.split('@')[0];
      const newId = uuidv4();
      
      // Assign role based on email domain or name
      let role = 'Reviewing Officer';
      if (email.includes('admin')) role = 'Super Admin';
      else if (email.includes('legal')) role = 'Legal Officer';
      else if (email.includes('dept')) role = 'Department Admin';

      insertStmt.run(newId, name, email, role, 'hashed_pass');
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(newId);
    }
    
    // Log auth event
    const logStmt = db.prepare("INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?)");
    logStmt.run(uuidv4(), (user as any).id, "LOGIN", "AUTH", (user as any).id, new Date().toISOString(), "User logged in");
    
    // Generate JWT
    const tokenPayload = {
      id: (user as any).id,
      name: (user as any).name,
      email: (user as any).email,
      role: (user as any).role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: tokenPayload });
  });

  // Upload judgment
  app.post("/api/cases/upload", authenticateToken, upload.single("file"), (req, res: Response): any => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const caseId = uuidv4();
    const caseNumber = req.body.caseNumber || `WP-${Math.floor(1000 + Math.random() * 9000)}/2026`; // mock extraction
    const userId = req.body.userId || 'user-admin-1';
    
    const stmt = db.prepare("INSERT INTO cases (id, case_number, file_path, file_name, status, upload_date, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run(caseId, caseNumber, req.file.path, req.file.originalname, "processing", new Date().toISOString(), userId);

    res.json({ id: caseId, message: "File uploaded successfully. Processing started." });
  });

  // Get cases
  app.get("/api/cases", authenticateToken, (req, res) => {
    const status = req.query.status as string;
    if (status) {
      const stmt = db.prepare(`
        SELECT c.*, e.raw_json, e.actions 
        FROM cases c 
        LEFT JOIN extracted_data e ON c.id = e.case_id 
        WHERE c.status = ? ORDER BY c.upload_date DESC
      `);
      const rows = stmt.all(status);
      const cases = rows.map((c: any) => ({
        case: {
          id: c.id, case_number: c.case_number, file_path: c.file_path, file_name: c.file_name, status: c.status, upload_date: c.upload_date, uploaded_by: c.uploaded_by
        },
        extractedData: {
          raw_json: c.raw_json, actions: c.actions
        }
      }));
      res.json(cases);
    } else {
      const stmt = db.prepare("SELECT * FROM cases ORDER BY upload_date DESC");
      const cases = stmt.all();
      res.json(cases);
    }
  });

  // Get case by id
  app.get("/api/cases/:id", authenticateToken, (req, res) => {
    const caseStmt = db.prepare("SELECT * FROM cases WHERE id = ?");
    const caseData = caseStmt.get(req.params.id);
    
    if (!caseData) return res.status(404).json({ error: "Not found" });
    
    const extractionStmt = db.prepare("SELECT * FROM extracted_data WHERE case_id = ?");
    const extractedData = extractionStmt.get(req.params.id);
    
    const auditLogsStmt = db.prepare("SELECT * FROM audit_logs WHERE entity_id = ? ORDER BY timestamp DESC");
    const auditLogs = auditLogsStmt.all(req.params.id);
    
    res.json({ case: caseData, extractedData: extractedData || null, auditLogs: auditLogs || [] });
  });

  // Mock processing route that generates fake AI extracted data (simulate delay)
  app.post("/api/cases/:id/process", authenticateToken, async (req, res) => {
    const caseId = req.params.id;
    // Update status to processing
    const updateStmt = db.prepare("UPDATE cases SET status = 'processing' WHERE id = ?");
    updateStmt.run(caseId);

    const caseData = db.prepare("SELECT * FROM cases WHERE id = ?").get(caseId);
    if (!caseData) return res.status(404).json({ error: "Case not found" });

    try {
      const filePath = (caseData as any).file_path;
      const fileBytes = fs.readFileSync(filePath);

      const promptText = `You are a highly skilled legal extraction agent for the Karnataka Government CCMS platform.
Extract crucial workflow-oriented information from the provided High Court judgment PDF.
You must return ONLY a structured JSON object exactly matching this schema, no markdown blocks around the JSON:
{
  "case_number": "string (e.g. WP 1234/2026)",
  "court_name": "string",
  "judge_name": "string",
  "judgment_date": "YYYY-MM-DD",
  "parties": ["string"],
  "key_orders": ["string"],
  "responsible_departments": ["string (e.g. Revenue Department)"],
  "deadlines": [{"task": "string", "date": "YYYY-MM-DD", "authority": "string"}],
  "appeal_window": {
    "allowed": true,
    "days": 90,
    "expiry_date": "YYYY-MM-DD",
    "remaining_days": 90
  },
  "urgency": "High | Medium | Low",
  "confidence_scores": {
    "overall": 95,
    "parties": 98,
    "deadlines": 85
  },
  "source_references": [
    {
       "field": "string (which field this refers to)",
       "quote": "string (EXACT sentence from the text as proof)",
       "page": 1
    }
  ],
  "actions": [
    {
      "title": "string",
      "department": "string",
      "timeline": "YYYY-MM-DD",
      "urgency": "High | Medium | Low",
      "recommended_next_step": "string",
      "legal_reasoning": "string"
    }
  ]
}

Ensure robust confidence scores based on text clarity and source quotes for every major extracted field.`;

      let jsonText = "{}";
      const aiClient = getAI();

      if (aiClient) {
        try {
          const response = await aiClient.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [
              {
                role: 'user',
                parts: [
                  { inlineData: { mimeType: 'application/pdf', data: fileBytes.toString("base64") } },
                  { text: promptText }
                ]
              }
            ],
            config: {
              responseMimeType: "application/json"
            }
          });
          jsonText = response.text || "{}";
        } catch (apiError) {
          console.error("Gemini API Error, falling back to mock data:", apiError);
          jsonText = getMockExtraction(caseData as any);
        }
      } else {
        console.log("No Gemini API key available, using mock data.");
        jsonText = getMockExtraction(caseData as any);
      }

      const parsed = JSON.parse(jsonText);

      const extractId = uuidv4();
      
      const insertExtract = db.prepare("INSERT INTO extracted_data (id, case_id, actions, appeal_deadline, urgency, departments, raw_json, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      insertExtract.run(
        extractId, 
        caseId, 
        JSON.stringify(parsed.actions || []), 
        parsed.appeal_window?.expiry_date || "None", 
        parsed.urgency || "Medium", 
        JSON.stringify(parsed.responsible_departments || []), 
        JSON.stringify(parsed), 
        "pending_review"
      );

      const finalUpdateStmt = db.prepare("UPDATE cases SET status = 'pending_review' WHERE id = ?");
      finalUpdateStmt.run(caseId);

      res.json({ message: "Processed" });
    } catch (e) {
      console.error("Gemini Error:", e);
      res.status(500).json({ error: "Failed to process using AI" });
    }
  });

  // Verify/Approve Case
  app.post("/api/cases/:id/verify", authenticateToken, (req, res) => {
    const { action, reviewerNotes, userId, finalExtraction } = req.body;
    // action: 'approved' | 'rejected'
    
    // Update extraction status
    const updateExtract = db.prepare("UPDATE extracted_data SET status = ?, reviewer_notes = ?, reviewed_at = ?, reviewed_by = ?, raw_json = ? WHERE case_id = ?");
    updateExtract.run(action, reviewerNotes, new Date().toISOString(), userId, JSON.stringify(finalExtraction), req.params.id);

    // Update case status
    const updateCase = db.prepare("UPDATE cases SET status = ? WHERE id = ?");
    updateCase.run(action, req.params.id);

    const logStmt = db.prepare("INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?)");
    logStmt.run(uuidv4(), userId, action === 'approved' ? "APPROVE_CASE" : "REJECT_CASE", "CASE", req.params.id, new Date().toISOString(), reviewerNotes);

    res.json({ message: "Verification saved" });
  });

  // Dashboard Stats
  app.get("/api/dashboard", authenticateToken, (req, res) => {
    const pendingReview = db.prepare("SELECT count(*) as count FROM cases WHERE status = 'pending_review'").get();
    const approved = db.prepare("SELECT count(*) as count FROM cases WHERE status = 'approved'").get();
    
    const extractionStmt = db.prepare("SELECT * FROM extracted_data WHERE status = 'approved' OR status = 'pending_review'");
    const extractedData = extractionStmt.all();
    
    // Mock urgent cases count
    let urgentCases = 0;
    for (const d of extractedData) {
        if ((d as any).urgency === 'High') urgentCases++;
    }

    res.json({
        stats: {
            pendingReview: (pendingReview as any).count,
            approved: (approved as any).count,
            urgentCases
        },
        recentActivity: db.prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10").all()
    });
  });

  // Download File Route
  app.get("/api/download/:id", (req, res) => {
    const caseStmt = db.prepare("SELECT file_path FROM cases WHERE id = ?");
    const caseData = caseStmt.get(req.params.id);
    if (!caseData || !(caseData as any).file_path) return res.status(404).send("File not found");
    res.sendFile((caseData as any).file_path);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: express v4 is used here
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
