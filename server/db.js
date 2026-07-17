import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";
import { DEFAULT_THEME, DEFAULT_CONTENT, DEFAULT_IMAGES } from "./defaults.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "rpsm.db");

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

const getStmt = db.prepare("SELECT value FROM kv WHERE key = ?");
const setStmt = db.prepare(`
  INSERT INTO kv (key, value) VALUES (?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`);

export function getKV(key, fallback) {
  const row = getStmt.get(key);
  if (!row) return fallback;
  try { return JSON.parse(row.value); } catch { return fallback; }
}
export function setKV(key, value) {
  setStmt.run(key, JSON.stringify(value));
}

// Seed default content the first time the database is created.
if (getKV("theme") == null) setKV("theme", DEFAULT_THEME);
if (getKV("content") == null) setKV("content", DEFAULT_CONTENT);
if (getKV("images") == null) setKV("images", DEFAULT_IMAGES);

// Seed a default admin account on first run and print the generated
// password once so it can be captured and changed immediately.
const adminCount = db.prepare("SELECT COUNT(*) AS c FROM admins").get().c;
if (adminCount === 0) {
  const username = "admin";
  const password = crypto.randomBytes(9).toString("base64url");
  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(username, hash);
  console.log("\n==============================================");
  console.log(" First run: created admin account");
  console.log(`   username: ${username}`);
  console.log(`   password: ${password}`);
  console.log(" Log in and change the password from Settings.");
  console.log("==============================================\n");
}

export function findAdmin(username) {
  return db.prepare("SELECT * FROM admins WHERE username = ?").get(username);
}
export function updateAdminPassword(id, passwordHash) {
  db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(passwordHash, id);
}
