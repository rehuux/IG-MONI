
// ─── EXE-safe base directory ──────────────────────────────────────────────────
const path = require('path');
const http = require('http');

// Detect if running inside pkg EXE
const isPkg = typeof process.pkg !== 'undefined';

// Base directory = folder where EXE or script lives
const BASE_DIR = isPkg
  ? path.dirname(process.execPath)
  : path.dirname(process.argv[1] || __filename);

// Make globally available for bot.js and db.js
global.__basedir = BASE_DIR;

// Load .env from EXE/script directory
require('dotenv').config({
  path: path.join(BASE_DIR, '.env')
});

// ─── HTTP Health Server (Render Web Service) ──────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });

    return res.end(JSON.stringify({
      status: 'online',
      service: 'Instagram Monitor Discord Bot',
      timestamp: new Date().toISOString()
    }));
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[HTTP] Health server listening on port ${PORT}`);
});

// ─── Database and Discord Bot ─────────────────────────────────────────────────
const db = require('./db');
const bot = require('./bot');

async function start() {
  console.log('──────────────────────────────────────────');
  console.log(`📁 Base directory: ${BASE_DIR}`);
  console.log(`📦 Running as: ${isPkg ? 'EXE (pkg)' : 'Node.js script'}`);
  console.log('──────────────────────────────────────────');

  console.log('🔄 Connecting to MongoDB...');
  await db.connect();

  console.log('🤖 Starting Discord bot...');
  await bot.start();
}

// ─── Startup Error Handling ───────────────────────────────────────────────────
start().catch(err => {
  console.error('❌ Startup failed:', err);

  server.close(() => {
    process.exit(1);
  });

  // Prevent hanging if server close does not complete
  setTimeout(() => process.exit(1), 5000).unref();
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`[SHUTDOWN] Received ${signal}`);

  server.close(() => {
    console.log('[HTTP] Health server closed');
    process.exit(0);
  });
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
