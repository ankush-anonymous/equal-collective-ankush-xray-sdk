const { pool } = require("../db/connect");

const createSchema = async (data) => {
  const { pipeline_name, schema_version, schema_definition, is_active } = data;
  const query = `
    INSERT INTO schema_definitions (pipeline_name, schema_version, schema_definition, is_active)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [pipeline_name, schema_version, schema_definition, is_active];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllSchemas = async () => {
  const query = "SELECT * FROM schema_definitions ORDER BY created_at DESC;";
  const result = await pool.query(query);
  return result.rows;
};

const getSchemaById = async (schema_id) => {
  const query = "SELECT * FROM schema_definitions WHERE schema_id = $1;";
  const result = await pool.query(query, [schema_id]);
  return result.rows[0];
};

const deleteSchemaById = async (schema_id) => {
  const query =
    "DELETE FROM schema_definitions WHERE schema_id = $1 RETURNING *;";
  const result = await pool.query(query, [schema_id]);
  return result.rows[0];
};

module.exports = {
  createSchema,
  getAllSchemas,
  getSchemaById,
  deleteSchemaById,
};
