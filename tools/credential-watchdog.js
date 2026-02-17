#!/usr/bin/env node
/**
 * Credential Watchdog
 * Scans config files for missing/placeholder API keys
 * Posts alerts to Telegram and logs to file
 * 
 * Usage: node tools/credential-watchdog.js [--fix]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config files to monitor
const CONFIG_FILES = [
  { path: 'openweathermap_config.json', keys: ['api_key'], required: true },
  { path: 'google_calendar_config.json', keys: ['client_id', 'client_secret'], required: false },
  { path: 'newsapi_config.json', keys: ['api_key'], required: false },
  { path: '/Users/user/.openclaw/openclaw.json', keys: ['braveApiKey'], checkPath: 'skills.entries.web_search', required: true, absolute: true }
];

const PLACEHOLDERS = ['YOUR_', 'INSERT_', 'REPLACE_', 'placeholder', 'example', 'demo', 'test', 'xxxx'];
const LOG_FILE = 'logs/secret-health.log';

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}\n`;
  console.log(line.trim());
  fs.appendFileSync(LOG_FILE, line);
}

function checkConfig(configDef) {
  const issues = [];
  const fullPath = configDef.absolute 
    ? configDef.path 
    : path.join(__dirname, '..', configDef.path);
  
  if (!fs.existsSync(fullPath)) {
    if (configDef.required) {
      issues.push({ file: path.basename(configDef.path), issue: 'MISSING', severity: 'HIGH' });
    }
    return issues;
  }
  
  let content;
  try {
    content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (e) {
    issues.push({ file: configDef.path, issue: 'INVALID_JSON', severity: 'HIGH' });
    return issues;
  }
  
  // Navigate nested path if specified
  let target = content;
  if (configDef.checkPath) {
    const parts = configDef.checkPath.split('.');
    for (const part of parts) {
      target = target?.[part];
      if (!target) break;
    }
  }
  
  if (!target) {
    issues.push({ file: configDef.path, issue: 'CONFIG_SECTION_MISSING', severity: 'MEDIUM' });
    return issues;
  }
  
  const keysToCheck = configDef.checkPath ? Object.keys(target) : configDef.keys;
  
  for (const key of keysToCheck) {
    const value = target[key];
    
    if (!value || value === '' || value === null) {
      issues.push({ 
        file: configDef.path, 
        key: key,
        issue: 'EMPTY', 
        severity: configDef.required ? 'HIGH' : 'MEDIUM' 
      });
      continue;
    }
    
    const strValue = String(value);
    const isPlaceholder = PLACEHOLDERS.some(ph => 
      strValue.toLowerCase().includes(ph.toLowerCase())
    );
    
    if (isPlaceholder) {
      issues.push({ 
        file: configDef.path, 
        key: key,
        issue: 'PLACEHOLDER', 
        value: strValue.substring(0, 20) + '...',
        severity: configDef.required ? 'HIGH' : 'LOW' 
      });
    }
  }
  
  return issues;
}

function sendTelegramAlert(issues) {
  // Only alert once per day to avoid spam
  const alertMarker = path.join(__dirname, '..', '.last-credential-alert');
  const now = Date.now();
  
  try {
    if (fs.existsSync(alertMarker)) {
      const lastAlert = parseInt(fs.readFileSync(alertMarker, 'utf8'));
      if (now - lastAlert < 24 * 60 * 60 * 1000) {
        return; // Already alerted today
      }
    }
  } catch (e) {
    // Continue to alert
  }
  
  const token = process.env.TELEGRAM_BOT_TOKEN || '7556707117:AAFuzeNV_AY-zWtO2LAxnieDEaiKPK9BCn4';
  const chatId = '903821546';
  
  const highCount = issues.filter(i => i.severity === 'HIGH').length;
  
  let message = `🔐 *Credential Watchdog*\n\n`;
  message += `Found ${highCount} HIGH priority issue(s):\n\n`;
  
  issues.filter(i => i.severity === 'HIGH').slice(0, 3).forEach(issue => {
    message += `🔴 ${issue.file}`;
    if (issue.key) message += ` → ${issue.key}`;
    message += `\n`;
  });
  
  message += `\nCheck: logs/secret-health.log`;
  
  try {
    execSync(`curl -s -X POST "https://api.telegram.org/bot${token}/sendMessage" \
      -d "chat_id=${chatId}" \
      -d "parse_mode=Markdown" \
      -d "text=${message.replace(/"/g, '\\"')}"`, 
      { stdio: 'ignore' }
    );
    fs.writeFileSync(alertMarker, String(now));
    log('Telegram alert sent (throttled: once per 24h)');
  } catch (e) {
    log(`Failed to send Telegram: ${e.message}`, 'ERROR');
  }
}

async function main() {
  console.log('🔍 Credential Watchdog starting...\n');
  
  // Ensure log directory exists
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const allIssues = [];
  
  for (const config of CONFIG_FILES) {
    const issues = checkConfig(config);
    allIssues.push(...issues);
    
    if (issues.length === 0) {
      log(`✓ ${config.path} - OK`);
    } else {
      issues.forEach(issue => {
        log(`${issue.severity}: ${issue.file} ${issue.key ? `→ ${issue.key}` : ''} - ${issue.issue}`, issue.severity);
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  const highIssues = allIssues.filter(i => i.severity === 'HIGH');
  
  if (allIssues.length === 0) {
    log('✅ All credentials healthy');
    process.exit(0);
  } else {
    log(`⚠️  Found ${allIssues.length} issue(s), ${highIssues.length} HIGH severity`, 'WARN');
    
    // Send alert if HIGH severity issues found
    if (highIssues.length > 0) {
      sendTelegramAlert(allIssues);
    }
    
    process.exit(1);
  }
}

main().catch(e => {
  log(`Fatal error: ${e.message}`, 'ERROR');
  process.exit(2);
});