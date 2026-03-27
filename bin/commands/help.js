/**
 * Omni Claw — Help Command
 */

module.exports = function help() {
  console.log('🔮 OMNI CLAW — Your AI Supercomputer\n');
  console.log('═══════════════════════════════════════\n');
  
  console.log('COMMANDS:\n');
  
  console.log('  setup                    First-time setup');
  console.log('  gateway start            Start the gateway');
  console.log('  gateway stop             Stop the gateway');
  console.log('  gateway restart          Restart the gateway');
  console.log('  gateway status           Check gateway status');
  console.log('');
  console.log('  config set KEY=VALUE     Set config value');
  console.log('  config get KEY           Get config value');
  console.log('  config list              List all config');
  console.log('');
  console.log('  chat "message"           Chat with AI');
  console.log('  research "topic"         Deep research');
  console.log('  search "query"           Web search');
  console.log('');
  console.log('  deploy docker            Deploy with Docker');
  console.log('  deploy vercel            Deploy to Vercel');
  console.log('  deploy fly               Deploy to Fly.io');
  console.log('  deploy build             Build project');
  console.log('');
  console.log('  status                   Show system status');
  console.log('  help                     Show this help');
  
  console.log('\n═══════════════════════════════════════\n');
  
  console.log('EXAMPLES:\n');
  console.log('  omniclaw setup');
  console.log('  omniclaw config set PERPLEXITY_API_KEY=pplx-xxx');
  console.log('  omniclaw gateway start');
  console.log('  omniclaw chat "Mujhe Python mein hello world banao"');
  console.log('  omniclaw research "Quantum computing ke latest advances"');
  console.log('  omniclaw research --deep --academic "AI agents survey"');
  console.log('  omniclaw search --domain=arxiv.org "transformer models"');
  console.log('  omniclaw deploy docker --name=myapp --port=3000');
  
  console.log('\n═══════════════════════════════════════\n');
  
  console.log('FEATURES:\n');
  console.log('  🔮 Deep Research    — Multi-step research with citations');
  console.log('  🔍 Advanced Search  — Domain, recency, academic filters');
  console.log('  🧠 Reasoning        — Chain of thought analysis');
  console.log('  🤖 Multi-Model      — 12+ models, one API key');
  console.log('  📱 20+ Channels     — WhatsApp, Telegram, Discord...');
  console.log('  🌐 Browser Control  — Automated Chromium');
  console.log('  💻 Terminal         — Full shell access');
  console.log('  🎙️ Voice            — Wake words + Talk mode');
  console.log('  🎨 Canvas           — Visual workspace');
  console.log('  📲 Mobile           — iOS + Android nodes');
  console.log('  🚀 Deploy           — Docker, Vercel, Fly.io');
  
  console.log('\n═══════════════════════════════════════');
  console.log('\n🔮 https://omniclaw.ai | MIT License\n');
};
