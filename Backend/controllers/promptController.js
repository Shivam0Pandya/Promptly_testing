// controllers/promptController.js
import mongoose from 'mongoose';
import Prompt from '../models/Prompt.js';
import Workspace from '../models/Workspace.js';
import UserModel from '../models/User.js'; // used in getPendingUpdates population if needed

// ---------- addPrompt (fixed)
export const addPrompt = async (req, res) => {
  try {
    const { title, body, workspaceId } = req.body;
    if (!title || !body) return res.status(400).json({ message: "Title and body are required" });

    // find workspace (if provided)
    let workspace = null;
    if (workspaceId) {
      workspace = await Workspace.findById(workspaceId);
      if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    }

    const newPrompt = await Prompt.create({
      title,
      body,
      createdBy: req.user._id, // use req.user._id (auth middleware sets req.user)
      workspaceId: workspaceId || null,
      versions: [
        {
          version: 1,
          body,
          editedBy: req.user._id,
          timestamp: new Date(),
        },
      ],
    });

    if (workspace) {
      workspace.prompts = workspace.prompts || [];
      workspace.prompts.push(newPrompt._id);
      await workspace.save();
    }

    res.status(201).json(newPrompt);
  } catch (error) {
    console.error("Error adding prompt:", error);
    res.status(500).json({ message: "Error adding prompt", error: error.message });
  }
};

// ---------- getPrompts
export const getPrompts = async (req, res) => {
  try {
    // return prompts with createdBy (name) and upvote info
    const prompts = await Prompt.find()
      .populate("createdBy", "name")
      .lean();
    res.json(prompts);
  } catch (err) {
    console.error("Error fetching prompts:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------- getPromptById
export const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid prompt ID" });

    const prompt = await Prompt.findById(id)
      .populate("createdBy", "name email")
      .populate("workspaceId", "title")
      .lean();

    if (!prompt) return res.status(404).json({ message: "Prompt not found" });

    res.json(prompt);
  } catch (error) {
    console.error("Error fetching prompt:", error);
    res.status(500).json({ message: "Error fetching prompt", error: error.message });
  }
};

// ---------- requestPromptUpdate (unchanged)
export const requestPromptUpdate = async (req, res) => {
  try {
    const { id } = req.params; // prompt id
    const { body: suggestedBody } = req.body;
    if (!suggestedBody) return res.status(400).json({ message: "Suggested body is required" });

    const prompt = await Prompt.findById(id);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });

    if (prompt.createdBy.toString() === req.user._id.toString()) {
      const newVersion = {
        version: prompt.versions.length + 1,
        body: suggestedBody,
        editedBy: req.user._id,
        timestamp: new Date(),
      };
      prompt.versions.push(newVersion);
      prompt.body = suggestedBody;
      await prompt.save();
      return res.json({ message: "Prompt updated successfully by owner", updatedPrompt: prompt });
    }

    const pending = {
      suggestedBody,
      suggestedBy: req.user._id,
      timestamp: new Date(),
      status: "pending",
    };

    prompt.pendingUpdates.push(pending);
    await prompt.save();

    const lastPending = prompt.pendingUpdates[prompt.pendingUpdates.length - 1];

    await prompt.populate({
      path: "pendingUpdates.suggestedBy",
      select: "name email",
    });

    return res.status(201).json({
      message: "Update request submitted successfully",
      pendingUpdate: lastPending,
      promptId: prompt._id,
    });
  } catch (error) {
    console.error("Error in requestPromptUpdate:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------- approvePromptUpdate (unchanged, but uses findById earlier)
export const approvePromptUpdate = async (req, res) => {
  try {
    const { promptId, updateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(promptId) || !mongoose.Types.ObjectId.isValid(updateId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });

    if (prompt.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to approve updates" });
    }

    const update = prompt.pendingUpdates.id(updateId);
    if (!update || update.status !== "pending") {
      return res.status(400).json({ message: "Invalid update request" });
    }

    prompt.body = update.suggestedBody;
    prompt.versions.push({
      version: prompt.versions.length + 1,
      body: update.suggestedBody,
      editedBy: update.suggestedBy,
      timestamp: new Date(),
    });

    update.status = "approved";
    update.processedBy = req.user._id;
    update.processedAt = new Date();

    await prompt.save();

    const updatedPrompt = await Prompt.findById(prompt._id).populate("createdBy", "name email");

    return res.json({ message: "Prompt update approved and applied", updatedPrompt });
  } catch (error) {
    console.error("Error approving update:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------- rejectPromptUpdate (unchanged)
export const rejectPromptUpdate = async (req, res) => {
  try {
    const { promptId, updateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(promptId) || !mongoose.Types.ObjectId.isValid(updateId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });

    if (prompt.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to reject updates" });
    }

    const update = prompt.pendingUpdates.id(updateId);
    if (!update || update.status !== "pending") {
      return res.status(400).json({ message: "Invalid update request" });
    }

    update.status = "rejected";
    update.processedBy = req.user._id;
    update.processedAt = new Date();

    await prompt.save();

    return res.json({ message: "Prompt update rejected", promptId: prompt._id, updateId });
  } catch (error) {
    console.error("Error rejecting update:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------- getPendingUpdates (unchanged)
export const getPendingUpdates = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 0;
    const prompts = await Prompt.find({
      createdBy: req.user._id,
      "pendingUpdates.status": "pending",
    }).select("title body pendingUpdates").lean();

    let pendingList = [];
    for (const p of prompts) {
      for (const u of p.pendingUpdates) {
        if (u.status === "pending") {
          pendingList.push({
            promptId: p._id,
            promptTitle: p.title,
            originalBody: p.body,
            updateId: u._id,
            suggestedBody: u.suggestedBody,
            suggestedBy: u.suggestedBy,
            timestamp: u.timestamp,
          });
        }
      }
    }

    const userIds = [...new Set(pendingList.map(item => item.suggestedBy?.toString()).filter(Boolean))];
    const userMap = {};
    if (userIds.length > 0) {
      const users = await UserModel.find({ _id: { $in: userIds } }).select("name email").lean();
      for (const u of users) userMap[u._id.toString()] = u;
    }
    pendingList = pendingList.map(item => ({
      ...item,
      requestedBy: userMap[item.suggestedBy?.toString()] || null,
    }));

    const total = pendingList.length;
    const items = limit && limit > 0 ? pendingList.slice(0, limit) : pendingList;

    return res.json({ total, items });
  } catch (error) {
    console.error("Error getting pending updates:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ===================== New Upvote endpoints ===================== */

// Toggle upvote for a prompt
export const togglePromptUpvote = async (req, res) => {
  try {
    const { id } = req.params; // prompt id
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid prompt ID" });

    // 💡 DEBUG CHECK D: Log the ID received by the server
    console.log("DEBUG CHECK D: Controller Received ID:", id);

    const prompt = await Prompt.findById(id);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });

    const userId = req.user._id.toString();
    const idx = (prompt.upvotedBy || []).findIndex(u => u.toString() === userId);

    if (idx >= 0) {
      // already upvoted -> remove
      prompt.upvotedBy.splice(idx, 1);
      prompt.upvotes = Math.max(0, (prompt.upvotes || 1) - 1);
      await prompt.save();
      return res.json({ message: "Upvote removed", upvotes: prompt.upvotes, hasUpvoted: false, promptId: prompt._id });
    } else {
      // add upvote
      prompt.upvotedBy.push(req.user._id);
      prompt.upvotes = (prompt.upvotes || 0) + 1;
      await prompt.save();
      return res.json({ message: "Upvoted", upvotes: prompt.upvotes, hasUpvoted: true, promptId: prompt._id });
    }
  } catch (error) {
    console.error("Error toggling upvote:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all prompt ids the current user has upvoted
export const getUserUpvotedPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find({ upvotedBy: req.user._id }).select("_id").lean();
    const items = (prompts || []).map(p => p._id.toString());
    return res.json({ items });
  } catch (error) {
    console.error("Error getting user upvoted prompts:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
