"use client";

import { ResponseData } from "@/services/api";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "./theme-toggle";
import UserAvatar from "./user-avatar";
import { Heart, MessageSquare, User, Users } from "lucide-react";

// Update the SidebarProps interface to include onOptionSelect
interface SidebarProps {
    previousResponses: ResponseData[];
    fetchingHistory: boolean;
    onSelectResponse: (response: ResponseData) => void;
    onOptionSelect: (option: string) => void; // New prop for option selection
    selectedOption: string | null; // Currently selected option
}

export function Sidebar({
    previousResponses,
    fetchingHistory,
    onSelectResponse,
    onOptionSelect,
    selectedOption,
}: SidebarProps) {
    const [width, setWidth] = useState(256);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Custom scrollbar CSS styles
    const scrollbarStyles = {
        // For Webkit browsers (Chrome, Safari, Edge)
        "--scrollbar-thumb": "rgba(156, 163, 175, 0.9)",
        "--scrollbar-thumb-hover": "rgba(156, 163, 175, 0.5)",
        "--scrollbar-track": "rgba(0, 0, 0, 0)",
        scrollbarWidth: "thin" as const, // For Firefox
        scrollbarColor: "rgba(156, 163, 175, 0.9) transparent", // For Firefox
    };

    // Dark mode scrollbar styles
    const darkScrollbarStyles = {
        "--scrollbar-thumb": "rgba(156, 163, 175, 0.9)",
        "--scrollbar-thumb-hover": "rgba(156, 163, 175, 0.4)",
        "--scrollbar-track": "rgba(0, 0, 0, 0)",
        scrollbarWidth: "thin" as const,
        scrollbarColor: "rgba(156, 163, 175, 0.2) transparent",
    };

    // Check for dark mode on client-side only
    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains("dark"));

        // Optional: listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    setIsDarkMode(document.documentElement.classList.contains("dark"));
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            // Calculate new width based on mouse position
            const newWidth = e.clientX;

            // Set min and max constraints
            if (newWidth >= 200 && newWidth <= 600) {
                setWidth(newWidth);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isResizing || !e.touches[0]) return;

            const newWidth = e.touches[0].clientX;

            if (newWidth >= 200 && newWidth <= 600) {
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = "default";
            document.body.classList.remove("select-none");

            // Save width preference to localStorage
            localStorage.setItem("sidebarWidth", width.toString());
        };

        const handleTouchEnd = () => {
            setIsResizing(false);
            document.body.classList.remove("select-none");
            localStorage.setItem("sidebarWidth", width.toString());
        };

        // Add event listeners when resizing
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("touchend", handleTouchEnd);
            // Prevent text selection during resize
            document.body.classList.add("select-none");
        }

        // Cleanup
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
            document.body.classList.remove("select-none");
        };
    }, [isResizing, width]);

    // Load saved width from localStorage on component mount
    useEffect(() => {
        const savedWidth = localStorage.getItem("sidebarWidth");
        if (savedWidth) {
            const parsedWidth = parseInt(savedWidth);
            if (!isNaN(parsedWidth) && parsedWidth >= 200 && parsedWidth <= 600) {
                setWidth(parsedWidth);
            }
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        document.body.style.cursor = "ew-resize";
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    // Handler function for option selection
    const handleOptionSelect = (option: string) => {
        onOptionSelect(option);
    };

    return (
        <div
            ref={sidebarRef}
            className="flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 h-screen overflow-hidden relative"
            style={{ width: `${width}px` }}
        >
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <UserAvatar />
                    <div className="flex flex-row items-center space-x-2">
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Options */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">What do you need?</h2>
                <div className="flex flex-col space-y-2 mt-4">
                    <button
                        className={`flex items-center justify-between cursor-pointer space-x-2 px-2 h-10 
                            ${
                                selectedOption === "love-calculator"
                                    ? "bg-pink-500 dark:bg-pink-900 text-white"
                                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            } 
                            rounded-lg transition-colors`}
                        onClick={() => handleOptionSelect("love-calculator")}
                    >
                        <span className="text-sm">Love calculator</span>
                        <Heart className="w-4 h-4" />
                    </button>

                    <button
                        className={`flex items-center justify-between cursor-pointer space-x-2 px-2 h-10 
                            ${
                                selectedOption === "reply-help"
                                    ? "bg-blue-500 dark:bg-blue-900 text-white"
                                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            } 
                            rounded-lg transition-colors`}
                        onClick={() => handleOptionSelect("reply-help")}
                    >
                        <span className="text-sm">Trouble with replying?</span>
                        <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                        className={`flex items-center justify-between cursor-pointer space-x-2 px-2 h-10 
                            ${
                                selectedOption === "describe-yourself"
                                    ? "bg-green-500 dark:bg-green-900 text-white"
                                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            } 
                            rounded-lg transition-colors`}
                        onClick={() => handleOptionSelect("describe-yourself")}
                    >
                        <span className="text-sm">Describe yourself</span>
                        <User className="w-4 h-4" />
                    </button>

                    <button
                        className={`flex items-center justify-between cursor-pointer space-x-2 px-2 h-10 
                            ${
                                selectedOption === "dating-help"
                                    ? "bg-purple-500 dark:bg-purple-900 text-white"
                                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            } 
                            rounded-lg transition-colors`}
                        onClick={() => handleOptionSelect("dating-help")}
                    >
                        <span className="text-sm">Dating help</span>
                        <Users className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Apply RTL to container to move scrollbar left with transparent styling */}
            <div
                className="overflow-y-auto flex-1 scrollbar-custom"
                style={{
                    direction: "rtl",
                    ...(isDarkMode ? darkScrollbarStyles : scrollbarStyles),
                }}
            >
                {/* Apply LTR to content to maintain correct text direction
                <div style={{ direction: "ltr" }}>
                    {fetchingHistory ? (
                        <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">Loading history...</div>
                    ) : previousResponses.length === 0 ? (
                        <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">No previous responses</div>
                    ) : (
                        <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {previousResponses.map((item) => (
                                <li key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer">
                                    <button onClick={() => onSelectResponse(item)} className="p-4 w-full text-left">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                            {item.prompt.length > 30
                                                ? item.prompt.substring(0, 30) + "..."
                                                : item.prompt}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            {new Date(item.created_at).toLocaleString()}
                                        </p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div> */}
            </div>
            {/* Improved resize handle */}
            <div
                className={`absolute top-0 right-0 w-2 h-full cursor-ew-resize flex items-center justify-center ${
                    isResizing ? "bg-blue-200 dark:bg-zinc-500" : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                } transition-colors`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                aria-label="Resize sidebar"
            >
                <div className="w-1 right-10 h-16 rounded-full bg-zinc-300 dark:bg-zinc-600"></div>
            </div>
        </div>
    );
}
