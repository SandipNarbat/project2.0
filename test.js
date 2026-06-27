const express = require('express');
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
