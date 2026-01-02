const executionErrorRepository = require('../repositories/executionErrorRepository');

const createExecutionError = async (req, res) => {
  try {
    const { execution_id, error_message } = req.body;

    // Basic validation
    if (!execution_id || !error_message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newExecutionError = await executionErrorRepository.createExecutionError(req.body);
    res.status(201).json(newExecutionError);
  } catch (error) {
    console.error('Error creating execution error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllExecutionErrors = async (req, res) => {
  try {
    const executionErrors = await executionErrorRepository.getAllExecutionErrors();
    res.status(200).json(executionErrors);
  } catch (error) {
    console.error('Error fetching execution errors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getExecutionErrorById = async (req, res) => {
  try {
    const { id } = req.params;
    const executionError = await executionErrorRepository.getExecutionErrorById(id);

    if (!executionError) {
      return res.status(404).json({ error: 'Execution error not found' });
    }

    res.status(200).json(executionError);
  } catch (error) {
    console.error('Error fetching execution error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteExecutionErrorById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExecutionError = await executionErrorRepository.deleteExecutionErrorById(id);

    if (!deletedExecutionError) {
      return res.status(404).json({ error: 'Execution error not found' });
    }

    res.status(200).json({ message: 'Execution error deleted successfully', executionError: deletedExecutionError });
  } catch (error) {
    console.error('Error deleting execution error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createExecutionError,
  getAllExecutionErrors,
  getExecutionErrorById,
  deleteExecutionErrorById,
};