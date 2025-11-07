import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    prompts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prompt" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Workspace = mongoose.model("Workspace", workspaceSchema);
export default Workspace;
