/**
 * Omni Claw — Config Command
 * Get/set configuration values
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const OMNICLAW_CONFIG = path.join(os.homedir(), '.omniclaw', 'config.json');

module.exports = function config(subCommand, flags) {
  if (!fs.existsSync(OMNICLAW_CONFIG)) {
    console.log('❌ Config not found. Run: omniclaw setup');
    return;
  }

  const configData = JSON.parse(fs.readFileSync(OMNICLAW_CONFIG, 'utf8'));

  switch (subCommand) {
    case 'set':
      setConfig(configData, flags);
      break;
    case 'get':
      getConfig(configData, flags);
      break;
    case 'list':
      listConfig(configData);
      break;
    default:
      console.log('Usage: omniclaw config <set|get|list> [key=value]');
  }
};

function setConfig(configData, flags) {
  for (const flag of flags) {
    const [key, ...valueParts] = flag.split('=');
    const value = valueParts.join('=');
    
    if (key && value) {
      // Support nested keys like gateway.port
      const keys = key.split('.');
      let obj = configData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      console.log(`✅ Set ${key} = ${'*'.repeat(Math.min(value.length, 8))}`);
    }
  }

  fs.writeFileSync(OMNICLAW_CONFIG, JSON.stringify(configData, null, 2));
  console.log('✅ Config saved');
}

function getConfig(configData, flags) {
  for (const key of flags) {
    const keys = key.split('.');
    let value = configData;
    for (const k of keys) {
      value = value?.[k];
    }
    if (value !== undefined) {
      // Mask sensitive values
      if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token')) {
        console.log(`${key} = ${'*'.repeat(8)}`);
      } else {
        console.log(`${key} = ${value}`);
      }
    } else {
      console.log(`${key} = (not set)`);
    }
  }
}

function listConfig(configData) {
  console.log('📋 Omni Claw Configuration\n');
  console.log('API Keys:');
  for (const [key, value] of Object.entries(configData.apiKeys || {})) {
    const status = value ? '✅ set' : '❌ not set';
    console.log(`  ${key}: ${status}`);
  }
  console.log('\nModels:');
  for (const [key, value] of Object.entries(configData.models || {})) {
    console.log(`  ${key}: ${value}`);
  }
  console.log('\nGateway:');
  console.log(`  port: ${configData.gateway?.port || 3001}`);
  console.log(`  mode: ${configData.gateway?.mode || 'local'}`);
}
