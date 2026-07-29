const express = require('express');
const fsp = require("fs/promises");
const path = require('path');
const cors = require("cors");
const fs = require("fs");
const readline = require("readline");
const chokidar = require("chokidar");
const app = express();
const PORT = 4000;

const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5174,http://10.177.194.138:5173")
  .split(",").map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));

app.use(express.json());


const MFLAGS_D_PATH = "data/MFLAGS_D";
const QUEUE_REPLICA_PATH = "data/queue_replica";
const JOB_FILE_TYPES = {
  "B24 Gateway": "b24",
  "Trickle Feed": "tric",
  "RTGS": "rtgs"
};
const WATCH_DEBOUNCE_MS = 500;

function readDateSuffix() {
  try {
    const content = fs.readFileSync(MFLAGS_D_PATH, "utf8");
    return content.trim();
  } catch {
    return null;
  }
}

let date_ = readDateSuffix();
console.log(date_);

let gatewayCache = null;
let trickleCache = null;
let rtgsCache = null;
const pendingLoads = new Map();

function buildTimingPattern(fileType, date) {
  if (!fileType || !date) return null;
  const escapedDate = date.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^timing_${fileType}_(m|s\\d+)\\.txt\\.${escapedDate}$`, "i");
}

function fileMatchesJob(file, jobName, date) {
  const pattern = buildTimingPattern(JOB_FILE_TYPES[jobName], date);
  return Boolean(pattern && pattern.test(path.basename(file)));
}

async function parseTimingFile(filePath) {
  const state = {};
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  try {
    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parts = trimmed.split(/\s+/);
      const key = parts[0];
      state[key] = parts.slice(1);
    }
  } finally {
    rl.close();
    stream.destroy();
  }

  return {
    name: path.basename(filePath),
    state
  };
}

async function loadgateways(folderPath, jobName, date) {
  if (!date) {
    console.warn(`Skipping ${jobName} load because date suffix is unavailable`);
    return;
  }

  const fileType = JOB_FILE_TYPES[jobName];
  const pattern = buildTimingPattern(fileType, date);
  if (!pattern) {
    console.warn(`Skipping unsupported job: ${jobName}`);
    return;
  }

  const loadKey = `${jobName}:${date}`;
  if (pendingLoads.has(loadKey)) {
    return pendingLoads.get(loadKey);
  }

  const loadPromise = (async () => {
    const files = await fsp.readdir(folderPath);
    const timingFiles = files.filter(file => pattern.test(file));
    const cache = {};

    for (const file of timingFiles) {
      const filePath = path.join(folderPath, file);
      const parsedFile = await parseTimingFile(filePath);
      cache[parsedFile.name] = parsedFile.state;
    }

    switch (jobName) {
      case "B24 Gateway":
        gatewayCache = cache;
        break;
      case "Trickle Feed":
        trickleCache = cache;
        break;
      case "RTGS":
        rtgsCache = cache;
        break;
    }

    console.log(`Loaded ${timingFiles.length} ${jobName} timing files into memory`);
  })().finally(() => {
    pendingLoads.delete(loadKey);
  });

  pendingLoads.set(loadKey, loadPromise);
  return loadPromise;
}

async function loadAllGateways(date) {
  await loadgateways(QUEUE_REPLICA_PATH, "B24 Gateway", date);
  await loadgateways(QUEUE_REPLICA_PATH, "Trickle Feed", date);
  await loadgateways(QUEUE_REPLICA_PATH, "RTGS", date);
}

const scheduledLoads = new Map();
function scheduleLoad(key, loader) {
  clearTimeout(scheduledLoads.get(key));
  scheduledLoads.set(key, setTimeout(async () => {
    scheduledLoads.delete(key);
    try {
      await loader();
      console.log(`${key} processed successfully`);
    } catch (err) {
      console.error(err);
    }
  }, WATCH_DEBOUNCE_MS));
}

chokidar.watch(MFLAGS_D_PATH, { ignoreInitial: true })
  .on("change", () => {
    scheduleLoad("date-rollover", async () => {
      date_ = readDateSuffix();
      console.log(`${date_} >> Date Rollover Detected`);
      await loadAllGateways(date_);
      console.log(`Cache updated for ${date_}`);
    });
  });

chokidar.watch(`${QUEUE_REPLICA_PATH}/timing_*.txt.*`, { ignoreInitial: true })
  .on("change", (file) => {
    console.log(`${file} changed`);
    for (const jobName of Object.keys(JOB_FILE_TYPES)) {
      if (fileMatchesJob(file, jobName, date_)) {
        scheduleLoad(jobName, () => loadgateways(QUEUE_REPLICA_PATH, jobName, date_));
        break;
      }
    }
  });

//CALL ON STARTUP
(async () => {
  try {
    console.time("Initial Txn Load");
    await loadAllGateways(date_);

    console.timeEnd("Initial Txn Load");
  } catch (err) {
    console.error("Failed to preload txn files:", err);
  }
})();


//API
app.post("/api/jobs", async (req, res) => {
  try {
    const { jobName } = req.body;

    let result = null;
    switch (jobName) {
      case "B24 Gateway":
        result = gatewayCache;
        break;
      case "Trickle Feed":
        result = trickleCache;
        break;
      case "RTGS":
        result = rtgsCache;
        break;
    }
    res.json({
      message: "Files processed successfully",
      data: result
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to return cached data",
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
