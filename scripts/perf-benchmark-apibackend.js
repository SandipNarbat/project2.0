#!/usr/bin/env node
const http = require('http');
const { app } = require('../apibackend');

const PORT = Number(process.env.BENCH_PORT || 5101);
const endpoints = [
  { name: 'process-files', method: 'POST', path: '/api/process-files', body: { queue: 'TEST' } },
  { name: 'trickle-summ', method: 'GET', path: '/api/trickle-summ' },
  { name: 'jobs-b24', method: 'POST', path: '/api/jobs', body: { jobName: 'B24 Gateway', date: '20260424' } },
  { name: 'jobs-trickle', method: 'POST', path: '/api/jobs', body: { jobName: 'Trickle Feed', date: '20260424' } },
  { name: 'jobs-rtgs', method: 'POST', path: '/api/jobs', body: { jobName: 'RTGS', date: '20260424' } },
  { name: 'neft-invalid', method: 'POST', path: '/api/neft-invalid', body: { date: '20260424', isDay: true } },
  { name: 'pace-buildup', method: 'POST', path: '/api/pace_buildup', body: { flag: 'sample.txt' } },
  { name: 'branches', method: 'GET', path: '/api/branches?page=1&limit=20' },
  { name: 'txn-desc', method: 'GET', path: '/api/txn-desc' },
  { name: 'check-rc', method: 'GET', path: '/api/check-rc?server=0&date=20260424' },
  { name: 'night-eodsod', method: 'POST', path: '/api/night-eodsod', body: { date: '20260424' } },
  { name: 'repost-fail', method: 'GET', path: '/api/repost-fail?server=HIMALAYA' },
];

function request(endpoint) {
  const payload = endpoint.body ? JSON.stringify(endpoint.body) : null;
  const startedAt = process.hrtime.bigint();
  const startCpu = process.cpuUsage();
  const startMem = process.memoryUsage();
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1', port: PORT, path: endpoint.path, method: endpoint.method,
      headers: payload ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } : {},
    }, (res) => {
      let bytes = 0;
      res.on('data', (chunk) => { bytes += chunk.length; });
      res.on('end', () => {
        const cpu = process.cpuUsage(startCpu);
        const mem = process.memoryUsage();
        resolve({
          api: endpoint.name, status: res.statusCode,
          totalMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
          payloadBytes: bytes, cpuMicros: cpu.user + cpu.system,
          heapDelta: mem.heapUsed - startMem.heapUsed,
        });
      });
    });
    req.on('error', (error) => resolve({ api: endpoint.name, error: error.message }));
    if (payload) req.write(payload);
    req.end();
  });
}

const server = app.listen(PORT, async () => {
  const results = [];
  for (const endpoint of endpoints) {
    // cold then warm/cache run
    await request(endpoint);
    results.push(await request(endpoint));
  }
  console.table(results.map(r => ({ ...r, totalMs: r.totalMs && r.totalMs.toFixed(2) })));
  server.close();
});
