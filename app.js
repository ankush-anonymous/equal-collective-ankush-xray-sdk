const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./db/connect");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "✅ Hoku server is running",
    timestamp: new Date().toISOString(),
  });
});

const start = async () => {
  await connectDB(process.env.DB_URI);
  app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
  });
};

start();
