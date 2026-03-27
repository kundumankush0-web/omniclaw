/**
 * Omni Claw — Gateway Module
 * WebSocket control plane
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class OmniGateway {
  constructor(config) {
    this.config = config;
    this.port = config?.gateway?.port || 3001;
  }

  start(options = {}) {
    console.log('🔮 Starting Omni Claw Gateway...');
    const args = ['gateway', 'start'];
    if (options.verbose) args.push('--verbose');
    if (options.port) args.push(`--port=${options.port}`);
    
    return spawn('openclaw', args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        OMNICLAW: 'true',
        OMNICLAW_PORT: String(this.port)
      }
    });
  }

  stop() {
    try {
      execSync('openclaw gateway stop', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  restart() {
    this.stop();
    return this.start();
  }

  status() {
    try {
      execSync('openclaw gateway status', { stdio: 'pipe' });
      return { running: true };
    } catch {
      return { running: false };
    }
  }
}

module.exports = OmniGateway;
