const schemaRepository = require('../repositories/schemaRepository');

const createSchema = async (req, res) => {
  try {
    const { pipeline_name, schema_version, schema_definition, is_active } = req.body;
    
    // Basic validation
    if (!pipeline_name || !schema_version || !schema_definition) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newSchema = await schemaRepository.createSchema({
      pipeline_name,
      schema_version,
      schema_definition,
      is_active: is_active || false,
    });
    
    res.status(201).json(newSchema);
  } catch (error) {
    console.error('Error creating schema:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllSchemas = async (req, res) => {
  try {
    const schemas = await schemaRepository.getAllSchemas();
    res.status(200).json(schemas);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getSchemaById = async (req, res) => {
  try {
    const { id } = req.params;
    const schema = await schemaRepository.getSchemaById(id);
    
    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    
    res.status(200).json(schema);
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteSchemaById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSchema = await schemaRepository.deleteSchemaById(id);
    
    if (!deletedSchema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    
    res.status(200).json({ message: 'Schema deleted successfully', schema: deletedSchema });
  } catch (error) {
    console.error('Error deleting schema:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createSchema,
  getAllSchemas,
  getSchemaById,
  deleteSchemaById,
};
