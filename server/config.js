const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');

function loadEnvFile() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match || process.env[match[1]]) return;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  });
}

loadEnvFile();

const dataDir = path.join(root, 'data');
const dbPath = path.join(dataDir, 'mock-db.json');
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 5173);

const staticTypes = {
  '.html': 'text/html;charset=utf-8',
  '.js': 'text/javascript;charset=utf-8',
  '.css': 'text/css;charset=utf-8',
  '.json': 'application/json;charset=utf-8',
  '.svg': 'image/svg+xml;charset=utf-8'
};

module.exports = { root, dataDir, dbPath, host, port, staticTypes };
