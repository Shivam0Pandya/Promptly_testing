// src/components/Common/PromptCard.jsx
import { ThumbsUp } from 'lucide-react';

const PromptCard = ({ task, upvotes, onClick }) => { // Removed 'tags' from props
    return (
        <div 
            className="prompt-card bg-surface-card p-4 rounded-xl shadow-lg flex justify-between items-center cursor-pointer hover:border-l-4 border-accent-teal mb-3 transition" 
            onClick={onClick}
        >
            <div>
                <h4 className="text-base font-semibold text-text-primary">{task}</h4>
                {/* Tags removed here */}
            </div>
            <div className="flex items-center space-x-1 text-sm font-bold text-accent-teal">
                <ThumbsUp className="w-4 h-4" />
                <span>{upvotes}</span>
            </div>
        </div>
    );
};

export default PromptCard;