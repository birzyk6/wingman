"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import LoveCalculator from "@/components/love-calculator";
import ReplyHelp from "@/components/reply-help";
import TinderReplyGenerator from "@/components/tinder-reply-generator";
import TinderDescriptionGenerator from "@/components/tinder-description-generator";
import { getAllChatWindows, createChatWindow, deleteChatWindow } from "@/services/api";
import { ChatModeSelector } from "@/components/chat-mode-selector";
import WelcomeScreen from "@/components/welcome-screen";

export default function Home() {
    // IMPORTANT: Call all hooks at the top level BEFORE any conditional returns
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    // Always call useAIAssistant hook first, regardless of authentication state
    const { previousResponses, fetchingHistory, handleSubmit, loadPreviousResponse } = useAIAssistant();

    // Then add all other state hooks, ensuring they're ALWAYS called in the same order
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [chatWindows, setChatWindows] = useState<any[]>([]);
    const [loadingChatWindows, setLoadingChatWindows] = useState(false);
    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    const [activeChatData, setActiveChatData] = useState<any>(null);
    const [generatingChats, setGeneratingChats] = useState<Record<number, boolean>>({});
    const [chatMode, setChatMode] = useState<string>("basic");

    // Check authentication first
    useEffect(() => {
        const userId = localStorage.getItem("wingmanUserId");
        setIsAuthenticated(!!userId);

        if (!userId) {
            console.log("No user ID found, redirecting to login");
            window.location.href = "/login"; // Use window.location for hard redirect
        } else {
            console.log("User authenticated with ID:", userId);
        }
    }, []);

    // Effect for fetching chat windows
    useEffect(() => {
        // Don't fetch if there's no user ID
        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) return;

        // Initial fetch on component mount
        fetchChatWindows();

        // Only refresh when tab becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchChatWindows();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []); // No dependency on activeChatId to prevent loops

    // Effect to handle active chat changes
    useEffect(() => {
        if (activeChatId) {
            // Update active chat data when the active chat changes
            const activeChat = chatWindows.find((chat) => chat.id === activeChatId);
            if (activeChat) {
                setActiveChatData(activeChat);
            }
        }
    }, [activeChatId, chatWindows]);

    // Effect to load saved chat mode
    useEffect(() => {
        const savedMode = localStorage.getItem("wingmanChatMode");
        if (savedMode) {
            setChatMode(savedMode);
        }
    }, []);

    // Function to mark a chat as generating or not generating
    const setChartGenerating = (chatId: number, isGenerating: boolean) => {
        // Check if chatId is valid and if the state actually needs to change
        if (!chatId || chatId <= 0) return;

        setGeneratingChats((prev) => {
            // Check if we're trying to set the same state that already exists
            const currentState = prev[chatId];
            if (currentState === isGenerating) {
                // No change needed, return the same object to avoid re-render
                return prev;
            }

            // Otherwise, update the state
            if (isGenerating) {
                return { ...prev, [chatId]: true };
            } else {
                // Create a new object without this chatId
                const newState = { ...prev };
                delete newState[chatId];
                return newState;
            }
        });
    };

    // Function to fetch all chat windows
    const fetchChatWindows = async () => {
        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) return;

        setLoadingChatWindows(true);
        try {
            const response = await getAllChatWindows(userId);
            if (response && Array.isArray(response)) {
                setChatWindows(response);

                // If there's an active chat, update its data
                if (activeChatId) {
                    const activeChat = response.find((chat) => chat.id === activeChatId);
                    if (activeChat) {
                        setActiveChatData(activeChat);
                    }
                }

                // If we just created a new chat and there are no active chats,
                // automatically select the first one
                if (!activeChatId && response.length > 0 && selectedOption === "reply-help") {
                    setActiveChatId(response[0].id);
                    setActiveChatData(response[0]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch chat windows:", err);
        } finally {
            setLoadingChatWindows(false);
        }
    };

    // Handler for creating a new chat
    const handleCreateChat = async () => {
        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) {
            alert("You need to log in first!");
            return;
        }

        try {
            const newChat = await createChatWindow(userId);
            // Refresh the chat windows list
            await fetchChatWindows();
            // Set the new chat as active
            if (newChat && newChat.id) {
                setActiveChatId(newChat.id);
            }
            // Switch to the reply help view
            setSelectedOption("reply-help");
        } catch (error) {
            console.error("Failed to create new chat:", error);
            alert("Failed to create new chat. Please try again.");
        }
    };

    // Handler for deleting a chat
    const handleDeleteChat = async (chatId: number) => {
        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) {
            alert("You need to log in first!");
            return;
        }

        try {
            await deleteChatWindow(chatId, userId);

            // Check if the deleted chat was the active one
            if (activeChatId === chatId) {
                // Reset active chat state
                setActiveChatId(null);
                setActiveChatData(null);
            }

            // Refresh the chat windows list
            await fetchChatWindows();

            // If we deleted the active chat, select a new one if available
            if (activeChatId === chatId) {
                const updatedWindows = await getAllChatWindows(userId);
                if (updatedWindows && updatedWindows.length > 0) {
                    // Select the first available chat
                    setActiveChatId(updatedWindows[0].id);
                    setActiveChatData(updatedWindows[0]);
                } else {
                    // No chats left, could redirect to a different view
                    setSelectedOption(null);
                }
            }
        } catch (error) {
            console.error("Failed to delete chat:", error);
            alert("Failed to delete chat. Please try again.");
        }
    };

    // Handler for selecting a chat window
    const handleSelectChatWindow = (chatWindow: any) => {
        // Check if we're currently generating in another chat
        const currentlyGenerating = activeChatId && generatingChats[activeChatId];

        if (currentlyGenerating && activeChatId !== chatWindow.id) {
            // If generating in a different chat, show warning
            const confirm = window.confirm(
                "You have a message being generated in another chat. Switching now may cause that message to be lost. Continue anyway?"
            );

            if (!confirm) {
                return; // User canceled, don't switch chats
            }
        }

        // Set the selected option to reply-help to show the chat interface
        setSelectedOption("reply-help");

        // Set this chat as active and ensure we set the correct activeChatData
        setActiveChatId(chatWindow.id);
        setActiveChatData(chatWindow);

        console.log(`Selected chat window: ${chatWindow.id}`);
    };

    // Handle chat mode change
    const handleChatModeChange = (mode: string) => {
        setChatMode(mode);
        // Save preference to localStorage
        localStorage.setItem("wingmanChatMode", mode);
    };

    // Show loading state while checking authentication
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Show login redirect message if not authenticated
    if (isAuthenticated === false) {
        return (
            <div className="min-h-screen bg-zinc-200 dark:bg-zinc-950 flex items-center justify-center">
                <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Not Logged In</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">Please log in to continue to Wingman.</p>
                    <button
                        onClick={() => (window.location.href = "/login")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }

    // Function to render the appropriate component based on selection
    const renderSelectedComponent = () => {
        switch (selectedOption) {
            case "love-calculator":
                return <LoveCalculator />;
            case "reply-help":
                // If there's no active chat but we're in reply-help view,
                // we might have just deleted the active chat
                if (!activeChatId && chatWindows.length === 0) {
                    return (
                        <div className="h-full bg-white dark:bg-zinc-900 shadow-md overflow-hidden flex flex-col justify-center items-center">
                            <div className="text-center p-6">
                                <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                                    No Active Chat
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                    The chat you were viewing has been deleted or no chats exist.
                                </p>
                                <button
                                    onClick={handleCreateChat}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors cursor-pointer"
                                >
                                    Create New Chat
                                </button>
                            </div>
                        </div>
                    );
                }

                // Prevent unnecessary recreation of ReplyHelp component
                const chatId = activeChatId || null;

                return (
                    <div className="h-full bg-white dark:bg-zinc-900 shadow-md overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
                            <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                                {activeChatData && activeChatData.responses && activeChatData.responses.length > 0
                                    ? `Chat: ${activeChatData.responses[0].prompt.substring(0, 40)}...`
                                    : "New Chat"}
                            </h1>

                            {/* Add chat mode selector alongside generating indicator */}
                            <div className="flex items-center space-x-3">
                                {/* Generating indicator */}
                                {chatId && generatingChats[chatId] && (
                                    <div className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-sm rounded-md flex items-center">
                                        <div className="animate-spin h-3 w-3 mr-2 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                        Generating...
                                    </div>
                                )}
                                {/* Chat mode selector */}
                                <div className="w-40">
                                    <ChatModeSelector
                                        selectedMode={chatMode}
                                        onModeSelect={handleChatModeChange}
                                        dropDirection="down"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ReplyHelp
                                chatId={chatId}
                                chatMode={chatMode}
                                onMessageSent={fetchChatWindows}
                                onGeneratingChange={(isGenerating) => {
                                    if (chatId) {
                                        setChartGenerating(chatId, isGenerating);
                                    }
                                }}
                                onChatModeSelect={handleChatModeChange}
                            />
                        </div>
                    </div>
                );
            case "dating-help":
                return <TinderReplyGenerator />;
            case "profile-description":
                return <TinderDescriptionGenerator />;
            case "welcome":
                return <WelcomeScreen />;
            default:
                // Return our welcome screen component
                return <WelcomeScreen />;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex overflow-hidden">
            {/* Sidebar with chat windows */}
            <Sidebar
                previousResponses={previousResponses}
                fetchingHistory={fetchingHistory || loadingChatWindows}
                onSelectResponse={loadPreviousResponse}
                onOptionSelect={setSelectedOption}
                selectedOption={selectedOption}
                chatWindows={chatWindows}
                onSelectChatWindow={handleSelectChatWindow}
                onCreateChat={handleCreateChat}
                onDeleteChat={handleDeleteChat}
                generatingChats={generatingChats}
                onRefresh={fetchChatWindows}
            />

            {/* Main content area that changes based on selection */}
            <main className="flex-1 overflow-y-auto h-screen">{renderSelectedComponent()}</main>
        </div>
    );
}
