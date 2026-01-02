const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./db/connect");
const executionRoutes = require("./routes/executionRoutes");
const executionStepRoutes = require("./routes/executionStepRoutes");
const executionErrorRoutes = require("./routes/executionErrorRoutes");
const markIncompleteExecutions = require("./jobs/markIncompleteExecutions");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/v1/executions", executionRoutes);
app.use("/api/v1/execution-steps", executionStepRoutes);
app.use("/api/v1/execution-errors", executionErrorRoutes);

// cron-job to mark executions -> incomplete if not acknowledged with 10 mins of start
setInterval(() => {
  markIncompleteExecutions().catch(console.error);
}, 60 * 1000); // every 1 minute

const start = async () => {
  await connectDB(process.env.DB_URI);
  app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
  });
};

start();
