// src/components/Dashboard/PendingUpdatesPreview.jsx
import React, { useEffect, useState } from "react";
import Button from '../Common/Button';
import { ArrowRight } from 'lucide-react';
import api from '../../api/axiosConfig';

const PendingUpdatesPreview = ({ showRequests, pendingCountFromApp }) => {
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchPreview = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/prompts/pending?limit=2");
        if (!mounted) return;
        setPreview(data.items || []);
      } catch (err) {
        console.error("Error fetching pending preview", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPreview();
    return () => { mounted = false; };
  }, []); // only on mount; App-level count will reflect changes globally

  return (
    <section className="bg-surface-card p-6 rounded-xl border border-zinc-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-text-primary">
          Pending Updates ({loading ? "..." : (pendingCountFromApp ?? 0)})
        </h2>
        <Button type="button" variant="secondary" className="text-sm" onClick={showRequests}>
          Review All Requests <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="space-y-3">
        {preview.length === 0 ? (
          <p className="text-zinc-400">No pending updates.</p>
        ) : (
          preview.map(item => (
            <div key={item.updateId} className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg">
              <span className="text-base font-medium">Prompt: {item.promptTitle}</span>
              <span className="text-sm text-zinc-400">from {item.requestedBy?.name || "Unknown"}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default PendingUpdatesPreview;
