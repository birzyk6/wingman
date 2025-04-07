"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface ChatModeSelectorProps {
    selectedMode: string;
    onModeSelect: (mode: string) => void;
    dropDirection?: "up" | "down"; // Add prop to control dropdown direction
}

export function ChatModeSelector({
    selectedMode,
    onModeSelect,
    dropDirection = "up", // Default to dropdown opening upward
}: ChatModeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const modes = [
        { id: "basic", name: "Basic", description: "Standard AI assistant" },
        { id: "expert", name: "Expert", description: "Dating coach mode" },
        { id: "alpha", name: "α - v0.1", description: "Our best model yet!" },
    ];

    const selectedModeData = modes.find((mode) => mode.id === selectedMode) || modes[0];

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleModeSelect = (modeId: string) => {
        onModeSelect(modeId);
        setIsOpen(false);
    };

    // Determine dropdown position class based on dropDirection
    const dropdownPositionClass =
        dropDirection === "up"
            ? "bottom-full mb-1" // Open upward
            : "top-full mt-1"; // Open downward

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="flex items-center justify-between w-full pr-2 pl-4 h-10 py-1 text-sm btn"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="truncate">{selectedModeData.name}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
            </button>

            {isOpen && (
                <div
                    className={`absolute ${dropdownPositionClass} right-0 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg z-10`}
                >
                    <ul className="py-1 px-1">
                        {modes.map((mode) => (
                            <li key={mode.id}>
                                <button
                                    onClick={() => handleModeSelect(mode.id)}
                                    className={`flex items-center w-full text-left px-3 py-2 text-sm btn${
                                        selectedMode === mode.id ? "bg-zinc-100 dark:bg-zinc-700 rounded-sm" : ""
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{mode.name}</div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {mode.description}
                                        </div>
                                    </div>
                                    {selectedMode === mode.id && <Check className="w-4 h-4 text-blue-500" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
