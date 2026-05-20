const fs = require('fs');
const path = require('path');
const { root, staticTypes } = require('./config');
const { securityHeaders } = require('./utils');

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(root, `.${pathname}`);
  const relative = path.relative(root, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    res.writeHead(403, securityHeaders());
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, securityHeaders());
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      ...securityHeaders(),
      'Content-Type': staticTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
}

module.exports = { serveStatic };
