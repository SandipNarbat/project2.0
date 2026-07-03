const express = require("express");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174")
  .split(",").map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(express.json());

// --------------------------------------------------
// Unified SSE fan-out
// --------------------------------------------------
// All /events clients live in one Set. Payloads are stringified exactly once
// per broadcast, regardless of how many clients are connected.

const unifiedClients = new Set();

function writeToClient(res, payload) {
  try {
    if (res.writableEnded || res.destroyed) return false;
    return res.write(payload);
  } catch {
    return false;
  }
}

// On the unified stream every message is named by its SOURCE; the inner
// envelope's `type` field distinguishes snapshot/delta/etc.
function sendUnifiedRaw(source, dataStr) {
  if (unifiedClients.size === 0) return;
  const payload = `event: ${source}\ndata: ${dataStr}\n\n`;
  for (const res of unifiedClients) writeToClient(res, payload);
}

const MFLAGS_D_PATH = path.join(__dirname, "data", "MFLAGS_D");

let currentDateSuffix = null;   // e.g. "20260525"

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

async function readJobsState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(",");
    state[parts[0]] = parts.slice(1);
  });
  return state;
}

/// queue Buildup
async function readQueueState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    if (line.includes("VV3Q")) return;

    line = line.replace(/NQKE/g, "-1");   

    const parts = line.split(",");
    const key = parts[0];

    const metrics = parts.slice(1).map(v => {
      const num = parseInt(v.trim(), 10);
      if (isNaN(num)) return 0;
      return (num >= 1 && num < 150) ? 0 : num;
    });

    state[key] = metrics;
  });
  return state;
}

//Trickle feed master
async function readTrickleMasterState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(",");
    const key = parts[0];
    const metrics = parts.slice(1).map(v => {
      const num = parseInt(v.trim(), 10);
      return num;
    });
    state[key] = metrics;
  });
  return state;
}

//space utilization
async function readSpaceState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(",");
    const key = parts[0];
    const metrics = parts.slice(1).map(v => {
      if (v === "NA") return "NA";
      const v1 = v.slice(0, -1)
      const num = parseInt((v.trim()), 10);
      return num;
    });
    state[key] = metrics;
  });
  return state;
}

//sysytem context block
async function readSystemContextState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(":");
    const key = parts[0].trim();
    const metrics = parts.slice(1).map(v => {
      return v.trim();
    });
    state[key] = metrics;
  });
  return state;
}

//sysytem Utilization
async function readSystemUtilizationState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  const METRICS_INDICES = [0, 1, 2, 5, 8];

  let counter = 1;

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    line = line.replace(/\\u0000/g, '');
    const parts = line.split(/\s+/);
    const key = counter;
    counter++;

    const allMetrics = parts;
    const picked = METRICS_INDICES.map(i => {
      const v = allMetrics[i];
      if (v === undefined) return null;
      const num = parseFloat(v);
      return v;
    });

    state[key] = picked;
  });

  return state;
}

// High Resource Replicas
async function readHighResourseState(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  let counter = 1;

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(/\s+/);
    const key = counter;
    counter++;

    const allMetrics = [parts[0], parts[1], parts[2], parts[7], parts[4]];
    state[key] = allMetrics;
  });
  return state;
}

//RTGS and NEFT
async function readRtgs(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  const parts = content.split(",");
  const key = parts[0].trim();
  const values = parts.slice(1).map(val => val.split("|")[0].trim());
  state[key] = values;
  return state;
}


/// Queue Buildup Replica
async function QueueBuildupReplica(folderPath, queue) {
  const state = {};
  let totalCount = 0;

  const files = await fsp.readdir(folderPath);

  const txtFiles = files.filter(f => f.endsWith('.txt'));

  for (const file of txtFiles) {
    const filePath = path.join(folderPath, file);

    const match = file.match(/replica_details_(.*?)_/);
    const identifier = match ? match[1] : file.split('.')[0];

    const stateKey = `${identifier}_${queue}`;

    const content = await fsp.readFile(filePath, "utf8");
    const replicas = [];

    content.split("\n").forEach(line => {
      line = line.trim();
      if (!line) return;

      if (queue.includes(" ")) {
        const parts = queue.split(" ")
        const pattern = `${parts[0].slice(0, -1)}.......${parts[1]}`;
        const regex = new RegExp(pattern);
        if (regex.test(line)) {
          const parts = line.split(" ");
          if (parts.length > 0) {
            replicas.push(parts[0]);
          }
        }
      }
      else {
        if (line.includes(queue.slice(0, -1))) {
          const parts = line.split(" ");
          if (parts.length > 0) {
            replicas.push(parts[0]);
          }
        }
      }

    });

    state[stateKey] = replicas;
    totalCount += replicas.length;

  }

  return state;
}

// GATEWAY_MORE
async function readGatewayMore(gatewaypath) {
  const result = {};
  const files = await fsp.readdir(gatewaypath);

  const timingFiles = files.filter(file => /^timing_b24_(m|s\d+)\.txt$/i.test(file));

  for (const file of timingFiles) {
    const filePath = path.join(gatewaypath, file);

    const content = await fsp.readFile(filePath, "utf8");
    const state = {};

    content.split("\n").forEach(line => {
      line = line.trim();
      if (!line) return;
      const parts = line.split(" ");
      const key = parts[0].trim();
      const metrics = parts.slice(1).map(v => {
        return v.trim();
      });
      state[key] = parts[1].trim();
    });
    const masterName = path.basename(filePath, ".txt");
    result[masterName] = state;
  }
  return result;
}

//TRICKLEFEED MORE
async function readtricklemore(tricklepath) {
  const result = {};
  const files = await fsp.readdir(tricklepath);

  const timingFiles = files.filter(file => /^timing_tric_(m|s\d+)\.txt$/i.test(file));

  for (const file of timingFiles) {
    const filePath = path.join(tricklepath, file);

    const content = await fsp.readFile(filePath, "utf8");
    const state = {};

    content.split("\n").forEach(line => {
      line = line.trim();
      if (!line) return;
      const parts = line.split(" ");
      const key = parts[0].trim();
      const metrics = parts.slice(1).map(v => {
        return v.trim();
      });
      state[key] = metrics;
    });
    const masterName = path.basename(filePath, ".txt");
    result[masterName] = state;
  }
  // console.log({[masterName]:state})
  return result;
}

//RTGS MORE
async function readrtgsmore(rtgspath) {
  const result = {};
  const files = await fsp.readdir(rtgspath);

  const timingFiles = files.filter(file => /^timing_rtgs_(m|s\d+)\.txt$/i.test(file));

  for (const file of timingFiles) {
    const filePath = path.join(rtgspath, file);

    const content = await fsp.readFile(filePath, "utf8");
    const state = {};

    content.split("\n").forEach(line => {
      line = line.trim();
      if (!line) return;
      const parts = line.split(" ");
      const key = parts[0].trim();
      const metrics = parts.slice(1).map(v => {
        return v.trim();
      });
      state[key] = metrics;
    });
    const masterName = path.basename(filePath, ".txt");
    result[masterName] = state;
  }
  return result;
}

/// trickle feed summary


//MQ_status
async function readMQStatus(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(",");
    state[parts[0]] = parts.slice(1);
  });
  return state;
}

//OCR NEFT
async function readOCRNEFT(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(",").map(item => item === "---" ? "-" : item);
    state[parts[0]] = parts.slice(1);
  });
  return state;
}
//branch logged in No
async function readBLIN(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  state["branch logged in No"] = content
  return state;
}
//teller logged in no
async function readTLIN(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  state["teller logged in No"] = content
  return state;
}
//readNeftOncomigCount
async function readNeftOncomigCount(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  const parts = content.split(",");
  state["neft incoming count"] = parts[1].trim()
  return state;
}
//branch logged in
async function readBranchLoggedIn(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  var count = 0;
  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;
    const parts = line.split("|");
    const key = count + 1;
    const metrics = parts.map(v => {
      return v.trim();
    });
    state[key] = metrics;
    count++;
  });
  return state;
}

// reposting fails
async function readRepostingFail(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  const lines = content.split('\n');
  state["repost fail"] = lines.length;
  return state;
}

// neft invalid (D/N) count
async function readNeftInvalidDN(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  if (!content) return;
  const parts = content.split(':');
  state[parts[0]] = parts[1];
  return state;
}

// neft count
async function ReadNeftCount(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  if (!content) return;

  const parts = content.split(",");
  state["neft count"] = parts;
  return state;
};


//neft invalid day and night
async function ReadNeftInvalidDNUTR(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  let counter = 1;

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split("|");
    const key = counter;
    counter++;

    const allMetrics = parts.slice(1).map(v => {
      return v.trim();
    });
    state[key] = allMetrics;
  });
  return state;
}


// neft reposting failed night
async function readNeftRepostFailNight(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  let counter = 1;

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split("|");
    const key = counter;
    counter++;

    const allMetrics = parts.map(v => {
      return v.trim();
    });
    state[key] = allMetrics;
  });
  return state;
}

// Repost Fail
async function readRepostFail(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  let counter = 1;

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split("|");
    const key = counter;
    counter++;

    const allMetrics = parts.map(v => {
      return v.trim();
    });
    state[key] = allMetrics;
  });
  return state;
}


// UPI MR Connections
async function readUPIMR(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  content.split('\r\n').forEach(line => {
    if (!line) return;
    const parts = line.split(":")
    state[parts[0]] = parts[1];
  });
  return state;
}

// read rtgsnging Gateway 12apps
async function readrtgsngingGateway_12apps(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  if (!content) return;
  const parts = content.split(",")
  state["01ERR 0546"] = parts;
  return state;
}

// read rtgsnging Gateway 12apps
async function readrtgAcksngingGateway_12apps(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  if (!content) return;
  const parts = content.split(",")
  state["01ERR 0146"] = parts;
  return state;
}
/// legends   

async function readLegends(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(" ");
    state[parts[0]] = parts.slice(1);
  });
  return state;
}

// rtgs outgoing / incoming

async function readRtgsIncoming(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(" ");
    state["rtgs_incoming"] = [parts[0], parts[1], parts[2], parts[3], parts[8]];
  });
  return state;
}

async function readRtgsOutgoing(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(" ");
    state["rtgs_outgoing"] = [parts[0], parts[4], parts[5], parts[6], parts[7], parts[9]];
  });
  return state;
}

// read BU
async function readBU(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  if (!content) return;

  const parts = content.split(",");
  parts.push("NA")
  parts.forEach((element, i) => {
    if (element === "") {
      parts[i] = "OK"
    }
  });
  state["BU"] = parts.slice(1);
  return state;
};

async function readtrickleSummary(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  let counter = 1;

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(",");
    const key = counter;
    counter++;

    const allMetrics = parts.map(v => {
      return v.trim();
    });
    state[key] = allMetrics;
  });
  return state;
}

async function trickleSummaryCount() {
  const filePath = "data/trickle_summ.txt";
  const content = await fsp.readFile(filePath, 'utf8');

  const lines = content.trim().split('\n');
  const aggregated = {};

  lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length >= 3) {
      const key = parts[1];
      const value = parseFloat(parts[2]) || 0;

      if (!aggregated[key]) {
        aggregated[key] = 0;
      }
      aggregated[key] += value;
    }
  });
  return aggregated;
}

async function NewPlusOld() {
  const filePath = "data/final_trickle.txt";
  const content = await fsp.readFile(filePath, 'utf8');
  const lines = content.trim().split('\r\n');
  const state = {};

  lines.forEach(line => {
    const parts = line.split(" ");
    state[parts[0]] = parts.slice(1);
  })
  return state;
}

// Neft Invalid By date api function

async function NeftInvalidByDate(filePath){
  const state = {};
  try{
    const content = await fsp.readFile(filePath, "utf8");
    content.split("\n").forEach(line => {
      line = line.trim();
      if (!line) return;
  
      const parts = line.split(",");
      state[parts[0]] = parts.slice(1);
    });
    if(Object.keys(state).length === 0){
      return state
    }else{
  
      return state;
    }
  }catch (err){
    return state;
  }
}
// pace buildup api function

async function readPaceBuildup(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  let counter = 1;

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(",");
    const key = counter;
    counter++;

    const allMetrics = parts;
    state[key] = allMetrics;
  });
  return state;
}

/// MFLAGS_D

async function readMflags_d(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");
  state["MFLAGS_D"] = content.trim();
  return state;
}

//////////////////////////////////////// NIGHT ///////////////////////////////////////////////////////

// read active jobs
async function readActiveJobs(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(":");
    state[parts[0]] = parts[1];
  });
  return state;
}


// --------------------------------------------------
// Watcher Factory
// --------------------------------------------------

const RESURRECTION_POLL_MS = 5000;   // how often to poll for a missing file
function GetTimeStamp() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false })
}

function createWatcher(name, baseFilePath, readerFn, usesDateSuffix = false) {
  let prevState = {};
  let debounceTimer = null;
  const startUpTime = GetTimeStamp();
  let lastUpdatedTime = startUpTime;
  let fsWatcher = null;
  let resurrectTimer = null;
  let activePath = baseFilePath;   // the path currently being watched
  const clients = new Set();

  // ---- helpers --------------------------------------------------------

  function resolveActivePath(dateSuffix) {
    if (!usesDateSuffix || !dateSuffix) return baseFilePath;
    return `${baseFilePath}${dateSuffix}`;
  }

  function broadcast(event, data) {
    const needsTimeStamp = event === "snapshot" || event === "delta";
    const envelope = needsTimeStamp ? { type: event, last_updated_time: lastUpdatedTime, payload: data } : data;
    const dataStr = JSON.stringify(envelope);   // stringified once for all clients
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
        // ONE message per file change carrying ALL deltas — a full-file
        // rewrite used to fan out as N separate SSE messages, each forcing a
        // client-side parse + state update (the browser froze on bursts).
        broadcast("delta", deltas);
        prevState = currState;
      }
    } catch (err) {
      broadcast("error", { error: err.message });
    }
  }

  // ---- fs.watch management -------------------------------------------

  function attachFsWatch() {
    if (fsWatcher) {
      try { fsWatcher.close(); } catch { /* ignore */ }
      fsWatcher = null;
    }

    try {
      fsWatcher = fs.watch(activePath, (eventType) => {
        if (eventType === "change") {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(processFileChange, 100);
        } else if (eventType === "rename") {
          // File was removed (or renamed away). Stop watching and begin
          // polling until it comes back.
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
    if (resurrectTimer) return;   // already polling
    resurrectTimer = setInterval(async () => {
      if (fs.existsSync(activePath)) {
        clearInterval(resurrectTimer);
        resurrectTimer = null;
        console.log(`[${name}] File resurrected: ${activePath}. Restarting watcher.`);
        try {
          prevState = await readerFn(activePath);
          broadcast("snapshot", prevState);
          broadcast("fileResurrected", { path: activePath });
        } catch (err) {
          console.error(`[${name}] Error reading resurrected file: ${err.message}`);
        }
        attachFsWatch();
      }
    }, RESURRECTION_POLL_MS);
  }

  // ---- public API ----------------------------------------------------

  function start() {
    // Initialise activePath with the current date suffix (if applicable).
    if (usesDateSuffix && currentDateSuffix) {
      activePath = resolveActivePath(currentDateSuffix);
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

  // Called by the MFLAGS_D monitor when the date changes.
  async function rolloverTo(newDateSuffix) {
    if (!usesDateSuffix) return;

    const newPath = resolveActivePath(newDateSuffix);
    if (newPath === activePath) return;   // no-op if same path

    console.log(`[${name}] Date rollover: ${activePath} → ${newPath}`);

    // Stop current watch / polling.
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

  return { start, addClient, removeClient, getState, rolloverTo, getLastUpdatedTime };
}

// --------------------------------------------------
// File Configuration
// --------------------------------------------------

const FILE_CONFIG = [
  { name: "jobs", path: "data/jobs.txt_", reader: readJobsState, usesDateSuffix: true },
  { name: "queue", path: "data/queuebuilder.txt", reader: readQueueState, usesDateSuffix: false },
  { name: "trickle", path: "data/trickle.txt", reader: readTrickleMasterState, usesDateSuffix: false },
  { name: "space", path: "data/jobs_data/space_8apps.txt.20260626", reader: readSpaceState, usesDateSuffix: false },
  { name: "context", path: "data/context.txt", reader: readSystemContextState, usesDateSuffix: false },
  { name: "system", path: "data/system_utilization.txt", reader: readSystemUtilizationState, usesDateSuffix: false },
  { name: "resourse", path: "data/high_resourse.txt", reader: readHighResourseState, usesDateSuffix: false },
  { name: "MQStatus", path: "data/mq_status.txt", reader: readMQStatus, usesDateSuffix: false },
  { name: "OCRNEFT", path: "data/OCR_NEFT.txt", reader: readOCRNEFT, usesDateSuffix: false },
  { name: "branchLoggedInNo", path: "data/branch_logged_in_no.txt", reader: readBLIN, usesDateSuffix: false },
  { name: "tellerLoggedInNo", path: "data/teller_logged_in_no.txt", reader: readTLIN, usesDateSuffix: false },
  { name: "branchLoggedIn", path: "data/branch_logged_in.txt", reader: readBranchLoggedIn, usesDateSuffix: false },
  { name: "repostingFail", path: "data/repost_fail.txt", reader: readRepostingFail, usesDateSuffix: false },
  { name: "neftInvalidDay", path: "data/neftinvalid.txt", reader: readNeftInvalidDN, usesDateSuffix: false },
  { name: "neftInvalidNight", path: "data/neftinvalidnight.txt", reader: readNeftInvalidDN, usesDateSuffix: false },
  { name: "neftcounttable", path: "data/neft_all.txt", reader: ReadNeftCount, usesDateSuffix: false },
  { name: "neftDinvalidUtr", path: "data/neft_invalid_spool.txt", reader: ReadNeftInvalidDNUTR, usesDateSuffix: false },
  { name: "neftNinvalidUtr", path: "data/neft_invalid_spool_night.txt", reader: ReadNeftInvalidDNUTR, usesDateSuffix: false },
  { name: "neftRepostFailNight", path: "data/NNEF_REPOST_FAIL.txt", reader: readNeftRepostFailNight, usesDateSuffix: false },
  { name: "neftRepostFailPage", path: "data/NNEF_ALL.txt", reader: readRepostFail, usesDateSuffix: false },
  { name: "neftIncomingCount", path: "data/neft_incoming_count.txt", reader: readNeftOncomigCount, usesDateSuffix: false },



  { name: "UpiMrMax", path: "data/mrnax_conn.txt", reader: readUPIMR, usesDateSuffix: false },
  { name: "RTGSngingGateway12Apps", path: "data/rtgsngingateway_12apps.txt", reader: readrtgsngingGateway_12apps, usesDateSuffix: false },
  { name: "RTGSACKngingGateway12Apps", path: "data/rtgsng_ack_in_12apps.txt", reader: readrtgAcksngingGateway_12apps, usesDateSuffix: false },

  { name: "PrLegend", path: "data/pr_card.txt", reader: readLegends, usesDateSuffix: false },
  { name: "NrLegend", path: "data/nr_card.txt", reader: readLegends, usesDateSuffix: false },
  { name: "DrLegend", path: "data/dr_card.txt", reader: readLegends, usesDateSuffix: false },
  { name: "RtgsIncoming", path: "data/rtgs.txt", reader: readRtgsIncoming, usesDateSuffix: false },
  { name: "RtgsOutgoing", path: "data/rtgs.txt", reader: readRtgsOutgoing, usesDateSuffix: false },
  { name: "rtgsIncomingPend", path: "data/rtgs_incoming.txt", reader: readRtgs, usesDateSuffix: false },
  { name: "rtgsOutgoingPend", path: "data/rtgs_outgoing.txt", reader: readRtgs, usesDateSuffix: false },
  { name: "miscTxtCount", path: "data/MISC.txt", reader: readJobsState, usesDateSuffix: false },
  { name: "batchUpload", path: "data/bu_arka.txt", reader: readBU, usesDateSuffix: false },
  // { name: "trickleSummary", path: "data/trickle_summ.txt", reader: readtrickleSummary, usesDateSuffix: false },

  { name: "Mflags_d", path: "data/MFLAGS_D", reader: readMflags_d, usesDateSuffix: false },

  //night region

  { name: "jobsNight", path: "data/night/gateway_night_9apps.txt", reader: readJobsState, usesDateSuffix: false },
  { name: "queueNight", path: "data/night/status_queue_9apps.txt", reader: readQueueState, usesDateSuffix: false },
  { name: "in0800", path: "data/night/IN0800_details_9apps.txt", reader: readJobsState, usesDateSuffix: false },
  { name: "BR0501", path: "data/night/BR0501_details_9apps.txt", reader: readJobsState, usesDateSuffix: false },
  { name: "activeJobM", path: "data/night/jobs_m.txt", reader: readActiveJobs, usesDateSuffix: false },
  { name: "activeJobS1", path: "data/night/jobs_s1.txt", reader: readActiveJobs, usesDateSuffix: false },

];

// -------------------------------------------------- 
// Build watchers & start them
// --------------------------------------------------

const watchers = {};

// Read initial date suffix synchronously so watchers start on the right file.
(async () => {
  currentDateSuffix = await readDateSuffix();
  if (currentDateSuffix) {
    console.log(`[MFLAGS_D] Initial date suffix: ${currentDateSuffix}`);
  } else {
    console.warn("[MFLAGS_D] Could not read MFLAGS_D — date-suffixed files will use base path until flag file appears.");
  }

  FILE_CONFIG.forEach(config => {
    const fullPath = path.join(__dirname, config.path);
    const watcher = createWatcher(config.name, fullPath, config.reader, config.usesDateSuffix);
    watcher.start();
    watchers[config.name] = watcher;
  });

  startMflagsDWatcher();
  startServer();
})();

// --------------------------------------------------
// MFLAGS_D Watcher
// --------------------------------------------------
// Watches data/MFLAGS_D for content changes.  When the date string
// inside it changes, triggers rolloverTo() on every date-suffixed watcher.

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
      if (eventType === "change") {
        const newSuffix = await readDateSuffix();
        if (newSuffix && newSuffix !== currentDateSuffix) {
          console.log(`[MFLAGS_D] Date changed: ${currentDateSuffix} → ${newSuffix}`);
          currentDateSuffix = newSuffix;

          // Notify all date-suffixed watchers to roll over.
          for (const config of FILE_CONFIG) {
            if (config.usesDateSuffix) {
              await watchers[config.name].rolloverTo(newSuffix);
            }
          }

          // Broadcast a global rollover event on the unified channel.
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
    mflagsResurrectTimer = setInterval(async () => {
      if (fs.existsSync(MFLAGS_D_PATH)) {
        clearInterval(mflagsResurrectTimer);
        mflagsResurrectTimer = null;
        console.log("[MFLAGS_D] Flag file reappeared. Reattaching watcher.");
        // Immediately check if date changed while flag was missing.
        const newSuffix = await readDateSuffix();
        if (newSuffix && newSuffix !== currentDateSuffix) {
          currentDateSuffix = newSuffix;
          for (const config of FILE_CONFIG) {
            if (config.usesDateSuffix) {
              await watchers[config.name].rolloverTo(newSuffix);
            }
          }
          sendUnifiedRaw("MFLAGS_D", JSON.stringify({ type: "dateRollover", dateSuffix: newSuffix }));
        }
        attachMflagsWatch();
      }
    }, RESURRECTION_POLL_MS);
  }

  attachMflagsWatch();
}

// --------------------------------------------------
// Dynamic Per-File SSE Route
// --------------------------------------------------

app.get("/events/:source", (req, res) => {
  const { source } = req.params;
  const watcher = watchers[source];

  if (!watcher) {
    return res.status(404).json({ error: "Invalid source" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();
  watcher.addClient(res);

  res.write(`event: snapshot\ndata: ${JSON.stringify({ type: "snapshot", last_updated_time: watcher.getUpdatedTime(), payload: watcher.getState() })}\n\n`);

  const pingInterval = setInterval(() => {
    res.write(": ping\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(pingInterval);
    watcher.removeClient(res);
  });
});

// --------------------------------------------------
// Unified SSE Route
// --------------------------------------------------

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();

  const pingInterval = setInterval(() => {
    writeToClient(res, ": ping\n\n");
  }, 15000);

  // Cleanup is registered BEFORE any write so a failed write can never leave
  // a zombie client behind.
  req.on("close", () => {
    clearInterval(pingInterval);
    unifiedClients.delete(res);
  });

  // ONE init message carrying every source's current state — the client does
  // a single parse + a single state update instead of 37 back-to-back
  // snapshot messages (the old connect/reconnect burst froze the browser).
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

// queue Replica API
app.post('/api/process-files', async (req, res) => {
  try {
    const { queue } = req.body;
    const resultState = await QueueBuildupReplica("data/queue_replica", queue);

    res.json({
      message: 'Files processed successfully',
      data: resultState
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Invailid queue name', details: error.message });
  }
});


// Trickle summary API

app.get('/api/trickle-summ', async (req, res) => {
  try {
    const summCount = await trickleSummaryCount();
    const summary = await readtrickleSummary("data/trickle_summ.txt");
    const newPlusOld = await NewPlusOld();


    res.json({
      message: 'Files processed successfully',
      data: summCount,
      data2: summary,
      data3: newPlusOld
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Invailid queue name', details: error.message });
  }
});


// jobs API

const jobProcessors = {
  "B24 Gateway": () => readGatewayMore("data/queue_replica"),
  "Trickle Feed": () => readtricklemore("data/queue_replica"),
  "RTGS": () => readrtgsmore("data/queue_replica"),
};

app.post("/api/jobs", async (req, res) => {
  try {
    console.log("BODY = ", req.body);
    const { jobName } = req.body;
    const processor = jobProcessors[jobName];

    if (!processor) {
      return res.status(400).json({ error: `Unsupported job: ${jobName}` });
    }

    const result = await processor();
    res.json({
      success: true,
      data: result

    });

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
});

app.post('/api/neft-invalid', async (req, res) => {
  try {
    const { date, isDay } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    console.log(isDay ? "day" : "night");
    
    const filePath = isDay 
      ? `data/Neft_Invalid.txt.${date}`
      : `data/Neft_InvalidNight.txt.${date}`;
    
    const resultState = await NeftInvalidByDate(filePath);

    res.json({
      message: 'Files processed successfully',
      data: resultState
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ 
      error: 'Invalid file', 
      details: error.message 
    });
  }
});   


//pace buildup api

app.post('/api/pace_buildup', async (req, res) => {
  try {
    const { flag } = req.body;
    
    const resultState = await readPaceBuildup(`data/${flag}`);

    res.json({
      message: 'Files processed successfully',
      data: resultState
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Invailid name', details: error.message });
  }
});

// --------------------------------------------------
function startServer() {
  app.listen(PORT, () => {
    console.log(`SSE server running at http://localhost:${PORT}`);
  });
}
