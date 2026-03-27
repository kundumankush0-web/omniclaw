/**
 * Omni Claw — Gateway Command
 * Start/stop/restart the gateway
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const os = require('os');

const OMNICLAW_HOME = path.join(os.homedir(), '.omniclaw');

module.exports = function gateway(subCommand, flags) {
  switch (subCommand) {
    case 'start':
      startGateway(flags);
      break;
    case 'stop':
      stopGateway();
      break;
    case 'restart':
      stopGateway();
      startGateway(flags);
      break;
    case 'status':
      checkStatus();
      break;
    default:
      console.log('Usage: omniclaw gateway <start|stop|restart|status>');
  }
};

function startGateway(flags) {
  console.log('🔮 Starting Omni Claw Gateway...\n');
  
  // Check if OpenClaw is installed
  try {
    execSync('which openclaw', { stdio: 'pipe' });
  } catch {
    console.log('📦 Installing OpenClaw base...');
    try {
      execSync('npm install -g openclaw@latest', { stdio: 'inherit' });
      console.log('✅ OpenClaw installed');
    } catch (err) {
      console.error('❌ Failed to install OpenClaw:', err.message);
      return;
    }
  }

  // Start gateway
  const verbose = flags.includes('--verbose') ? '--verbose' : '';
  const port = flags.find(f => f.startsWith('--port='));
  
  try {
    console.log('🚀 Gateway starting on port 3001...');
    console.log('🌐 Dashboard: http://127.0.0.1:3001/');
    console.log('');
    console.log('Press Ctrl+C to stop\n');
    
    const child = spawn('openclaw', ['gateway', 'start', verbose].filter(Boolean), {
      stdio: 'inherit',
      env: {
        ...process.env,
        OMNICLAW_HOME: OMNICLAW_HOME
      }
    });
    
    child.on('error', (err) => {
      console.error('❌ Gateway error:', err.message);
    });
    
  } catch (err) {
    console.error('❌ Failed to start gateway:', err.message);
  }
}

function stopGateway() {
  console.log('🛑 Stopping Omni Claw Gateway...');
  try {
    execSync('openclaw gateway stop', { stdio: 'inherit' });
    console.log('✅ Gateway stopped');
  } catch (err) {
    console.error('❌ Failed to stop gateway:', err.message);
  }
}

function checkStatus() {
  console.log('📊 Omni Claw Gateway Status\n');
  try {
    execSync('openclaw gateway status', { stdio: 'inherit' });
  } catch {
    console.log('❌ Gateway is not running');
    console.log('Start with: omniclaw gateway start');
  }
}
