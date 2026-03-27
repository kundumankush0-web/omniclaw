/**
 * Omni Claw — Search Command
 * Advanced search with filters
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const OMNICLAW_CONFIG = path.join(os.homedir(), '.omniclaw', 'config.json');

module.exports = function search(subCommand, flags) {
  const query = [subCommand, ...flags].filter(Boolean).join(' ');
  
  if (!query) {
    console.log('Usage: omniclaw search "your query"');
    console.log('');
    console.log('Options:');
    console.log('  --domain=    Filter by domain (e.g., --domain=arxiv.org)');
    console.log('  --since=     Time filter (day/week/month/year)');
    console.log('  --lang=      Language (e.g., --lang=hi)');
    console.log('  --raw        Raw search results (no AI)');
    return;
  }

  const isRaw = flags.includes('--raw');
  const domainFlag = flags.find(f => f.startsWith('--domain='));
  const sinceFlag = flags.find(f => f.startsWith('--since='));
  const langFlag = flags.find(f => f.startsWith('--lang='));

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

  if (isRaw) {
    // Raw search using Search API
    const searchQueries = [query];
    const postData = JSON.stringify({ query: searchQueries });
    
    const options = {
      hostname: 'api.perplexity.ai',
      path: '/search',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`🔍 Raw Search: "${query}"\n`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const results = response.results || [];
          
          console.log(`📊 Found ${results.length} results:\n`);
          results.forEach((r, i) => {
            console.log(`${i + 1}. ${r.title}`);
            console.log(`   ${r.snippet || ''}`);
            console.log(`   🔗 ${r.url}`);
            if (r.date) console.log(`   📅 ${r.date}`);
            console.log('');
          });
        } catch (err) {
          console.error('❌ Parse error:', err.message);
        }
      });
    });
    req.on('error', (err) => console.error('❌ Error:', err.message));
    req.write(postData);
    req.end();
    
  } else {
    // Sonar search with filters
    const webSearchOptions = { search_context_size: 'medium' };
    if (domainFlag) webSearchOptions.search_domain_filter = [domainFlag.split('=')[1]];
    if (sinceFlag) webSearchOptions.search_recency_filter = sinceFlag.split('=')[1];
    if (langFlag) webSearchOptions.language_preference = langFlag.split('=')[1];

    const postData = JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: query }],
      stream: false,
      web_search_options: webSearchOptions
    });

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

    console.log(`🔍 Search: "${query}"`);
    if (domainFlag) console.log(`🌐 Domain: ${domainFlag.split('=')[1]}`);
    if (sinceFlag) console.log(`📅 Since: ${sinceFlag.split('=')[1]}`);
    console.log('\n⏳ Searching...\n');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const answer = response.choices?.[0]?.message?.content || 'No response';
          console.log(answer);
          
          const sources = response.search_results || [];
          if (sources.length > 0) {
            console.log('\n📚 Sources:');
            sources.forEach((s, i) => {
              console.log(`  ${i + 1}. ${s.title} — ${s.url}`);
            });
          }
        } catch (err) {
          console.error('❌ Parse error:', err.message);
        }
      });
    });
    req.on('error', (err) => console.error('❌ Error:', err.message));
    req.write(postData);
    req.end();
  }
};
