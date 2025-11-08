import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"
import { createServer } from "http";
import { Server as IOServer } from "socket.io";




import userRoutes from "./routes/userRoutes.js"
import workspaceRoutes from "./routes/workspaceRoutes.js";
import promptRoutes from "./routes/promptRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

import { getGlobalStats } from "./controllers/generalController.js";

const allowed = [process.env.FRONTEND_URL];

dotenv.config();
const app = express();
connectDB();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser (curl)
    if (!process.env.FRONTEND_URL) return cb(null, true); // dev fallback
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ PromptCollab API is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/search", searchRoutes);

app.get("/api/stats", getGlobalStats);

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

const server = createServer(app);
const io = new IOServer(server, {
  cors: { origin: process.env.FRONTEND_URL || "*", methods: ["GET","POST"] },
});
server.listen(process.env.PORT || 5000);