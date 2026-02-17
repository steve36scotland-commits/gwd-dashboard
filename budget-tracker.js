#!/usr/bin/env node
/**
 * GWD Budget Tracker - Real-time API cost monitoring
 * Tracks actual API usage and costs for OpenClaw/GWD dashboard
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'budget-data.json');
const DAILY_BUDGET = 5.00;
const ALERT_THRESHOLD = 4.00;

// Model pricing (per 1K tokens)
const MODEL_PRICING = {
    'gpt-5.1-codex': { input: 0.002, output: 0.006 },
    'moonshot/kimi-k2.5': { input: 0.0015, output: 0.0045 },
    'gemini-flash': { input: 0.0005, output: 0.0015 },
    'ollama/mistral': { input: 0, output: 0 },
    'ollama/llama2': { input: 0, output: 0 },
    'ollama/gemma3': { input: 0, output: 0 }
};

// Load or initialize data
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (e) {}
    return {
        dailyUsage: {},
        modelUsage: {
            'gpt-5.1-codex': { calls: 0, tokens: 0, cost: 0 },
            'moonshot/kimi-k2.5': { calls: 0, tokens: 0, cost: 0 },
            'gemini-flash': { calls: 0, tokens: 0, cost: 0 },
            'ollama/mistral': { calls: 0, tokens: 0, cost: 0 },
            'ollama/llama2': { calls: 0, tokens: 0, cost: 0 },
            'ollama/gemma3': { calls: 0, tokens: 0, cost: 0 }
        },
        lastReset: new Date().toISOString().split('T')[0]
    };
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function recordUsage(model, inputTokens, outputTokens) {
    const data = loadData();
    const today = getToday();
    
    // Reset if new day
    if (data.lastReset !== today) {
        data.dailyUsage = {};
        data.lastReset = today;
    }
    
    // Initialize today's data
    if (!data.dailyUsage[today]) {
        data.dailyUsage[today] = { totalCost: 0, calls: 0 };
    }
    
    // Calculate cost
    const pricing = MODEL_PRICING[model] || { input: 0.001, output: 0.003 };
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const totalCost = inputCost + outputCost;
    
    // Update daily usage
    data.dailyUsage[today].totalCost += totalCost;
    data.dailyUsage[today].calls += 1;
    
    // Update model usage
    if (!data.modelUsage[model]) {
        data.modelUsage[model] = { calls: 0, tokens: 0, cost: 0 };
    }
    data.modelUsage[model].calls += 1;
    data.modelUsage[model].tokens += inputTokens + outputTokens;
    data.modelUsage[model].cost += totalCost;
    
    saveData(data);
    return { cost: totalCost, total: data.dailyUsage[today].totalCost };
}

function getBudgetStatus() {
    const data = loadData();
    const today = getToday();
    const todayUsage = data.dailyUsage[today] || { totalCost: 0, calls: 0 };
    
    return {
        used: todayUsage.totalCost.toFixed(2),
        budget: DAILY_BUDGET.toFixed(2),
        remaining: (DAILY_BUDGET - todayUsage.totalCost).toFixed(2),
        percentage: ((todayUsage.totalCost / DAILY_BUDGET) * 100).toFixed(1),
        calls: todayUsage.calls,
        alert: todayUsage.totalCost >= ALERT_THRESHOLD
    };
}

function getModelUsage() {
    const data = loadData();
    const totalCalls = Object.values(data.modelUsage).reduce((sum, m) => sum + m.calls, 0);
    
    return Object.entries(data.modelUsage).map(([name, stats]) => ({
        name: name.replace('ollama/', 'Ollama/').replace('moonshot/', ''),
        type: name.startsWith('ollama') ? 'Local' : 'Cloud',
        calls: stats.calls,
        tokens: stats.tokens,
        cost: stats.cost.toFixed(3),
        percentage: totalCalls > 0 ? ((stats.calls / totalCalls) * 100).toFixed(1) : 0
    })).sort((a, b) => b.calls - a.calls);
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'record':
            const model = args[1] || 'unknown';
            const inputTokens = parseInt(args[2]) || 0;
            const outputTokens = parseInt(args[3]) || 0;
            const result = recordUsage(model, inputTokens, outputTokens);
            console.log(JSON.stringify(result));
            break;
        case 'status':
            console.log(JSON.stringify(getBudgetStatus()));
            break;
        case 'models':
            console.log(JSON.stringify(getModelUsage()));
            break;
        default:
            console.log(JSON.stringify({
                status: getBudgetStatus(),
                models: getModelUsage()
            }));
    }
}

module.exports = { recordUsage, getBudgetStatus, getModelUsage };
