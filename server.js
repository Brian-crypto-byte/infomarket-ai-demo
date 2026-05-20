const http = require('http');
const { host, port } = require('./server/config');
const { ensureDb } = require('./server/store/mock-db');
const { handleApi } = require('./server/api');
const { serveStatic } = require('./server/static');
const { sendError } = require('./server/utils');
const { startJobs } = require('./server/jobs');

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${host}:${port}`);
  try {
    if (url.pathname.startsWith('/api/v1')) return await handleApi(req, res, url);
    return serveStatic(req, res, url);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
}).listen(port, host, () => {
  ensureDb();
  startJobs();
  console.log(`http://${host}:${port}`);
  console.log(`http://${host}:${port}/api/v1/health`);
});
