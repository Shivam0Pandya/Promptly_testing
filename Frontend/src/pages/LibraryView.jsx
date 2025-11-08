// src/pages/LibraryView.jsx
import React, { useEffect, useMemo, useState } from "react";
import PromptCard from "../components/Common/PromptCard";
import { Plus } from "lucide-react";
import Button from "../components/Common/Button";
import AddPromptModal from "../components/Modals/AddpromptModal";
import api from "../api/axiosConfig";

const LibraryView = ({ onPromptSelect, selectedWorkspaceId, searchQuery = "" }) => {
  const [prompts, setPrompts] = useState([]);
  const [workspaceName, setWorkspaceName] = useState("Loading...");
  const [isAddPromptModalOpen, setIsAddPromptModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userUpvotedSet, setUserUpvotedSet] = useState(new Set());
  const [upvotingIds, setUpvotingIds] = useState(new Set());

  useEffect(() => {
    const fetchWorkspacePrompts = async () => {
      if (!selectedWorkspaceId) {
        setPrompts([]);
        setWorkspaceName("Select a workspace");
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get("/workspaces");
        const workspace = data.find((w) => w._id === selectedWorkspaceId);
        if (workspace) {
          setPrompts(workspace.prompts || []);
          setWorkspaceName(workspace.title);
        } else {
          setWorkspaceName("Unknown Workspace");
          setPrompts([]);
        }

        try {
          const upvResp = await api.get("/prompts/upvoted/me");
          const ids = new Set((upvResp.data.items || []).map((id) => id.toString()));
          setUserUpvotedSet(ids);
        } catch (err) {
          console.warn("Could not fetch upvoted prompts for user:", err?.response?.data || err?.message);
        }
      } catch (error) {
        console.error("Error fetching workspace prompts:", error);
        setWorkspaceName("Error loading workspace");
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspacePrompts();
  }, [selectedWorkspaceId]);

  // Filter prompts according to searchQuery (title & body)
  const normalizedQuery = (searchQuery || "").trim().toLowerCase();
  const filteredPrompts = useMemo(() => {
    if (!normalizedQuery) return prompts;
    return prompts.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const body = (p.body || p.body || "").toLowerCase();
      return title.includes(normalizedQuery) || body.includes(normalizedQuery);
    });
  }, [prompts, normalizedQuery]);

  const handleUpvote = async (promptId) => {
    if (upvotingIds.has(promptId)) return;
    setUpvotingIds(prev => new Set([...prev, promptId]));

    setPrompts(prev =>
      prev.map(p => {
        if (p._id !== promptId) return p;
        const currentlyUpvoted = userUpvotedSet.has(promptId);
        return {
          ...p,
          upvotes: (p.upvotes ?? p.upvote ?? 0) + (currentlyUpvoted ? -1 : 1),
        };
      })
    );

    try {
      const { data } = await api.put(`/prompts/${promptId}/upvote`);
      setPrompts(prev => prev.map(p => (p._id === promptId ? { ...p, upvotes: data.upvotes } : p)));
      setUserUpvotedSet(prev => {
        const s = new Set(prev);
        if (data.hasUpvoted) s.add(promptId);
        else s.delete(promptId);
        return s;
      });
    } catch (err) {
      console.error("Failed to upvote:", err?.response?.data || err?.message);
      try {
        const { data: refreshed } = await api.get(`/prompts/${promptId}`);
        setPrompts(prev => prev.map(p => (p._id === promptId ? refreshed : p)));
      } catch (reErr) {
        console.error("Failed to refresh prompt after upvote error", reErr);
      }
    } finally {
      setUpvotingIds(prev => {
        const s = new Set(prev);
        s.delete(promptId);
        return s;
      });
    }
  };

  const handlePromptAdded = (newPrompt) => {
    setPrompts((prev) => [...prev, newPrompt]);
  };

  if (loading) return <p className="text-zinc-400 p-4">Loading workspace...</p>;

  return (
    <div className="flex h-full -mt-8">
      <div className="w-full pr-6 flex flex-col">
        <h2 className="text-3xl font-semibold text-text-primary mb-1">{workspaceName}</h2>

        {/* Show match count when searching */}
        {normalizedQuery ? (
          <p className="text-sm text-zinc-400 mb-3">
            Showing {filteredPrompts.length} result{filteredPrompts.length !== 1 ? "s" : ""} for “{searchQuery}”
          </p>
        ) : null}

        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2 text-sm">
            <Button variant="secondary">Top Rated</Button>
            <Button variant="default" className="text-zinc-400">Pending Updates</Button>
          </div>

          <Button variant="primary" onClick={() => setIsAddPromptModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Prompt
          </Button>
        </div>

        <div className="overflow-y-auto prompt-feed-list space-y-3 pr-2">
          {filteredPrompts.length > 0 ? (
            filteredPrompts.map((p) => (
              <PromptCard
                key={p._id}
                id={p._id}
                task={p.title}
                upvotes={p.upvotes ?? p.upvote ?? 0}
                onClick={() => onPromptSelect(p._id)}
                isUpvoted={userUpvotedSet.has(p._id)}
                onUpvote={() => handleUpvote(p._id)}
              />
            ))
          ) : (
            <p className="text-zinc-500 p-4">
              {normalizedQuery ? "No prompts match your search." : "No prompts found in this workspace yet."}
            </p>
          )}
        </div>
      </div>

      <AddPromptModal
        isOpen={isAddPromptModalOpen}
        onClose={() => setIsAddPromptModalOpen(false)}
        workspaceId={selectedWorkspaceId}
        workspaceName={workspaceName}
        onPromptAdded={handlePromptAdded}
      />
    </div>
  );
};

export default LibraryView;
