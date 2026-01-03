const { pool } = require("../db/connect");

async function markIncompleteExecutions() {
  if (!pool) {
    console.warn(
      "[X-Ray] Database pool not initialized. Skipping incomplete execution check."
    );
    return;
  }

  // Debug: Check DB time vs Local time to diagnose timezone issues
  try {
    const timeCheck = await pool.query("SELECT now() as db_time");
    // console.log("[X-Ray] DB Time Check:", timeCheck.rows[0].db_time);
  } catch (err) {
    // ignore
  }

  // Updated logic: Check both started_at and created_at.
  // If a 'running' execution was created > 10 mins ago, it's likely stale,
  // even if started_at is in the future (due to timezone mismatches).
  const query = `
    UPDATE executions
    SET status = 'incomplete',
        updated_at = now()
    WHERE status = 'running'
      AND (
        started_at < now() - INTERVAL '10 minutes'
        OR
        created_at < now() - INTERVAL '10 minutes'
      )
  `;

  try {
    const result = await pool.query(query);
    if (result.rowCount > 0) {
      console.log(`[X-Ray] Marked ${result.rowCount} executions as incomplete`);
    }
  } catch (err) {
    console.error("[X-Ray] Error marking incomplete executions:", err);
  }
}

module.exports = markIncompleteExecutions;
