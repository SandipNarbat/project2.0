
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { finished } = require('stream');
const { promisify } = require('util');
const finishedPromise = promisify(finished);


const WATCH_DIR = "/home/smartportal02/portal_data/"; 
const DATE_FILE = path.join(WATCH_DIR, 'MFLAGS_D');
const DEBOUNCE_DELAY = 1000;


console.log(DATE_FILE)

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
            fileNames: [`tf_pen_pro_i.txt_${date}`, `tf_pen_pro_I.txt_${date}`, `tf_pen_pro_a.txt_${date}`, `tf_pen_pro_b.txt_${date}`, `tf_pen_pro_c.txt_${date}`, `tf_pen_pro_d.txt_${date}`, `tf_pen_pro_e.txt_${date}`, `tf_pen_pro_f.txt_${date}`, `tf_pen_pro_g.txt_${date}`, `tf_pen_pro_h.txt_${date}`, `tf_pen_pro_j.txt_${date}`, `tf_pen_pro_k.txt_${date}`, `tf_pen_pro_m.txt_${date}`, `tf_pen_pro_n.txt_${date}`, `tf_pen_pro_p.txt_${date}`, `tf_pen_pro_q.txt_${date}`],
            output: `TRICKLEFEED_MASTER.txt_${date}`,
            function : "trickleMerge"
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


async function trickleMerge(fileList, outputFile) {
    const validFiles = fileList
        .map(f => path.join(WATCH_DIR, f))
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

            if (results.every(res => res.done)) break;

            const processedLines = results.map((res, index) => {
                if (res.done) return ''; 

                const line = res.value.trim();
                if (!line) return '';

                if (index === 0) {
                    return line;
                } else {

                    const parts = line.split(',');
                    return parts.slice(1).join(',');
                }
            });

            output.write(processedLines.join(',') + '\n');
        }
        output.end();

        await finishedPromise(output);
        console.log(`[${new Date().toLocaleTimeString()}] Merged ${validFiles.length} files into ${outputFile}`);
    } catch (err) {
        console.error('Merge error:', err);
        output.destroy(err);
        throw err;
    }
}

async function performGroupMerge(outputFile, inputFiles) {
    if (inputFiles.size === 0) return;
    // Dispatch to the merge function named in the group's `function` config
    // (see initializeGroupRules). Falls back to trickleMerge if unset/unknown.
    const rule = GROUP_RULES.find(r => r.output === outputFile);
    const mergeFn = (rule && MERGE_FUNCTIONS[rule.function]) || trickleMerge;
    await mergeFn(Array.from(inputFiles), outputFile);
}

async function processQueue() {
    if (pendingChanges.size === 0) return;
    const promises = [];
    for (const [outputFile, inputFiles] of pendingChanges.entries()) {
        promises.push(performGroupMerge(outputFile, inputFiles));
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
        if (!pendingChanges.has(output)) pendingChanges.set(output, new Set(files));
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
            pendingChanges.set(rule.output, new Set(rule.fileNames));
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
            pendingChanges.set(rule.output, new Set(rule.fileNames));
        }
        await processQueue();
        console.log('Startup merge complete. Now watching for changes... Press Ctrl+C to stop.');
        
        if (process.stdin.isTTY) {
            process.stdin.pause(); 
        }
    });
}


 init()
// module.exports = { init } ;


// i have added function in initializeGroupRules so we can do apply separate merge functions for perticular group(not i have just added the function config but not added n code ypu have to that)
// and iam adding three file groups below we need to merge those three groups in a single file 
// for your reference am addiing a shell code that how should you perform the above Task but note that we do this in nodejs 

// shell code :
// paste -d ',' RTGS.txt mq_rtgs_status_i.txt mq_rtgs_status_I.txt mq_rtgs_status_a.txt mq_rtgs_status_b.txt mq_rtgs_status_c.txt mq_rtgs_status_d.txt mq_rtgs_status_e.txt mq_rtgs_status_f.txt mq_rtgs_status_g.txt  mq_rtgs_status_h.txt mq_rtgs_status_j.txt  mq_rtgs_status_k.txt mq_rtgs_status_m.txt mq_rtgs_status_n.txt mq_rtgs_status_p.txt mq_rtgs_status_q.txt >mq_status_12apps.txt.${dt}
// paste -d ',' NEFT.txt mq_neft_status_i.txt mq_neft_status_I.txt mq_neft_status_a.txt mq_neft_status_b.txt mq_neft_status_c.txt mq_neft_status_d.txt mq_neft_status_e.txt mq_neft_status_f.txt mq_neft_status_g.txt  mq_neft_status_h.txt mq_neft_status_j.txt  mq_neft_status_k.txt mq_neft_status_m.txt mq_neft_status_n.txt mq_neft_status_p.txt mq_neft_status_q.txt >>mq_status_12apps.txt.${dt}
// paste -d ',' IMPS.txt mq_imps_status_i.txt mq_imps_status_I.txt mq_imps_status_a.txt mq_imps_status_b.txt mq_imps_status_c.txt mq_imps_status_d.txt mq_imps_status_e.txt mq_imps_status_f.txt mq_imps_status_g.txt  mq_imps_status_h.txt mq_imps_status_j.txt  mq_imps_status_k.txt mq_imps_status_m.txt mq_imps_status_n.txt mq_imps_status_p.txt mq_imps_status_q.txt >>mq_status_12apps.txt.${dt}

// three filename groups:
// {
//     fileNames: [`mq_rtgs_status_i.txt`, `mq_rtgs_status_I.txt`, `mq_rtgs_status_a.txt`, `mq_rtgs_status_b.txt`, `mq_rtgs_status_c.txt`, `mq_rtgs_status_d.txt`, `mq_rtgs_status_e.txt`, `mq_rtgs_status_f.txt`, `mq_rtgs_status_g.txt`, `mq_rtgs_status_h.txt`, `mq_rtgs_status_j.txt`, `mq_rtgs_status_k.txt`, `mq_rtgs_status_m.txt`, `mq_rtgs_status_n.txt`, `mq_rtgs_status_p.txt`, `mq_rtgs_status_q.txt`]
// },
// {
//     fileNames: [`mq_neft_status_i.txt`, `mq_neft_status_I.txt`, `mq_neft_status_a.txt`, `mq_neft_status_b.txt`, `mq_neft_status_c.txt`, `mq_neft_status_d.txt`, `mq_neft_status_e.txt`, `mq_neft_status_f.txt`, `mq_neft_status_g.txt`, `mq_neft_status_h.txt`, `mq_neft_status_j.txt`, `mq_neft_status_k.txt`, `mq_neft_status_m.txt`, `mq_neft_status_n.txt`, `mq_neft_status_p.txt`, `mq_neft_status_q.txt`]
// },
// {
//     fileNames: [`mq_imps_status_i.txt`, `mq_imps_status_I.txt`, `mq_imps_status_a.txt`, `mq_imps_status_b.txt`, `mq_imps_status_c.txt`, `mq_imps_status_d.txt`, `mq_imps_status_e.txt`, `mq_imps_status_f.txt`, `mq_imps_status_g.txt`, `mq_imps_status_h.txt`, `mq_imps_status_j.txt`, `mq_imps_status_k.txt`, `mq_imps_status_m.txt`, `mq_imps_status_n.txt`, `mq_imps_status_p.txt`, `mq_imps_status_q.txt`]
// }
// output file name:  mq_status_16apps.txt

//create a separate function for this perticular three groups ( note all three groups are going to merge in a single file not seaprate for each group)


// ===========================================================================
// TASK IMPLEMENTATION
// ===========================================================================

// (1) Merge-function registry — makes the `function` field on a group rule
//     (see initializeGroupRules) actually choose which merge runs, so
//     different groups can use different merge functions. `performGroupMerge`
//     looks the name up here.
const MERGE_FUNCTIONS = {
    trickleMerge,
};

// (2) MQ status merge — three status groups (RTGS / NEFT / IMPS), 16 files each.
//     Node.js equivalent of the reference shell:
//         paste -d ',' mq_rtgs_status_* >  mq_status_16apps.txt
//         paste -d ',' mq_neft_status_* >> mq_status_16apps.txt
//         paste -d ',' mq_imps_status_* >> mq_status_16apps.txt
//     Each group is pasted horizontally (output line i = line i of every file
//     in the group joined by commas); the three groups are then stacked into
//     ONE output file.
const MQ_STATUS_SUFFIXES = ['i', 'I', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 'q'];
const MQ_STATUS_GROUPS = [
    MQ_STATUS_SUFFIXES.map(s => `mq_rtgs_status_${s}.txt`),
    MQ_STATUS_SUFFIXES.map(s => `mq_neft_status_${s}.txt`),
    MQ_STATUS_SUFFIXES.map(s => `mq_imps_status_${s}.txt`),
];
const MQ_STATUS_OUTPUT = 'mq_status_16apps.txt';

// `paste -d ','` for one group: returns an array of output lines where line i
// is line i of every (existing) input file joined by commas. A file that has
// run out of lines contributes an empty field, matching paste's behaviour.
async function pasteFilesHorizontally(fileList) {
    const validFiles = fileList
        .map(f => path.join(WATCH_DIR, f))
        .filter(f => fs.existsSync(f));

    if (validFiles.length === 0) return [];

    const readers = validFiles.map(file => {
        const stream = fs.createReadStream(file);
        const rl = require('readline').createInterface({ input: stream, crlfDelay: Infinity });
        return rl[Symbol.asyncIterator]();
    });

    const lines = [];
    while (true) {
        const results = await Promise.all(readers.map(iter => iter.next()));
        if (results.every(res => res.done)) break;
        lines.push(results.map(res => (res.done ? '' : res.value.trim())).join(','));
    }
    return lines;
}

// Merge all three MQ status groups into the single output file.
async function mqStatusMerge() {
    const groupLineSets = [];
    for (const group of MQ_STATUS_GROUPS) {
        groupLineSets.push(await pasteFilesHorizontally(group));
    }

    if (groupLineSets.every(lines => lines.length === 0)) {
        console.log(`No input files found for ${MQ_STATUS_OUTPUT}.`);
        return;
    }

    const output = fs.createWriteStream(path.join(WATCH_DIR, MQ_STATUS_OUTPUT));
    try {
        for (const lines of groupLineSets) {          // stack the groups vertically
            for (const line of lines) output.write(line + '\n');
        }
        output.end();
        await finishedPromise(output);
        console.log(`[${new Date().toLocaleTimeString()}] Merged 3 MQ status groups into ${MQ_STATUS_OUTPUT}`);
    } catch (err) {
        console.error('MQ status merge error:', err);
        output.destroy(err);
        throw err;
    }
}

// Run the MQ status merge once at startup. To re-merge automatically whenever
// these files change, add MQ_STATUS_GROUPS to a group rule (with a matching
// entry in MERGE_FUNCTIONS) and let the existing watcher pipeline trigger it.
mqStatusMerge().catch(console.error);
