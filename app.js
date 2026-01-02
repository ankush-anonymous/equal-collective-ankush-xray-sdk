const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./db/connect");
const schemaRoutes = require("./routes/schemaRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/v1/schemas", schemaRoutes);

const start = async () => {
  await connectDB(process.env.DB_URI);
  app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
  });
};

start();
