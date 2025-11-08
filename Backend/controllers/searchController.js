// controllers/searchController.js
import mongoose from "mongoose";
import Workspace from "../models/Workspace.js";
import Prompt from "../models/Prompt.js";

/**
 * GET /api/search/workspaces?q=...&includePrompts=true&limit=20&skip=0
 * Returns: { total, items: [{ workspace, matchedPrompts: [...] }, ...] }
 */
export const searchWorkspaces = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const includePrompts = req.query.includePrompts === "true" || false;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = parseInt(req.query.skip, 10) || 0;

    if (!q) {
      // if no query, return paginated list of workspaces (or all as fallback)
      const total = await Workspace.countDocuments();
      const items = await Workspace.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("title description promptCount owner ownerName")
        .lean();
      return res.json({ total, items: items.map(w => ({ workspace: w, matchedPrompts: [] })) });
    }

    // Prefer text search if index exists
    let workspaces = [];
    try {
      workspaces = await Workspace.find(
        { $text: { $search: q } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .select("title description promptCount owner ownerName prompts")
        .lean();
    } catch (err) {
      // fallback to regex search if text index missing
      const re = new RegExp(escapeRegExp(q), "i");
      workspaces = await Workspace.find({
        $or: [{ title: re }, { description: re }, { ownerName: re }],
      })
        .skip(skip)
        .limit(limit)
        .select("title description promptCount owner ownerName prompts")
        .lean();
    }

    // If requested, search inside prompts for matched prompts and attach
    const results = [];
    if (includePrompts) {
      // If workspaces include prompts array of ObjectIds, fetch preview prompts and filter
      for (const ws of workspaces) {
        let matchedPrompts = [];
        if (Array.isArray(ws.prompts) && ws.prompts.length > 0) {
          // load prompt docs for these ids (limit to first N to avoid heavy queries)
          const prompts = await Prompt.find({ _id: { $in: ws.prompts } }).select("title body").lean();
          const qRe = new RegExp(escapeRegExp(q), "i");
          matchedPrompts = prompts.filter(p => qRe.test(p.title || "") || qRe.test(p.body || ""));
        } else {
          // fallback: database-wide prompt search scoped to workspace
          const pQuery = { workspaceId: ws._id, $or: [{ title: { $regex: q, $options: "i" } }, { body: { $regex: q, $options: "i" } }] };
          matchedPrompts = await Prompt.find(pQuery).select("title body").limit(10).lean();
        }
        results.push({ workspace: ws, matchedPrompts });
      }
    } else {
      // no prompt matching requested
      workspaces.forEach(ws => results.push({ workspace: ws, matchedPrompts: [] }));
    }

    return res.json({ total: results.length, items: results });
  } catch (error) {
    console.error("Error in searchWorkspaces:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/search/prompts?q=...&workspaceId=...&limit=20&skip=0
 * Returns: { total, items: [prompt, ...] }
 */
export const searchPrompts = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const workspaceId = req.query.workspaceId || null;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = parseInt(req.query.skip, 10) || 0;

    if (!q) {
      const filter = workspaceId ? { workspaceId } : {};
      const total = await Prompt.countDocuments(filter);
      const items = await Prompt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
      return res.json({ total, items });
    }

    // Try text search first
    let items = [];
    try {
      const textFilter = workspaceId ? { $text: { $search: q }, workspaceId } : { $text: { $search: q } };
      items = await Prompt.find(textFilter, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name")
        .lean();
    } catch (err) {
      // fallback regex
      const re = new RegExp(escapeRegExp(q), "i");
      const filter = workspaceId ? { workspaceId, $or: [{ title: re }, { body: re }] } : { $or: [{ title: re }, { body: re }] };
      items = await Prompt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("createdBy", "name").lean();
    }

    const total = items.length;
    return res.json({ total, items });
  } catch (error) {
    console.error("Error in searchPrompts:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// small helper to escape regex metacharacters for fallback searches
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
