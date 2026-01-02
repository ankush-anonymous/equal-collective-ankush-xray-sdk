const express = require("express");
const router = express.Router();
const executionController = require("../controller/executionController");

router.post("/createExecution", executionController.createExecution);
router.get("/getAllExecution", executionController.getAllExecutions);
router.get("/getExecutionById/:id", executionController.getExecutionById);
router.delete(
  "/deleteExecutionById/:id",
  executionController.deleteExecutionById
);

module.exports = router;
