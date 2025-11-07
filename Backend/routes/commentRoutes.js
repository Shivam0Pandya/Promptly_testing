import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addComment, getComments } from "../controllers/commentController.js";

const router = express.Router();

router.route("/:promptId").get(getComments);
router.route("/").post(protect, addComment);

export default router;
