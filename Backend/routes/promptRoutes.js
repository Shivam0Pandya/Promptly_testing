// routes/promptRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addPrompt,
  getPrompts,
  getPromptById,
  requestPromptUpdate,
  approvePromptUpdate,
  rejectPromptUpdate,
  getPendingUpdates,   // new export
} from "../controllers/promptController.js";

const router = express.Router();

// Public list and creation
router.route("/")
  .get(getPrompts)
  .post(protect, addPrompt);

// New: pending updates list (owner-only view)
router.get("/pending", protect, getPendingUpdates);

// Single prompt (keep protected if you want only authenticated users to view details)
router.route("/:id")
  .get(protect, getPromptById);

// Request update: create a new pending update (protected)
router.route("/:id/request-update")
  .post(protect, requestPromptUpdate);

// Approve / Reject update (protected)
router.route("/:promptId/approve/:updateId")
  .put(protect, approvePromptUpdate);

router.route("/:promptId/reject/:updateId")
  .put(protect, rejectPromptUpdate);

export default router;
