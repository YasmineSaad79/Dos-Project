const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;
app.use(express.json());

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "catalog.db");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY,
      title TEXT,
      topic TEXT,
      price REAL,
      quantity INTEGER
    )`);

  db.get("SELECT COUNT(*) AS c FROM books", (err, row) => {
    if (row && row.c === 0) {
      const ins = db.prepare("INSERT INTO books (title, topic, price, quantity) VALUES (?, ?, ?, ?)");
      ins.run("How to get a good grade in DOS in 40 minutes a day", "distributed", 30, 5);
      ins.run("RPCs for Noobs", "distributed", 50, 5);
      ins.run("Xen and the Art of Surviving Undergraduate School", "undergrad", 40, 5);
      ins.run("Cooking for the Impatient Undergrad", "undergrad", 35, 5);
      ins.finalize();
    }
  });
});

app.get("/search/:topic", (req, res) => {
  db.all("SELECT id, title FROM books WHERE topic=?", [req.params.topic], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/info/:id", (req, res) => {
  db.get("SELECT title, quantity, price FROM books WHERE id=?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(row);
  });
});

app.post("/reserve/:id", (req, res) => {
  db.get("SELECT title, price, quantity FROM books WHERE id=?", [req.params.id], (err, book) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!book) return res.status(404).json({ error: "not_found" });
    if (book.quantity <= 0) return res.status(409).json({ error: "out_of_stock" });

    db.run("UPDATE books SET quantity = quantity - 1 WHERE id=?", [req.params.id], (uErr) => {
      if (uErr) return res.status(500).json({ error: uErr.message });
      res.json({ title: book.title, price: book.price });
    });
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.put("/update/:id", (req, res) => {
  const { price, quantity } = req.body;
  const id = req.params.id;

  if (price === undefined && quantity === undefined) {
    return res.status(400).json({ error: "price or quantity must be provided" });
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

  const query = `UPDATE books SET ${fields.join(", ")} WHERE id = ?`;

  db.run(query, values, function (err) {
    if (err) {
      console.error("❌ Error updating book:", err.message);
      return res.status(500).json({ error: "Failed to update book" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book updated successfully" });
  });
});

app.listen(PORT, () => console.log(`📚 Catalog service on ${PORT}, DB at ${DB_PATH}`));
