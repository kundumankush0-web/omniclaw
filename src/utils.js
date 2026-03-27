/**
 * Omni Claw — Utils Module
 * Common utilities
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const OMNICLAW_HOME = path.join(os.homedir(), '.omniclaw');

module.exports = {
  /**
   * Get Omni Claw home directory
   */
  getHome() {
    return OMNICLAW_HOME;
  },

  /**
   * Get workspace directory
   */
  getWorkspace() {
    return path.join(OMNICLAW_HOME, 'workspace');
  },

  /**
   * Get skills directory
   */
  getSkillsDir() {
    return path.join(OMNICLAW_HOME, 'skills');
  },

  /**
   * Ensure directory exists
   */
  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  },

  /**
   * Read JSON file
   */
  readJSON(filePath) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return null;
    }
  },

  /**
   * Write JSON file
   */
  writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  },

  /**
   * Mask sensitive string
   */
  mask(str, showChars = 4) {
    if (!str || str.length <= showChars) return '****';
    return str.substring(0, showChars) + '*'.repeat(Math.max(str.length - showChars, 4));
  },

  /**
   * Format cost
   */
  formatCost(cost) {
    if (typeof cost === 'number') {
      return `$${cost.toFixed(4)}`;
    }
    if (cost?.total_cost) {
      return `$${cost.total_cost.toFixed(4)}`;
    }
    return 'N/A';
  },

  /**
   * Print formatted research result
   */
  printResearch(result) {
    console.log('\n═══════════════════════════════════════════════');
    console.log('🔮 OMNI CLAW RESEARCH RESULTS');
    console.log('═══════════════════════════════════════════════\n');
    
    console.log(result.answer || result.text || 'No response');
    
    const sources = result.sources || result.results || [];
    if (sources.length > 0) {
      console.log('\n───────────────────────────────────────────────');
      console.log('📚 SOURCES:');
      console.log('───────────────────────────────────────────────');
      sources.forEach((src, i) => {
        console.log(`\n[${i + 1}] ${src.title}`);
        console.log(`    🔗 ${src.url}`);
        if (src.date) console.log(`    📅 ${src.date}`);
        if (src.snippet) console.log(`    📝 ${src.snippet.substring(0, 100)}...`);
      });
    }

    if (result.cost) {
      console.log('\n───────────────────────────────────────────────');
      console.log(`💰 Cost: ${module.exports.formatCost(result.cost)}`);
    }
    console.log('');
  },

  /**
   * Print formatted search results
   */
  printSearchResults(results) {
    console.log(`\n📊 Found ${results.length} results:\n`);
    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title}`);
      if (r.snippet) console.log(`   ${r.snippet.substring(0, 150)}`);
      console.log(`   🔗 ${r.url}`);
      if (r.date) console.log(`   📅 ${r.date}`);
      console.log('');
    });
  }
};
