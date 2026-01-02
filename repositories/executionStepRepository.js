const { pool } = require("../db/connect");

// Execution Steps
const createExecutionStep = async (data) => {
  const {
    execution_id,
    step_index,
    step_name,
    step_type,
    input_payload,
    output_payload,
    reasoning_payload,
    status,
    error_message,
    started_at,
  } = data;

  const query = `
    INSERT INTO execution_steps (
      execution_id, 
      step_index, 
      step_name, 
      step_type, 
      input_payload, 
      output_payload, 
      reasoning_payload, 
      status, 
      error_message, 
      started_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const values = [
    execution_id,
    step_index,
    step_name,
    step_type,
    input_payload,
    output_payload,
    reasoning_payload,
    status,
    error_message,
    started_at || new Date(),
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllExecutionSteps = async () => {
  // Using started_at as created_at is not present in execution_steps table
  const query = "SELECT * FROM execution_steps ORDER BY started_at DESC;";
  const result = await pool.query(query);
  return result.rows;
};

const getExecutionStepById = async (execution_step_id) => {
  const query = "SELECT * FROM execution_steps WHERE execution_step_id = $1;";
  const result = await pool.query(query, [execution_step_id]);
  return result.rows[0];
};

const deleteExecutionStepById = async (execution_step_id) => {
  const query =
    "DELETE FROM execution_steps WHERE execution_step_id = $1 RETURNING *;";
  const result = await pool.query(query, [execution_step_id]);
  return result.rows[0];
};

module.exports = {
  createExecutionStep,
  getAllExecutionSteps,
  getExecutionStepById,
  deleteExecutionStepById,
};
