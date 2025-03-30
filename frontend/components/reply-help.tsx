"use client";

import { useState } from "react";

export default function ReplyHelp() {
    const [message, setMessage] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const generateReplies = () => {
        if (!message) return;

        setLoading(true);
        setSuggestions([]);

        // Simulate API call with timeout
        setTimeout(() => {
            const demoSuggestions = [
                "I'd love to grab coffee sometime! How's your schedule looking this week?",
                "That's really interesting! I've been thinking about that too. Wanna discuss over drinks?",
                "Haha, I totally get what you mean. We should hang out and talk more about it.",
                "I'm glad we matched! Your profile caught my eye.",
            ];
            setSuggestions(demoSuggestions);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <p className="text-zinc-700 dark:text-zinc-300">
                Paste the message you received, and I'll help you craft the perfect reply!
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Their Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
                        placeholder="Paste the message you received here"
                    />
                </div>

                <button
                    onClick={generateReplies}
                    disabled={!message || loading}
                    className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
                        !message || loading
                            ? "bg-blue-300 dark:bg-blue-800 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                    }`}
                >
                    {loading ? "Thinking..." : "Generate Reply Suggestions"}
                </button>
            </div>

            {loading && (
                <div className="flex justify-center my-6">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="space-y-4 mt-6">
                    <h3 className="font-medium text-zinc-800 dark:text-zinc-200">Suggested Replies:</h3>
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                        >
                            <p className="text-zinc-800 dark:text-zinc-200">{suggestion}</p>
                            <button
                                className="mt-2 text-xs bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                                onClick={() => navigator.clipboard.writeText(suggestion)}
                            >
                                Copy to clipboard
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
