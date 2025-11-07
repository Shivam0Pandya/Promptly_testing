import express from "express";
import  {protect} from "../middleware/authMiddleware.js"
import {
    addPrompt,
    getPrompts,
    requestPromptUpdate,
    approvePromptUpdate,
    rejectPromptUpdate
} from "../controllers/promptController.js"

router.route("/")
  .get(getPrompts)
  .post(protect, addPrompt);

router.route("/:id/request-update")
  .post(protect, requestPromptUpdate);

router.route("/:promptId/approve/:updateId")
  .put(protect, approvePromptUpdate);

router.route("/:promptId/reject/:updateId")
  .put(protect, rejectPromptUpdate);

export default router;
