// src/components/Common/Button.jsx
import React from 'react';

// Defines the styles based on the type prop
const baseStyles = "px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center";

const getVariantStyles = (variant) => {
    switch (variant) {
        case 'primary':
            return "bg-accent-teal text-white hover:bg-teal-600";
        case 'secondary':
            return "bg-zinc-700 text-white hover:bg-zinc-600";
        case 'outline':
            return "border border-white text-white hover:bg-zinc-700";
        case 'destructive':
            return "bg-accent-red text-white hover:bg-red-600";
        case 'success':
            return "bg-accent-green text-white hover:bg-green-600";
        default:
            return "bg-zinc-800 text-white hover:bg-zinc-700";
    }
};

const Button = ({ children, onClick, variant = 'default', className = '', ...props }) => {
    return (
        <button
            className={`${baseStyles} ${getVariantStyles(variant)} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;