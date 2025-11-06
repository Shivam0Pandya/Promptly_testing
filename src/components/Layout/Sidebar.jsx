// src/components/Layout/Sidebar.jsx
import { Zap, Home, HardHat, FileText, Compass, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

const mockWorkspaces = [
    { id: 1, name: "Dev Team Prompts" },
    { id: 2, name: "Marketing Campaigns" },
    { id: 3, name: "Hackathon Squad" },
];

const NavItem = ({ Icon, name, isActive, onClick, isDropdown = false, isOpen = false }) => (
    <a 
        href="#"
        onClick={onClick}
        className={`flex items-center p-3 rounded-lg transition text-sm ${
            isActive ? 'bg-accent-teal text-white font-semibold' : 'text-white hover:bg-zinc-800'
        } ${isDropdown ? 'justify-between' : ''}`}
    >
        <span className="flex items-center">
            <Icon className="mr-3 w-5 h-5" />
            {name}
        </span>
        {isDropdown && (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
    </a>
);

const Sidebar = ({ currentPage, setCurrentPage, setSelectedWorkspaceId }) => {
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

    const handleWorkspaceSelect = (id) => {
        setSelectedWorkspaceId(id); // Update selected workspace state
        setCurrentPage('library'); // Navigate to the library view
    };

    return (
        <aside className="bg-surface-card h-full p-4 flex flex-col justify-between w-64 flex-shrink-0">
            <div>
                <div className="text-3xl font-bold mb-8 flex items-center text-accent-teal">
                    <Zap className="mr-2 w-6 h-6" /> promptly
                </div>
                <nav className="space-y-2 text-sm">
                    <NavItem Icon={Home} name="Home" isActive={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
                    
                    {/* My Workspace (Dropdown Toggle) */}
                    <NavItem 
                        Icon={HardHat} 
                        name="My Workspace" 
                        isActive={currentPage === 'library'} 
                        isDropdown={true}
                        isOpen={isWorkspaceOpen}
                        onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)} 
                    />
                    
                    {/* Workspace Dropdown Content */}
                    {isWorkspaceOpen && (
                        <div className="pl-6 space-y-1">
                            {mockWorkspaces.map(ws => (
                                <a 
                                    key={ws.id}
                                    href="#" 
                                    onClick={() => handleWorkspaceSelect(ws.id)}
                                    className="block p-2 rounded-lg text-zinc-300 hover:bg-zinc-700 transition"
                                >
                                    {ws.name}
                                </a>
                            ))}
                        </div>
                    )}
                    
                    <NavItem Icon={FileText} name="Requests" isActive={currentPage === 'requests'} onClick={() => setCurrentPage('requests')} />
                    <NavItem Icon={Compass} name="Explore" isActive={currentPage === 'explore'} onClick={() => alert('Explore clicked')} />
                </nav>
            </div>
            <div className="mt-8">
                <button className="flex items-center p-3 rounded-lg text-white hover:bg-zinc-800 transition w-full text-sm">
                    <Plus className="mr-3 w-5 h-5" /> Add Workspace
                </button>
                <div className="flex items-center justify-between p-3 mt-4 bg-surface-secondary rounded-xl">
                    <span className="text-sm">John Doe</span>
                    <div className="w-8 h-8 rounded-full bg-accent-teal flex items-center justify-center text-xs text-white">JD</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;