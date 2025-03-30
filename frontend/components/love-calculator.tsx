"use client";

import { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { calculateLoveScore } from "@/services/api";

export default function LoveCalculator() {
    const [yourName, setYourName] = useState("");
    const [theirName, setTheirName] = useState("");
    const [result, setResult] = useState<number | null>(null);
    const [displayedResult, setDisplayedResult] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState("Calculating");
    const [showMessage, setShowMessage] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);

    // Effect to animate percentage from 0 to result
    useEffect(() => {
        if (result !== null) {
            setDisplayedResult(0);
            const duration = 2000; // 2 seconds for the animation
            const interval = 20; // Update every 20ms
            const steps = duration / interval;
            const increment = result / steps;
            let current = 0;
            let timer: NodeJS.Timeout;

            const animate = () => {
                current += increment;
                if (current >= result) {
                    setDisplayedResult(result);
                    clearInterval(timer);

                    // Show the message after the animation completes
                    setTimeout(() => {
                        setShowMessage(true);
                        // Scroll to the result
                        resultRef.current?.scrollIntoView({ behavior: "smooth" });
                    }, 500);
                } else {
                    setDisplayedResult(Math.floor(current));
                }
            };

            timer = setInterval(animate, interval);
            return () => clearInterval(timer);
        }
    }, [result]);

    // Effect to update loading message
    useEffect(() => {
        if (loading) {
            let dots = 0;
            const loadingMessages = [
                "Analyzing compatibility",
                "Consulting the stars",
                "Reading your romantic future",
                "Matching your energies",
                "Calculating love potential",
            ];
            let messageIndex = 0;

            const timer = setInterval(() => {
                dots = (dots + 1) % 4;
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(`${loadingMessages[messageIndex]}${".".repeat(dots)}`);
            }, 1500);

            return () => clearInterval(timer);
        }
    }, [loading]);

    const handleCalculateLove = async () => {
        if (!yourName || !theirName) return;

        setLoading(true);
        setError(null);
        setMessage(null);
        setResult(null);
        setShowMessage(false);

        try {
            // Use the API service function instead of direct axios call
            const response = await calculateLoveScore(yourName, theirName);

            // Update state with the response data
            setResult(response.love_score);
            setMessage(response.message);
        } catch (err: any) {
            console.error("Failed to calculate love score:", err);
            setError(err.response?.data?.error || "Failed to calculate love score. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen p-4">
            {/* Input Section */}
            <div className="w-full p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-md mb-6">
                <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-6 text-center">
                    Love Calculator
                </h1>

                <p className="text-zinc-700 dark:text-zinc-300 mb-8 text-center">
                    Enter your name and your crush's name to calculate your compatibility!
                </p>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={yourName}
                                onChange={(e) => setYourName(e.target.value)}
                                className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Their Name
                            </label>
                            <input
                                type="text"
                                value={theirName}
                                onChange={(e) => setTheirName(e.target.value)}
                                className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                placeholder="Enter their name"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCalculateLove}
                        disabled={!yourName || !theirName || loading}
                        className={`w-full flex items-center justify-center py-3 px-4 rounded-md text-white text-lg transition-colors ${
                            !yourName || !theirName || loading
                                ? "bg-pink-300 dark:bg-pink-800 cursor-not-allowed animate-pulse"
                                : "bg-pink-500 hover:bg-pink-600 dark:bg-pink-700 dark:hover:bg-pink-800"
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>{loadingMessage}</span>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <Heart className="mr-2 h-5 w-5" />
                                <span>Calculate Love Match</span>
                            </div>
                        )}
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                        {error}
                    </div>
                )}
            </div>

            {/* Results Section - Separately below inputs */}
            {result !== null && !error && (
                <div
                    ref={resultRef}
                    className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow-md p-8 transition-all duration-500 ease-in-out transform"
                >
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-pink-800 dark:text-pink-300 mb-6">Love Score Results</h3>

                        <div className="relative">
                            <div className="mx-auto py-4 flex items-center justify-center rounded-full">
                                <div className="text-5xl font-extrabold text-pink-600 dark:text-pink-400">
                                    {displayedResult}%
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center space-x-2 mb-6">
                            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300">{yourName}</span>
                            <Heart className="h-5 w-5 text-pink-500" />
                            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300">{theirName}</span>
                        </div>

                        <div
                            className={`mt-8 transition-opacity duration-500 ${
                                showMessage ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <div className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-lg border border-pink-200 dark:border-pink-800 mb-8">
                                <p className="text-lg text-pink-700 dark:text-pink-300 whitespace-pre-line">
                                    {message}
                                </p>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => {
                                        setYourName("");
                                        setTheirName("");
                                        setResult(null);
                                        setMessage(null);
                                        setShowMessage(false);
                                    }}
                                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-800 dark:text-zinc-200 transition-colors"
                                >
                                    Try Another Pair
                                </button>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${yourName} and ${theirName} have a love score of ${result}%! ${message}`
                                        );
                                        alert("Result copied to clipboard!");
                                    }}
                                    className="px-4 py-2 bg-pink-100 dark:bg-pink-800 hover:bg-pink-200 dark:hover:bg-pink-700 rounded-md text-pink-800 dark:text-pink-200 transition-colors"
                                >
                                    Share Results!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty space at the bottom for scrolling */}
            <div className="flex-grow"></div>
        </div>
    );
}
