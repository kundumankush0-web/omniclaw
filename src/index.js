/**
 * Omni Claw — Main Entry Point
 * Your AI Supercomputer
 */

const OmniResearch = require('./research');
const OmniSearch = require('./search');
const OmniModel = require('./model');
const OmniGateway = require('./gateway');
const OmniDeploy = require('./deploy');
const OmniConfig = require('./config');
const utils = require('./utils');

class OmniClaw {
  constructor() {
    this.version = require('../package.json').version;
    this.config = new OmniConfig();
    
    const apiKey = this.config.getKey('perplexity');
    this.research = new OmniResearch(apiKey);
    this.search = new OmniSearch(apiKey);
    this.model = new OmniModel(apiKey);
    this.gateway = new OmniGateway(this.config.config);
    this.deploy = new OmniDeploy();
    this.utils = utils;
  }

  /**
   * Initialize Omni Claw
   */
  async init() {
    this.config.init();
    return this;
  }

  /**
   * Quick research
   */
  async research_query(query, options = {}) {
    return this.research.search(query, options);
  }

  /**
   * Deep research with citations
   */
  async deep_research(query, options = {}) {
    return this.research.deepResearch(query, options);
  }

  /**
   * Quick search
   */
  async search_query(query, options = {}) {
    return this.search.search(query, options);
  }

  /**
   * Generate with AI model
   */
  async generate(prompt, options = {}) {
    return this.model.generate(prompt, options);
  }
}

// Export both the class and a default instance factory
module.exports = OmniClaw;
module.exports.create = () => new OmniClaw();
module.exports.OmniResearch = OmniResearch;
module.exports.OmniSearch = OmniSearch;
module.exports.OmniModel = OmniModel;
module.exports.OmniGateway = OmniGateway;
module.exports.OmniDeploy = OmniDeploy;
module.exports.OmniConfig = OmniConfig;
module.exports.utils = utils;
