const express = require('express');
const fsp = require("fs/promises");
const path = require('path');
const cors = require("cors");
const fs = require("fs");
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


const MFLAGS_D_PATH = "data/MFLAGS_D"
function readDateSuffix() {
  try {
    const content = fs.readFileSync(MFLAGS_D_PATH, "utf8");
    return content.trim();
  } catch {
    return null;
  }
}

let date_ = readDateSuffix()
console.log(date_)

const WATCHERS = [
    {
    pattern: "data/MFLAGS_D",
    handler: async (file) => {
    date_ = readDateSuffix();
    console.log(`${date_} >> Date Rollover Detected`);
    await loadgateways("data/queue_replica", "B24 Gateway", date_);
    await loadgateways("data/queue_replica", "Trickle Feed", date_);
    await loadgateways("data/queue_replica", "RTGS", date_);
    console.log(`Cache updated for ${date_}`);
    }
  },
  {
    pattern: `data/queue_replica/timing_b24*.txt.${date_}`,
    handler: async (file) => {
      await loadgateways("data/queue_replica", "B24 Gateway", date_);
    }
  },
  {
    pattern: `data/queue_replica/timing_tric*.txt.${date_}`,
    handler: async (file) => {
      await loadgateways("data/queue_replica", "Trickle Feed", date_);
    }
  },
  {
    pattern: `data/queue_replica/timing_rtgs*.txt.${date_}`,
    handler: async (file) => {
      await loadgateways("data/queue_replica", "RTGS", date_);
    }
  },
]


for (const watcher of WATCHERS) {
  chokidar.watch(watcher.pattern)
    .on("change", async (file) => {
      console.log(`${file} changed`)
      try {
        await watcher.handler(file);
        console.log(`${file} processed successfully`)
      } catch (err) {
        console.error(err);
      }
    });
}


let gatewayCache = null;
let trickleCache = null;
let rtgsCache = null;

async function loadgateways(folderPath, jobName, date) {
  const result = {};
  const files = await fsp.readdir(folderPath);

  const fileTypes = {
    "B24 Gateway": "b24",
    "Trickle Feed": "tric",
    "RTGS": "rtgs"
  }
  const fileType = fileTypes[jobName];

  const pattern = new RegExp(`^timing_${fileType}_(m|s\\d+)\\.txt.${date}$`, "i");
  const timingFiles = files.filter(file => pattern.test(file));

  const parsedFiles = await Promise.all(
    timingFiles.map(async (file) => {
      const filePath = path.join(folderPath, file);

      const content = await fsp.readFile(filePath, "utf8");
      const state = {};

      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const parts = trimmed.split(" ");
        const key = parts[0].trim();
        const metrics = parts.slice(1).map(v => {
          return v.trim();
        });
        state[key] = metrics;
      }

      return {
        name: path.basename(file, ".txt"),
        state
      };
    })
  );

  const cache = Object.fromEntries(
    parsedFiles.map(item => [item.name, item.state])
  );

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

  console.log(
    `Loaded ${parsedFiles.length} txn description files into memory`
  );
}

//CALL ON STARTUP
(async () => {
  try {
    console.time("Initial Txn Load");
    await loadgateways("data/queue_replica", "B24 Gateway", date_);
    await loadgateways("data/queue_replica", "Trickle Feed", date_);
    await loadgateways("data/queue_replica", "RTGS", date_);

    console.timeEnd("Initial Txn Load");
  } catch (err) {
    console.error("Failed to preload txn files:", err);
  }
})();


//API
app.post("/api/jobs", async (req, res) => {
  try {
    const { jobName, date } = req.body;

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
