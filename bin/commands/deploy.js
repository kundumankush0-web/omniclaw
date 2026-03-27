/**
 * Omni Claw — Deploy Command
 * Build and deploy projects
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = function deploy(subCommand, flags) {
  if (!subCommand) {
    console.log('Usage: omniclaw deploy <platform> [options]');
    console.log('');
    console.log('Platforms:');
    console.log('  docker      Build and run with Docker');
    console.log('  vercel      Deploy to Vercel');
    console.log('  fly         Deploy to Fly.io');
    console.log('  build       Just build (npm run build)');
    console.log('');
    console.log('Options:');
    console.log('  --name=     Project name');
    console.log('  --port=     Port number');
    console.log('  --prod      Production deployment');
    return;
  }

  const projectName = flags.find(f => f.startsWith('--name='))?.split('=')[1] || 'app';
  const port = flags.find(f => f.startsWith('--port='))?.split('=')[1] || '3000';
  const isProd = flags.includes('--prod');

  console.log(`🚀 Omni Claw Deploy — ${subCommand}\n`);

  switch (subCommand) {
    case 'docker':
      deployDocker(projectName, port);
      break;
    case 'vercel':
      deployVercel(isProd);
      break;
    case 'fly':
      deployFly();
      break;
    case 'build':
      buildProject();
      break;
    default:
      console.log(`❌ Unknown platform: ${subCommand}`);
  }
};

function deployDocker(name, port) {
  console.log('📦 Building Docker image...\n');
  try {
    if (fs.existsSync('Dockerfile')) {
      execSync(`docker build -t ${name} .`, { stdio: 'inherit' });
      console.log(`\n✅ Image built: ${name}`);
      console.log(`\n🚀 Running on port ${port}...`);
      execSync(`docker run -p ${port}:${port} ${name}`, { stdio: 'inherit' });
    } else {
      console.log('❌ No Dockerfile found. Create one first.');
      console.log('Tip: Ask Omni Claw to create a Dockerfile for your project.');
    }
  } catch (err) {
    console.error('❌ Docker error:', err.message);
  }
}

function deployVercel(isProd) {
  console.log('📦 Deploying to Vercel...\n');
  try {
    const flag = isProd ? '--prod' : '';
    execSync(`vercel ${flag}`, { stdio: 'inherit' });
    console.log('\n✅ Deployed to Vercel!');
  } catch (err) {
    console.error('❌ Vercel error:', err.message);
    console.log('Install Vercel CLI: npm i -g vercel');
  }
}

function deployFly() {
  console.log('📦 Deploying to Fly.io...\n');
  try {
    execSync('fly deploy', { stdio: 'inherit' });
    console.log('\n✅ Deployed to Fly.io!');
  } catch (err) {
    console.error('❌ Fly error:', err.message);
    console.log('Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/');
  }
}

function buildProject() {
  console.log('🔨 Building project...\n');
  try {
    if (fs.existsSync('package.json')) {
      console.log('📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      console.log('\n🔨 Building...');
      execSync('npm run build', { stdio: 'inherit' });
      console.log('\n✅ Build complete!');
    } else {
      console.log('❌ No package.json found.');
    }
  } catch (err) {
    console.error('❌ Build error:', err.message);
  }
}
