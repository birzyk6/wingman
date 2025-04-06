"use client";

import { useState, useRef, useEffect } from "react";
import { streamGenerateResponse, getChatHistory, getAllChatWindows } from "@/services/api";
import { SendIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
// Remove the ChatModeSelector import since we're moving it to page.tsx
// import { ChatModeSelector } from "./chat-mode-selector";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

// Update props interface - can keep onChatModeSelect for future use if needed
interface ReplyHelpProps {
    chatId?: number | null;
    chatMode?: string;
    onMessageSent?: () => Promise<void> | void;
    onGeneratingChange?: (isGenerating: boolean) => void;
    onChatModeSelect?: (mode: string) => void;
}

export default function ReplyHelp({
    chatId,
    chatMode = "basic",
    onMessageSent,
    onGeneratingChange,
    onChatModeSelect,
}: ReplyHelpProps) {
    const [inputMessage, setInputMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentResponse, setCurrentResponse] = useState("");
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const responseRef = useRef<string>("");

    // Track the current chatId in a ref to avoid useEffect dependency issues
    const currentChatIdRef = useRef<number | null | undefined>(chatId);
    // Track if we've loaded history for this chat
    const hasLoadedHistoryRef = useRef<boolean>(false);

    // Simple function to check if a chat ID is valid
    const isValidChatId = (id: any): boolean => {
        return id !== null && id !== undefined && typeof id === "number" && !isNaN(id);
    };

    // Function to load chat history - extracted outside useEffect
    const loadChatHistory = async (id: number) => {
        // Skip if already loading or invalid ID
        if (isLoadingHistory || !isValidChatId(id)) return;

        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) return;

        try {
            setIsLoadingHistory(true);
            console.log(`Loading chat history for chat ID: ${id}`);

            // Clear messages to show loading state
            setMessages([]);

            const history = await getChatHistory(userId, id);

            // Component might have unmounted or chat changed during the async call
            // Only proceed if we're still on the same chat
            if (currentChatIdRef.current !== id) return;

            if (history && Array.isArray(history)) {
                const formattedMessages: Message[] = [];

                for (const msg of history) {
                    if (msg && msg.prompt && msg.created_at) {
                        formattedMessages.push({
                            role: "user",
                            content: msg.prompt,
                            timestamp: new Date(msg.created_at),
                        });

                        if (msg.response) {
                            formattedMessages.push({
                                role: "assistant",
                                content: msg.response,
                                timestamp: new Date(msg.created_at),
                            });
                        }
                    }
                }

                formattedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
                setMessages(formattedMessages);
            }

            // Mark as loaded for this chat ID
            hasLoadedHistoryRef.current = true;
        } catch (error) {
            console.error(`Failed to load chat history for chat ID ${id}:`, error);
        } finally {
            if (currentChatIdRef.current === id) {
                setIsLoadingHistory(false);
            }
        }
    };

    // Handle chat ID changes without infinite loops
    useEffect(() => {
        // Update the ref with current chat ID
        const prevChatId = currentChatIdRef.current;
        currentChatIdRef.current = chatId;

        // If chat ID changed, reset loaded state
        if (prevChatId !== chatId) {
            hasLoadedHistoryRef.current = false;
            // Clear messages if there's no valid chat ID
            if (!isValidChatId(chatId)) {
                setMessages([]);
            }
        }

        // Load history if we have a valid chat ID and haven't loaded yet
        if (isValidChatId(chatId) && !hasLoadedHistoryRef.current) {
            // Small timeout to prevent potential race conditions
            const loadTimer = setTimeout(() => {
                loadChatHistory(chatId as number);
            }, 10);
            return () => clearTimeout(loadTimer);
        }
    }, [chatId]);

    // Notify parent about generating state - with extra safety
    useEffect(() => {
        if (onGeneratingChange && isValidChatId(chatId)) {
            onGeneratingChange(isGenerating);
        }

        return () => {
            // If component unmounts while generating, call with false
            if (isGenerating && onGeneratingChange && isValidChatId(chatId)) {
                onGeneratingChange(false);
            }
        };
    }, [isGenerating, chatId]);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, currentResponse]);

    // Add a function to refresh chat windows list in parent component
    const refreshChatWindows = async () => {
        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) return;

        try {
            // This will update the global state, which will be reflected in the sidebar
            await getAllChatWindows(userId);
        } catch (error) {
            console.error("Failed to refresh chat windows:", error);
        }
    };

    // Add state for context handling
    const [isContextActive] = useState<boolean>(true); // Default to true as requested

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || isGenerating || !chatId) return;

        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) {
            alert("You need to log in first!");
            return;
        }

        // Add user message to chat
        const userMessage: Message = {
            role: "user",
            content: inputMessage,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        const promptText = inputMessage;
        setInputMessage("");
        setIsGenerating(true);
        if (onGeneratingChange) onGeneratingChange(true);
        setCurrentResponse("");
        responseRef.current = ""; // Reset reference

        try {
            let accumulatedResponse = ""; // Local variable to accumulate response

            // Stream the response, passing chatId to ensure we use the correct chat window
            // And now include the isContextActive flag and chat mode
            await streamGenerateResponse(
                promptText,
                parseInt(userId),
                (chunk) => {
                    accumulatedResponse += chunk; // Add to local variable
                    responseRef.current = accumulatedResponse; // Update ref
                    setCurrentResponse(accumulatedResponse); // Update state
                },
                async () => {
                    // When streaming is complete, add the full response as a message
                    const finalContent = accumulatedResponse; // Use local variable

                    // Use a callback function form to ensure we have the latest state
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            role: "assistant",
                            content: finalContent,
                            timestamp: new Date(),
                        },
                    ]);

                    setCurrentResponse("");
                    responseRef.current = "";
                    setIsGenerating(false);
                    if (onGeneratingChange) onGeneratingChange(false);

                    // Refresh chat windows after sending a message
                    refreshChatWindows();

                    // Call the onMessageSent callback if provided
                    if (onMessageSent) {
                        await onMessageSent();
                    }
                },
                chatId, // Pass the chatId parameter to the API call
                undefined, // Don't pass context since backend will handle it
                isContextActive, // Pass the context active flag
                chatMode // Pass the chat mode to the API
            );
        } catch (error) {
            console.error("Error generating response:", error);
            setIsGenerating(false);
            if (onGeneratingChange) onGeneratingChange(false);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an error trying to respond. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Remove the ChatModeSelector from here */}

            {/* Chat messages area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {!chatId ? (
                    <div className="text-center text-zinc-500 dark:text-zinc-400 my-8">
                        <p className="mb-2">No active chat selected.</p>
                        <p>Please select or create a chat to begin.</p>
                    </div>
                ) : isLoadingHistory ? (
                    <div className="text-center text-zinc-500 dark:text-zinc-400 my-8">
                        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p>Loading conversation history...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-zinc-500 dark:text-zinc-400 my-8">
                        <p className="mb-2">Need help with a conversation?</p>
                        <p>Send a message to get started!</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                    message.role === "user"
                                        ? "bg-blue-500 text-white"
                                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                                }`}
                            >
                                {message.role === "user" ? (
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                ) : (
                                    <div className="markdown-content">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeSanitize]}
                                            components={{
                                                // Custom styling for markdown components
                                                h1: ({ node, ...props }) => (
                                                    <h1 className="text-xl font-bold my-2" {...props} />
                                                ),
                                                h2: ({ node, ...props }) => (
                                                    <h2 className="text-lg font-bold my-2" {...props} />
                                                ),
                                                h3: ({ node, ...props }) => (
                                                    <h3 className="text-md font-bold my-1" {...props} />
                                                ),
                                                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                                                ul: ({ node, ...props }) => (
                                                    <ul className="list-disc pl-5 my-2" {...props} />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <ol className="list-decimal pl-5 my-2" {...props} />
                                                ),
                                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                a: ({ node, ...props }) => (
                                                    <a className="text-blue-500 hover:underline" {...props} />
                                                ),
                                                code: ({ node, ...props }) => (
                                                    <code
                                                        className="block bg-zinc-300 dark:bg-zinc-700 p-2 rounded text-sm overflow-x-auto my-2"
                                                        {...props}
                                                    />
                                                ),
                                                pre: ({ node, ...props }) => (
                                                    <pre
                                                        className="bg-zinc-300 dark:bg-zinc-700 p-0 rounded overflow-x-auto my-2"
                                                        {...props}
                                                    />
                                                ),
                                                blockquote: ({ node, ...props }) => (
                                                    <blockquote
                                                        className="border-l-4 border-zinc-400 dark:border-zinc-600 pl-3 italic my-2"
                                                        {...props}
                                                    />
                                                ),
                                                table: ({ node, ...props }) => (
                                                    <table className="border-collapse w-full my-2" {...props} />
                                                ),
                                                th: ({ node, ...props }) => (
                                                    <th
                                                        className="border border-zinc-400 dark:border-zinc-600 px-2 py-1 bg-zinc-300 dark:bg-zinc-700"
                                                        {...props}
                                                    />
                                                ),
                                                td: ({ node, ...props }) => (
                                                    <td
                                                        className="border border-zinc-400 dark:border-zinc-600 px-2 py-1"
                                                        {...props}
                                                    />
                                                ),
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                                <div
                                    className={`text-xs mt-1 ${
                                        message.role === "user" ? "text-blue-100" : "text-zinc-500 dark:text-zinc-400"
                                    }`}
                                >
                                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Streaming response message */}
                {isGenerating && currentResponse && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                            <div className="markdown-content">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeSanitize]}
                                    components={{
                                        // Same custom styling as above
                                        h1: ({ node, ...props }) => (
                                            <h1 className="text-xl font-bold my-2" {...props} />
                                        ),
                                        h2: ({ node, ...props }) => (
                                            <h2 className="text-lg font-bold my-2" {...props} />
                                        ),
                                        h3: ({ node, ...props }) => (
                                            <h3 className="text-md font-bold my-1" {...props} />
                                        ),
                                        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                                        ol: ({ node, ...props }) => (
                                            <ol className="list-decimal pl-5 my-2" {...props} />
                                        ),
                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                        a: ({ node, ...props }) => (
                                            <a className="text-blue-500 hover:underline" {...props} />
                                        ),
                                        code: ({ node, ...props }) => (
                                            <code
                                                className="block bg-zinc-300 dark:bg-zinc-700 p-2 rounded text-sm overflow-x-auto my-2"
                                                {...props}
                                            />
                                        ),
                                        pre: ({ node, ...props }) => (
                                            <pre
                                                className="bg-zinc-300 dark:bg-zinc-700 p-0 rounded overflow-x-auto my-2"
                                                {...props}
                                            />
                                        ),
                                        blockquote: ({ node, ...props }) => (
                                            <blockquote
                                                className="border-l-4 border-zinc-400 dark:border-zinc-600 pl-3 italic my-2"
                                                {...props}
                                            />
                                        ),
                                        table: ({ node, ...props }) => (
                                            <table className="border-collapse w-full my-2" {...props} />
                                        ),
                                        th: ({ node, ...props }) => (
                                            <th
                                                className="border border-zinc-400 dark:border-zinc-600 px-2 py-1 bg-zinc-300 dark:bg-zinc-700"
                                                {...props}
                                            />
                                        ),
                                        td: ({ node, ...props }) => (
                                            <td
                                                className="border border-zinc-400 dark:border-zinc-600 px-2 py-1"
                                                {...props}
                                            />
                                        ),
                                    }}
                                >
                                    {currentResponse}
                                </ReactMarkdown>
                            </div>
                            <div className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
                                <span className="animate-pulse">Typing...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={chatId ? "Type your message here..." : "Select a chat to begin messaging"}
                        className="flex-1 p-3 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        disabled={isGenerating || !chatId}
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || isGenerating || !chatId}
                        className={`p-3 rounded-md text-white cursor-pointer ${
                            !inputMessage.trim() || isGenerating || !chatId
                                ? "bg-blue-300 dark:bg-blue-800 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                        }`}
                    >
                        <SendIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
