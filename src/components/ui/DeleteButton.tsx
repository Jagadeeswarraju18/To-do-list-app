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
            className={`custom-delete-button group ${className}`}
            type="button"
        >
            <div className="bin-container">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 39 7"
                    className="bin-top"
                >
                    <line y1="3.5" x2="39" y2="3.5" stroke="white" strokeWidth="7"></line>
                    <line
                        x1="12"
                        y1="1.5"
                        x2="27"
                        y2="1.5"
                        stroke="white"
                        strokeWidth="3"
                    ></line>
                </svg>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 33 39"
                    className="bin-bottom"
                >
                    <mask id="path-1-inside-1_8_19" fill="white">
                        <path
                            d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
                        ></path>
                    </mask>
                    <path
                        d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
                        stroke="white"
                        strokeWidth="10"
                        mask="url(#path-1-inside-1_8_19)"
                    ></path>
                    <path d="M12 6L12 29" stroke="white" strokeWidth="4"></path>
                    <path d="M21 6V29" stroke="white" strokeWidth="4"></path>
                </svg>
            </div>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                </div>
            )}
        </button>
    );
}
