// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";  // Adjusted import
import userRoutes from "./routes/userRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/cards", cardRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Connect to MongoDB
connectDB();  // Use the function from db.js

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
