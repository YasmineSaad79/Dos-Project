const axios = require("axios");
const fs = require("fs");
const { performance } = require("perf_hooks");

// عدد التكرارات لتجربة كل طلب
const NUM_REQUESTS = 20;

// URL بدون كاش
const URL_NO_CACHE = "http://localhost:5000/info/1";

// URL مع كاش (بعد أول طلب)
const URL_WITH_CACHE = "http://localhost:5000/info/1";

// تخزين الأوقات
const results = [];

async function measureRequest(url, useCache) {
  const times = [];

  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = performance.now();
    try {
      await axios.get(url);
    } catch (err) {
      console.error(`❌ Error on ${useCache ? "cache" : "no-cache"} run`, err.message);
    }
    const end = performance.now();
    times.push(end - start);
  }

  const average = times.reduce((a, b) => a + b, 0) / times.length;

  results.push({
    type: useCache ? "With Cache" : "Without Cache",
    times,
    average: average.toFixed(2),
  });
}

async function runBenchmark() {
  console.log("🚀 Benchmark started...");

  // تجربة بدون كاش
  await measureRequest(URL_NO_CACHE, false);

  // تجربة مع كاش (بعد أول طلب يتم تخزين النتيجة)
  await measureRequest(URL_WITH_CACHE, true);

  console.log("✅ Benchmark completed.\n");

  // طباعة النتائج في جدول
  console.table(results.map(r => ({
    Type: r.type,
    "Average (ms)": r.average,
  })));

  // حفظ النتائج في ملف CSV
  const csvLines = ["Type,Request #,Time (ms)"];
  results.forEach((r) => {
    r.times.forEach((t, i) => {
      csvLines.push(`${r.type},${i + 1},${t.toFixed(2)}`);
    });
  });

  fs.writeFileSync("benchmark_results.csv", csvLines.join("\n"));
  console.log("📁 Saved CSV to benchmark_results.csv");
}

runBenchmark();
