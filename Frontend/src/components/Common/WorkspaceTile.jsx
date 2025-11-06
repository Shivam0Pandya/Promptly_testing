const WorkspaceTile = ({ name, prompts, onClick }) => {
    return (
        <div className="bg-surface-card p-5 rounded-xl border border-zinc-700 hover:border-accent-teal transition cursor-pointer flex-shrink-0 w-60">
            <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
            <p className="text-sm text-zinc-400 mt-1">{prompts} Prompts</p>
            {/* The onClick handler is passed down here */}
            <button 
                className="mt-4 px-3 py-1 text-xs rounded-full bg-accent-teal text-white hover:bg-teal-600 transition" 
                onClick={onClick}
            >
                View
            </button>
        </div>
    );
};

export default WorkspaceTile;