// Dev tool: generate a plausible data/ tree for every FILE_CONFIG source so
// server.js can run without the real CBS share. Usage:
//   node tools/gen-data.js [dateSuffix]      (default: today as YYYYMMDD)
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "data");
const suffix = process.argv[2] ||
  new Date().toISOString().slice(0, 10).replace(/-/g, "");

const rnd = (max) => Math.floor(Math.random() * max);
const csvRow = (key, n, max = 999) =>
  [key, ...Array.from({ length: n }, () => rnd(max))].join(",");

function jobsLike(keys, cols = 16) {
  return keys.map((k) => csvRow(k, cols, 2)).join("\n") + "\n";
}

const FILES = {
  MFLAGS_D: suffix + "\n",

  [`jobs.txt_${suffix}`]: jobsLike(["B24 Gateway", "ATM Gateway", "INB Gateway", "MR Gateway", "TF Gateway", "Trickle Feed", "RTGS", "NEFT", "MQ SERVER"]),
  "queuebuilder.txt": ["CASQ", "CIFQ", "CIFQ A", "GEFU B", "SIQ"].map((k) => csvRow(k, 16, 700)).join("\n") + "\n",
  "trickle.txt": ["M", "S1", "S2"].map((k) => csvRow(k, 8, 500)).join("\n") + "\n",
  [`jobs_data/space_8apps.txt.${suffix}`]: ["/prod", "/data", "/logs"].map((k) => `${k},${rnd(90)}%,${rnd(90)}%,NA,${rnd(90)}%`).join("\n") + "\n",
  "context.txt": "CTX1: 12 : 34\nCTX2: 56 : 78\n",
  "system_utilization.txt": Array.from({ length: 16 }, (_, i) => `srv${i} ${rnd(99)} ${rnd(99)} x y ${rnd(99)} a b ${rnd(99)}`).join("\n") + "\n",
  "high_resourse.txt": Array.from({ length: 5 }, (_, i) => `proc${i} ${rnd(9999)} ${rnd(99)} a b c d ${rnd(99)}`).join("\n") + "\n",
  "mq_status.txt": ["QM1", "QM2"].map((k) => csvRow(k, 16, 2)).join("\n") + "\n",
  "OCR_NEFT.txt": ["OCR1", "OCR2"].map((k) => csvRow(k, 16, 50)).join("\n") + "\n",
  "branch_logged_in_no.txt": String(20000 + rnd(9999)),
  "teller_logged_in_no.txt": String(100000 + rnd(99999)),
  "branch_logged_in.txt": Array.from({ length: 60 }, (_, i) => `${i + 1}|BR${1000 + i}|BRANCH ${i + 1}|00${1 + rnd(9)}`).join("\n") + "\n",
  "repost_fail.txt": "line1\nline2\n",
  "neftinvalid.txt": `NEFT INVALID COUNT(In 9Apps) :${rnd(50)}\n`,
  "neftinvalidnight.txt": `NEFT NIGHT INVALID COUNT(In 9Apps) :${rnd(50)}\n`,
  "neft_all.txt": `${rnd(99)},${rnd(99)},${rnd(99)}\n`,
  "neft_invalid_spool.txt": "UTR1,x\nUTR2,y\n",
  "neft_invalid_spool_night.txt": "UTR3,x\n",
  "NNEF_REPOST_FAIL.txt": "a|b|c\nd|e|f\n",
  "NNEF_ALL.txt": "a|b|c\n",
  "neft_incoming_count.txt": `count,${rnd(9999)}\n`,
  "mrnax_conn.txt": "MAX CONN:512\r\nCUR CONN:128\r\n",
  "rtgsngingateway_12apps.txt": Array.from({ length: 16 }, () => rnd(3)).join(",") + "\n",
  "rtgsng_ack_in_12apps.txt": Array.from({ length: 16 }, () => rnd(3)).join(",") + "\n",
  "pr_card.txt": "PR1 10 20\nPR2 30 40\n",
  "nr_card.txt": "NR1 10 20\n",
  "dr_card.txt": "DR1 10 20\n",
  "rtgs.txt": `10:30,${rnd(50)}|x,${rnd(50)}|y,${rnd(9999)}|z,${rnd(9)}|w\n`,
  "rtgs_incoming.txt": `files,${rnd(5)}|a,${rnd(5)}|b\n`,
  "rtgs_outgoing.txt": `files,${rnd(5)}|a,${rnd(5)}|b\n`,
  "MISC.txt": jobsLike(["TXN A", "TXN B"], 4),
  "bu_arka.txt": `bu,${rnd(9)},,${rnd(9)}\n`,
  "night/gateway_night_9apps.txt": jobsLike(["B24 NIGHT", "ATM NIGHT"], 9),
  "night/status_queue_9apps.txt": ["NQ1", "NQ2"].map((k) => csvRow(k, 9, 700)).join("\n") + "\n",
  "night/IN0800_details_9apps.txt": jobsLike(["IN0800 A"], 9),
  "night/BR0501_details_9apps.txt": jobsLike(["BR0501 A"], 9),
  "night/jobs_m.txt": "job1:running\njob2:done\n",
  "night/jobs_s1.txt": "job1:running\n",
};

for (const [rel, content] of Object.entries(FILES)) {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}
// dirs used by the popup APIs
fs.mkdirSync(path.join(ROOT, "queue_replica"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "queue_replica", "replica_details_m_1.txt"), "pid1 CASQ x\npid2 CIFQ y\n");
fs.writeFileSync(path.join(ROOT, "trickle_summ.txt"), "T1,5\nT2,9\n");
fs.writeFileSync(path.join(ROOT, "final_trickle.txt"), "M,3,4\n");

console.log(`Generated ${Object.keys(FILES).length} files under ${ROOT} (date suffix ${suffix})`);
