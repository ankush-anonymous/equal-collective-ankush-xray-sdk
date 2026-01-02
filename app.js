const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./db/connect");
const schemaRoutes = require("./routes/schemaRoutes");
const executionRoutes = require("./routes/executionRoutes");
const executionStepRoutes = require("./routes/executionStepRoutes");
const executionErrorRoutes = require("./routes/executionErrorRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/v1/schemas", schemaRoutes);
app.use("/api/v1/executions", executionRoutes);
app.use("/api/v1/execution-steps", executionStepRoutes);
app.use("/api/v1/execution-errors", executionErrorRoutes);

const start = async () => {
  await connectDB(process.env.DB_URI);
  app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
  });
};

start();
