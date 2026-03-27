#!/usr/bin/env node

/**
 * 🔮 Omni Claw — Standalone Server
 * Your AI Supercomputer — One file, full functionality
 * 
 * Run: node server.js
 * Open: http://localhost:3000
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// API Keys (set these or use the web UI to configure)
let API_KEYS = {
  perplexity: process.env.PERPLEXITY_API_KEY || '',
  nvidia: process.env.NVIDIA_API_KEY || '',
  openai: process.env.OPENAI_API_KEY || '',
  anthropic: process.env.ANTHROPIC_API_KEY || '',
  gemini: process.env.GEMINI_API_KEY || ''
};

// Save/Load keys from file
const KEYS_FILE = path.join(__dirname, '.keys.json');
try {
  if (fs.existsSync(KEYS_FILE)) {
    const saved = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    API_KEYS = { ...API_KEYS, ...saved };
  }
} catch {}

function saveKeys() {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(API_KEYS, null, 2));
}

// Perplexity API call
function perplexityCall(endpoint, body) {
  return new Promise((resolve, reject) => {
    if (!API_KEYS.perplexity) {
      return reject(new Error('Perplexity API key not set'));
    }
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.perplexity.ai',
      path: endpoint,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.perplexity}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error('API error: ' + body.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// NVIDIA API call
function nvidiaCall(body) {
  return new Promise((resolve, reject) => {
    if (!API_KEYS.nvidia) {
      return reject(new Error('NVIDIA API key not set'));
    }
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'integrate.api.nvidia.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.nvidia}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error('API error: ' + body.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// API Routes
async function handleAPI(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse body for POST
  if (req.method === 'POST') {
    const body = await new Promise((resolve) => {
      let data = '';
      req.on('data', c => data += c);
      req.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({}); }
      });
    });

    try {
      // Chat
      if (pathname === '/api/chat') {
        const result = await nvidiaCall({
          model: 'nvidia/llama-3.1-nemotron-70b-instruct',
          messages: [{ role: 'user', content: body.message }],
          max_tokens: 2048
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          answer: result.choices?.[0]?.message?.content || 'No response',
          model: result.model
        }));
        return;
      }

      // Research
      if (pathname === '/api/research') {
        const searchOptions = { search_context_size: body.contextSize || 'high' };
        if (body.filter === 'academic') searchOptions.search_mode = 'academic';
        if (body.filter === 'arxiv') searchOptions.search_domain_filter = ['arxiv.org'];
        if (body.filter === 'week') searchOptions.search_recency_filter = 'week';
        if (body.filter === 'month') searchOptions.search_recency_filter = 'month';

        const model = body.deep ? 'sonar-deep-research' : 'sonar-pro';
        const webSearchOptions = body.deep ? searchOptions : { ...searchOptions, search_type: 'pro' };

        const result = await perplexityCall('/v1/sonar', {
          model,
          messages: [{ role: 'user', content: body.query }],
          web_search_options: webSearchOptions,
          ...(body.deep ? { reasoning_effort: 'high' } : {})
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          answer: result.choices?.[0]?.message?.content || 'No response',
          sources: result.search_results || [],
          cost: result.usage?.cost || {},
          model: result.model
        }));
        return;
      }

      // Search
      if (pathname === '/api/search') {
        const webSearchOptions = { search_context_size: 'medium' };
        if (body.domain) webSearchOptions.search_domain_filter = [body.domain];
        if (body.since) webSearchOptions.search_recency_filter = body.since;

        const result = await perplexityCall('/v1/sonar', {
          model: 'sonar',
          messages: [{ role: 'user', content: body.query }],
          web_search_options: webSearchOptions
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          answer: result.choices?.[0]?.message?.content || 'No response',
          sources: result.search_results || [],
          cost: result.usage?.cost || {}
        }));
        return;
      }

      // Reasoning
      if (pathname === '/api/reason') {
        const result = await perplexityCall('/v1/sonar', {
          model: 'sonar-reasoning-pro',
          messages: [{ role: 'user', content: body.query }],
          reasoning_effort: body.effort || 'medium',
          web_search_options: { search_context_size: 'medium' }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          answer: result.choices?.[0]?.message?.content || 'No response',
          sources: result.search_results || [],
          cost: result.usage?.cost || {}
        }));
        return;
      }

      // Model
      if (pathname === '/api/model') {
        const result = await perplexityCall('/v1/agent', {
          model: body.model || 'openai/gpt-5.4',
          input: body.prompt,
          max_output_tokens: 2048,
          ...(body.tools ? { tools: [{ type: 'web_search' }] } : {})
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          answer: result.output_text || result.choices?.[0]?.message?.content || 'No response',
          model: result.model,
          cost: result.usage?.cost || {}
        }));
        return;
      }

      // Save keys
      if (pathname === '/api/keys') {
        if (body.perplexity) API_KEYS.perplexity = body.perplexity;
        if (body.nvidia) API_KEYS.nvidia = body.nvidia;
        if (body.openai) API_KEYS.openai = body.openai;
        if (body.anthropic) API_KEYS.anthropic = body.anthropic;
        if (body.gemini) API_KEYS.gemini = body.gemini;
        saveKeys();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
      }

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // GET endpoints
  if (pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      version: '1.0.0',
      keys: {
        perplexity: !!API_KEYS.perplexity,
        nvidia: !!API_KEYS.nvidia,
        openai: !!API_KEYS.openai,
        anthropic: !!API_KEYS.anthropic,
        gemini: !!API_KEYS.gemini
      }
    }));
    return;
  }

  if (pathname === '/api/models') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      { id: 'openai/gpt-5.4', name: 'GPT-5.4', provider: 'OpenAI', input: '$2.50', output: '$15.00' },
      { id: 'openai/gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI', input: '$1.75', output: '$14.00' },
      { id: 'anthropic/claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic', input: '$5.00', output: '$25.00' },
      { id: 'anthropic/claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', input: '$3.00', output: '$15.00' },
      { id: 'google/gemini-3.1-pro', name: 'Gemini 3.1 Pro', provider: 'Google', input: '$2.00', output: '$12.00' },
      { id: 'xai/grok-4-1-fast', name: 'Grok 4.1 Fast', provider: 'xAI', input: '$0.20', output: '$0.50' },
      { id: 'nvidia/nemotron-70b', name: 'Nemotron 70B', provider: 'NVIDIA', input: '$0.25', output: '$2.50' },
      { id: 'perplexity/sonar', name: 'Sonar', provider: 'Perplexity', input: '$0.25', output: '$2.50' },
      { id: 'perplexity/sonar-pro', name: 'Sonar Pro', provider: 'Perplexity', input: '$3.00', output: '$15.00' },
      { id: 'perplexity/sonar-deep-research', name: 'Deep Research', provider: 'Perplexity', input: '$2.00', output: '$8.00' },
      { id: 'perplexity/sonar-reasoning-pro', name: 'Reasoning Pro', provider: 'Perplexity', input: '$2.00', output: '$8.00' }
    ]));
    return;
  }

  // Serve static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, 'dashboard', filePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}

// Start server
const server = http.createServer(handleAPI);
server.listen(PORT, () => {
  console.log(`\n🔮 ═══════════════════════════════════════════════`);
  console.log(`   OMNI CLAW — Your AI Supercomputer`);
  console.log(`   Running at: http://0.0.0.0:${PORT}`);
  console.log(`═══════════════════════════════════════════════════\n`);
});
