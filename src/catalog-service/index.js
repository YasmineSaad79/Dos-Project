const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;
app.use(express.json());

// ===============================
// 🆔 Instance Identifier
// ===============================
const INSTANCE = process.env.INSTANCE_NAME || "unknown";

// ===============================
// 📂 Database Setup
// ===============================
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "catalog.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ DB connection failed", err.message);
  } else {
    console.log(`✅ Catalog DB ready [${INSTANCE}] → ${DB_PATH}`);
  }
});

// ===============================
// 📚 Initialize Data
// ===============================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      topic TEXT,
      price REAL,
      quantity INTEGER
    )
  `);

  db.get("SELECT COUNT(*) AS c FROM books", (err, row) => {
    if (row && row.c === 0) {
      const ins = db.prepare(
        "INSERT INTO books (title, topic, price, quantity) VALUES (?, ?, ?, ?)"
      );
      ins.run(
        "How to get a good grade in DOS in 40 minutes a day",
        "distributed",
        30,
        5
      );
      ins.run("RPCs for Noobs", "distributed", 50, 5);
      ins.run(
        "Xen and the Art of Surviving Undergraduate School",
        "undergrad",
        40,
        5
      );
      ins.run("Cooking for the Impatient Undergrad", "undergrad", 35, 5);
      ins.finalize();
    }
  });
});

// ===============================
// 🔍 Search Books
// ===============================
app.get("/search/:topic", (req, res) => {
  console.log(`📍 Catalog ${INSTANCE} → SEARCH (${req.params.topic})`);

  db.all(
    "SELECT id, title FROM books WHERE topic=?",
    [req.params.topic],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ===============================
// ℹ️ Book Info
// ===============================
app.get("/info/:id", (req, res) => {
  console.log(`📍 Catalog ${INSTANCE} → INFO (${req.params.id})`);

  db.get(
    "SELECT title, price, quantity FROM books WHERE id=?",
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "not_found" });
      res.json(row);
    }
  );
});

// ===============================
// 📦 Reserve Book
// ===============================
app.post("/reserve/:id", (req, res) => {
  const id = req.params.id;

  console.log(`📍 Catalog ${INSTANCE} → RESERVE (${id})`);

  db.get(
    "SELECT title, price, quantity FROM books WHERE id=?",
    [id],
    (err, book) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!book) return res.status(404).json({ error: "not_found" });
      if (book.quantity <= 0)
        return res.status(409).json({ error: "out_of_stock" });

      db.run(
        "UPDATE books SET quantity = quantity - 1 WHERE id=?",
        [id],
        (uErr) => {
          if (uErr) return res.status(500).json({ error: uErr.message });

          res.json({
            title: book.title,
            price: book.price,
            served_by: `catalog-${INSTANCE}`,
          });
        }
      );
    }
  );
});

// ===============================
// ✏️ Update Book (Admin)
// ===============================
app.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const { price, quantity } = req.body;

  console.log(`📍 Catalog ${INSTANCE} → UPDATE (${id})`);

  if (price === undefined && quantity === undefined) {
    return res
      .status(400)
      .json({ error: "price or quantity must be provided" });
  }

  const fields = [];
  const values = [];

  if (price !== undefined) {
    fields.push("price = ?");
    values.push(price);
  }
  if (quantity !== undefined) {
    fields.push("quantity = ?");
    values.push(quantity);
  }

  values.push(id);

  const query = `UPDATE books SET ${fields.join(", ")} WHERE id=?`;

  db.run(query, values, function (err) {
    if (err) return res.status(500).json({ error: "update_failed" });
    if (this.changes === 0)
      return res.status(404).json({ error: "not_found" });

    res.json({ message: "Book updated successfully" });
  });
});

// ===============================
// ❤️ Health Check
// ===============================
app.get("/health", (_req, res) => res.json({ ok: true }));

// ===============================
// 🚀 Start Server
// ===============================
app.listen(PORT, () => {
  console.log(`📚 Catalog service [${INSTANCE}] running on port ${PORT}`);
});
