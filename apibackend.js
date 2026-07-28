const express = require("express");
const fsp = require("fs/promises");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors({ origin: ["https://10.177.194.138:9090"] }));
app.use(express.json());

//////////////////////////////////////////[   API'S FUNCTIONS   ]///////////////////////////////////////////

/// Queue Buildup Replica
async function QueueBuildupReplica(folderPath, queue) {
  const state = {};
  let totalCount = 0;

  const files = await fsp.readdir(folderPath);

const txtFiles = files.filter(f => f.startsWith('replica_details_'));
  const spacedQueue = queue.includes(" ");
  let regex = null;
  if (spacedQueue) {
    const qparts = queue.split(" ");
    regex = new RegExp(`${qparts[0].slice(0, -1)}.......${qparts[1]}`);
  }
  const plainNeedle = queue.slice(0, -1);

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

      const hit = spacedQueue ? regex.test(line) : line.includes(plainNeedle);
      if (hit) {
        const parts = line.split(" ");
        if (parts.length > 0) {
          replicas.push(parts[0]);
        }
      }

    });

    state[stateKey] = replicas;
    totalCount += replicas.length;

  }

  return state;
}

// GATEWAY_MORE
async function readGatewayMore(gatewaypath, date) {

  const result = {};
  const files = await fsp.readdir(gatewaypath);

  const timingFiles = files.filter(file =>
    new RegExp(`^timing_b24_.*\\.txt\\.${date}$`, 'i').test(file)
  );
  console.log("timing fles:")
  console.log(timingFiles)

  for (const file of timingFiles) {
    const filePath = path.join(gatewaypath, file);
    console.log(filePath)

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
      state[key] = parts[1]?.trim() ?? "";
    });
    const masterName = path.basename(filePath, ".txt");
    result[masterName] = state;
  }
  return result;
}

//TRICKLEFEED MORE
async function readtricklemore(tricklepath, date) {
  const result = {};
  const files = await fsp.readdir(tricklepath);

  const timingFiles = files.filter(file =>
    new RegExp(`^timing_tric_.*\\.txt\\.${date}$`, 'i').test(file)
  );

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
async function readrtgsmore(rtgspath, date) {
  const result = {};
  const files = await fsp.readdir(rtgspath);

  const timingFiles = files.filter(file =>
    new RegExp(`^timing_rtgs_.*\\.txt\\.${date}$`, 'i').test(file)
  );

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

async function NeftInvalidByDate(filePath) {
  const state = {};
  try {
    const content = await fsp.readFile(filePath, "utf8");
    content.split("\n").forEach(line => {
      line = line.trim();
      if (!line) return;

      const parts = line.split(",");
      state[parts[0]] = parts.slice(1);
    });
    if (Object.keys(state).length === 0) {
      return state
    } else {

      return state;
    }
  } catch (err) {
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

//////////////////////////////////////////[   API'S   ]///////////////////////////////////////////
// queue Replica API
app.post('/api/process-files', async (req, res) => {
  try {
    const { queue } = req.body;
    const resultState = await QueueBuildupReplica("../portal_data", queue);

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
    const summary = await readtrickleSummary("../portal_data/trickle_summ.txt");
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

const jobProcessors = {
  "B24 Gateway": (date) => readGatewayMore("../portal_data", date),
  "Trickle Feed": (date) => readtricklemore("../portal_data", date),
  "RTGS": (date) => readrtgsmore("../portal_data", date),
};

app.post("/api/jobs", async (req, res) => {
  try {
    const { jobName, date } = req.body;

    const processor = jobProcessors[jobName];
    console.log(processor)
    if (!processor) {
      return res.status(400).json({ error: `Unsupported job: ${jobName}` });
    }

    const result = await processor(date);
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

    if (!date || typeof date !== 'string' || !/^\d{8}$/.test(date)) {
      return res.status(400).json({ error: 'Date is required in YYYYMMDD format' });
    }

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

    if (!flag || typeof flag !== 'string' || !/^[A-Za-z0-9._-]+$/.test(flag) || flag.includes('..')) {
      return res.status(400).json({ error: 'Invalid flag' });
    }

    const resultState = await readPaceBuildup(`../portal_data/HISTORY/${flag}`);

    res.json({
      message: 'Files processed successfully',
      data: resultState
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Invailid name', details: error.message });
  }
});

const DATA_FILE = "../portal_data/branchlist.txt";

app.get("/api/branches", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || "").toString().trim().toLowerCase();
    const content = await fsp.readFile(DATA_FILE, "utf8");
    let rows = content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.split("|"));
    if (search) {
      rows = rows.filter((cols) => cols.join(" ").toLowerCase().includes(search));
    }


    const total = rows.length;
    const start = (page - 1) * limit;
    const pageRows = rows.slice(start, start + limit);

    res.json({ rows: pageRows, total, page, limit });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.json({ rows: [], total: 0, page: 1, limit: 20 });
    }
    res.status(500).json({ error: "Failed to read branch data", details: err.message });
  }
});



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

app.get('/api/txn-desc', async (req, res) => {
  try {
    const resultState = await readtxnDesc('../portal_data/txt_desc');

    res.json({
      message: 'Files processed successfully',
      data: resultState
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Invailid files', details: error.message });
  }
});


app.get('/api/check-rc', async (req, res) => {
  try {
    const server = req.query.server;
    const date = req.query.date;
    const numserver = Number(server)
    console.log(numserver)
    let result = null;
    if (numserver === 0) {
      const content = await fsp.readFile(`data/app1.core.txt.${date}`, "utf8");
      result = content
    } else {
      const content = await fsp.readFile(`data/app${numserver + 1}.core.txt.${date}`, "utf8");
      result = content
    }

    res.json({
      message: 'Files processed successfully',
      data: result
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Invailid files', details: error.message });
  }
});


//EOD Sod


async function nightEodSod(filePath) {
  const state = {};
  let currentJobDesc = null;
  let orphanLines = []; // Buffer for lines appearing before a job header

  const content = await fsp.readFile(filePath, "utf8");
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    if (trimmedLine === ", , , ,") {
      currentJobDesc = null;
      orphanLines = [];
      continue;
    }
    const parts = trimmedLine.split(",");
    if (parts.length < 2) continue;
    const col1 = parts[0].trim();
    const col2 = parts[1].trim();
    const col3 = parts[2] ? parts[2].trim() : null;
    const col4 = parts[3] ? parts[3].trim() : null;

    if (col1 !== "") {

      currentJobDesc = col1;
      if (!state[currentJobDesc]) {
        state[currentJobDesc] = [];
      }
      if (orphanLines.length > 0) {
        state[currentJobDesc].push(...orphanLines);
        orphanLines = []; // Clear buffer
      }
      if (col2) {
        state[currentJobDesc].push([col2, col3, col4]);
      }
    } else {
      if (currentJobDesc) {
        state[currentJobDesc].push([col2, col3, col4]);
      } else {
        orphanLines.push([col2, col3, col4]);
      }
    }
  }
  console.log(state)
  return state;
}

// readJobsState("data/night/cutoff_eodsod.txt");

/// Eod details
async function eodDetails(filePath) {
  const state = {};

  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(",");

    const key = parts[0];

    const values = parts.slice(1, 5).map(value => {
      value = value.trim();

      if (value === "") return "";
      if (!isNaN(value)) return Number(value);

      return value;
    });

    state[key] = values;
  });
  console.log(state)
  return state;
}

//cutoffeod details

async function cutOffEodSod(filePath) {
  const state = {};
  let currentJobDesc = null;
  let orphanLines = []; // Buffer for lines appearing before a job header
  const content = await fsp.readFile(filePath, "utf8");
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    // Reset on separator
    if (trimmedLine === ", , , ,") {
      currentJobDesc = null;
      orphanLines = []; // Clear orphans on block reset
      continue;
    }
    const parts = trimmedLine.split(",");
    if (parts.length < 2) continue;
    const col1 = parts[0].trim();
    const col2 = parts[1].trim();
    const col3 = parts[2] ? parts[2].trim() : null;
    if (col1 !== "") {
      // Found a Job Header (e.g., SWEEPS_PROCESSING)
      currentJobDesc = col1;
      if (!state[currentJobDesc]) {
        state[currentJobDesc] = [];
      }
      // 1. First, assign any buffered "orphan" lines to this new job
      if (orphanLines.length > 0) {
        state[currentJobDesc].push(...orphanLines);
        orphanLines = []; // Clear buffer
      }
      // 2. Add the header line's own data
      if (col2) {
        state[currentJobDesc].push([col2, col3]);
      }
    } else {
      // Line starts with comma (e.g., " ,M,...")
      if (currentJobDesc) {
        // If we already have a job, add normally
        state[currentJobDesc].push([col2, col3]);
      } else {
        // If NO job yet, buffer it for the next header
        orphanLines.push([col2, col3]);
      }
    }
  }
  // console.log(state)
  return state;
}

async function addOnDetails(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(" ");
    state["addonDetails"] = [parts[0]];
  });
  console.log(state)
  return state;

}
app.post('/api/night-eodsod', async (req, res) => {
  try {
    const { date } = req.body;


    if (!date || typeof date !== 'string' || !/^\d{8}$/.test(date)) {
      return res.status(400).json({
        error: 'Date is required in YYYYMMDD format (e.g., 20231025)'
      });
    }


    // 3. Execute All Three Functions in Parallel
    const [nightData, eodData, cutoffData, addonData] = await Promise.all([
      nightEodSod("data/night/Night_eodsod.txt.20260424"),
      eodDetails("data/night/Eod_details.txt.20260424"),
      cutOffEodSod("data/night/cutoff_eodsod.txt.20260424"),
      addOnDetails("data/night/eod_addondetails.txt.20260424")
    ]);

    res.json({
      message: 'Files processed successfully',
      date: date,
      data: {
        nightTable: nightData,
        eodTable: eodData,
        cutoffTable: cutoffData,
        addonTable: addonData
      }
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});


async function repostFail(filePath) {
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  let counter = 1;

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split("|");
    const key = counter;
    counter++;

    const allMetrics = parts;
    state[key] = allMetrics;
  });
  console.log(state)
  return state;
}

app.get('/api/repost-fail', async (req, res) => {
  try {
    const server = req.query.server;
    const servers = {
      "HIMALAYA" : "NNEF_ALL.txt_HIMALAYA",
      "SUTLEJ" : "NNEF_ALL.txt_SUTLEJ",
      "KRISHNA" : "NNEF_ALL.txt_KRISHNA",
    }

    const serverFile = servers[server]
    const result = await repostFail(`data/ALL/${serverFile}`)

    res.json({
      message: 'Files processed successfully',
      data: result
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Invailid files', details: error.message });
  }
});

// --------------------------------------------------
function startApi() {
  app.listen(5001, () => {
    console.log(`Branch API on http://127.0.0.1:5001`);
  });
}

module.exports = { startApi };
