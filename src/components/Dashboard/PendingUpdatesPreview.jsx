// src/components/Dashboard/PendingUpdatesPreview.jsx
import React from 'react';
import Button from '../Common/Button';
import { ArrowRight } from 'lucide-react';

const PendingUpdatesPreview = ({ showRequests }) => {
    return (
        <section className="bg-surface-card p-6 rounded-xl border border-zinc-700">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-semibold text-text-primary">Pending Updates (3)</h2>
                 <Button 
                    variant="secondary"
                    className="text-sm"
                    onClick={showRequests} // Triggers the modal via App.jsx state
                >
                    Review All Requests <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg">
                    <span className="text-base font-medium">Prompt: Next.js Component with Tailwind</span>
                    <span className="text-sm text-zinc-400">from Jane Smith</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg">
                    <span className="text-base font-medium">Prompt: Advanced SQL Join Query</span>
                    <span className="text-sm text-zinc-400">from Bob Johnson</span>
                </div>
            </div>
        </section>
    );
};

export default PendingUpdatesPreview;