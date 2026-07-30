ki const express = require('express');
const fsp = require("fs/promises");
const app = express();
const PORT = 4000;

app.use(express.json());




async function NeftInvalidByDate(filePath) {
  try {
    const content = await fsp.readFile(filePath, "utf8");
    const state = {};
    content.split("\n").forEach(line => {
      line = line.trim();
      if (!line) return;
      const parts = line.split(",");
      state[parts[0]] = parts.slice(1);
    });
    return { records: state, found: Object.keys(state).length > 0 };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { records: {}, found: false };
    }
    throw err;
  }
}

app.post('/api/neft-invalid', async (req, res) => {
  try {
    const { date } = req.body;

    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
    }

    const result = await NeftInvalidByDate(`data/Neft_Invalid.txt.${date}`);

    res.json({
      message: result.found ? 'Invalid records found' : 'No invalid records for this date',
      data: result.records
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Processing failed', details: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 





const fsp = require('fs/promises');
const path = require('path');

// Escapes regex metacharacters so user-supplied `queue` values
// can never build a pathological/catastrophic-backtracking pattern
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
    const first = escapeRegex(qparts[0].slice(0, -1));
    const second = escapeRegex(qparts[1]);
    regex = new RegExp(`${first}.......${second}`);
  }

  const plainNeedle = queue.slice(0, -1);

  // Parallelize file reads instead of sequential await-in-loop
  await Promise.all(txtFiles.map(async (file) => {
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
  }));

  return state;
}

// Log request arrival time so we can separate queuing delay from processing time
app.use((req, res, next) => {
  req._arrived = Date.now();
  next();
});

// queue Replica API
app.post('/api/process-files', async (req, res) => {
  try {
    const { queue } = req.body;

    console.log('Queued for:', Date.now() - req._arrived, 'ms');
    console.log('Queue value:', JSON.stringify(queue));

    console.time("Initial Txn Load");
    const resultState = await QueueBuildupReplica("../portal_data", queue);
    console.timeEnd("Initial Txn Load");

    res.json({
      message: 'Files processed successfully',
      data: resultState
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Invalid queue name', details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

