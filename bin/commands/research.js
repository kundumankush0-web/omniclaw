/**
 * Omni Claw — Research Command
 * Deep research with Perplexity
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const OMNICLAW_CONFIG = path.join(os.homedir(), '.omniclaw', 'config.json');

module.exports = function research(subCommand, flags) {
  const query = [subCommand, ...flags].filter(Boolean).join(' ');
  
  if (!query) {
    console.log('Usage: omniclaw research "your research topic"');
    console.log('');
    console.log('Options:');
    console.log('  --deep        Exhaustive research (sonar-deep-research)');
    console.log('  --academic    Academic sources only');
    console.log('  --domain=     Filter by domain (e.g., --domain=arxiv.org)');
    console.log('  --since=      Time filter (day/week/month/year)');
    return;
  }

  // Parse flags
  const isDeep = flags.includes('--deep');
  const isAcademic = flags.includes('--academic');
  const domainFlag = flags.find(f => f.startsWith('--domain='));
  const sinceFlag = flags.find(f => f.startsWith('--since='));

  // Get API key
  let apiKey;
  try {
    const config = JSON.parse(fs.readFileSync(OMNICLAW_CONFIG, 'utf8'));
    apiKey = config.apiKeys?.perplexity;
  } catch {
    console.log('❌ Config not found. Run: omniclaw setup');
    return;
  }

  if (!apiKey) {
    console.log('❌ Perplexity API key not set.');
    console.log('Set with: omniclaw config set PERPLEXITY_API_KEY=your-key');
    return;
  }

  // Build request
  const model = isDeep ? 'sonar-deep-research' : 'sonar-pro';
  const searchType = isDeep ? undefined : 'pro';
  
  const webSearchOptions = {
    search_context_size: 'high'
  };

  if (searchType) webSearchOptions.search_type = searchType;
  if (isAcademic) webSearchOptions.search_mode = 'academic';
  if (domainFlag) {
    webSearchOptions.search_domain_filter = [domainFlag.split('=')[1]];
  }
  if (sinceFlag) {
    webSearchOptions.search_recency_filter = sinceFlag.split('=')[1];
  }

  const requestBody = {
    model,
    messages: [
      {
        role: 'user',
        content: query
      }
    ],
    stream: false,
    web_search_options: webSearchOptions
  };

  if (isDeep) {
    requestBody.reasoning_effort = 'high';
  }

  console.log(`🔮 Deep Research: "${query}"`);
  console.log(`📊 Model: ${model}`);
  if (isAcademic) console.log('📚 Academic mode: ON');
  if (domainFlag) console.log(`🌐 Domain filter: ${domainFlag.split('=')[1]}`);
  if (sinceFlag) console.log(`📅 Since: ${sinceFlag.split('=')[1]}`);
  console.log('\n⏳ Researching...\n');

  // Make API call
  const postData = JSON.stringify(requestBody);
  
  const options = {
    hostname: 'api.perplexity.ai',
    path: '/v1/sonar',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.error) {
          console.error('❌ API Error:', response.error.message);
          return;
        }

        // Print answer
        console.log('═══════════════════════════════════════════════');
        console.log('🔮 OMNI CLAW RESEARCH RESULTS');
        console.log('═══════════════════════════════════════════════\n');
        
        const answer = response.choices?.[0]?.message?.content || 'No response';
        console.log(answer);
        
        // Print sources
        const sources = response.search_results || [];
        if (sources.length > 0) {
          console.log('\n───────────────────────────────────────────────');
          console.log('📚 SOURCES:');
          console.log('───────────────────────────────────────────────');
          sources.forEach((src, i) => {
            console.log(`\n[${i + 1}] ${src.title}`);
            console.log(`    🔗 ${src.url}`);
            if (src.date) console.log(`    📅 ${src.date}`);
          });
        }

        // Print cost
        if (response.usage?.cost) {
          console.log('\n───────────────────────────────────────────────');
          console.log(`💰 Cost: $${response.usage.cost.total_cost?.toFixed(4) || 'N/A'}`);
          console.log(`📊 Tokens: ${response.usage.total_tokens || 'N/A'}`);
        }
        
      } catch (err) {
        console.error('❌ Parse error:', err.message);
        console.log('Raw response:', data.substring(0, 500));
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
  });

  req.write(postData);
  req.end();
};
