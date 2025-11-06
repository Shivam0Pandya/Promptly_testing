// src/components/Dashboard/ActiveWorkspaces.jsx
import React from 'react';
import WorkspaceTile from '../Common/WorkspaceTile';

// Mock Data
const workspaces = [
    { id: 1, name: "Dev Team Prompts", prompts: 45 },
    { id: 2, name: "Marketing Campaigns", prompts: 12 },
    { id: 3, name: "Hackathon Squad", prompts: 8 },
    { id: 4, name: "Personal Code Snippets", prompts: 88 },
    { id: 5, name: "Data Science Models", prompts: 22 },
];

// The component now accepts a handler prop
const ActiveWorkspaces = ({ onViewWorkspace }) => {
    return (
        <section>
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">My Active Workspaces</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {workspaces.map((ws) => (
                    <WorkspaceTile 
                        key={ws.id} 
                        name={ws.name} 
                        prompts={ws.prompts}
                        // Pass the function that triggers navigation when the button is clicked
                        onClick={() => onViewWorkspace(ws.id)} 
                    />
                ))}
            </div>
        </section>
    );
};

export default ActiveWorkspaces;