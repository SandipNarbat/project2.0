// Dev tool: continuously rewrite random data files to simulate the CBS share
// under load. Usage:
//   node tools/churn.js [intervalMs] [filesPerTick]     (default 200ms, 3 files)
// Every ~15s it also deletes+recreates one file (resurrection path).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "data");
const INTERVAL = Number(process.argv[2]) || 200;
const PER_TICK = Number(process.argv[3]) || 3;

const rnd = (max) => Math.floor(Math.random() * max);

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "queue_replica" ? [] : listFiles(p);
    return e.name === "MFLAGS_D" ? [] : [p];
  });
}

function rewrite(file) {
  // keep the line structure, randomize the numbers
  const content = fs.readFileSync(file, "utf8");
  const churned = content.replace(/\b\d{1,4}\b/g, () => rnd(999));
  fs.writeFileSync(file, churned);
}

const files = listFiles(ROOT);
console.log(`Churning ${files.length} files every ${INTERVAL}ms (${PER_TICK}/tick). Ctrl+C to stop.`);

let tick = 0;
setInterval(() => {
  tick++;
  for (let i = 0; i < PER_TICK; i++) {
    const f = files[rnd(files.length)];
    try { rewrite(f); } catch { /* deleted mid-run */ }
  }
  // every ~15s: delete + recreate a file to exercise resurrection polling
  if (tick % Math.max(1, Math.round(15000 / INTERVAL)) === 0) {
    const f = files[rnd(files.length)];
    try {
      const content = fs.readFileSync(f, "utf8");
      fs.unlinkSync(f);
      setTimeout(() => fs.writeFileSync(f, content), 6000);
      console.log(`[churn] deleted ${path.basename(f)} (recreates in 6s)`);
    } catch { /* ignore */ }
  }
}, INTERVAL);
