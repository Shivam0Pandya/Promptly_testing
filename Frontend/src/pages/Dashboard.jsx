// src/pages/Dashboard.jsx
import React from 'react';
import ActiveWorkspaces from "../components/Dashboard/ActiveWorkspaces"; 
import PendingUpdatesPreview from "../components/Dashboard/PendingUpdatesPreview";
import TrendingPrompts from "../components/Dashboard/TrendingPrompts";

// Accept searchQuery + pendingCount and forward to children
const Dashboard = ({ activeWorkspaces = [], onViewWorkspace, searchQuery = "", pendingCount = 0, ...props }) => { 
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* ActiveWorkspaces now performs filtering based on searchQuery */}
          <ActiveWorkspaces 
             workspaces={activeWorkspaces} 
             onViewWorkspace={onViewWorkspace}
             searchQuery={searchQuery}
          />

          <TrendingPrompts {...props} />
        </div>

        <div className="md:col-span-1 space-y-8">
          <PendingUpdatesPreview {...props} pendingCount={pendingCount} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
