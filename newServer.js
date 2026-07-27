const express = require("express");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173,http://10.177.194.138:4173")
  .split(",").map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(express.json());

const unifiedClients = new Set();

const MAX_CLIENT_BUFFER_BYTES = 1_000_000;

function writeToClient(res, payload) {
  try {
    if (res.writableEnded || res.destroyed) return false;
    const ok = res.write(payload);
    if (!ok && res.socket && res.socket.writableLength > MAX_CLIENT_BUFFER_BYTES) {
      console.warn("[sse] Dropping slow client (socket buffer over limit)");
      res.destroy();
      return false;
    }
    return true;
  } catch {
    try { res.destroy(); } catch { /* ignore */ }
    return false;
  }
}

// --------------------------------------------------
// Process-level guards — this server must run 24/7
// --------------------------------------------------


process.on("unhandledRejection", (reason) => {
  console.error("[process] Unhandled rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[process] Uncaught exception, exiting for supervisor restart:", err);
  process.exit(1);
});

function sendUnifiedRaw(source, dataStr) {
  if (unifiedClients.size === 0) return;
  const payload = `event: ${source}\ndata: ${dataStr}\n\n`;
  for (const res of unifiedClients) writeToClient(res, payload);
}

const MFLAGS_D_PATH = path.join(__dirname, "data", "MFLAGS_D");

let currentDateSuffix = null;

async function readDateSuffix() {
  try {
    const content = await fsp.readFile(MFLAGS_D_PATH, "utf8");
    return content.trim();
  } catch {
    return null;
  }
}

// --------------------------------------------------
// Diff Engine
// --------------------------------------------------

function diffStates(oldState, newState) {
  const deltas = [];

  for (const key in newState) {
    const newMetrics = newState[key];
    const oldMetrics = oldState[key];

    if (!oldMetrics) {
      deltas.push({ key, type: "new", metrics: newMetrics });
      continue;
    }

    const changes = [];

    if (Array.isArray(newMetrics)) {
      newMetrics.forEach((n, i) => {
        if (oldMetrics[i] !== n) {
          changes.push({ index: i, old: oldMetrics[i], new: n });
        }
      });
    } else {
      if (JSON.stringify(oldMetrics) !== JSON.stringify(newMetrics)) {
        changes.push({ old: oldMetrics, new: newMetrics });
      }
    }

    if (changes.length > 0) {
      deltas.push({ key, type: "update", changes });
    }
  }

  return deltas;
}

// --------------------------------------------------
// Readers
///Jobs
// --------------------------------------------------

async function readtxnDesc(folderPath) {
    const result = {};
    const files = await fsp.readdir(folderPath);

    const txnFiles = files.filter(file => /_txn\.txt$/i.test(file));
    console.log(txnFiles.length)
    for (const file of txnFiles) {
        const filePath = path.join(folderPath, file);

        const content = await fsp.readFile(filePath, "utf8");
        const state = {};

        content.split("\n").forEach(line => {
            line = line.trim();
            if (!line) return;
            const parts = line.split("@");
            const key = parts[0].trim();
            const metrics = parts.slice(1).map(v => {
                return v.trim();
            });
            state[key] = parts[1];
        });
        const masterName = path.basename(filePath, ".txt");
        result[masterName] = state;
    }
    return result;
}


async function readMflags_d(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  state["MFLAGS_D"] = content.trim();
  return state;
}


// --------------------------------------------------
// Watcher Factory
// -------------------------------------------------

const RESURRECTION_POLL_MS = 5000;
function GetTimeStamp() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false })
}

function createWatcher(name, baseFilePath, readerFn, usesDateSuffix = false, passive = false) {
  let prevState = {};
  let debounceTimer = null;
  const startUpTime = GetTimeStamp();
  let lastUpdatedTime = startUpTime;
  let fsWatcher = null;
  let resurrectTimer = null;
  let activePath = baseFilePath;
  const clients = new Set();
  const followers = [];

  // ---- helpers --------------------------------------------------------

  function resolveActivePath(dateSuffix) {
    if (!usesDateSuffix || !dateSuffix) return baseFilePath;
    return `${baseFilePath}${dateSuffix}`;
  }

  function broadcast(event, data) {
    const needsTimeStamp = event === "snapshot" || event === "delta";
    const envelope = needsTimeStamp ? { type: event, last_updated_time: lastUpdatedTime, payload: data } : data;
    const dataStr = JSON.stringify(envelope);
    const ssePayload = `event: ${event}\ndata: ${dataStr}\n\n`;
    for (const res of clients) {
      writeToClient(res, ssePayload);
    }
    sendUnifiedRaw(name, dataStr);
  }

  // ---- file processing -----------------------------------------------

  async function processFileChange() {
    try {
      const currState = await readerFn(activePath);
      const deltas = diffStates(prevState, currState);
      if (deltas.length > 0) {
        lastUpdatedTime = GetTimeStamp();
        broadcast("delta", deltas);
        prevState = currState;
      }
    } catch (err) {
      broadcast("error", { error: err.message });
    }
    for (const follower of followers) {
      follower.processFileChange().catch(() => { /* follower broadcasts its own error */ });
    }
  }

  // ---- fs.watch management -------------------------------------------

  function attachFsWatch() {
    if (fsWatcher) {
      try { fsWatcher.close(); } catch { /* ignore */ }
      fsWatcher = null;
    }

    // Auto-detect whether we're watching a single FILE or a FOLDER, so the
    // same factory handles both. For a folder, fs.watch fires 'change' when a
    // file inside is modified and 'rename' when a file is added/removed/renamed
    // — in both cases we just re-read the whole folder, instead of the
    // file-only behaviour of treating 'rename' as "the path was deleted".
    let watchingDir = false;
    try {
      watchingDir = fs.statSync(activePath).isDirectory();
    } catch { /* path vanished between checks — treat as a file */ }

    try {
      fsWatcher = fs.watch(activePath, (eventType) => {
        if (watchingDir) {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            // Only fall back to resurrection polling if the FOLDER itself is gone.
            if (!fs.existsSync(activePath)) {
              console.warn(`[${name}] Folder removed: ${activePath}. Polling for resurrection…`);
              if (fsWatcher) {
                try { fsWatcher.close(); } catch { /* ignore */ }
                fsWatcher = null;
              }
              broadcast("fileRemoved", { path: activePath });
              startResurrectionPolling();
              return;
            }
            processFileChange();
          }, 100);
          return;
        }

        // Single-file watch (original behaviour)
        if (eventType === "change") {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(processFileChange, 100);
        } else if (eventType === "rename") {

          console.warn(`[${name}] File removed/renamed: ${activePath}. Polling for resurrection…`);
          if (fsWatcher) {
            try { fsWatcher.close(); } catch { /* ignore */ }
            fsWatcher = null;
          }
          broadcast("fileRemoved", { path: activePath });
          startResurrectionPolling();
        }
      });

      fsWatcher.on("error", (err) => {
        console.error(`[${name}] fs.watch error: ${err.message}. Polling for resurrection…`);
        if (fsWatcher) {
          try { fsWatcher.close(); } catch { /* ignore */ }
          fsWatcher = null;
        }
        broadcast("error", { error: err.message });
        startResurrectionPolling();
      });
    } catch (err) {
      console.error(`[${name}] Could not attach fs.watch on ${activePath}: ${err.message}`);
      startResurrectionPolling();
    }
  }

  // ---- resurrection polling ------------------------------------------

  function startResurrectionPolling() {
    if (resurrectTimer) return;
    let ticking = false;
    resurrectTimer = setInterval(async () => {
      if (ticking) return;
      ticking = true;
      try {
        const exists = await fsp.access(activePath).then(() => true, () => false);
        if (!exists) return;
        clearInterval(resurrectTimer);
        resurrectTimer = null;
        console.log(`[${name}] File resurrected: ${activePath}. Restarting watcher.`);
        try {
          prevState = await readerFn(activePath);
          lastUpdatedTime = GetTimeStamp();
          broadcast("snapshot", prevState);
          broadcast("fileResurrected", { path: activePath });
        } catch (err) {
          console.error(`[${name}] Error reading resurrected file: ${err.message}`);
        }
        attachFsWatch();
      } finally {
        ticking = false;
      }
    }, RESURRECTION_POLL_MS);
  }

  // ---- public API ----------------------------------------------------

  function start() {
    if (usesDateSuffix && currentDateSuffix) {
      activePath = resolveActivePath(currentDateSuffix);
    }

    if (passive) {
      readerFn(activePath).then(state => {
        prevState = state;
      }).catch(err => {
        console.error(`[${name}] Initial read error: ${err.message}`);
      });
      console.log(`[${name}] Follower started (shares file with primary) → ${activePath}`);
      return;
    }

    if (!fs.existsSync(activePath)) {
      console.warn(`[${name}] File not found at start: ${activePath}. Polling for resurrection…`);
      startResurrectionPolling();
      return;
    }

    readerFn(activePath).then(state => {
      prevState = state;
    }).catch(err => {
      console.error(`[${name}] Initial read error: ${err.message}`);
    });

    attachFsWatch();
    console.log(`[${name}] Watcher started → ${activePath}`);
  }

  async function rolloverTo(newDateSuffix) {
    if (!usesDateSuffix) return;

    const newPath = resolveActivePath(newDateSuffix);
    if (newPath === activePath) return;

    console.log(`[${name}] Date rollover: ${activePath} → ${newPath}`);

    if (fsWatcher) {
      try { fsWatcher.close(); } catch { /* ignore */ }
      fsWatcher = null;
    }
    if (resurrectTimer) {
      clearInterval(resurrectTimer);
      resurrectTimer = null;
    }

    activePath = newPath;
    prevState = {};

    broadcast("rollover", { newPath, dateSuffix: newDateSuffix });

    if (!fs.existsSync(activePath)) {
      console.warn(`[${name}] Rolled-over file not yet present: ${activePath}. Polling…`);
      startResurrectionPolling();
      return;
    }

    try {
      prevState = await readerFn(activePath);
      broadcast("snapshot", prevState);
    } catch (err) {
      console.error(`[${name}] Error reading rolled-over file: ${err.message}`);
    }

    attachFsWatch();
  }

  function addClient(res) { clients.add(res); }
  function removeClient(res) { clients.delete(res); }
  function getState() { return prevState; }
  function getLastUpdatedTime() { return lastUpdatedTime; }
  function addFollower(watcher) { followers.push(watcher); }

  return { start, addClient, removeClient, getState, rolloverTo, getLastUpdatedTime, processFileChange, addFollower };
}

// --------------------------------------------------
// File Configuration
// --------------------------------------------------

const FILE_CONFIG = [
  { name: "txn_desc", path: "data/txn_desc", reader: readtxnDesc, usesDateSuffix: true },
    { name: "Mflags_d", path: "data/MFLAGS_D", reader: readMflags_d, usesDateSuffix: false },
];

// -------------------------------------------------- 
// Build watchers & start them
// --------------------------------------------------

const watchers = {};

(async () => {
  currentDateSuffix = await readDateSuffix();
  if (currentDateSuffix) {
    console.log(`[MFLAGS_D] Initial date suffix: ${currentDateSuffix}`);
  } else {
    console.warn("[MFLAGS_D] Could not read MFLAGS_D — date-suffixed files will use base path until flag file appears.");
  }

  const primaryByPath = new Map();
  FILE_CONFIG.forEach(config => {
    const fullPath = path.join(__dirname, config.path);
    const primary = primaryByPath.get(fullPath);
    const watcher = createWatcher(config.name, fullPath, config.reader, config.usesDateSuffix, Boolean(primary));
    watcher.start();
    watchers[config.name] = watcher;
    if (primary) {
      primary.addFollower(watcher);
    } else {
      primaryByPath.set(fullPath, watcher);
    }
  });

  startMflagsDWatcher();
  startServer();
})().catch(err => {
  console.error("[startup] Fatal error during boot:", err);
  process.exit(1);
});

// --------------------------------------------------
// MFLAGS_D Watcher
// --------------------------------------------------

function startMflagsDWatcher() {
  let mflagsWatcher = null;
  let mflagsResurrectTimer = null;

  function attachMflagsWatch() {
    if (mflagsWatcher) {
      try { mflagsWatcher.close(); } catch { /* ignore */ }
      mflagsWatcher = null;
    }

    if (!fs.existsSync(MFLAGS_D_PATH)) {
      console.warn("[MFLAGS_D] Flag file not found. Polling…");
      pollForMflags();
      return;
    }

    mflagsWatcher = fs.watch(MFLAGS_D_PATH, async (eventType) => {
      try {
        if (eventType === "change") {
          const newSuffix = await readDateSuffix();
          if (newSuffix && newSuffix !== currentDateSuffix) {
            console.log(`[MFLAGS_D] Date changed: ${currentDateSuffix} → ${newSuffix}`);
            currentDateSuffix = newSuffix;
            await rolloverAllDateSuffixed(newSuffix);
            sendUnifiedRaw("MFLAGS_D", JSON.stringify({ type: "dateRollover", dateSuffix: newSuffix }));
          }
        } else if (eventType === "rename") {
          console.warn("[MFLAGS_D] Flag file removed. Polling for it…");
          if (mflagsWatcher) {
            try { mflagsWatcher.close(); } catch { /* ignore */ }
            mflagsWatcher = null;
          }
          pollForMflags();
        }
      } catch (err) {
        console.error(`[MFLAGS_D] Error handling ${eventType}: ${err.message}`);
      }
    });

    mflagsWatcher.on("error", (err) => {
      console.error(`[MFLAGS_D] Watch error: ${err.message}`);
      if (mflagsWatcher) {
        try { mflagsWatcher.close(); } catch { /* ignore */ }
        mflagsWatcher = null;
      }
      pollForMflags();
    });

    console.log("[MFLAGS_D] Watching flag file for date changes.");
  }

  function pollForMflags() {
    if (mflagsResurrectTimer) return;
    let ticking = false;
    mflagsResurrectTimer = setInterval(async () => {
      if (ticking) return;
      ticking = true;
      try {
        const exists = await fsp.access(MFLAGS_D_PATH).then(() => true, () => false);
        if (!exists) return;
        clearInterval(mflagsResurrectTimer);
        mflagsResurrectTimer = null;
        console.log("[MFLAGS_D] Flag file reappeared. Reattaching watcher.");
        const newSuffix = await readDateSuffix();
        if (newSuffix && newSuffix !== currentDateSuffix) {
          currentDateSuffix = newSuffix;
          await rolloverAllDateSuffixed(newSuffix);
          sendUnifiedRaw("MFLAGS_D", JSON.stringify({ type: "dateRollover", dateSuffix: newSuffix }));
        }
        attachMflagsWatch();
      } catch (err) {
        console.error(`[MFLAGS_D] Poll error: ${err.message}`);
      } finally {
        ticking = false;
      }
    }, RESURRECTION_POLL_MS);
  }

  attachMflagsWatch();
}

async function rolloverAllDateSuffixed(newSuffix) {
  for (const config of FILE_CONFIG) {
    if (!config.usesDateSuffix) continue;
    try {
      await watchers[config.name].rolloverTo(newSuffix);
    } catch (err) {
      console.error(`[${config.name}] Rollover to ${newSuffix} failed: ${err.message}`);
    }
  }
}

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();

  const pingInterval = setInterval(() => {
    writeToClient(res, ": ping\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(pingInterval);
    unifiedClients.delete(res);
  });

  const sources = {};
  for (const config of FILE_CONFIG) {
    const watcher = watchers[config.name];
    if (watcher) {
      sources[config.name] = {
        payload: watcher.getState(),
        last_updated_time: watcher.getLastUpdatedTime(),
      };
    }
  }
  writeToClient(res, `event: init\ndata: ${JSON.stringify({ type: "init", sources })}\n\n`);

  unifiedClients.add(res);
});



// app.get('/api/txn-desc', async (req, res) => {
//   try {    
//     const resultState = await readtxnDesc('data/txt_desc');

//     res.json({
//       message: 'Files processed successfully',
//       data: resultState
//     });

//   } catch (error) {
//     console.error('Processing error:', error);
//     res.status(500).json({ error: 'Invailid files', details: error.message });
//   }
// });


// --------------------------------------------------
function startServer() {
  app.listen(PORT, () => {
    console.log(`SSE server running at http://localhost:${PORT}`);
  });
}
