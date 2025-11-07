// Frontend/src/components/Dashboard/ActiveWorkspaces.jsx
import React from 'react';
import { HardHat, ChevronRight } from 'lucide-react';
import Button from '../Common/Button'; 

// Functional component for a single workspace card on the Dashboard
const DashboardWorkspaceCard = ({ workspace, onViewWorkspace }) => {
    // Determine the label based on the new backend property
    const statusText = workspace.isOwner ? "Owned" : "Joined";

    return (
        <div className="bg-surface-card p-4 rounded-lg flex items-center justify-between border border-zinc-700/50">
            <div className="flex items-center">
                <HardHat className="w-5 h-5 mr-3 text-accent-teal" />
                <div>
                    <h3 className="text-lg font-semibold text-white">{workspace.title}</h3>
                    <p className="text-xs text-zinc-400">
                        {statusText} | {workspace.prompts.length} Prompts
                    </p>
                </div>
            </div>
            
            <Button
                variant="primary"
                onClick={() => onViewWorkspace(workspace._id)}
                className="py-1 px-3"
            >
                View <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
        </div>
    );
};


const ActiveWorkspaces = ({ workspaces, onViewWorkspace }) => {
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Active Workspaces ({workspaces.length})</h2>
      
      {workspaces.length === 0 ? (
        <p className="text-zinc-500">You haven't created or joined any workspaces yet.</p>
      ) : (
        <div className="space-y-3">
          {workspaces.map(ws => (
            <DashboardWorkspaceCard 
                key={ws._id} 
                workspace={ws} 
                onViewWorkspace={onViewWorkspace} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveWorkspaces;