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

const getExecutionSteps = async (filters) => {
  const conditions = [];
  const values = [];
  let index = 1;

  if (filters.execution_id) {
    conditions.push(`execution_id = $${index++}`);
    values.push(filters.execution_id);
  }

  if (filters.step_index !== undefined) {
    conditions.push(`step_index = $${index++}`);
    values.push(filters.step_index);
  }

  if (filters.step_name) {
    conditions.push(`step_name = $${index++}`);
    values.push(filters.step_name);
  }

  if (filters.step_type) {
    conditions.push(`step_type = $${index++}`);
    values.push(filters.step_type);
  }

  if (filters.status) {
    conditions.push(`status = $${index++}`);
    values.push(filters.status);
  }

  // Time-based filtering (critical for timelines)
  if (filters.from) {
    conditions.push(`started_at >= $${index++}`);
    values.push(filters.from);
  }

  if (filters.to) {
    conditions.push(`started_at <= $${index++}`);
    values.push(filters.to);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT *
    FROM execution_steps
    ${whereClause}
    ORDER BY execution_id, step_index ASC
    LIMIT 200;
  `;

  const result = await pool.query(query, values);
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
  getExecutionSteps,
  getExecutionStepById,
  deleteExecutionStepById,
};
