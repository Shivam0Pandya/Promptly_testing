// src/components/Layout/Header.jsx
import { Search } from 'lucide-react';

const Header = () => {
    // We hide auth buttons when logged in (as assumed for the main views)
    const isAuthenticated = true; 

    return (
        <header className="h-16 flex items-center justify-between px-2 mb-8">
            <div className="flex-1 max-w-lg">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search Workspace" 
                        className="w-full p-3 pl-10 bg-surface-secondary rounded-xl text-sm border-none focus:ring-2 focus:ring-accent-teal focus:outline-none"
                        onFocus={(e) => e.target.placeholder='Searching in Current Workspace...'}
                        onBlur={(e) => e.target.placeholder='Search Workspace'}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                </div>
            </div>
            {/* Log In/Sign Up placeholder (Shown if !isAuthenticated) */}
            {!isAuthenticated && (
                 <div className="space-x-4">
                    <button className="px-5 py-2 rounded-lg bg-accent-teal text-white font-semibold">Log in</button>
                    <button className="px-5 py-2 rounded-lg border border-white text-white font-semibold hover:bg-zinc-700 transition">Sign up</button>
                </div>
            )}
        </header>
    );
};

export default Header;