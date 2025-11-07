// Frontend/src/pages/Dashboard.jsx (Updated)

import React from 'react';
// Ensure this import path is correct based on your file structure
import ActiveWorkspaces from "../components/Dashboard/ActiveWorkspaces"; 
import PendingUpdatesPreview from "../components/Dashboard/PendingUpdatesPreview";
import TrendingPrompts from "../components/Dashboard/TrendingPrompts";

// Update component signature to accept activeWorkspaces
const Dashboard = ({ activeWorkspaces, onViewWorkspace, ...props }) => { 
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* RENDER ActiveWorkspaces */}
          <ActiveWorkspaces 
             workspaces={activeWorkspaces} 
             onViewWorkspace={onViewWorkspace} 
          />

          <TrendingPrompts {...props} />
        </div>

        <div className="md:col-span-1 space-y-8">
          <PendingUpdatesPreview {...props} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;