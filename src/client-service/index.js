const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 5000;

const CATALOG_URL = process.env.CATALOG_URL || "http://catalog-service:5001";
const ORDER_URL   = process.env.ORDER_URL   || "http://order-service:5002";

app.get("/search/:topic", async (req, res) => {
  const r = await axios.get(`${CATALOG_URL}/search/${req.params.topic}`);
  res.json(r.data);
});

app.get("/info/:id", async (req, res) => {
  try {
    const r = await axios.get(`${CATALOG_URL}/info/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data);
    res.status(500).json({ error: "internal_error" });
  }
});

app.post("/purchase/:id", async (req, res) => {
  try {
    const r = await axios.post(`${ORDER_URL}/purchase/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data);
    res.status(500).json({ error: "internal_error" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`💻 Client service on ${PORT}`));
