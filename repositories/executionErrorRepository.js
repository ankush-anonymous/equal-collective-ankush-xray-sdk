const { pool } = require("../db/connect");

// Execution Errors
const createExecutionError = async (data) => {
  const {
    execution_id,
    execution_step_id,
    step_name,
    step_type,
    error_message,
    stack_trace,
  } = data;

  const query = `
    INSERT INTO execution_errors (
      execution_id, 
      execution_step_id, 
      step_name, 
      step_type, 
      error_message, 
      stack_trace
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    execution_id,
    execution_step_id,
    step_name,
    step_type,
    error_message,
    stack_trace,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllExecutionErrors = async () => {
  const query = "SELECT * FROM execution_errors ORDER BY created_at DESC;";
  const result = await pool.query(query);
  return result.rows;
};

const getExecutionErrorById = async (execution_error_id) => {
  const query = "SELECT * FROM execution_errors WHERE execution_error_id = $1;";
  const result = await pool.query(query, [execution_error_id]);
  return result.rows[0];
};

const deleteExecutionErrorById = async (execution_error_id) => {
  const query =
    "DELETE FROM execution_errors WHERE execution_error_id = $1 RETURNING *;";
  const result = await pool.query(query, [execution_error_id]);
  return result.rows[0];
};

module.exports = {
  createExecutionError,
  getAllExecutionErrors,
  getExecutionErrorById,
  deleteExecutionErrorById,
};
