const { pool, connectDB } = require("../db/connect");
require("dotenv").config();

/**
 * Flushes the entire database by truncating all primary tables.
 * Uses CASCADE to handle foreign key dependencies and RESTART IDENTITY to reset sequences.
 */
const flushDB = async () => {
  const query = `
    TRUNCATE TABLE 
      execution_errors, 
      execution_steps, 
      executions 
    RESTART IDENTITY CASCADE;
  `;

  try {
    console.log("Initiating database flush...");
    await pool.query(query);
    console.log(
      "Database flushed successfully: All tables truncated and identities reset."
    );
  } catch (err) {
    console.error("Error during database flush:", err.message);
    throw err;
  }
};

// Allow running directly from command line
if (require.main === module) {
  flushDB()
    .then(() => {
      console.log("Flush script completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Flush script failed:", err);
      process.exit(1);
    });
}

module.exports = flushDB;
