const express = require("express");
const router = express.Router();
const schemaController = require("../controller/schemaController");

router.post("/createSchema", schemaController.createSchema);
router.get("/getAllSchema", schemaController.getAllSchemas);
router.get("/getSchemaById/:id", schemaController.getSchemaById);
router.delete("/deleteSchemaById/:id", schemaController.deleteSchemaById);

module.exports = router;
