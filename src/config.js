/**
 * Omni Claw — Config Module
 * Configuration management
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const OMNICLAW_HOME = path.join(os.homedir(), '.omniclaw');
const OMNICLAW_CONFIG = path.join(OMNICLAW_HOME, 'config.json');

const DEFAULT_CONFIG = {
  version: '1.0.0',
  name: 'Omni Claw',
  gateway: {
    port: 3001,
    mode: 'local',
    bind: 'loopback',
    auth: {
      mode: 'token',
      token: ''
    }
  },
  apiKeys: {
    perplexity: '',
    openai: '',
    anthropic: '',
    gemini: '',
    nvidia: '',
    brave: ''
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

class OmniConfig {
  constructor() {
    this.home = OMNICLAW_HOME;
    this.configPath = OMNICLAW_CONFIG;
    this.config = this._load();
  }

  /**
   * Load config from disk
   */
  _load() {
    if (fs.existsSync(this.configPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      } catch {
        return { ...DEFAULT_CONFIG };
      }
    }
    return { ...DEFAULT_CONFIG };
  }

  /**
   * Save config to disk
   */
  save() {
    if (!fs.existsSync(this.home)) {
      fs.mkdirSync(this.home, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * Get a config value (supports dot notation)
   */
  get(key) {
    const keys = key.split('.');
    let value = this.config;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  }

  /**
   * Set a config value (supports dot notation)
   */
  set(key, value) {
    const keys = key.split('.');
    let obj = this.config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    this.save();
  }

  /**
   * Get API key
   */
  getKey(provider) {
    return this.get(`apiKeys.${provider}`) || process.env[`${provider.toUpperCase()}_API_KEY`] || '';
  }

  /**
   * Set API key
   */
  setKey(provider, key) {
    this.set(`apiKeys.${provider}`, key);
  }

  /**
   * Initialize with defaults
   */
  init() {
    if (!this.config.gateway.auth.token) {
      this.config.gateway.auth.token = crypto.randomBytes(32).toString('hex');
    }
    this.save();
    return this;
  }

  /**
   * Check if setup is complete
   */
  isSetup() {
    return fs.existsSync(this.configPath);
  }

  /**
   * Get all configured keys status
   */
  getKeysStatus() {
    const keys = this.config.apiKeys || {};
    return Object.entries(keys).map(([name, value]) => ({
      name,
      configured: !!value
    }));
  }
}

module.exports = OmniConfig;
