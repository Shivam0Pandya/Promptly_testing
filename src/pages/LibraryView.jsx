// src/pages/LibraryView.jsx
import React, { useState } from 'react';
import PromptCard from '../components/Common/PromptCard';
import { Plus } from 'lucide-react';
import Button from '../components/Common/Button';

// Sample Data (No tags needed)
const libraryPrompts = [
    { id: 1, task: "Next.js Component with Tailwind", upvotes: 45, creator: "Alice Johnson" },
    { id: 2, task: "Kubernetes Deployment YAML Generator", upvotes: 38, creator: "Bob Johnson" },
    { id: 3, task: "Advanced SQL Join Query", upvotes: 35, creator: "Charlie Brown" },
    { id: 4, task: "Functional Component Unit Test Template", upvotes: 29, creator: "Alice Johnson" },
];

const LibraryView = ({ onPromptSelect, selectedWorkspaceId }) => {
    // In a real app, selectedWorkspaceId would be used to fetch the correct prompts
    const workspaceName = selectedWorkspaceId === 1 ? "Dev Team Prompts" : "Selected Workspace";

    return (
        <div className="flex h-full -mt-8">
            {/* Full Width Column for the Feed */}
            <div className="w-full pr-6 flex flex-col">
                <h2 className="text-3xl font-semibold text-text-primary mb-4">{workspaceName}</h2>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2 text-sm">
                        <Button variant="secondary">Top Rated</Button>
                        <Button variant="default" className="text-zinc-400">Pending Updates</Button>
                    </div>
                    <Button variant="primary">
                        <Plus className="w-4 h-4 mr-2" /> New Prompt
                    </Button>
                </div>
                <div className="overflow-y-auto prompt-feed-list space-y-3 pr-2">
                    {libraryPrompts.map((p) => (
                        <PromptCard 
                            key={p.id} 
                            {...p} 
                            onClick={() => onPromptSelect(p.id)} // Navigate to detail page
                        />
                    ))}
                    {/* Add repeats for scrolling effect */}
                    {libraryPrompts.map((p, index) => (
                        <PromptCard 
                            key={`v2-${index}`} 
                            {...p} 
                            upvotes={Math.floor(p.upvotes / 2)}
                            onClick={() => onPromptSelect(p.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LibraryView;