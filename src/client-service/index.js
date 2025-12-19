const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================================
   🔴 Redis Client
   ========================================= */
const redisClient = redis.createClient({
  url: "redis://redis:6379",
});

redisClient
  .connect()
  .then(() => console.log("🔴 Connected to Redis"))
  .catch((err) => console.error("Redis error:", err));

/* =========================================
   ⚖️ Front-end Load Balancing (Round Robin)
   ========================================= */

// تُمرَّر من docker-compose كـ ENV
const CATALOG_REPLICAS = (process.env.CATALOG_REPLICAS ||
  "http://catalog-service-1:5001,http://catalog-service-2:5001"
).split(",");

const ORDER_REPLICAS = (process.env.ORDER_REPLICAS ||
  "http://order-service-1:5002,http://order-service-2:5002"
).split(",");

let rrCatalog = 0;
let rrOrder = 0;

function pickCatalog() {
  const url = CATALOG_REPLICAS[rrCatalog % CATALOG_REPLICAS.length].trim();
  rrCatalog++;
  return url;
}

function pickOrder() {
  const url = ORDER_REPLICAS[rrOrder % ORDER_REPLICAS.length].trim();
  rrOrder++;
  return url;
}

/* =========================================
   🔍 Search Books (Cached)
   ========================================= */
app.get("/search/:topic", async (req, res) => {
  const topic = req.params.topic;
  const cacheKey = `search:${topic}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache HIT (search): ${topic}`);
      return res.json(JSON.parse(cached));
    }

    console.log(`❌ Cache MISS (search): ${topic}`);
    const catalog = pickCatalog();
    const r = await axios.get(`${catalog}/search/${topic}`);

    await redisClient.set(cacheKey, JSON.stringify(r.data));
    res.json(r.data);
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data);
    res.status(500).json({ error: "internal_error" });
  }
});

/* =========================================
   ℹ️ Book Info (Cached)
   ========================================= */
app.get("/info/:id", async (req, res) => {
  const id = req.params.id;
  const cacheKey = `info:${id}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache HIT (info): book ${id}`);
      return res.json(JSON.parse(cached));
    }

    console.log(`❌ Cache MISS (info): book ${id}`);
    const catalog = pickCatalog();
    const r = await axios.get(`${catalog}/info/${id}`);

    await redisClient.set(cacheKey, JSON.stringify(r.data));
    res.json(r.data);
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data);
    res.status(500).json({ error: "internal_error" });
  }
});

/* =========================================
   💳 Purchase (NO cache invalidation here)
   ========================================= */
app.post("/purchase/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const order = pickOrder();
    const r = await axios.post(`${order}/purchase/${id}`);
    res.json(r.data);
  } catch (e) {
    if (e.response) return res.status(e.response.status).json(e.response.data);
    res.status(500).json({ error: "internal_error" });
  }
});

/* =========================================
   🧹 Cache Invalidation (Server-Push)
   ========================================= */
app.post("/invalidate/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await redisClient.del(`info:${id}`);
    await redisClient.del(`search:distributed`);
    await redisClient.del(`search:undergrad`);

    console.log(`🧹 Cache invalidated for book ${id}`);
    res.json({ status: "OK" });
  } catch (err) {
    res.status(500).json({ error: "invalidate_failed" });
  }
});

/* =========================================
   ✅ Health Check
   ========================================= */
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () =>
  console.log(`💻 Client service running on port ${PORT}`)
);
