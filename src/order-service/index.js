import express from "express";
import sqlite3 from "sqlite3";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5002;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "data", "orders.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to orders database:", err);
  } else {
    console.log(`✅ Connected to Orders DB at ${dbPath}`);
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

app.post("/purchase/:id", async (req, res) => {
  try {
    const itemId = req.params.id;

    const CATALOG_URL = process.env.CATALOG_URL || "http://catalog-service:5001";
    console.log("🔧 Using CATALOG_URL:", CATALOG_URL);

    const catalogRes = await axios.get(`${CATALOG_URL}/info/${itemId}`);
    const book = catalogRes.data;

    if (!book || book.quantity <= 0) {
      return res.status(400).json({ status: "fail", message: "Item out of stock" });
    }

    await axios.post(`${CATALOG_URL}/reserve/${itemId}`);
    console.log(`📦 Reserved one copy of "${book.title}"`);

    db.run(
      `INSERT INTO orders (book_id, title, price) VALUES (?, ?, ?)`,
      [itemId, book.title, book.price],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ status: "error" });
        }
        res.json({
          status: "ok",
          message: `bought book ${book.title}`,
          order_id: this.lastID,
        });
      }
    );
  } catch (error) {
    console.error("❌ Error in purchase:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`🚀 Order Service running on port ${PORT}`));
