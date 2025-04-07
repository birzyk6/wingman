"use client";

import { ResponseData } from "@/services/api";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "./theme-toggle";
import UserAvatar from "./user-avatar";
import { Heart, MessageSquare, User, Users, Plus, Trash2, RefreshCw, Info } from "lucide-react";
import Link from "next/link";

// Update SidebarProps interface - remove the chat mode related props
interface SidebarProps {
    previousResponses: ResponseData[];
    fetchingHistory: boolean;
    onSelectResponse: (response: ResponseData) => void;
    onOptionSelect: (option: string) => void;
    selectedOption: string | null;
    chatWindows?: any[];
    onSelectChatWindow?: (chatWindow: any) => void;
    onCreateChat?: () => void;
    onDeleteChat?: (chatId: number) => void;
    onRefresh?: () => void;
    generatingChats?: Record<number, boolean>;
}

export function Sidebar({
    previousResponses,
    fetchingHistory,
    onSelectResponse,
    onOptionSelect,
    selectedOption,
    chatWindows = [],
    onSelectChatWindow = () => {},
    onCreateChat = () => {},
    onDeleteChat = () => {},
    onRefresh = () => {},
    generatingChats = {},
}: SidebarProps) {
    const [width, setWidth] = useState(300);
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
            if (newWidth >= 300 && newWidth <= 600) {
                setWidth(newWidth);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isResizing || !e.touches[0]) return;

            const newWidth = e.touches[0].clientX;

            if (newWidth >= 300 && newWidth <= 600) {
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

    // Keep the chat container ref but remove button-related states
    const chatContainerRef = useRef<HTMLDivElement>(null);

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
                        {/* Add Welcome Screen button */}
                        <button
                            onClick={() => handleOptionSelect("welcome")}
                            className={`p-2 rounded-md ${
                                selectedOption === "welcome"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                            title="About Wingman"
                        >
                            <Info className="w-5 h-5" />
                        </button>

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
                                selectedOption === "dating-help"
                                    ? "bg-purple-500 dark:bg-purple-900 text-white"
                                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            } 
                            rounded-lg transition-colors`}
                        onClick={() => handleOptionSelect("dating-help")}
                    >
                        <span className="text-sm">Help with replies</span>
                        <Users className="w-4 h-4" />
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
                        <span className="text-sm">Dating help</span>
                        <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* Add new button for Tinder profile descriptions */}
                    <button
                        className={`flex items-center justify-between cursor-pointer space-x-2 px-2 h-10 
                            ${
                                selectedOption === "profile-description"
                                    ? "bg-green-500 dark:bg-green-900 text-white"
                                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            } 
                            rounded-lg transition-colors`}
                        onClick={() => handleOptionSelect("profile-description")}
                    >
                        <span className="text-sm">Tinder Bio Creator</span>
                        <User className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Windows Section - Modified to remove scroll buttons */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Your Conversations</h2>
                    <div className="flex gap-1">
                        <button
                            onClick={onRefresh}
                            className="p-1 cursor-pointer rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                            title="Refresh Chats"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onCreateChat}
                            className="p-1 rounded-md cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                            title="New Chat"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Scrollable container for chats - Keep this part */}
                <div
                    ref={chatContainerRef}
                    className="flex flex-col space-y-2 mt-4 h-64 overflow-y-auto pr-1 relative scrollbar-thin"
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(156, 163, 175, 0.5) transparent",
                    }}
                >
                    {fetchingHistory ? (
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 p-2 flex items-center">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-zinc-500 border-t-transparent rounded-full"></div>
                            Loading chats...
                        </div>
                    ) : chatWindows.length === 0 ? (
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 p-2">
                            <p>No conversations yet</p>
                            <button onClick={onCreateChat} className="mt-2 text-blue-500 flex items-center">
                                <Plus className="h-3 w-3 mr-1" /> Start a new chat
                            </button>
                        </div>
                    ) : (
                        chatWindows.map((chat, index) => {
                            // Find the most recent message to use as title
                            let chatTitle = `Chat ${index + 1}`;
                            let latestTime = null;

                            if (chat && chat.responses && Array.isArray(chat.responses) && chat.responses.length > 0) {
                                try {
                                    // Create a shallow copy of the responses array to avoid mutation issues
                                    const responsesCopy = chat.responses.slice();

                                    // Sort responses by date (newest first) with additional error checks
                                    const sortedResponses = responsesCopy.sort(
                                        (
                                            a: { created_at: string | number | Date },
                                            b: { created_at: string | number | Date }
                                        ) => {
                                            try {
                                                const dateA = a && a.created_at ? new Date(a.created_at).getTime() : 0;
                                                const dateB = b && b.created_at ? new Date(b.created_at).getTime() : 0;
                                                return dateB - dateA;
                                            } catch (err) {
                                                // If date parsing fails, maintain original order
                                                return 0;
                                            }
                                        }
                                    );

                                    // Use the latest prompt as the title with additional null checks
                                    const latestResponse = sortedResponses[0];
                                    if (latestResponse && typeof latestResponse === "object" && latestResponse.prompt) {
                                        chatTitle =
                                            typeof latestResponse.prompt === "string"
                                                ? latestResponse.prompt.length > 25
                                                    ? latestResponse.prompt.substring(0, 25) + "..."
                                                    : latestResponse.prompt
                                                : `Chat ${index + 1}`;

                                        // Only create Date object if created_at is valid
                                        if (latestResponse.created_at) {
                                            try {
                                                latestTime = new Date(latestResponse.created_at);
                                                // Verify the date is valid
                                                if (isNaN(latestTime.getTime())) {
                                                    latestTime = null;
                                                }
                                            } catch (e) {
                                                latestTime = null;
                                            }
                                        }
                                    }
                                } catch (error) {
                                    console.error("Error processing chat responses:", error);
                                    // Fallback to default title if there's an error
                                }
                            }

                            // Safely check if the chat is generating - ensure chat.id exists and is not null
                            const isGenerating =
                                chat &&
                                chat.id !== undefined &&
                                chat.id !== null &&
                                Object.prototype.hasOwnProperty.call(generatingChats, chat.id) &&
                                generatingChats[chat.id] === true;

                            return (
                                <div
                                    key={chat.id || index}
                                    className="flex items-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                                >
                                    <button
                                        className="flex flex-1 items-center justify-between cursor-pointer space-x-2 px-2 py-2 text-left"
                                        onClick={() => onSelectChatWindow(chat)}
                                    >
                                        <div className="flex flex-col overflow-hidden">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                    {chatTitle}
                                                </span>
                                                {isGenerating && (
                                                    <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                )}
                                            </div>
                                            {latestTime && (
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {latestTime.toLocaleDateString()}{" "}
                                                    {latestTime.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        <MessageSquare className="w-4 h-4 text-zinc-400 shrink-0" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm("Are you sure you want to delete this chat?")) {
                                                onDeleteChat(chat.id);
                                            }
                                        }}
                                        className="p-2 ml-1 cursor-pointer text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                                        title="Delete chat"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Apply RTL styling for scrollbar */}
            <div
                className="overflow-y-auto flex-1 scrollbar-custom"
                style={{
                    direction: "rtl",
                    ...(isDarkMode ? darkScrollbarStyles : scrollbarStyles),
                }}
            >
                {/* This div is kept empty - we're no longer showing previous responses here */}
                <div style={{ direction: "ltr" }}></div>
            </div>

            {/* Resize handle */}
            <div
                className={`absolute top-0 right-0 w-2 h-full cursor-ew-resize flex items-center justify-center ${
                    isResizing ? "bg-blue-200 dark:bg-zinc-500" : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                } transition-colors`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                aria-label="Resize sidebar"
            ></div>
        </div>
    );
}
