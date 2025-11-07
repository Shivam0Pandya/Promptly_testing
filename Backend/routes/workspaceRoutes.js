import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createWorkspace,
  getUserWorkspaces,
  addPromptToWorkspace,
} from "../controllers/workspaceController.js";

const router = express.Router();

router.route("/").post(protect, createWorkspace).get(protect, getUserWorkspaces);
router.route("/:workspaceId/prompts").post(protect, addPromptToWorkspace);

export default router;
