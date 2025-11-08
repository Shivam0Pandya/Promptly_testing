// src/App.jsx

import React, { useEffect, useState } from "react";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import Dashboard from "./pages/Dashboard";
import LibraryView from "./pages/LibraryView";
import PromptDetailPage from "./pages/PromptDetailPage";
import ExploreView from "./pages/ExploreView"; 
import ReviewRequestModal from "./components/Modals/ReviewRequestModal";
import AuthView from "./pages/AuthView";
import AddWorkspaceModal from "./components/Modals/AddWorkspaceModal";
import api from "./api/axiosConfig"; 
 // Required for mongoose.Types.ObjectId.isValid() check

const App = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [viewingPromptId, setViewingPromptId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  // `workspaces` holds all Active Workspaces (Owned + Joined)
  const [workspaces, setWorkspaces] = useState([]); 
  const [isAddWorkspaceModalOpen, setIsAddWorkspaceModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  
  const [exploreStats, setExploreStats] = useState({
    totalPrompts: 0,
    totalWorkspaces: 0,
  });
  
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  // inside App component:
  const [pendingCount, setPendingCount] = useState(0);

  // Load active workspaces (owned + joined) once authenticated
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const { data } = await api.get("/workspaces"); 
        setWorkspaces(data);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };

    if (isAuthenticated) fetchWorkspaces();
  }, [isAuthenticated]);
  
  // Fetch global stats & all workspaces (unprotected data fetch for Explore)
  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        const { data: statsData } = await api.get("/stats"); 
        setExploreStats(statsData);
        
        const { data: allWorkspacesData } = await api.get("/workspaces/all/count");
        setAllWorkspaces(allWorkspacesData);

      } catch (error) {
        console.error("Error fetching explore data:", error);
      }
    };

    fetchExploreData(); 
  }, [isAuthenticated]); 

  const fetchPendingCount = async () => {
    try {
      const { data } = await api.get("/prompts/pending?limit=2"); // backend returns { total, items }
      setPendingCount(data.total || 0);
    } catch (err) {
      console.error("Error fetching pending count:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchPendingCount();
    }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentPage("dashboard"); 
    setWorkspaces([]); 
    setSelectedWorkspaceId(null);
  };

  // Handles the Join action from the Explore Page
  const handleJoinWorkspace = async (workspaceId) => {
    if (!isAuthenticated) return; 

    try {
        await api.post(`/workspaces/join/${workspaceId}`);
        
        // Re-fetch the full list of active workspaces to update sidebar/dashboard
        const { data } = await api.get("/workspaces"); 
        setWorkspaces(data);

        // Navigate user to the newly joined workspace/library view
        handleViewWorkspace(workspaceId);

    } catch (error) {
        console.error("Error joining workspace:", error.response?.data.message || error.message);
    }
  }


  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setSearchQuery("");
      setCurrentPage(page);
    }
    setViewingPromptId(null);
    if (page === "requests") {
      setIsModalOpen(true);
      setCurrentPage("dashboard");
    } else {
      setIsModalOpen(false);
    }
  };

  const handlePromptSelect = (promptId) => {
    setCurrentPage("prompt-detail");
    setViewingPromptId(promptId);
  };

  const handleBackToLibrary = () => {
    setCurrentPage("library");
    setViewingPromptId(null)
  };

  const handleViewWorkspace = (workspaceId) => {
    setSelectedWorkspaceId(workspaceId);
    setCurrentPage("library");
  };
  
  const handleAddWorkspace = (newWorkspace) => {
    setWorkspaces((prev) => [...prev, newWorkspace]);
  };

  const handleRequestHandled = async ({ requestId, action, updatedPrompt }) => {
  // if the currently viewed prompt was affected, refresh it
  // assume request contains info about prompt id (or updatedPrompt returned)
  if (action === "Accept") {
    if (updatedPrompt && updatedPrompt._id === viewingPromptId) {
      // server returned updated prompt — replace selected prompt
      setSelectedPrompt(updatedPrompt);
    } else if (viewingPromptId) {
      // otherwise re-fetch current prompt from API
      try {
        const { data } = await api.get(`/prompts/${viewingPromptId}`);
        setSelectedPrompt(data);
      } catch (err) {
        console.error("Failed to refresh prompt after update:", err);
      }
    }
    fetchPendingCount();
  }
  // optionally: also refresh workspace lists / pending counts
  // e.g. refetch workspaces or pending counts if you display them elsewhere
};

  useEffect(() => {
  const fetchPrompt = async () => {
    if (!viewingPromptId) return;
    try {
      const { data } = await api.get(`/prompts/${viewingPromptId}`);
      setSelectedPrompt(data);
    } catch (error) {
      console.error("Error fetching prompt details:", error);
    }
  };

  fetchPrompt();
}, [viewingPromptId]);

  const renderPage = () => {
   
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            showRequests={() => setIsModalOpen(true)}
            onPromptClick={() => handlePromptSelect(viewingPromptId)}
            onViewWorkspace={handleViewWorkspace}
            setCurrentPage={handlePageChange}
            searchQuery={searchQuery}
            activeWorkspaces={workspaces} 
            pendingCount={pendingCount}
          />
        );
      case "requests":
        return (
          <ReviewRequestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        );
      case "library":
        return (
          <LibraryView
            onPromptSelect={handlePromptSelect}
            selectedWorkspaceId={selectedWorkspaceId}
            searchQuery={searchQuery}
            workspaces={workspaces}
          />
        );
      case "prompt-detail":
        console.log("i come here");
        console.log(selectedPrompt)
        console.log(viewingPromptId)
        return <PromptDetailPage 
        prompt={selectedPrompt}
        goBackToLibrary={handleBackToLibrary} />;

      // App.jsx (inside renderPage switch -> "explore" case)
      case "explore":
        return <ExploreView 
          stats={exploreStats} 
          allWorkspaces={allWorkspaces} 
          onViewWorkspace={handleViewWorkspace}
          onJoinWorkspace={handleJoinWorkspace} 
          userWorkspaces={workspaces}
          searchQuery={searchQuery}   // <-- add this
        />;

        
      default:
        return (
          <Dashboard
            showRequests={() => setIsModalOpen(true)}
            onPromptClick={() => handlePromptSelect(viewingPromptId)}
            activeWorkspaces={workspaces} 
            onViewWorkspace={handleViewWorkspace}
          />
        );
    }
  };

  return (
    <div id="app" className="font-inter">
      {!isAuthenticated ? (
        <AuthView onAuthSuccess={handleAuthSuccess} />
      ) : (
        <div className="flex h-screen overflow-hidden bg-bg-primary">
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
            setSelectedWorkspaceId={setSelectedWorkspaceId}
            workspaces={workspaces}
            onOpenAddWorkspaceModal={() => setIsAddWorkspaceModalOpen(true)}
          />

          <main id="main-content" className="flex-1 p-8 overflow-y-auto">
            <Header
              currentPage={currentPage}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onLogout={handleLogout} 
            />
            <div id="page-content" className="w-full">
              {renderPage()}
            </div>
          </main>

          <ReviewRequestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onRequestHandled={handleRequestHandled}
          />
          
          <AddWorkspaceModal
            isOpen={isAddWorkspaceModalOpen}
            onClose={() => setIsAddWorkspaceModalOpen(false)}
            onSave={handleAddWorkspace}
          />
        </div>
      )}
    </div>
  );
};

export default App;