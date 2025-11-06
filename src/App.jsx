// src/App.jsx
import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import LibraryView from './pages/LibraryView';
import PromptDetailPage from './pages/PromptDetailPage'; // New Import
import ReviewRequestModal from './components/Modals/ReviewRequestModal';

const App = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    // New state to manage selected workspace and prompt viewing
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(1);
    const [viewingPromptId, setViewingPromptId] = useState(null);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setViewingPromptId(null); // Reset prompt view when changing pages
        if (page === 'requests') {
            setIsModalOpen(true);
            setCurrentPage('dashboard');
        } else {
            setIsModalOpen(false);
        }
    };
    
    const handlePromptSelect = (promptId) => {
        setCurrentPage('prompt-detail');
        setViewingPromptId(promptId);
    };
    
    const handleBackToLibrary = () => {
        setCurrentPage('library');
        setViewingPromptId(null);
    };

    const handleViewWorkspace = (workspaceId) => {
      setSelectedWorkspaceId(workspaceId);
      setCurrentPage('library');
    };

    const renderPage = () => {
        if (viewingPromptId) {
            // Render the dedicated prompt detail page
            return <PromptDetailPage goBackToLibrary={handleBackToLibrary} />;
        }
        
        switch (currentPage) {
            case 'dashboard':
              return <Dashboard 
                    showRequests={() => setIsModalOpen(true)} 
                    onPromptClick={() => handlePromptSelect(1)}
                    //  PASSING THE NEW HANDLER TO THE DASHBOARD
                    onViewWorkspace={handleViewWorkspace}
              />;
            case 'requests':
                console.log(currentPage);
                // Dashboard now passes the select handler to navigate to the new detail view
                return <ReviewRequestModal
                isOpen={isModalOpen} 
                onClose={() => {
                  
                  setIsModalOpen(false);
                                
                }} 
                  // Mock select for trending
                />;
            case 'library':
                return <LibraryView 
                    onPromptSelect={handlePromptSelect} 
                    selectedWorkspaceId={selectedWorkspaceId} 
                />;
            case 'prompt-detail': // <--- NEW CASE ADDED HERE
            return <PromptDetailPage 
                goBackToLibrary={handleBackToLibrary} 
                // In a real app, you would pass the actual prompt data based on viewingPromptId
            />;

            default:
                return <Dashboard showRequests={() => setIsModalOpen(true)} onPromptClick={() => handlePromptSelect(1)} />;
        }
    };

    return (
        <div id="app" className="flex h-screen overflow-hidden bg-bg-primary font-inter">
            <Sidebar 
                currentPage={currentPage} 
                setCurrentPage={handlePageChange}
                setSelectedWorkspaceId={setSelectedWorkspaceId} // Pass setter for dropdown
            />

            <main id="main-content" className="flex-1 p-8 overflow-y-auto">
                <Header />
                <div id="page-content" className="w-full">
                    {renderPage()}
                </div>
            </main>
            
            <ReviewRequestModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default App;