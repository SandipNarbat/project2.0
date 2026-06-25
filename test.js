const express = require('express');
// const fs = require('fs').promises;
const fsp = require("fs/promises");
const path = require('path');
const app = express();
const PORT = 4000;

app.use(express.json());




async function NeftInvalidByDate(filePath){
  const state = {};
  const content = await fsp.readFile(filePath, "utf8");

  content.split("\n").forEach(line => {
    line = line.trim();
    if (!line) return;

    const parts = line.split(",");
    state[parts[0]] = parts.slice(1);
  });
  if(Object.keys(state).length === 0){
    console.log("no invalid found")
    return "no invalid found"
  }else{

    console.log(state)
    return state;
  }
}


// queue Replica API
app.post('/api/neft-invalid', async (req, res) => {
  try {
    const { date } = req.body;
    const resultState = await NeftInvalidByDate(`data/Neft_Invalid.txt.${date}`);

    res.json({
      message: 'Files processed successfully',
      data: resultState
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Invailid queue name', details: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 
