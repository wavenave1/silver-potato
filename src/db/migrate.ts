import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "crm.db");
const sqlite = new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    industry TEXT,
    size TEXT,
    arr REAL DEFAULT 0,
    health_score INTEGER DEFAULT 50,
    stage TEXT NOT NULL DEFAULT 'prospect',
    renewal_date TEXT,
    cs_owner TEXT,
    ae_owner TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    role TEXT,
    engagement_level TEXT DEFAULT 'cold',
    linkedin_url TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'new_logo',
    stage TEXT NOT NULL DEFAULT 'discovery',
    arr REAL DEFAULT 0,
    close_date TEXT,
    probability INTEGER DEFAULT 10,
    ae_owner TEXT,
    loss_reason TEXT,
    qual_metrics TEXT,
    qual_economic_buyer TEXT,
    qual_decision_criteria TEXT,
    qual_decision_process TEXT,
    qual_identified_pain TEXT,
    qual_champion TEXT,
    qual_competition TEXT,
    qual_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    contact_id TEXT REFERENCES contacts(id),
    opportunity_id TEXT REFERENCES opportunities(id),
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT,
    outcome TEXT,
    next_step TEXT,
    due_date TEXT,
    completed_at TEXT,
    owner TEXT,
    created_at TEXT NOT NULL
  );
`);

console.log("Database migrated successfully.");
sqlite.close();
