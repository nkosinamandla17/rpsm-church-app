import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "node:url";
import { getKV, setKV, findAdmin, updateAdminPassword } from "./db.js";

try { process.loadEnvFile(); } catch { /* no .env file yet — fine, Cloudinary just stays off */ }

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

function parseCloudinaryUrl(url) {
  const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url || "");
  if (!m) return null;
  const [, api_key, api_secret, cloud_name] = m;
  if (/[<>]/.test(api_key) || /[<>]/.test(api_secret)) return null; // still the dashboard's <placeholder> template
  return { api_key, api_secret, cloud_name };
}

const cloudinaryCreds = parseCloudinaryUrl(process.env.CLOUDINARY_URL) || (
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
    ? { cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET }
    : null
);
const CLOUDINARY_ENABLED = !!cloudinaryCreds;
if (CLOUDINARY_ENABLED) {
  cloudinary.config(cloudinaryCreds);
  console.log("Image uploads: Cloudinary (" + cloudinaryCreds.cloud_name + ")");
} else if (process.env.CLOUDINARY_URL) {
  console.log("Image uploads: local disk — CLOUDINARY_URL still has <placeholder> text in it; paste your real API key/secret from the Cloudinary dashboard");
} else {
  console.log("Image uploads: local disk (server/uploads) — add Cloudinary credentials to .env to switch to Cloudinary");
}

const JWT_SECRET = getKV("jwt_secret", null) || (() => {
  const s = crypto.randomBytes(32).toString("hex");
  setKV("jwt_secret", s);
  return s;
})();

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "rpsm", resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/* ---------- auth ---------- */
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const admin = username && findAdmin(username);
  if (!admin || !bcrypt.compareSync(password || "", admin.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, username: admin.username });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ username: req.admin.username });
});

app.post("/api/auth/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const admin = findAdmin(req.admin.username);
  if (!admin || !bcrypt.compareSync(currentPassword || "", admin.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  updateAdminPassword(admin.id, bcrypt.hashSync(newPassword, 10));
  res.json({ ok: true });
});

/* ---------- content ----------
   "theme"/"images"/"content" = LIVE (published, what public visitors get).
   "*_draft" = the admin's working copy. Authenticated writes always land
   in the draft; POST /api/publish is the only thing that copies draft -> live. */
app.get("/api/content", (req, res) => {
  res.json({
    theme: getKV("theme", {}),
    images: getKV("images", {}),
    content: getKV("content", {}),
  });
});

app.get("/api/content/draft", requireAuth, (req, res) => {
  res.json({
    theme: getKV("theme_draft", null) ?? getKV("theme", {}),
    images: getKV("images_draft", null) ?? getKV("images", {}),
    content: getKV("content_draft", null) ?? getKV("content", {}),
  });
});

app.put("/api/content/theme", requireAuth, (req, res) => {
  setKV("theme_draft", req.body);
  res.json({ ok: true });
});
app.put("/api/content/images", requireAuth, (req, res) => {
  setKV("images_draft", req.body);
  res.json({ ok: true });
});
app.put("/api/content/text", requireAuth, (req, res) => {
  setKV("content_draft", req.body);
  res.json({ ok: true });
});

app.post("/api/publish", requireAuth, (req, res) => {
  setKV("theme", getKV("theme_draft", null) ?? getKV("theme", {}));
  setKV("images", getKV("images_draft", null) ?? getKV("images", {}));
  setKV("content", getKV("content_draft", null) ?? getKV("content", {}));
  res.json({ ok: true });
});

/* ---------- image uploads ----------
   Cloudinary when configured (see .env); otherwise falls back to saving
   the file on local disk under server/uploads, unchanged from before. */
app.post("/api/uploads", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  if (CLOUDINARY_ENABLED) {
    try {
      const url = await uploadToCloudinary(req.file.buffer);
      return res.json({ url });
    } catch (err) {
      return res.status(502).json({ error: "Cloudinary upload failed: " + err.message });
    }
  }

  const ext = path.extname(req.file.originalname) || "";
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  fs.writeFileSync(path.join(__dirname, "uploads", filename), req.file.buffer);
  res.json({ url: `/uploads/${filename}` });
});

app.listen(PORT, () => {
  console.log(`RPSM CMS API listening on http://localhost:${PORT}`);
});
