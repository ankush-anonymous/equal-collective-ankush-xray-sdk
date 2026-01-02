const { pool } = require("../db/connect");

const createExecution = async (data) => {
  const {
    pipeline_name,
    environment,
    status,
    trigger_type,
    triggered_by,
    started_at,
  } = data;
  const query = `
    INSERT INTO executions (
      pipeline_name, 
      environment, 
      status, 
      trigger_type, 
      triggered_by, 
      started_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    pipeline_name,
    environment,
    status,
    trigger_type,
    triggered_by,
    started_at || new Date(),
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllExecutions = async () => {
  const query = "SELECT * FROM executions ORDER BY created_at DESC;";
  const result = await pool.query(query);
  return result.rows;
};

const getExecutionById = async (execution_id) => {
  const query = "SELECT * FROM executions WHERE execution_id = $1;";
  const result = await pool.query(query, [execution_id]);
  return result.rows[0];
};

const deleteExecutionById = async (execution_id) => {
  const query = "DELETE FROM executions WHERE execution_id = $1 RETURNING *;";
  const result = await pool.query(query, [execution_id]);
  return result.rows[0];
};

module.exports = {
  createExecution,
  getAllExecutions,
  getExecutionById,
  deleteExecutionById,
};
