import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"



import userRoutes from "./routes/userRoutes.js"
import workspaceRoutes from "./routes/workspaceRoutes.js";
import promptRoutes from "./routes/promptRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ PromptCollab API is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/comments", commentRoutes);

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);