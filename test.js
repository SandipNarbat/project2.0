
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { finished } = require('stream/promises');
const readline = require('readline');


const WATCH_DIR = "/home/smartportal02/portal_data/"; 
const DATE_FILE = path.join(WATCH_DIR, 'MFLAGS_D');
const DEBOUNCE_DELAY = 1000;

// State
let CURRENT_DATE = null;
let mergeTimeout;
let watcher; 
const pendingChanges = new Map();
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
	isVertical: true 
        },
        {
            fileNames: [`queue_buildup_i.txt.${date}`, `queue_buildup_I.txt.${date}`, `queue_buildup_a.txt.${date}`, `queue_buildup_b.txt.${date}`, `queue_buildup_c.txt.${date}`, `queue_buildup_d.txt.${date}`, `queue_buildup_e.txt.${date}`, `queue_buildup_f.txt.${date}`, `queue_buildup_g.txt.${date}`, `queue_buildup_h.txt.${date}`, `queue_buildup_j.txt.${date}`, `queue_buildup_k.txt.${date}`, `queue_buildup_m.txt.${date}`, `queue_buildup_n.txt.${date}`, `queue_buildup_p.txt.${date}`, `queue_buildup_q.txt.${date}`],
            output: `status_queue_8app.txt.${date}`,
	isVertical: true
        },
        {
            fileNames: [`top_m.txt.${date}`, `top_s1.txt.${date}`, `top_s2.txt.${date}`, `top_s3.txt.${date}`, `top_s4.txt.${date}`, `top_s5.txt.${date}`, `top_s6.txt.${date}`, `top_s7.txt.${date}`, `top_s8.txt.${date}`],
            output: `top_8apps.txt_1.${date}`,
	isVertical: false
        },
        {
            fileNames: [`topstat_m.txt.${date}`, `topstat_s1.txt.${date}`, `topstat_s2.txt.${date}`, `topstat_s3.txt.${date}`, `topstat_s4.txt.${date}`, `topstat_s5.txt.${date}`, `topstat_s6.txt.${date}`, `topstat_s7.txt.${date}`, `topstat_s8.txt.${date}`, `topstat_s9.txt.${date}`, `topstat_s10.txt.${date}`, `topstat_s11.txt.${date}`, `topstat_s12.txt.${date}`, `topstat_s13.txt.${date}`, `topstat_s14.txt.${date}`, `topstat_s15.txt.${date}`],
            output: `topstat_8apps.txt.${date}`,
            isVertical: false
        },
        {
            fileNames: [`space_m.txt.${date}`, `space_s1.txt.${date}`, `space_s2.txt.${date}`, `space_s3.txt.${date}`, `space_s4.txt.${date}`, `space_s5.txt.${date}`, `space_s6.txt.${date}`, `space_s7.txt.${date}`, `space_s8.txt.${date}`, `space_s9.txt.${date}`, `space_s10.txt.${date}`, `space_s11.txt.${date}`, `space_s12.txt.${date}`, `space_s13.txt.${date}`, `space_s14.txt.${date}`, `space_s15.txt.${date}`],
                output: `space_8apps.txt.${date}`,
                    isVertical: false
        },
        {
            fileNames: [`path_for_bu_files`, `bu_arka_i.txt.${date}`, `bu_arka_I.txt.${date}`, `bu_arka_a.txt.${date}`, `bu_arka_b.txt.${date}`, `bu_arka_b.txt.${date}`, `bu_arka_d.txt.${date}`, `bu_arka_e.txt.${date}`, `bu_arka_f.txt.${date}`, `bu_arka_g.txt.${date}`],
                output: `bu_arka.txt.${date}`,
                    isVertical: true
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

async function performMerge(fileList, outputFile) {
    const validFiles = fileList
        .map(f => path.join(WATCH_DIR, f)) // Ensure full path
        .filter(f => fs.existsSync(f));
    
    if (validFiles.length === 0) {
        console.log(`No input files found for ${outputFile}.`);
        return;
    }

    const output = fs.createWriteStream(path.join(WATCH_DIR, outputFile));
    const readers = validFiles.map(file => {
        const stream = fs.createReadStream(file);
        const rl = require('readline').createInterface({ input: stream, crlfDelay: Infinity });
        return rl[Symbol.asyncIterator]();
    });

    let hasMoreLines = true;
    try {
        while (hasMoreLines) {
            const linePromises = readers.map(iter => iter.next());
            const results = await Promise.all(linePromises);
            const lines = results.map(res => res.done ? '' : res.value);
            
            if (results.every(res => res.done)) break;
            output.write(lines.join(',') + '\n');
        }
        output.end();
        await finished(output);
        console.log(`[${new Date().toLocaleTimeString()}] Merged ${validFiles.length} files into ${outputFile}`);
    } catch (err) {
        console.error('Merge error:', err);
        output.destroy(err);
        throw err;
    }
}

async function performMerge2(fileList, outputFile) {
    const validFiles = fileList
        .map(f => path.join(WATCH_DIR, f))
        .filter(f => fs.existsSync(f));

    if (validFiles.length === 0) {
        console.log(`No input files found for ${outputFile}.`);
        return;
    }
    
    const outputPath = path.join(WATCH_DIR, outputFile);
    const tmpPath = outputPath + `.tmp.${process.pid}`;
    const output = fs.createWriteStream(tmpPath);

    try {
        for (const file of validFiles) {
            const stream = fs.createReadStream(file);
            const rl = readline.createInterface({
                input: stream,
                crlfDelay: Infinity
            });

            for await (const line of rl) {
                const clean = line.replace(/\u0000/g, '').replace(/\r/g, '').trimEnd();

                if(!clean) continue;
                output.write(clean + '\n');
            }            
            await finished(stream); 
        }

        output.end();
        await finished(output);
	fs.renameSync(tmpPath, outputPath);
        console.log(`[${new Date().toLocaleTimeString()}] Merged ${validFiles.length} files into ${outputFile}`);
    } catch (err) {
        console.error('Merge error:', err);
        output.destroy(err);
        throw err;
    }
}
const mergeLocks = new Map();
async function performGroupMerge(outputFile, inputFiles, isVertical) {
    const prior = mergeLocks.get(outputFile) || Promise.resolve();
    const run = prior.then(()=>isVertical ? performMerge(Array.from(inputFiles), outputFile): performMerge2(Array.from(inputFiles), outputFile));
    mergeLocks.set(outputFile, run.catch(()=> {}));
    return run;
}

async function processQueue() {
    if (pendingChanges.size === 0) return;
    const promises = [];
    for (const [outputFile, {isVertical, fileNames}] of pendingChanges.entries()) {
        promises.push(performGroupMerge(outputFile, fileNames, isVertical));
    }
    pendingChanges.clear();
    await Promise.all(promises);
}

function handleFileEvent(filePath) {
    const fileName = path.basename(filePath);
    if (fileName === path.basename(DATE_FILE)) return;

    const groups = getGroupsForFile(filePath);
    if (groups.length === 0) return;

    groups.forEach(({ output, files }) => {
        if (!pendingChanges.has(output)) {
            const rule = GROUP_RULES.find(r => r.output === output);
            pendingChanges.set(output, {isVertical: rule.isVertical, 
                fileNames: new Set(files)})
        }
    });

    clearTimeout(mergeTimeout);
    mergeTimeout = setTimeout(() => processQueue().catch(console.error), DEBOUNCE_DELAY);
}

async function handleDateRollover() {
    const newDate = readDateFromFile();
    if (newDate !== CURRENT_DATE) {
        console.log(`\n--- DATE ROLLOVER: ${CURRENT_DATE} -> ${newDate} ---`);
        CURRENT_DATE = newDate;
        GROUP_RULES = initializeGroupRules(CURRENT_DATE);
        pendingChanges.clear();
        clearTimeout(mergeTimeout);

        for (const rule of GROUP_RULES) {
            pendingChanges.set(rule.output, {isVertical: rule.isVertical, 
                fileNames: new Set(rule.fileNames)});
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
            if (GROUP_RULES.some(r => r.output === name)) return true;
            return name.startsWith('.') && name !== path.basename(DATE_FILE);
        },
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 },
        usePolling: false, // Set to true if watching network drives
        interval: 1000
    });

    watcher
        .on('add', handleFileEvent)
        .on('change', (filePath) => {
            if (path.basename(filePath) === path.basename(DATE_FILE)) handleDateRollover();
            else handleFileEvent(filePath);
        })
        .on('unlink', handleFileEvent)
        .on('error', error => console.error('Watcher error:', error));

    watcher.on('ready', async () => {
        console.log('Initial scan complete. Triggering startup merge...');
        for (const rule of GROUP_RULES) {
            pendingChanges.set(rule.output, {isVertical: rule.isVertical, 
                fileNames: new Set(rule.fileNames)});
        }
        await processQueue();
        console.log('Startup merge complete. Now watching for changes... Press Ctrl+C to stop.');
        
        if (process.stdin.isTTY) {
            process.stdin.pause(); 
        }
    });
}
module.exports = { init } ;
