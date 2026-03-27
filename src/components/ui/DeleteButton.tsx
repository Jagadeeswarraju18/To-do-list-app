"use client";

import { Trash2, Loader2 } from "lucide-react";

interface DeleteButtonProps {
    onClick: (e: React.MouseEvent) => void;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
}

export function DeleteButton({ onClick, loading, disabled, className = "" }: DeleteButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`premium-button bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 group h-10 w-10 p-0 rounded-full ${className}`}
            type="button"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin premium-icon" />
            ) : (
                <Trash2 className="w-4 h-4 premium-icon" />
            )}
        </button>
    );
}
