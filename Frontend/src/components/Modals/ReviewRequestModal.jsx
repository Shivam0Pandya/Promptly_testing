// src/components/Modals/ReviewRequestModal.jsx
import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import api from "../../api/axiosConfig";

const ReviewCard = ({ request, onHandled }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    if (loading) return;
    setLoading(true);
    try {
      if (action === "Accept") {
        const res = await api.put(`/prompts/${request.promptId}/approve/${request.updateId}`);
        onHandled({ requestId: request.updateId, action: "Accept", updatedPrompt: res.data.updatedPrompt });
      } else {
        await api.put(`/prompts/${request.promptId}/reject/${request.updateId}`);
        onHandled({ requestId: request.updateId, action: "Reject" });
      }
    } catch (err) {
      console.error(`${action} failed`, err.response?.data || err.message);
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-secondary p-4 rounded-lg border border-zinc-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{request.promptTitle}</h3>
          <p className="text-sm text-zinc-400">Requested by: {request.requestedBy?.name || request.requestedBy}</p>
          <p className="text-sm mt-2"><strong>Original:</strong></p>
          <pre className="code-block p-2 rounded bg-zinc-900 text-sm overflow-auto">{request.originalBody}</pre>
          <p className="text-sm mt-2"><strong>Proposed:</strong></p>
          <pre className="code-block p-2 rounded bg-zinc-900 text-sm overflow-auto">{request.suggestedBody}</pre>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        <button
          disabled={loading}
          onClick={() => handleAction("Reject")}
          className="px-3 py-2 rounded bg-red-600 text-white"
        >
          <X className="inline w-4 h-4 mr-1" /> Deny
        </button>
        <button
          disabled={loading}
          onClick={() => handleAction("Accept")}
          className="px-3 py-2 rounded bg-green-600 text-white"
        >
          <Check className="inline w-4 h-4 mr-1" /> Accept
        </button>
      </div>
    </div>
  );
};

const ReviewRequestModal = ({ isOpen, onClose, onRequestHandled }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchPending = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        console.log("Fetching pending updates...");
        const { data } = await api.get("/prompts/pending");
        console.log("Pending response:", data);
        if (!mounted) return;
        setPendingRequests(data.items || []);
        // optional global for quick console inspection while debugging
        window.__pendingRequests = data.items || [];
      } catch (err) {
        console.error("Error fetching pending requests:", err.response?.data || err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPending();
    return () => { mounted = false; };
  }, [isOpen]);

  const handleLocalHandled = ({ requestId, action, updatedPrompt }) => {
    setPendingRequests(prev => prev.filter(r => r.updateId !== requestId));
    if (onRequestHandled) onRequestHandled({ requestId, action, updatedPrompt });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-surface-card rounded-xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto relative">
        <button className="absolute top-4 right-4 text-white" onClick={onClose}><X /></button>
        <h2 className="text-2xl font-semibold mb-4">Pending Update Requests ({pendingRequests.length})</h2>

        {loading ? (
          <p className="text-zinc-400">Loading...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-zinc-400">No pending requests.</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(req => (
              <ReviewCard key={req.updateId} request={req} onHandled={handleLocalHandled} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewRequestModal;
