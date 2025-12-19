import express from "express";
import sqlite3 from "sqlite3";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5002;
const INSTANCE = process.env.INSTANCE_NAME || "unknown";

/* =========================================
   📁 Paths & SQLite
   ========================================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "data", "orders.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to Orders DB:", err);
  } else {
    console.log(`✅ [Order ${INSTANCE}] Connected to DB at ${dbPath}`);
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    title TEXT,
    price REAL,
    date TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

app.use(express.json());

/* =========================================
   ⚖️ Catalog Replicas (Round Robin)
   ========================================= */
const CATALOG_REPLICAS = (process.env.CATALOG_REPLICAS ||
  "http://catalog-service-1:5001,http://catalog-service-2:5001"
).split(",");

let rrCatalog = 0;
function pickCatalog() {
  const url = CATALOG_REPLICAS[rrCatalog % CATALOG_REPLICAS.length].trim();
  rrCatalog++;
  return url;
}

/* =========================================
   🌐 Front-End URL (for cache invalidation)
   ========================================= */
const FRONTEND_URL = process.env.FRONTEND_URL || "http://client:5000";

/* =========================================
   🛒 Purchase Endpoint
   ========================================= */
app.post("/purchase/:id", async (req, res) => {
  const itemId = req.params.id;
  const CATALOG_URL = pickCatalog();

  console.log(`🛒 [Order ${INSTANCE}] Purchase request for book ${itemId}`);
  console.log(`🔧 Using CATALOG_URL: ${CATALOG_URL}`);

  try {
    // 🔴 1) Invalidate cache BEFORE write
    await axios.post(`${FRONTEND_URL}/invalidate/${itemId}`);

    // 2️⃣ Get book info
    const infoRes = await axios.get(`${CATALOG_URL}/info/${itemId}`);
    const book = infoRes.data;

    if (!book || book.quantity <= 0) {
      return res.status(400).json({
        status: "FAILED",
        reason: "OUT_OF_STOCK",
      });
    }

    // 3️⃣ Reserve one copy
    await axios.post(`${CATALOG_URL}/reserve/${itemId}`);
    console.log(`📦 [Order ${INSTANCE}] Reserved "${book.title}"`);

    // 4️⃣ Save order
    db.run(
      `INSERT INTO orders (book_id, title, price) VALUES (?, ?, ?)`,
      [itemId, book.title, book.price],
      function (err) {
        if (err) {
          console.error("❌ DB insert error:", err.message);
          return res.status(500).json({ error: "db_error" });
        }

        res.json({
          status: "SUCCESS",
          message: `bought book "${book.title}"`,
          order_id: this.lastID,
          served_by: `order-${INSTANCE}`,
        });
      }
    );
  } catch (err) {
    console.error(`❌ [Order ${INSTANCE}] Error:`, err.message);
    res.status(500).json({ error: "internal_error" });
  }
});

/* =========================================
   ✅ Health Check
   ========================================= */
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () =>
  console.log(`🚀 Order Service [${INSTANCE}] running on port ${PORT}`)
);
