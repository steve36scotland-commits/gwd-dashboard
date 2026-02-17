const fs = require('fs');
const https = require('https');
const path = require('path');

const JOBS_FILE = '/Users/user/.openclaw/cron/jobs.json';
const LOG_FILE = '/Users/user/.openclaw/logs/cron-monitor.log';
const BOT_TOKEN = '7556707117:AAFuzeNV_AY-zWtO2LAxnieDEaiKPK9BCn4';
const STEVIE_CHAT_ID = '903821546';
const LAST_RUN_FILE = '/Users/user/.openclaw/logs/cron-last-runs.json';

const log = (message) => {
    const timestamp = new Date().toISOString();
    const msg = `[${timestamp}] ${message}`;
    console.log(msg);
    try {
        fs.appendFileSync(LOG_FILE, msg + '\n');
    } catch (e) {
        console.error('Failed to write log:', e.message);
    }
};

const sendTelegramAlert = (jobName, reason) => {
    const message = `⚠️ **CRON ALERT**: Job "${jobName}" ${reason}`;
    
    const data = JSON.stringify({
        chat_id: STEVIE_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
    });

    const options = {
        hostname: 'api.telegram.org',
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
            log(`✓ Alert sent for ${jobName}`);
        } else {
            log(`✗ Alert failed for ${jobName}: ${res.statusCode}`);
        }
    });

    req.on('error', (e) => {
        log(`Error sending alert: ${e.message}`);
    });

    req.write(data);
    req.end();
};

const getLastRuns = () => {
    try {
        if (fs.existsSync(LAST_RUN_FILE)) {
            return JSON.parse(fs.readFileSync(LAST_RUN_FILE, 'utf-8'));
        }
    } catch (e) {
        log('Error reading last runs: ' + e.message);
    }
    return {};
};

const saveLastRuns = (data) => {
    try {
        fs.writeFileSync(LAST_RUN_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        log('Error saving last runs: ' + e.message);
    }
};

const checkCronJobs = () => {
    try {
        if (!fs.existsSync(JOBS_FILE)) {
            log('Cron jobs file not found');
            return;
        }

        const jobsData = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8'));
        const jobs = jobsData.jobs || [];
        const lastRuns = getLastRuns();

        if (jobs.length === 0) {
            log('No cron jobs found');
            return;
        }

        const now = Date.now();
        
        jobs.forEach(job => {
            const jobId = job.id || job.name;
            const nextRunMs = job.state?.nextRunAtMs || 0;
            const lastAlerted = lastRuns[jobId] || 0;

            // If job should have run but hasn't (5+ minutes overdue) and we haven't alerted yet
            if (nextRunMs < now && (now - lastAlerted) > 300000) {
                log(`⚠️ Job "${job.name}" is overdue (was due at ${new Date(nextRunMs).toISOString()})`);
                sendTelegramAlert(job.name, 'failed to run on schedule');
                lastRuns[jobId] = now;
                saveLastRuns(lastRuns);
            }

            if (job.enabled) {
                log(`✓ Job "${job.name}" scheduled for ${new Date(nextRunMs).toISOString()}`);
            }
        });

    } catch (err) {
        log('Error checking cron jobs: ' + err.message);
    }
};

// Initial check
log('Cron monitor started');
checkCronJobs();

// Check every minute
setInterval(checkCronJobs, 60000);

log('Monitoring cron jobs every 60 seconds');
