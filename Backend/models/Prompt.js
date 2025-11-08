// models/Prompt.js
import mongoose from "mongoose";

export const updateSchema = new mongoose.Schema({
  suggestedBody: { type: String, required: true },
  suggestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
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

  // upvotes count and list of user ids who upvoted
  upvotes: { type: Number, default: 0, min: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  versions: { type: [versionSchema], default: [] },
  pendingUpdates: { type: [updateSchema], default: [] },
}, { timestamps: true });

const Prompt = mongoose.model("Prompt", promptSchema);
// models/Prompt.js  (append near the bottom, after defining schema)
promptSchema.index({ title: "text", body: "text" }, { weights: { title: 5, body: 1 } });


export default Prompt;
