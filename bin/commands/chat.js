/**
 * Omni Claw — Chat Command
 * Quick chat with the AI
 */

const { execSync } = require('child_process');

module.exports = function chat(subCommand, flags) {
  const message = [subCommand, ...flags].filter(Boolean).join(' ');
  
  if (!message) {
    console.log('Usage: omniclaw chat "your message here"');
    console.log('   or: omniclaw "your message here"');
    return;
  }

  console.log(`💬 Sending: "${message}"\n`);
  
  try {
    // Use OpenClaw agent command under the hood
    execSync(`openclaw agent --message "${message.replace(/"/g, '\\"')}"`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        OMNICLAW: 'true'
      }
    });
  } catch (err) {
    console.error('❌ Chat error:', err.message);
  }
};
