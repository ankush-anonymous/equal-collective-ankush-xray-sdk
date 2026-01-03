const executionStepRepository = require("../repositories/executionStepRepository");

const createExecutionStep = async (req, res) => {
  try {
    const {
      execution_id,
      step_index,
      step_name,
      step_type,
      input_payload,
      status,
    } = req.body;

    // Basic validation for required fields
    if (
      !execution_id ||
      step_index === undefined ||
      !step_name ||
      !step_type ||
      !input_payload ||
      !status
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newExecutionStep = await executionStepRepository.createExecutionStep(
      req.body
    );
    res.status(201).json(newExecutionStep);
  } catch (error) {
    console.error("Error creating execution step:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getExecutionSteps = async (req, res) => {
  try {
    const filters = req.query;
    const executionSteps = await executionStepRepository.getExecutionSteps(
      filters
    );

    res.status(200).json(executionSteps);
  } catch (error) {
    console.error("Error fetching execution steps:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getExecutionStepById = async (req, res) => {
  try {
    const { id } = req.params;
    const executionStep = await executionStepRepository.getExecutionStepById(
      id
    );

    if (!executionStep) {
      return res.status(404).json({ error: "Execution step not found" });
    }

    res.status(200).json(executionStep);
  } catch (error) {
    console.error("Error fetching execution step:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteExecutionStepById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExecutionStep =
      await executionStepRepository.deleteExecutionStepById(id);

    if (!deletedExecutionStep) {
      return res.status(404).json({ error: "Execution step not found" });
    }

    res.status(200).json({
      message: "Execution step deleted successfully",
      executionStep: deletedExecutionStep,
    });
  } catch (error) {
    console.error("Error deleting execution step:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createExecutionStep,
  getExecutionSteps,
  getExecutionStepById,
  deleteExecutionStepById,
};
