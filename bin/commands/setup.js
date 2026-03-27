/**
 * Omni Claw — Setup Command
 * First-time setup with API key configuration
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const OMNICLAW_HOME = path.join(os.homedir(), '.omniclaw');
const OMNICLAW_CONFIG = path.join(OMNICLAW_HOME, 'config.json');
const OMNICLAW_WORKSPACE = path.join(OMNICLAW_HOME, 'workspace');

const DEFAULT_CONFIG = {
  version: '1.0.0',
  name: 'Omni Claw',
  gateway: {
    port: 3001,
    mode: 'local',
    bind: 'loopback',
    auth: {
      mode: 'token',
      token: generateToken()
    }
  },
  apiKeys: {
    perplexity: process.env.PERPLEXITY_API_KEY || '',
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || '',
    nvidia: process.env.NVIDIA_API_KEY || '',
    brave: process.env.BRAVE_API_KEY || ''
  },
  models: {
    default: 'nvidia/llama-3.1-nemotron-70b-instruct',
    research: 'perplexity/sonar-deep-research',
    search: 'perplexity/sonar-pro',
    reasoning: 'perplexity/sonar-reasoning-pro'
  },
  channels: {},
  skills: {
    'omni-research': true,
    'omni-search': true,
    'omni-reason': true,
    'omni-model': true,
    'omni-deploy': true
  },
  research: {
    defaultSearchType: 'pro',
    defaultContextSize: 'medium',
    citationTracking: true,
    academicFilter: false
  }
};

function generateToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

module.exports = function setup(subCommand, flags) {
  console.log('🔮 Setting up Omni Claw...\n');

  // Create directories
  if (!fs.existsSync(OMNICLAW_HOME)) {
    fs.mkdirSync(OMNICLAW_HOME, { recursive: true });
    console.log('✅ Created ~/.omniclaw/');
  }

  if (!fs.existsSync(OMNICLAW_WORKSPACE)) {
    fs.mkdirSync(OMNICLAW_WORKSPACE, { recursive: true });
    console.log('✅ Created ~/.omniclaw/workspace/');
  }

  // Create skills directory
  const skillsDir = path.join(OMNICLAW_HOME, 'skills');
  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
    console.log('✅ Created ~/.omniclaw/skills/');
  }

  // Copy Omni skills
  const skillNames = ['omni-research', 'omni-search', 'omni-reason', 'omni-model', 'omni-deploy'];
  for (const skill of skillNames) {
    const skillDir = path.join(skillsDir, skill);
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
      console.log(`✅ Created skill: ${skill}`);
    }
  }

  // Write config
  if (!fs.existsSync(OMNICLAW_CONFIG)) {
    fs.writeFileSync(OMNICLAW_CONFIG, JSON.stringify(DEFAULT_CONFIG, null, 2));
    console.log('✅ Created config.json');
  } else {
    console.log('ℹ️  Config already exists, skipping...');
  }

  // Create workspace files
  const workspaceFiles = {
    'AGENTS.md': '# Omni Claw Agents\n\nOmni Claw workspace.',
    'SOUL.md': '# SOUL.md\n\nYou are Omni Claw — an AI supercomputer assistant.',
    'IDENTITY.md': '# IDENTITY.md\n\n- Name: Omni Claw\n- Emoji: 🔮',
    'USER.md': '# USER.md\n\nConfigure your user profile here.',
    'TOOLS.md': '# TOOLS.md\n\nOmni Claw tool notes.'
  };

  for (const [file, content] of Object.entries(workspaceFiles)) {
    const filePath = path.join(OMNICLAW_WORKSPACE, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Created ${file}`);
    }
  }

  console.log('\n🔮 Setup complete!\n');
  console.log('Next steps:');
  console.log('  1. Add API keys:');
  console.log('     omniclaw config set PERPLEXITY_API_KEY=your-key');
  console.log('     omniclaw config set NVIDIA_API_KEY=your-key');
  console.log('');
  console.log('  2. Start gateway:');
  console.log('     omniclaw gateway start');
  console.log('');
  console.log('  3. Chat:');
  console.log('     omniclaw chat "Research karo AI ke latest advances"');
};
