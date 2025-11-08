import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    prompts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prompt" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Workspace = mongoose.model("Workspace", workspaceSchema);
workspaceSchema.index({ title: "text", description: "text", ownerName: "text" }, { weights: { title: 5, description: 2 } });
export default Workspace;
