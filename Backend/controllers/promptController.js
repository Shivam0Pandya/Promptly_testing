import express from 'express'
import mongoose from 'mongoose';
import Prompt from '../models/Prompt.js'
import Workspace from '../models/Workspace.js';

export const addPrompt = async (req, res) => {
  try {
    const { title, body, workspaceId } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    const newPrompt = await Prompt.create({
      title,
      body,
      createdBy: req.user_id,
      workspaceId,
      versions: [
        {
          version: 1,
          body,
          editedBy: req.user_id,
          timestamp: new Date(),
        },
      ],
    });

    workspace.prompts.push(newPrompt._id);
    await workspace.save();
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error("Error adding prompt:", error);
    res.status(500).json({ message: "Error adding prompt", error: error.message });
  }
};


export const getPrompts = async (req, res) => {
  const prompts = await Prompt.find().populate("createdBy", "name");
  res.json(prompts);
};

export const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid prompt ID" });
    }

    const prompt = await Prompt.findById(id)
      .populate("createdBy", "name email")
      .populate("workspaceId", "title");

    if (!prompt) return res.status(404).json({ message: "Prompt not found" });

    
    res.json(prompt);
  } catch (error) {
    console.error("Error fetching prompt:", error);
    res.status(500).json({ message: "Error fetching prompt", error: error.message });
  }
};

/**
 * Submit a request to update a prompt (non-owner)
 * If the requester is the prompt owner, we directly create a new version (owner edit shortcut).
 */
export const requestPromptUpdate = async (req, res) => {
  try {
    const { id } = req.params; // prompt id
    const { body: suggestedBody } = req.body;
    if (!suggestedBody) return res.status(400).json({ message: "Suggested body is required" });

    const prompt = await Prompt.findById(id);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });

    // If the requester is the prompt owner, directly apply as new version
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

    // Otherwise push a pending update subdocument
    const pending = {
      suggestedBody,
      suggestedBy: req.user._id,
      timestamp: new Date(),
      status: "pending",
    };

    prompt.pendingUpdates.push(pending);
    await prompt.save();

    // Get the last pending update (the one we just pushed)
    const lastPending = prompt.pendingUpdates[prompt.pendingUpdates.length - 1];

    // Populate suggestedBy (optional)
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

/**
 * Approve a pending update and apply it to the prompt.
 * Only prompt owner (or workspace owner if you want) can approve.
 */
export const approvePromptUpdate = async (req, res) => {
  try {
    const { promptId, updateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(promptId) || !mongoose.Types.ObjectId.isValid(updateId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });

    // Authorization: only prompt creator can approve (you can also allow workspace owner)
    if (prompt.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to approve updates" });
    }

    const update = prompt.pendingUpdates.id(updateId);
    if (!update || update.status !== "pending") {
      return res.status(400).json({ message: "Invalid update request" });
    }

    // Apply the update
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

    // Return the updated prompt (so frontend can update instantly)
    const updatedPrompt = await Prompt.findById(prompt._id).populate("createdBy", "name email");

    return res.json({ message: "Prompt update approved and applied", updatedPrompt });
  } catch (error) {
    console.error("Error approving update:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Reject a pending update.
 * Only prompt owner (or workspace owner if you want) can reject.
 */
export const rejectPromptUpdate = async (req, res) => {
  try {
    const { promptId, updateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(promptId) || !mongoose.Types.ObjectId.isValid(updateId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });

    // Authorization
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

/**
 * List all pending updates that the current user should review.
 * This returns pending updates across prompts where the user is the prompt owner (or workspace owner if you prefer).
 * Query params:
 *   ?limit=2  -> limit items per prompt or total items (simple example below)
 */
export const getPendingUpdates = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 0; // 0 => no limit
    // Find prompts where the current user is owner and there are pending updates
    const prompts = await Prompt.find({
      createdBy: req.user._id,
      "pendingUpdates.status": "pending",
    }).select("title body pendingUpdates").lean();

    // Flatten pending updates into an array with prompt meta and update id
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

    // Optionally populate suggestedBy details
    // (populate manually since we used .lean())
    // collect user ids to populate
    const userIds = [...new Set(pendingList.map(item => item.suggestedBy?.toString()).filter(Boolean))];
    const userMap = {};
    if (userIds.length > 0) {
      const users = await (await import("../models/User.js")).default.find({ _id: { $in: userIds } }).select("name email").lean();
      for (const u of users) userMap[u._id.toString()] = u;
    }
    pendingList = pendingList.map(item => ({
      ...item,
      requestedBy: userMap[item.suggestedBy?.toString()] || null,
    }));

    // If limit provided, slice
    const total = pendingList.length;
    const items = limit && limit > 0 ? pendingList.slice(0, limit) : pendingList;

    return res.json({ total, items });
  } catch (error) {
    console.error("Error getting pending updates:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
