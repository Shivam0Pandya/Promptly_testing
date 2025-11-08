// src/components/Dashboard/ActiveWorkspaces.jsx
import React, { useMemo } from "react";
import Button from "../Common/Button";

/**
 * ActiveWorkspaces
 * Props:
 *   - workspaces: array of workspace objects (active workspaces for the user)
 *   - onViewWorkspace(workspaceId)
 *   - searchQuery: string to filter by
 */
const WorkspaceCardSmall = ({ workspace, onView }) => {
  return (
    <div className="bg-surface-card p-4 rounded-lg flex items-center justify-between border border-zinc-700/50">
      <div className="min-w-0 pr-4">
        <h4 className="text-lg font-semibold text-white truncate">{workspace.title}</h4>
        {workspace.description ? (
          <p className="text-sm text-zinc-400 truncate">{workspace.description}</p>
        ) : (
          <p className="text-sm text-zinc-500">No description</p>
        )}
      </div>
      <div className="ml-4">
        <Button variant="secondary" onClick={() => onView(workspace._id)}>
          Open
        </Button>
      </div>
    </div>
  );
};

const ActiveWorkspaces = ({ workspaces = [], onViewWorkspace = () => {}, searchQuery = "" }) => {
  const q = (searchQuery || "").trim().toLowerCase();

  // Filter by title / description / ownerName
  const filtered = useMemo(() => {
    if (!q) return workspaces;
    return workspaces.filter(ws => {
      const title = (ws.title || "").toLowerCase();
      const desc = (ws.description || "").toLowerCase();
      const owner = (ws.ownerName || ws.owner?.name || "").toLowerCase();
      return title.includes(q) || desc.includes(q) || owner.includes(q);
    });
  }, [workspaces, q]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Active Workspaces</h2>
        <div className="text-sm text-zinc-400">
          Showing {filtered.length} / {workspaces.length}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(ws => (
            <WorkspaceCardSmall key={ws._id} workspace={ws} onView={onViewWorkspace} />
          ))}
        </div>
      ) : (
        <div className="p-4 text-zinc-400 bg-surface-secondary rounded">
          {q ? `No active workspaces match “${searchQuery}”.` : "You have no active workspaces yet."}
        </div>
      )}
    </section>
  );
};

export default ActiveWorkspaces;
