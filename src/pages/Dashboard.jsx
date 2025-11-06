import React from 'react';
import ActiveWorkspaces from '../components/Dashboard/ActiveWorkspaces';
import PendingUpdatesPreview from '../components/Dashboard/PendingUpdatesPreview';
import TrendingPrompts from '../components/Dashboard/TrendingPrompts';

// We now accept the handler for viewing a workspace
const Dashboard = ({ showRequests, onPromptClick, onViewWorkspace }) => {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-text-primary">Welcome back, John Doe</h1>
            
            {/* Pass the onViewWorkspace handler here */}
            <ActiveWorkspaces onViewWorkspace={onViewWorkspace} />

            <PendingUpdatesPreview showRequests={showRequests} />

            <TrendingPrompts onPromptClick={onPromptClick} />
        </div>
    );
};

export default Dashboard;