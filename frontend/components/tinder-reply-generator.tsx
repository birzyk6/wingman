"use client";

import { useState, useRef, useEffect } from "react";
import { streamTinderReplies } from "@/services/api";
import { SendIcon, Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface ReplyOption {
    content: string;
    copied: boolean;
    isPlaceholder?: boolean;
}

export default function TinderReplyGenerator() {
    const [tinderMessage, setTinderMessage] = useState("");
    const [userIntention, setUserIntention] = useState("date");
    const [responseStyle, setResponseStyle] = useState("flirty");
    const [isGenerating, setIsGenerating] = useState(false);
    const [replyOptions, setReplyOptions] = useState<ReplyOption[]>([]);
    const [currentStreamingText, setCurrentStreamingText] = useState("");
    const [generationProgress, setGenerationProgress] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Predefined intention options
    const intentionOptions = [
        { value: "date", label: "Secure a Date" },
        { value: "casual", label: "Keep it Casual" },
        { value: "serious", label: "Build a Relationship" },
        { value: "hookup", label: "Quick Hookup" },
        { value: "friendship", label: "Just Friendship" },
    ];

    // Predefined style options
    const styleOptions = [
        { value: "flirty", label: "Flirty & Playful" },
        { value: "funny", label: "Humorous" },
        { value: "confident", label: "Confident & Direct" },
        { value: "mysterious", label: "Mysterious & Intriguing" },
        { value: "intellectual", label: "Intellectual & Deep" },
        { value: "casual", label: "Casual & Relaxed" },
    ];

    // Scroll to bottom whenever new replies are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [replyOptions, currentStreamingText]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!tinderMessage.trim() || isGenerating) return;

        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) {
            alert("You need to log in first!");
            return;
        }

        setIsGenerating(true);
        // Create placeholder responses
        const placeholders = Array(5)
            .fill(null)
            .map((_, i) => ({
                content: `Generating reply option ${i + 1}...`,
                copied: false,
                isPlaceholder: true,
            }));
        setReplyOptions(placeholders);
        setCurrentStreamingText("");
        setGenerationProgress(0);

        try {
            let accumulatedText = "";

            await streamTinderReplies(
                tinderMessage,
                userIntention,
                responseStyle,
                parseInt(userId),
                (chunk) => {
                    accumulatedText += chunk;
                    // Instead of showing the streaming text directly, update the progress
                    // This is a rough estimate based on typical response length
                    const progress = Math.min(Math.floor((accumulatedText.length / 500) * 100), 99);
                    setGenerationProgress(progress);
                },
                () => {
                    // When streaming is complete, parse the replies from the accumulated text
                    setCurrentStreamingText("");
                    setGenerationProgress(100);

                    // Try to extract numbered replies from the text
                    const replyList: string[] = [];

                    // First try to match numbered patterns like "1. Reply" or "1) Reply"
                    const numberedPattern = /(\d+[\.\)]\s*)([^\d\.\)].+?)(?=\s*\d+[\.\)]|$)/g;
                    let match;
                    while ((match = numberedPattern.exec(accumulatedText)) !== null) {
                        if (match[2] && match[2].trim()) {
                            replyList.push(match[2].trim());
                        }
                    }

                    // If we couldn't find numbered replies, try splitting by newlines
                    if (replyList.length === 0) {
                        const lines = accumulatedText.split("\n").filter(
                            (line) =>
                                line.trim() &&
                                !line.trim().match(/^(\d+[\.\)]?)$/) && // Skip lines that are just numbers
                                !line.trim().match(/^options$/i) // Skip headings
                        );

                        for (const line of lines) {
                            // Remove numbering if present
                            const cleanLine = line.trim().replace(/^\d+[\.\)]\s*/, "");
                            if (cleanLine) {
                                replyList.push(cleanLine);
                            }
                        }
                    }

                    // If we still don't have any replies, use the whole text as one option
                    if (replyList.length === 0 && accumulatedText.trim()) {
                        replyList.push(accumulatedText.trim());
                    }

                    // Ensure we have exactly 5 replies (pad or truncate as needed)
                    const finalReplies = replyList.slice(0, 5);
                    while (finalReplies.length < 5) {
                        finalReplies.push(`Reply option ${finalReplies.length + 1} (AI couldn't generate this option)`);
                    }

                    // Set the reply options
                    setReplyOptions(
                        finalReplies.map((reply) => ({
                            content: reply,
                            copied: false,
                        }))
                    );

                    setIsGenerating(false);
                }
            );
        } catch (error) {
            console.error("Error generating Tinder replies:", error);
            setIsGenerating(false);
            setReplyOptions([
                {
                    content: "Sorry, an error occurred while generating replies. Please try again.",
                    copied: false,
                },
            ]);
        }
    };

    const copyToClipboard = (index: number) => {
        const textToCopy = replyOptions[index].content;
        navigator.clipboard.writeText(textToCopy).then(
            () => {
                const updatedOptions = [...replyOptions];
                updatedOptions[index] = { ...updatedOptions[index], copied: true };
                setReplyOptions(updatedOptions);

                // Reset copied status after 2 seconds
                setTimeout(() => {
                    const resetOptions = [...replyOptions];
                    resetOptions[index] = { ...resetOptions[index], copied: false };
                    setReplyOptions(resetOptions);
                }, 2000);
            },
            (err) => {
                console.error("Could not copy text: ", err);
            }
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                <h1 className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">Tinder Reply Generator</h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Paste the message you received, set your intentions and preferred style, and get reply suggestions.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
                    <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Message Details</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="tinder-message"
                                className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                            >
                                Message You Received
                            </label>
                            <textarea
                                id="tinder-message"
                                value={tinderMessage}
                                onChange={(e) => setTinderMessage(e.target.value)}
                                placeholder="Paste the message you received on Tinder..."
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
                                disabled={isGenerating}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="intention"
                                    className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                                >
                                    Your Intention
                                </label>
                                <select
                                    id="intention"
                                    value={userIntention}
                                    onChange={(e) => setUserIntention(e.target.value)}
                                    className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                    disabled={isGenerating}
                                >
                                    {intentionOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="style"
                                    className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                                >
                                    Response Style
                                </label>
                                <select
                                    id="style"
                                    value={responseStyle}
                                    onChange={(e) => setResponseStyle(e.target.value)}
                                    className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                    disabled={isGenerating}
                                >
                                    {styleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={!tinderMessage.trim() || isGenerating}
                                className={`px-4 py-2 rounded-md text-white flex items-center ${
                                    !tinderMessage.trim() || isGenerating
                                        ? "bg-purple-400 cursor-not-allowed"
                                        : "bg-purple-500 hover:bg-purple-600"
                                }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Generating Replies...
                                    </>
                                ) : (
                                    <>
                                        Generate Reply Options
                                        <Sparkles className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {isGenerating && (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                                    Generating Replies
                                </h2>
                                <span className="text-sm text-purple-600 dark:text-purple-400">
                                    {generationProgress}%
                                </span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-2">
                                <div
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-200 ease-out"
                                    style={{ width: `${generationProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {replyOptions.length > 0 && !replyOptions[0].isPlaceholder && (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Reply Options</h2>
                            <div className="text-sm text-zinc-500 dark:text-zinc-400">Click on a reply to copy it</div>
                        </div>

                        <div className="space-y-3">
                            {replyOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-4 border border-zinc-200 dark:border-zinc-700 relative group hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer"
                                    onClick={() => copyToClipboard(index)}
                                >
                                    <div className="pr-8 text-zinc-800 dark:text-zinc-200">{option.content}</div>
                                    <div className="absolute top-4 right-4 text-zinc-400 group-hover:text-purple-500 dark:text-zinc-500 dark:group-hover:text-purple-400">
                                        {option.copied ? (
                                            <Check className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <Copy className="h-5 w-5" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                            <p>
                                You can generate new replies by changing your message or preferences and clicking
                                "Generate" again.
                            </p>
                        </div>
                    </div>
                )}

                {replyOptions.length > 0 && replyOptions[0].isPlaceholder && (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                            Generating Replies...
                        </h2>
                        <div className="space-y-3">
                            {replyOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-4 border border-zinc-200 dark:border-zinc-700 animate-pulse"
                                >
                                    <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
