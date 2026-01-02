const { log } = require("node:console");
const { Pool } = require("pg");
require("dotenv").config(); // Ensure dotenv is loaded to access environment variables

const pool = new Pool({
  // Use the environment variable for the connection string
  connectionString: process.env.DB_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectDB = async () => {
  try {
    // Check if the environment variable is set
    if (!process.env.DB_URI) {
      console.error("DB_URL environment variable is not set.");
      process.exit(1); // Exit if the URL is missing
    }

    await pool.query("SELECT NOW()");
    console.log("SQL Database connected successfully");

    // Error handling for idle clients
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });

    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
