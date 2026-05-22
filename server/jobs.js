const { readDb, writeDb } = require('./store/mock-db');
const { runFootballCollection, runFootballSettlement } = require('./football-ops');

function startJobs() {
  if (process.env.INFOMARKET_AUTO_JOBS !== '1') return;

  const runSettlement = async () => {
    try {
      const db = readDb();
      const result = await runFootballSettlement(db);
      if (result.settled.length || result.pending.length) writeDb(db);
    } catch (_) {
      // Background jobs must never crash the local server.
    }
  };

  const runCollection = async () => {
    try {
      const db = readDb();
      await runFootballCollection(db, { autoPublish: true });
      writeDb(db);
    } catch (_) {
      // Collection is best-effort; the app keeps serving cached markets.
    }
  };

  setTimeout(runCollection, 3500);
  setTimeout(runSettlement, 6000);
  setInterval(runCollection, 15 * 60 * 1000);
  setInterval(runSettlement, 10 * 60 * 1000);
}

module.exports = { startJobs };
