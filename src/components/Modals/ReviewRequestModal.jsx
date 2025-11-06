// src/components/Modals/ReviewRequestModal.jsx
import { X, Check } from 'lucide-react';

// Mock Data for a single review item
const mockReviewItem = {
    id: 101,
    promptName: "Next.js Component with Tailwind",
    requestedBy: "Jane Smith",
    originalPrompt: 
`// Original Prompt
- Task: Generate a basic React component.
- Prompt: "Write a functional component for a button that changes color on hover."`,
    proposedPrompt: 
`// Proposed New Prompt
- Task: Generate a high-performance React component.
- Prompt: "Using React Query, write a component that fetches user data, includes loading and error states, and is styled with Tailwind classes: bg-indigo-600."`
};

// In a real application, you would map over an array of requests here
const ReviewCard = ({ request }) => {
    const handleAction = (action) => {
        console.log(`${action} request ID: ${request.id}`);
        // Add your API call logic (e.g., PUT /api/requests/{id}/accept)
    };

    return (
        <div className="bg-surface-secondary p-6 rounded-lg border border-zinc-700">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-700">
                <h3 className="text-xl font-semibold text-text-primary">Title: {request.promptName}</h3>
                <span className="text-sm text-zinc-400">Requested by: {request.requestedBy}</span>
            </div>
            
            

            {/* Change Viewer (Original vs. Proposed) */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-semibold text-text-primary mb-2">Original Prompt</p>
                    <pre className="code-block p-3 rounded-lg overflow-x-auto text-zinc-200 h-64"><code className="whitespace-pre-wrap">{request.originalPrompt}</code></pre>
                </div>
                <div>
                    <p className="font-semibold text-text-primary mb-2">Proposed Prompt</p>
                    <pre className="code-block p-3 rounded-lg overflow-x-auto text-zinc-200 h-64"><code className="whitespace-pre-wrap">{request.proposedPrompt}</code></pre>
                </div>
            </div>

            {/* Action Buttons (Accept and Deny) */}
            <div className="flex justify-end space-x-4 mt-6">
                <button 
                    className="px-6 py-3 rounded-lg bg-accent-red text-white font-semibold flex items-center hover:bg-red-600 transition"
                    onClick={() => handleAction('Deny')}
                >
                    <X className="w-5 h-5 mr-2" /> Deny Request
                </button>
                <button 
                    className="px-6 py-3 rounded-lg bg-accent-green text-white font-semibold flex items-center hover:bg-green-600 transition"
                    onClick={() => handleAction('Accept')}
                >
                    <Check className="w-5 h-5 mr-2" /> Accept Update
                </button>
            </div>
        </div>
    );
};


const ReviewRequestModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Mock array of pending requests
    const pendingRequests = [mockReviewItem, {...mockReviewItem, id: 102, promptName: "Advanced SQL Join Query", requestedBy: "Bob Johnson"}];

    return (
        <div id="review-modal-overlay" className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div id="review-modal" className="bg-surface-card rounded-xl p-8 w-full max-w-4xl shadow-2xl relative">
                <h2 className="text-2xl font-semibold text-text-primary mb-6">Pending Update Requests ({pendingRequests.length})</h2>
                
                <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                    {pendingRequests.map(request => (
                        <ReviewCard key={request.id} request={request} />
                    ))}
                </div>

                {/* Close button for the modal */}
                <button className="absolute top-4 right-4 text-white hover:text-zinc-400 p-2" onClick={onClose}>
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default ReviewRequestModal;