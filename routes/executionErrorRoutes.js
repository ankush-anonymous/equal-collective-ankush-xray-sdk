const express = require("express");
const router = express.Router();
const executionErrorController = require("../controller/executionErrorController");

router.post(
  "/createExecutionError",
  executionErrorController.createExecutionError
);
router.get(
  "/getAllExecutionError",
  executionErrorController.getAllExecutionErrors
);
router.get(
  "/getExecutionErrorById/:id",
  executionErrorController.getExecutionErrorById
);
router.delete(
  "/deleteExecutionErrorById/:id",
  executionErrorController.deleteExecutionErrorById
);

module.exports = router;
