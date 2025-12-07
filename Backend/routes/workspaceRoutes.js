import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createWorkspace,
  getUserWorkspaces,
  addPromptToWorkspace,
  getAllWorkspacesWithPromptCount,
  joinWorkspace,
} from "../controllers/workspaceController.js";

const router = express.Router();
router.route("/all/count").get(getAllWorkspacesWithPromptCount);
router.route("/").post(protect, createWorkspace).get(protect, getUserWorkspaces);
router.route("/:workspaceId/prompts").post(protect, addPromptToWorkspace);
router.route("/:id/join").post(protect, joinWorkspace); // ✅ FIX: Path matches the test structure (/:id/join)
export default router;
