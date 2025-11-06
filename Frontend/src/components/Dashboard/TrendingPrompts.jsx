// src/components/Dashboard/TrendingPrompts.jsx
import React from 'react';
import PromptCard from '../Common/PromptCard';

// Mock Data
const trendingPrompts = [
    { task: "Advanced Python Web Scraper Setup", upvotes: 215, tags: ["Python", "Web", "Automation"] },
    { task: "Optimized SQL Indexing Strategy", upvotes: 188, tags: ["SQL", "Database", "Performance"] },
    { task: "Tailwind Config for Dark Mode", upvotes: 152, tags: ["CSS", "Frontend", "Config"] },
    { task: "Generate Creative Blog Post Titles", upvotes: 110, tags: ["Marketing", "Content", "SEO"] },
];

const TrendingPrompts = ({ onPromptClick }) => {
    return (
        <section>
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Trending Prompts</h2>
            <div className="space-y-2">
                {trendingPrompts.map((p, index) => (
                    <PromptCard 
                        key={index} 
                        {...p} 
                        // Clicking a trending prompt should take the user to the Library view
                        onClick={() => onPromptClick(p.task)} 
                    />
                ))}
            </div>
        </section>
    );
};

export default TrendingPrompts;