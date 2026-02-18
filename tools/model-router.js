#!/usr/bin/env node
/**
 * GWD Model Router - Intelligent Model Selection
 * Routes tasks to optimal model based on type, cost, and performance
 */

const MODELS = {
    'gpt-5.1-codex': {
        name: 'GPT-5.1 Codex',
        type: 'cloud',
        costPer1K: { input: 0.002, output: 0.006 },
        strengths: ['coding', 'technical', 'complex reasoning'],
        speed: 'medium',
        reliability: 0.95
    },
    'moonshot/kimi-k2.5': {
        name: 'Kimi K2.5',
        type: 'cloud',
        costPer1K: { input: 0.0015, output: 0.0045 },
        strengths: ['research', 'analysis', 'long context', 'general'],
        speed: 'fast',
        reliability: 0.92
    },
    'gemini-flash': {
        name: 'Gemini Flash',
        type: 'cloud',
        costPer1K: { input: 0.0005, output: 0.0015 },
        strengths: ['quick tasks', 'summarization', 'chat', 'simple queries'],
        speed: 'very-fast',
        reliability: 0.88
    },
    'ollama/mistral': {
        name: 'Ollama/Mistral',
        type: 'local',
        costPer1K: { input: 0, output: 0 },
        strengths: ['free', 'private', 'simple tasks', 'offline'],
        speed: 'medium',
        reliability: 0.85
    },
    'ollama/llama2': {
        name: 'Ollama/Llama2',
        type: 'local',
        costPer1K: { input: 0, output: 0 },
        strengths: ['free', 'private', 'general purpose'],
        speed: 'medium',
        reliability: 0.82
    }
};

// Task routing rules
const ROUTING_RULES = [
    {
        pattern: /code|program|script|function|bug|error|debug/i,
        model: 'gpt-5.1-codex',
        reason: 'Coding task'
    },
    {
        pattern: /research|analyze|study|investigate|deep dive/i,
        model: 'moonshot/kimi-k2.5',
        reason: 'Research task'
    },
    {
        pattern: /quick|brief|short|simple|hello|hi/i,
        model: 'gemini-flash',
        reason: 'Quick query'
    },
    {
        pattern: /local|private|offline|secret|password/i,
        model: 'ollama/mistral',
        reason: 'Privacy required'
    }
];

// Budget-based routing
function getBudgetStatus() {
    try {
        const data = require('./budget-data.json');
        const today = new Date().toISOString().split('T')[0];
        return data.dailyUsage[today] || { totalCost: 0 };
    } catch (e) {
        return { totalCost: 0 };
    }
}

function routeTask(taskDescription, priority = 'normal') {
    const budget = getBudgetStatus();
    const spent = budget.totalCost;
    const remaining = 5.00 - spent;
    
    // Check for explicit pattern matches
    for (const rule of ROUTING_RULES) {
        if (rule.pattern.test(taskDescription)) {
            // If low budget, downgrade to free model
            if (remaining < 1.00 && MODELS[rule.model].type === 'cloud') {
                return {
                    model: 'ollama/mistral',
                    reason: `${rule.reason} (downgraded: low budget $${remaining.toFixed(2)} remaining)`
                };
            }
            return { model: rule.model, reason: rule.reason };
        }
    }
    
    // Default routing based on budget
    if (remaining > 3.00) {
        return { model: 'moonshot/kimi-k2.5', reason: 'General task (high budget)' };
    } else if (remaining > 1.00) {
        return { model: 'gemini-flash', reason: 'General task (medium budget)' };
    } else {
        return { model: 'ollama/mistral', reason: 'General task (low budget, using free model)' };
    }
}

// CLI interface
if (require.main === module) {
    const task = process.argv[2] || 'general query';
    const result = routeTask(task);
    console.log(JSON.stringify(result, null, 2));
}

module.exports = { routeTask, MODELS, ROUTING_RULES };
