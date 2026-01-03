const executionRepository = require("../repositories/executionRepository");

const createExecution = async (req, res) => {
  try {
    const {
      pipeline_name,
      environment,
      status,
      trigger_type,
      triggered_by,
      started_at,
    } = req.body;

    if (!pipeline_name || !environment || !status || !trigger_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newExecution = await executionRepository.createExecution({
      pipeline_name,
      environment,
      status,
      trigger_type,
      triggered_by,
      started_at,
    });

    res.status(201).json(newExecution);
  } catch (error) {
    console.error("Error creating execution:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getExecutions = async (req, res) => {
  try {
    const filters = req.query; // ?pipeline_name=...&status=...
    const executions = await executionRepository.getExecutions(filters);
    res.status(200).json(executions);
  } catch (error) {
    console.error("Error fetching executions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getExecutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const execution = await executionRepository.getExecutionById(id);

    if (!execution) {
      return res.status(404).json({ error: "Execution not found" });
    }

    res.status(200).json(execution);
  } catch (error) {
    console.error("Error fetching execution:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateExecutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Allowed fields to update
    const allowedUpdates = ["status", "ended_at"];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    if (Object.keys(filteredUpdates).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update" });
    }

    const updatedExecution = await executionRepository.updateExecutionById(
      id,
      filteredUpdates
    );

    if (!updatedExecution) {
      return res
        .status(404)
        .json({ error: "Execution not found or no changes made" });
    }

    res.status(200).json(updatedExecution);
  } catch (error) {
    console.error("Error updating execution:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteExecutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExecution = await executionRepository.deleteExecutionById(id);

    if (!deletedExecution) {
      return res.status(404).json({ error: "Execution not found" });
    }

    res.status(200).json({
      message: "Execution deleted successfully",
      execution: deletedExecution,
    });
  } catch (error) {
    console.error("Error deleting execution:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createExecution,
  getExecutions,
  getExecutionById,
  updateExecutionById,
  deleteExecutionById,
};
