// routes/searchRoutes.js
import express from "express";
import { searchWorkspaces, searchPrompts } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public search endpoints (protect if you want them authenticated)
router.get("/workspaces", protect, searchWorkspaces);  // GET /api/search/workspaces?q=...
router.get("/prompts", protect, searchPrompts);        // GET /api/search/prompts?q=...&workspaceId=...

export default router;
