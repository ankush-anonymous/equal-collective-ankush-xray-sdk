const express = require("express");
const router = express.Router();
const executionController = require("../controller/executionController");

router.post("/createExecution", executionController.createExecution);
router.get("/getAllExecution", executionController.getExecutions);
router.get("/getExecutionById/:id", executionController.getExecutionById);
router.patch(
  "/updateExecutionById/:id",
  executionController.updateExecutionById
);
router.delete(
  "/deleteExecutionById/:id",
  executionController.deleteExecutionById
);

module.exports = router;
