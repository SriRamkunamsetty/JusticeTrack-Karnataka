import Database from 'better-sqlite3';
import path from 'path';

// Store DB in the root directory for preview purposes
const dbPath = path.resolve(process.cwd(), 'justice_track.db');

export const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    case_number TEXT,
    file_path TEXT,
    file_name TEXT,
    status TEXT,
    upload_date TEXT,
    uploaded_by TEXT
  );

  CREATE TABLE IF NOT EXISTS extracted_data (
    id TEXT PRIMARY KEY,
    case_id TEXT,
    actions TEXT,
    appeal_deadline TEXT,
    urgency TEXT,
    departments TEXT,
    raw_json TEXT,
    status TEXT, -- pending_review, approved, rejected
    reviewer_notes TEXT,
    reviewed_at TEXT,
    reviewed_by TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT,
    entity_type TEXT,
    entity_id TEXT,
    timestamp TEXT,
    details TEXT
  );

  -- Insert mock super admin if none exists
  INSERT OR IGNORE INTO users (id, name, email, role, password) 
  VALUES ('user-admin-1', 'Super Admin', 'admin@karnataka.gov.in', 'Super Admin', 'hashed_pass');

  INSERT OR IGNORE INTO users (id, name, email, role, password)
  VALUES ('user-reviewer-1', 'Legal Officer', 'legal@karnataka.gov.in', 'Legal Officer', 'hashed_pass');
`);
