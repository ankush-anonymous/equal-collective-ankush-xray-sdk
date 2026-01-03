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

const getExecutions = async (filters) => {
  const conditions = [];
  const values = [];
  let index = 1;

  if (filters.pipeline_name) {
    conditions.push(`pipeline_name = $${index++}`);
    values.push(filters.pipeline_name);
  }

  if (filters.environment) {
    conditions.push(`environment = $${index++}`);
    values.push(filters.environment);
  }

  if (filters.status) {
    conditions.push(`status = $${index++}`);
    values.push(filters.status);
  }

  if (filters.trigger_type) {
    conditions.push(`trigger_type = $${index++}`);
    values.push(filters.trigger_type);
  }

  if (filters.triggered_by) {
    conditions.push(`triggered_by = $${index++}`);
    values.push(filters.triggered_by);
  }

  // Time range filtering (very important for executions)
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
    FROM executions
    ${whereClause}
    ORDER BY started_at DESC
    LIMIT 100;
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

const getExecutionById = async (execution_id) => {
  const query = "SELECT * FROM executions WHERE execution_id = $1;";
  const result = await pool.query(query, [execution_id]);
  return result.rows[0];
};

const updateExecutionById = async (execution_id, data) => {
  // Filter out undefined fields so we only update what is provided
  const keys = Object.keys(data).filter((key) => data[key] !== undefined);
  if (keys.length === 0) return null; // Nothing to update

  const setClause = keys
    .map((key, index) => `${key} = $${index + 2}`)
    .join(", ");
  const values = keys.map((key) => data[key]);

  const query = `
    UPDATE executions
    SET ${setClause}, updated_at = now()
    WHERE execution_id = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [execution_id, ...values]);
  return result.rows[0];
};

const deleteExecutionById = async (execution_id) => {
  const query = "DELETE FROM executions WHERE execution_id = $1 RETURNING *;";
  const result = await pool.query(query, [execution_id]);
  return result.rows[0];
};

module.exports = {
  createExecution,
  getExecutions,
  getExecutionById,
  updateExecutionById,
  deleteExecutionById,
};
