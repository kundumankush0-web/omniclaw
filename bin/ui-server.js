/**
 * Omni Claw — UI Server
 * Serves the branded web dashboard
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.OMNICLAW_UI_PORT || 3000;
const UI_DIR = path.join(__dirname, '..', 'ui');

function startUIServer(port) {
  const server = http.createServer((req, res) => {
    // Serve index.html for root
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(UI_DIR, filePath);

    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Serve index.html for SPA routes
        fs.readFile(path.join(UI_DIR, 'index.html'), (err2, data2) => {
          if (err2) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data2);
        });
        return;
      }
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      res.end(data);
    });
  });

  server.listen(port, () => {
    console.log(`🔮 Omni Claw Dashboard: http://127.0.0.1:${port}`);
  });

  return server;
}

// Start if run directly
if (require.main === module) {
  startUIServer();
}

module.exports = { startUIServer };
