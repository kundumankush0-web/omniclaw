/**
 * Omni Claw — Status Command
 * Show system status
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const OMNICLAW_CONFIG = path.join(os.homedir(), '.omniclaw', 'config.json');

module.exports = function status() {
  console.log('🔮 OMNI CLAW STATUS\n');
  console.log('═══════════════════════════════════════\n');

  // Version
  const pkg = require('../../package.json');
  console.log(`📦 Version: ${pkg.version}`);

  // Config
  if (fs.existsSync(OMNICLAW_CONFIG)) {
    console.log('✅ Config: Found');
    
    try {
      const config = JSON.parse(fs.readFileSync(OMNICLAW_CONFIG, 'utf8'));
      
      console.log('\n🔑 API Keys:');
      const keys = config.apiKeys || {};
      for (const [name, value] of Object.entries(keys)) {
        console.log(`   ${value ? '✅' : '❌'} ${name}`);
      }

      console.log('\n🤖 Models:');
      const models = config.models || {};
      for (const [name, value] of Object.entries(models)) {
        console.log(`   ${name}: ${value}`);
      }

      console.log('\n🌐 Gateway:');
      console.log(`   Port: ${config.gateway?.port || 3001}`);
      console.log(`   Mode: ${config.gateway?.mode || 'local'}`);

    } catch (err) {
      console.log('⚠️  Config exists but has errors');
    }
  } else {
    console.log('❌ Config: Not found (run: omniclaw setup)');
  }

  // Gateway status
  console.log('\n📡 Gateway:');
  try {
    execSync('openclaw gateway status', { stdio: 'pipe' });
    console.log('   ✅ Running');
  } catch {
    console.log('   ❌ Not running');
  }

  // Skills
  const skillsDir = path.join(os.homedir(), '.omniclaw', 'skills');
  if (fs.existsSync(skillsDir)) {
    const skills = fs.readdirSync(skillsDir).filter(f => 
      fs.statSync(path.join(skillsDir, f)).isDirectory()
    );
    console.log(`\n🔮 Skills: ${skills.length} installed`);
    skills.forEach(s => console.log(`   • ${s}`));
  }

  console.log('\n═══════════════════════════════════════');
};
