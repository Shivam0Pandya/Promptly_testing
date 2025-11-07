import Workspace from "../models/Workspace.js";
import Prompt from "../models/Prompt.js";
import User from "../models/User.js"
import mongoose from "mongoose";

// POST /api/workspaces
export const createWorkspace = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    const workspace = await Workspace.create({
      title,
      createdBy: req.user._id,
      members: [req.user._id], 
      prompts: [],
    });

    const user=await User.findById(req.user._id);
    user.workspaces.push(workspace._id);
    await user.save();
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Error creating workspace", error: error.message });
  }
};

// GET /api/workspaces
export const getUserWorkspaces = async (req, res) => {
  try {
    // Query for any workspace where the user is listed in the members array.
    const activeWorkspaces = await Workspace.find({ 
        members: req.user._id 
    })
      // Populate 'createdBy' to check ownership on the backend
      .populate("createdBy", "name")
      .populate("prompts", "title upvotes createdAt");
    
    // Process results to indicate ownership/membership status
    const processedWorkspaces = activeWorkspaces.map(ws => {
        // Mongoose document conversion to easily add properties
        const workspaceObject = ws.toObject(); 
        
        // Check if the authenticated user's ID matches the creator's ID
        const isOwner = workspaceObject.createdBy._id.toString() === req.user._id.toString();
        
        return {
            ...workspaceObject,
            isOwner,
            isJoined: true // Since the query only returns members, this is always true
        };
    });

    res.json(processedWorkspaces);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workspaces", error: error.message });
  }
};
// POST /api/workspaces/:workspaceId/prompts
export const addPromptToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, body, tags } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Create prompt inside this workspace
    const prompt = await Prompt.create({
      title,
      body,
      tags,
      createdBy: req.user._id,
      workspaceId,
      versions: [
        {
          version: 1,
          body,
          editedBy: req.user._id,
          timestamp: new Date(),
        },
      ],
    });

    workspace.prompts.push(prompt._id);
    await workspace.save();

    res.status(201).json({ message: "Prompt added to workspace", prompt });
  } catch (error) {
    res.status(500).json({ message: "Error adding prompt", error: error.message });
  }
};


export const getAllWorkspacesWithPromptCount = async (req, res) => {
  try {
    const workspaces = await Workspace.aggregate([
      {
        $lookup: {
          from: "prompts", // The MongoDB collection name (usually plural lowercase)
          localField: "_id",
          foreignField: "workspaceId",
          as: "promptsData",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          createdBy: 1,
          promptCount: { $size: "$promptsData" }, 
        },
      },
      {
          $sort: { promptCount: -1 }
      }
    ]);

    res.json(workspaces);
  } catch (error) {
    console.error("Error fetching all workspaces with prompt count:", error);
    res.status(500).json({ message: "Error fetching collaboration data", error: error.message });
  }
};

export const joinWorkspace = async (req, res) => {
  const { id } = req.params;
  // Use a safer method to get userId, relying on req.user from authMiddleware.
  const userId = req.user?._id || req.user_id; 

  if (!userId) {
       return res.status(401).json({ message: "Authorization failed: User ID not found on request." });
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid workspace ID" });
  }

  try {
    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user is already a member/creator
    if (workspace.members.map(id => id.toString()).includes(userId.toString())) {
      return res.status(200).json({ message: "Already a member of this workspace" });
    }
    
    // Add user to members list and save
    workspace.members.push(userId);
    await workspace.save(); // ⬅️ The operation that is likely failing

    res.json({ 
        message: "Successfully joined workspace", 
        workspace: { _id: workspace._id, title: workspace.title }
    });

  } catch (error) {
    // 💡 CRITICAL DEBUG: Log the full error to the backend console
    console.error("FATAL ERROR in joinWorkspace:", error); 
    // Mongoose errors often include the error type in 'name'
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: "Validation Error: " + error.message });
    }
    res.status(500).json({ message: "Internal Server Error" }); 
  }
};