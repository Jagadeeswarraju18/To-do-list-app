"use client";

import { CloudDownload, Loader2 } from "lucide-react";

interface SaveButtonProps {
    onClick?: (e?: any) => void;
    label?: string;
    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit";
    className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
    onClick,
    label = "Save",
    loading = false,
    disabled = false,
    type = "button",
    className = "",
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`premium-button group ${className}`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin premium-icon" />
            ) : (
                <CloudDownload className="w-4 h-4 premium-icon" />
            )}
            <span className="relative z-10">{loading ? "Saving..." : label}</span>
        </button>
    );
};
