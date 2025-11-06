// src/pages/PromptDetailPage.jsx
import React, { useState } from 'react';
import { ThumbsUp, Send, User } from 'lucide-react';

const mockPrompt = {
    id: 1,
    task: "Next.js Component with Tailwind",
    content: `// Full Prompt:\n"Generate a production-ready Next.js functional component using TypeScript and Tailwind CSS. The component should fetch data from the /api/users endpoint using 'fetch' and display a list of users. Include loading and error states. Ensure component uses memoization."`,
    creator: "Alice Johnson",
    upvotes: 45,
    comments: [
        { id: 101, author: "Bob J.", text: "We should use React Query here instead of raw fetch for caching performance. Requesting an update!" },
        { id: 102, author: "Creator (Alice J.)", text: "Good point! I will review the proposed change." },
    ]
};

const CommentThread = ({ comment }) => (
    <div className="bg-surface-secondary p-3 rounded-lg text-sm">
        <div className="flex items-center mb-1">
            <User className="w-4 h-4 mr-2 text-accent-teal" />
            <p className="font-semibold text-text-primary">{comment.author}</p>
        </div>
        <p className="text-zinc-300 ml-6">{comment.text}</p>
    </div>
);

const PromptDetailPage = ({ prompt = mockPrompt, goBackToLibrary }) => {
    const [newComment, setNewComment] = useState('');

    const handlePostComment = () => {
        if (newComment.trim()) {
            console.log("Posting comment:", newComment);
            // In a real app, you would dispatch an action to post the comment
            setNewComment('');
        }
    };

    return (
        <div className="prompt-detail-page space-y-6">
            <button 
                className="text-sm text-zinc-400 hover:text-white mb-4" 
                onClick={goBackToLibrary}
            >
                &larr; Back to Dev Team Prompts
            </button>

            <h1 className="text-3xl font-bold text-text-primary">{prompt.task}</h1>
            <p className="text-sm text-zinc-500">Creator: {prompt.creator} | Upvotes: {prompt.upvotes}</p>

            {/* Prompt Content */}
            <h4 className="text-lg font-semibold text-text-primary">Prompt:</h4>
            <pre className="code-block p-4 rounded-xl text-sm overflow-x-auto text-zinc-200"><code className="whitespace-pre-wrap">{prompt.content}</code></pre>

            {/* Actions */}
            <div className="flex space-x-3">
                <button className="px-4 py-2 rounded-lg bg-accent-teal text-white font-semibold flex items-center hover:bg-teal-600 transition">
                    <ThumbsUp className="w-4 h-4 mr-2" /> Upvote ({prompt.upvotes})
                </button>
                <button className="px-4 py-2 rounded-lg bg-zinc-700 text-white font-semibold flex items-center hover:bg-zinc-600 transition">
                    <Send className="w-4 h-4 mr-2" /> Request Update
                </button>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
                <h4 className="text-xl font-semibold mb-4 text-text-primary">Comments ({prompt.comments.length})</h4>
                <div className="space-y-3 mb-6">
                    {prompt.comments.map(comment => (
                        <CommentThread key={comment.id} comment={comment} />
                    ))}
                </div>

                {/* Add Comment Input */}
                <div className="p-4 bg-surface-secondary rounded-xl">
                    <textarea 
                        placeholder="Add a Comment..." 
                        className="w-full p-2 bg-zinc-800 rounded-lg text-sm border-none focus:ring-1 focus:ring-accent-teal focus:outline-none resize-none h-20"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end mt-2">
                        <button 
                            className="px-4 py-2 text-sm rounded-lg bg-accent-teal text-white hover:bg-teal-600 transition"
                            onClick={handlePostComment}
                        >
                            Post Comment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptDetailPage;