const express = require("express");
const router = express.Router();
const executionStepController = require("../controller/executionStepController");

router.post(
  "/createExecutionStep",
  executionStepController.createExecutionStep
);
router.get(
  "/getAllExecutionStep",
  executionStepController.getAllExecutionSteps
);
router.get(
  "/getExecutionStepById/:id",
  executionStepController.getExecutionStepById
);
router.delete(
  "/deleteExecutionStepById/:id",
  executionStepController.deleteExecutionStepById
);

module.exports = router;
