#!/usr/bin/env node

/**
 * Omni Claw CLI
 * Your own AI supercomputer. Any channel. Any model. Any task.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Omni Claw paths
const OMNICLAW_HOME = path.join(os.homedir(), '.omniclaw');
const OMNICLAW_CONFIG = path.join(OMNICLAW_HOME, 'config.json');
const OMNICLAW_WORKSPACE = path.join(OMNICLAW_HOME, 'workspace');

// ASCII Art
const BANNER = `
🔮 ════════════════════════════════════════════════
   ╔═╗ ╔╗╔ ╔═╗ ╔═╗ ╔═╗ ╔═╗
   ╠═╣ ║║║ ╠═╝ ╠╦╝ ║ ║ ║
   ╩ ╩ ╝╚╝ ╩   ╩╚═ ╚═╝ ╚═╝
   Your AI Supercomputer 🦞
══════════════════════════════════════════════════
`;

// Commands
const commands = {
  setup: require('./commands/setup'),
  gateway: require('./commands/gateway'),
  config: require('./commands/config'),
  chat: require('./commands/chat'),
  research: require('./commands/research'),
  search: require('./commands/search'),
  deploy: require('./commands/deploy'),
  status: require('./commands/status'),
  help: require('./commands/help'),
};

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];
const subCommand = args[1];
const flags = args.slice(2);

// Main
function main() {
  console.log(BANNER);

  if (!command || command === 'help') {
    commands.help();
    return;
  }

  if (commands[command]) {
    commands[command](subCommand, flags);
  } else {
    // Treat as chat message
    commands.chat(null, args);
  }
}

main();
