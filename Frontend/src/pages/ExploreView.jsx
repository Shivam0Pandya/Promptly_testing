// src/pages/ExploreView.jsx
import React, { useMemo } from 'react';
import { FileText, HardHat, ChevronsRight } from 'lucide-react';
import Button from '../components/Common/Button';

// Helper component for stat cards
const StatCard = ({ icon: Icon, title, value }) => (
  <div className="bg-surface-card p-6 rounded-xl shadow-lg flex flex-col items-start space-y-3 border border-zinc-700/50">
    <div className="p-3 bg-accent-teal/20 rounded-full">
      <Icon className="w-6 h-6 text-accent-teal" />
    </div>
    <p className="text-sm font-medium text-zinc-400">{title}</p>
    <h2 className="text-4xl font-bold text-white">{value?.toLocaleString?.() ?? value}</h2>
  </div>
);

const ExploreWorkspaceCard = ({ workspace, onViewWorkspace, onJoinWorkspace, isMember, matchedPrompts = [] }) => {
  let buttonAction, buttonText, buttonVariant;
  if (isMember) {
    buttonAction = () => onViewWorkspace(workspace._id);
    buttonText = "View Workspace";
    buttonVariant = "success";
  } else {
    buttonAction = () => onJoinWorkspace(workspace._id);
    buttonText = "Join Workspace";
    buttonVariant = "primary";
  }

  return (
    <div className="bg-surface-card p-4 rounded-lg flex flex-col justify-between h-full hover:shadow-xl transition-shadow border border-zinc-700/50">
      <div>
        <h3 className="text-xl font-semibold text-white truncate mb-1">{workspace.title}</h3>
        {workspace.description ? <p className="text-zinc-400 text-sm mb-2 line-clamp-2">{workspace.description}</p> : null}
        <div className="text-zinc-400 text-sm mb-3">
          <FileText className="w-4 h-4 inline mr-2 text-accent-green" />
          {workspace.promptCount ?? (workspace.prompts?.length ?? 0)} {((workspace.promptCount ?? (workspace.prompts?.length ?? 0)) === 1 ? 'Prompt' : 'Prompts')}
        </div>

        {/* If search matched specific prompts, show a tiny preview list */}
        {matchedPrompts.length > 0 && (
          <div className="mt-2 text-sm text-zinc-300">
            <div className="mb-2 font-medium text-zinc-200">Matched prompts:</div>
            <ul className="space-y-1">
              {matchedPrompts.slice(0,3).map(mp => (
                <li key={mp._id} className="truncate">• {mp.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button
        variant={buttonVariant}
        onClick={buttonAction}
        className="mt-4 w-full"
      >
        {buttonText} <ChevronsRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

/**
 * ExploreView
 * Props:
 *  - stats: { totalPrompts, totalWorkspaces }
 *  - allWorkspaces: array of workspace objects (may include prompts or promptCount)
 *  - onViewWorkspace(workspaceId)
 *  - onJoinWorkspace(workspaceId)
 *  - userWorkspaces: array of workspaces the current user belongs to
 *  - searchQuery: string from Header input
 */
const ExploreView = ({ stats = {}, allWorkspaces = [], onViewWorkspace, onJoinWorkspace, userWorkspaces = [], searchQuery = "" }) => {
  const q = (searchQuery || "").trim().toLowerCase();

  // Build a set for quick membership checks
  const activeWorkspaceIds = useMemo(() => new Set(userWorkspaces.map(ws => ws._id?.toString())), [userWorkspaces]);

  // Filtering logic: returns array of { workspace, matchedPrompts }
  const filtered = useMemo(() => {
    if (!q) {
      // no search -> show original list, no matchedPrompts
      return allWorkspaces.map(ws => ({ workspace: ws, matchedPrompts: [] }));
    }

    const results = [];
    for (const ws of allWorkspaces) {
      const title = (ws.title || "").toLowerCase();
      const desc = (ws.description || "").toLowerCase();
      const ownerName = (ws.ownerName || ws.owner?.name || "").toLowerCase();

      // match workspace meta
      let matched = title.includes(q) || desc.includes(q) || ownerName.includes(q);

      // match inside prompts if prompts included in workspace object
      let matchedPrompts = [];
      if (Array.isArray(ws.prompts) && ws.prompts.length > 0) {
        matchedPrompts = ws.prompts.filter(p => {
          const t = (p.title || "").toLowerCase();
          const b = (p.body || p.prompt || "").toLowerCase();
          return t.includes(q) || b.includes(q);
        });
        if (matchedPrompts.length > 0) matched = true;
      }

      if (matched) {
        results.push({ workspace: ws, matchedPrompts });
      }
    }
    return results;
  }, [allWorkspaces, q]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Explore</h1>
          <p className="text-zinc-400 max-w-2xl">Discover collaboration across the platform.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={FileText} title="Total Prompts Created" value={stats.totalPrompts || 0} />
          <StatCard icon={HardHat} title="Total Workspaces Shared" value={stats.totalWorkspaces || 0} />
        </div>
      </div>

      {/* Search info */}
      {q ? (
        <div className="text-sm text-zinc-400">
          Showing {filtered.length} workspace{filtered.length !== 1 ? "s" : ""} matching “{searchQuery}”
        </div>
      ) : null}

      <div className="pt-6 space-y-4">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(({ workspace, matchedPrompts }) => (
              <ExploreWorkspaceCard
                key={workspace._id}
                workspace={workspace}
                onViewWorkspace={onViewWorkspace}
                onJoinWorkspace={onJoinWorkspace}
                isMember={activeWorkspaceIds.has(workspace._id?.toString())}
                matchedPrompts={matchedPrompts}
              />
            ))}
          </div>
        ) : (
          <p className="text-zinc-400">No workspaces match your search.</p>
        )}
      </div>
    </div>
  );
};

export default ExploreView;
