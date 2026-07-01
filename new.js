
const chokidar = require('chokidar');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const util = require('util');
const { exec } = require('child_process')


const WATCH_DIR = "/home/smartportal02/portal_data/";
const DATE_FILE = path.join(WATCH_DIR, 'MFLAGS_D');
const DEBOUNCE_DELAY = 100;

// State
let CURRENT_DATE = null;
let watcher;
const pendingChanges = new Map();
const mergeTimers = new Map();
let GROUP_RULES = [];

// Helper: Initialize Group Rules
function initializeGroupRules(date) {
    return [
        {
            fileNames: [
                `gateway_i.txt.${date}`, `gateway_I.txt.${date}`,
                `gateway_a.txt.${date}`, `gateway_b.txt.${date}`, `gateway_c.txt.${date}`,
                `gateway_d.txt.${date}`, `gateway_e.txt.${date}`, `gateway_f.txt.${date}`,
                `gateway_g.txt.${date}`, `gateway_h.txt.${date}`, `gateway_j.txt.${date}`,
                `gateway_k.txt.${date}`, `gateway_m.txt.${date}`, `gateway_n.txt.${date}`,
                `gateway_p.txt.${date}`, `gateway_q.txt.${date}`
            ],
            output: `gateway.txt_8app.${date}`,
            isVertical: true,
            useCat: false
        },
        {
            fileNames: [`queue_buildup_i.txt.${date}`, `queue_buildup_I.txt.${date}`, `queue_buildup_a.txt.${date}`, `queue_buildup_b.txt.${date}`, `queue_buildup_c.txt.${date}`, `queue_buildup_d.txt.${date}`, `queue_buildup_e.txt.${date}`, `queue_buildup_f.txt.${date}`, `queue_buildup_g.txt.${date}`, `queue_buildup_h.txt.${date}`, `queue_buildup_j.txt.${date}`, `queue_buildup_k.txt.${date}`, `queue_buildup_m.txt.${date}`, `queue_buildup_n.txt.${date}`, `queue_buildup_p.txt.${date}`, `queue_buildup_q.txt.${date}`],
            output: `status_queue_8app.txt.${date}`,
            isVertical: true,
            useCat: false
        },
        {
            fileNames: [`top_m.txt.${date}`, `top_s1.txt.${date}`, `top_s2.txt.${date}`, `top_s3.txt.${date}`, `top_s4.txt.${date}`, `top_s5.txt.${date}`, `top_s6.txt.${date}`, `top_s7.txt.${date}`, `top_s8.txt.${date}`],
            output: `top_8apps.txt_1.${date}`,
            isVertical: false,
            useCat: false
        },
        {
            fileNames: [`topstat_m.txt.${date}`, `topstat_s1.txt.${date}`, `topstat_s2.txt.${date}`, `topstat_s3.txt.${date}`, `topstat_s4.txt.${date}`, `topstat_s5.txt.${date}`, `topstat_s6.txt.${date}`, `topstat_s7.txt.${date}`, `topstat_s8.txt.${date}`, `topstat_s9.txt.${date}`, `topstat_s10.txt.${date}`, `topstat_s11.txt.${date}`, `topstat_s12.txt.${date}`, `topstat_s13.txt.${date}`, `topstat_s14.txt.${date}`, `topstat_s15.txt.${date}`],
            output: `topstat_8apps.txt.${date}`,
            isVertical: false,
            useCat: false
        },
        {
            fileNames: [`space_m.txt.${date}`, `space_s1.txt.${date}`, `space_s2.txt.${date}`, `space_s3.txt.${date}`, `space_s4.txt.${date}`, `space_s5.txt.${date}`, `space_s6.txt.${date}`, `space_s7.txt.${date}`, `space_s8.txt.${date}`, `space_s9.txt.${date}`, `space_s10.txt.${date}`, `space_s11.txt.${date}`, `space_s12.txt.${date}`, `space_s13.txt.${date}`, `space_s14.txt.${date}`, `space_s15.txt.${date}`],
            output: `space_8apps.txt.${date}`,
            isVertical: false,
            useCat: true
        },
        {
            fileNames: [`path_for_bu_files`, `bu_arka_i.txt.${date}`, `bu_arka_I.txt.${date}`, `bu_arka_a.txt.${date}`, `bu_arka_b.txt.${date}`, `bu_arka_b.txt.${date}`, `bu_arka_d.txt.${date}`, `bu_arka_e.txt.${date}`, `bu_arka_f.txt.${date}`, `bu_arka_g.txt.${date}`],
            output: `bu_arka.txt.${date}`,
            isVertical: true,
            useCat: false
        }
    ];
}

function readDateFromFile() {
    try {
        if (!fs.existsSync(DATE_FILE)) {
            console.warn(`Date file ${DATE_FILE} not found. Using system date.`);
            return new Date().toISOString().slice(0, 10).replace(/-/g, '');
        }
        return fs.readFileSync(DATE_FILE, 'utf8').trim();
    } catch (err) {
        console.error('Error reading date file:', err);
        return new Date().toISOString().slice(0, 10).replace(/-/g, '');
    }
}

function getGroupsForFile(filePath) {
    const fileName = path.basename(filePath);
    const groups = [];
    for (const rule of GROUP_RULES) {
        if (rule.fileNames && rule.fileNames.includes(fileName)) {
            groups.push({ output: rule.output, files: rule.fileNames });
        }
    }
    return groups;
}

// Horizontal (column) merge: line N of every file joined by commas.
// Reads each file fully in one shot (narrow read/write race window) then zips
// in memory, and swaps the result in atomically via a temp file + rename.
async function performMerge(fileList, outputFile) {
    const validFiles = fileList
        .map(f => path.join(WATCH_DIR, f))
        .filter(f => fs.existsSync(f));

    if (validFiles.length === 0) {
        console.log(`No input files found for ${outputFile}.`);
        return;
    }

    const finalPath = path.join(WATCH_DIR, outputFile);
    const tmpPath = `${finalPath}.tmp`;

    const perFileLines = await Promise.all(
        validFiles.map(async (file) => {
            const raw = await fsp.readFile(file, 'utf8');
            const lines = raw.split('\n');
            if (lines.length && lines[lines.length - 1] === '') lines.pop();
            return lines;
        })
    );

    const maxRows = Math.max(...perFileLines.map(l => l.length));
    const out = [];
    for (let r = 0; r < maxRows; r++) {
        const row = perFileLines.map(lines => lines[r] ?? '');
        out.push(row.join(','));
    }

    const body = out.length ? out.join('\n') + '\n' : '';
    try {
        await fsp.writeFile(tmpPath, body);
        await fsp.rename(tmpPath, finalPath);
        console.log(`[${new Date().toLocaleTimeString()}] Merged ${validFiles.length} files into ${outputFile}`);
    } catch (err) {
        console.error('Merge error:', err);
        await fsp.unlink(tmpPath).catch(() => { });
        throw err;
    }
}

// Vertical (concatenation) merge: files stacked one after another.
// Reads each file fully (fast, narrow race window vs. line-by-line streaming),
// cleans null bytes / CR / trailing blanks, drops empty lines, then writes
// atomically via a temp file + rename.
async function performMerge2(fileList, outputFile) {
    const validFiles = fileList
        .map(f => path.join(WATCH_DIR, f))
        .filter(f => fs.existsSync(f));

    if (validFiles.length === 0) {
        console.log(`No input files found for ${outputFile}.`);
        return;
    }

    const finalPath = path.join(WATCH_DIR, outputFile);
    const tmpPath = `${finalPath}.tmp`;

    const chunks = [];
    for (const file of validFiles) {
        const raw = await fsp.readFile(file, 'utf8');
        const cleaned = raw
            .split('\n')
            .map(l => l.replace(/\u0000/g, '').replace(/\r/g, '').trimEnd())
            .filter(l => l)
            .join('\n');
        if (cleaned) chunks.push(cleaned);
    }

    const body = chunks.length ? chunks.join('\n') + '\n' : '';
    try {
        await fsp.writeFile(tmpPath, body);
        await fsp.rename(tmpPath, finalPath);
        console.log(`[${new Date().toLocaleTimeString()}] Merged ${validFiles.length} files into ${outputFile}`);
    } catch (err) {
        console.error('Merge error:', err);
        await fsp.unlink(tmpPath).catch(() => { });
        throw err;
    }
}


const execAsync = util.promisify(exec)
// Concatenation via `cat`, written to a temp file then renamed atomically.
// Paths are single-quoted (with embedded-quote escaping) to survive spaces and
// shell metacharacters.
async function performMerge3(fileList, outputFile) {
    const validFiles = fileList
        .map(f => path.join(WATCH_DIR, f))
        .filter(f => fs.existsSync(f));

    if (validFiles.length === 0) {
        console.log(`No input files found for ${outputFile}.`);
        return;
    }

    const finalPath = path.join(WATCH_DIR, outputFile);
    const tmpPath = `${finalPath}.tmp`;

    const shQuote = (p) => `'${p.replace(/'/g, `'\\''`)}'`;
    const files = validFiles.map(shQuote).join(' ');

    try {
        const { stderr } = await execAsync(`cat ${files} > ${shQuote(tmpPath)}`);
        if (stderr) {
            console.error('Merge error:', stderr);
        }
        await fsp.rename(tmpPath, finalPath);
        console.log(`[${new Date().toLocaleTimeString()}] Merged ${validFiles.length} files into ${outputFile}`);
    } catch (err) {
        await fsp.unlink(tmpPath).catch(() => { });
        console.log(`[MERGE ERROR] ${err}`)
    }
}



const mergeLocks = new Map();
// Serialize merges per output file so two runs never write the same target at
// once. Applies to every strategy, including the `cat` path.
async function performGroupMerge(outputFile, inputFiles, isVertical, useCat) {
    const prior = mergeLocks.get(outputFile) || Promise.resolve();
    const run = prior.then(() => {
        if (useCat) return performMerge3(Array.from(inputFiles), outputFile);
        return isVertical
            ? performMerge(Array.from(inputFiles), outputFile)
            : performMerge2(Array.from(inputFiles), outputFile);
    });
    mergeLocks.set(outputFile, run.catch(() => { }));
    return run;
}

// Per-group debounce so an unrelated, continuously-changing group can never
// starve another group's merge (a single shared timer would keep resetting).
function scheduleGroupMerge(output) {
    clearTimeout(mergeTimers.get(output));
    mergeTimers.set(output, setTimeout(() => {
        mergeTimers.delete(output);
        processQueue().catch(console.error);
    }, DEBOUNCE_DELAY));
}

async function processQueue() {
    if (pendingChanges.size === 0) return;
    const batch = Array.from(pendingChanges.entries());
    pendingChanges.clear();
    await Promise.all(batch.map(async ([outputFile, entry]) => {
        try {
            await performGroupMerge(outputFile, entry.fileNames, entry.isVertical, entry.useCat);
        } catch (err) {
            console.error(`Merge failed for ${outputFile}, re-queueing:`, err);
            if (!pendingChanges.has(outputFile)) pendingChanges.set(outputFile, entry);
            scheduleGroupMerge(outputFile);
        }
    }));
}

function handleFileEvent(filePath) {
    const fileName = path.basename(filePath);
    if (fileName === path.basename(DATE_FILE)) return;

    const groups = getGroupsForFile(filePath);
    if (groups.length === 0) return;

    groups.forEach(({ output, files }) => {
        if (!pendingChanges.has(output)) {
            const rule = GROUP_RULES.find(r => r.output === output);
            pendingChanges.set(output, {
                isVertical: rule.isVertical, useCat: rule.useCat,
                fileNames: new Set(files)
            });
        }
        scheduleGroupMerge(output);
    });
}

async function handleDateRollover() {
    const newDate = readDateFromFile();
    if (newDate !== CURRENT_DATE) {
        console.log(`\n--- DATE ROLLOVER: ${CURRENT_DATE} -> ${newDate} ---`);
        CURRENT_DATE = newDate;
        GROUP_RULES = initializeGroupRules(CURRENT_DATE);
        pendingChanges.clear();
        for (const t of mergeTimers.values()) clearTimeout(t);
        mergeTimers.clear();

        for (const rule of GROUP_RULES) {
            pendingChanges.set(rule.output, {
                isVertical: rule.isVertical, useCat: rule.useCat,
                fileNames: new Set(rule.fileNames)
            });
        }
        await processQueue();
    }
}
async function init() {
    CURRENT_DATE = readDateFromFile();
    GROUP_RULES = initializeGroupRules(CURRENT_DATE);

    // Watcher configuration
    watcher = chokidar.watch(WATCH_DIR, {
        ignored: (filePath) => {
            const name = path.basename(filePath);
            if (name === path.basename(DATE_FILE)) return false;
            if (name.startsWith('.')) return true;
            if (name.endsWith('.tmp')) return true;
            if (GROUP_RULES.some(r => r.output === name)) return true;
            return false;
        },
        persistent: true,
        ignoreInitial: true,
        // These files are written by other processes on shared storage, where
        // inotify is unreliable/seconds-late. The old shell script was fast
        // because it polled the disk directly in a tight loop — do the same here
        // so changes are seen in near-realtime instead of 5-7s late.
        usePolling: true,
        interval: 300,
        binaryInterval: 300,
        awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 }
    });

    const onEvent = (filePath) => {
        if (path.basename(filePath) === path.basename(DATE_FILE)) {
            handleDateRollover().catch(console.error);
        } else {
            handleFileEvent(filePath);
        }
    };

    watcher
        .on('add', onEvent)
        .on('change', onEvent)
        .on('unlink', handleFileEvent)
        .on('error', error => console.error('Watcher error:', error));

    watcher.on('ready', async () => {
        console.log('Initial scan complete. Triggering startup merge...');
        for (const rule of GROUP_RULES) {
            pendingChanges.set(rule.output, { isVertical: rule.isVertical, useCat: rule.useCat, fileNames: new Set(rule.fileNames) });
        }
        await processQueue();
        console.log('Startup merge complete. Now watching for changes... Press Ctrl+C to stop.');

        if (process.stdin.isTTY) {
            process.stdin.pause();
        }
    });
}
module.exports = { init };
