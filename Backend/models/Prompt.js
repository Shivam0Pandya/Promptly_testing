// models/Prompt.js
import mongoose from "mongoose";

export const updateSchema = new mongoose.Schema({
  suggestedBody: { type: String, required: true },
  suggestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  // Added fields for who processed (approved/rejected) and when
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  processedAt: { type: Date },
}, { _id: true });

export const versionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  body: { type: String, required: true },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
}, { _id: true });

const promptSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  // Use plural 'upvotes' to match frontend; default 0
  upvotes: { type: Number, default: 0, min: 0 },

  versions: { type: [versionSchema], default: [] },

  // pending updates subdocuments (with processedBy/processedAt)
  pendingUpdates: { type: [updateSchema], default: [] },
}, { timestamps: true });

const Prompt = mongoose.model("Prompt", promptSchema);

export default Prompt;
