/**
 * Omni Claw — Deploy Module
 * Build and deploy automation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class OmniDeploy {
  constructor() {
    this.cwd = process.cwd();
  }

  /**
   * Detect project type
   */
  detectProject() {
    const indicators = {
      nodejs: ['package.json'],
      python: ['requirements.txt', 'pyproject.toml', 'setup.py'],
      go: ['go.mod'],
      rust: ['Cargo.toml'],
      docker: ['Dockerfile', 'docker-compose.yml'],
      vercel: ['vercel.json'],
      fly: ['fly.toml']
    };

    const detected = [];
    for (const [type, files] of Object.entries(indicators)) {
      for (const file of files) {
        if (fs.existsSync(path.join(this.cwd, file))) {
          detected.push(type);
          break;
        }
      }
    }
    return detected;
  }

  /**
   * Build project
   */
  build() {
    const types = this.detectProject();
    
    if (types.includes('nodejs')) {
      console.log('📦 Node.js project detected');
      console.log('📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit', cwd: this.cwd });
      console.log('🔨 Building...');
      execSync('npm run build', { stdio: 'inherit', cwd: this.cwd });
      return { success: true, type: 'nodejs' };
    }

    if (types.includes('python')) {
      console.log('🐍 Python project detected');
      console.log('📦 Installing dependencies...');
      execSync('pip install -r requirements.txt', { stdio: 'inherit', cwd: this.cwd });
      return { success: true, type: 'python' };
    }

    console.log('⚠️  No recognized project type found');
    return { success: false, type: 'unknown' };
  }

  /**
   * Deploy with Docker
   */
  docker(options = {}) {
    const name = options.name || path.basename(this.cwd);
    const port = options.port || '3000';

    if (!fs.existsSync(path.join(this.cwd, 'Dockerfile'))) {
      console.log('❌ No Dockerfile found');
      return { success: false, error: 'No Dockerfile' };
    }

    console.log(`📦 Building Docker image: ${name}`);
    execSync(`docker build -t ${name} .`, { stdio: 'inherit', cwd: this.cwd });

    if (options.run) {
      console.log(`🚀 Running on port ${port}`);
      execSync(`docker run -d -p ${port}:${port} --name ${name} ${name}`, { stdio: 'inherit', cwd: this.cwd });
    }

    return { success: true, image: name };
  }

  /**
   * Deploy to Vercel
   */
  vercel(options = {}) {
    const flag = options.prod ? '--prod' : '';
    console.log('🚀 Deploying to Vercel...');
    execSync(`vercel ${flag}`, { stdio: 'inherit', cwd: this.cwd });
    return { success: true, platform: 'vercel' };
  }

  /**
   * Deploy to Fly.io
   */
  fly() {
    console.log('🚀 Deploying to Fly.io...');
    execSync('fly deploy', { stdio: 'inherit', cwd: this.cwd });
    return { success: true, platform: 'fly' };
  }

  /**
   * Run arbitrary command
   */
  run(command) {
    console.log(`▶ Running: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: this.cwd });
    return { success: true, command };
  }
}

module.exports = OmniDeploy;
