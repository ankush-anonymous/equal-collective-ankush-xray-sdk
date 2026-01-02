const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function markIncompleteExecutions() {
  const query = `
    UPDATE executions
    SET status = 'incomplete',
        updated_at = now()
    WHERE status = 'running'
      AND started_at < now() - INTERVAL '10 minutes'
  `;

  const result = await pool.query(query);

  if (result.rowCount > 0) {
    console.log(`[X-Ray] Marked ${result.rowCount} executions as incomplete`);
  }
}

module.exports = markIncompleteExecutions;
