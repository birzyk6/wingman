"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// Interface for response data
interface ResponseData {
    id: number;
    prompt: string;
    response: string;
    created_at: string;
}

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [previousResponses, setPreviousResponses] = useState<ResponseData[]>([]);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [streaming, setStreaming] = useState(false);

    // Fetch previous responses on component mount
    useEffect(() => {
        const fetchPreviousResponses = async () => {
            setFetchingHistory(true);
            try {
                const res = await axios.get("http://localhost:8000/api/responses/");
                setPreviousResponses(res.data);
            } catch (err) {
                console.error("Failed to fetch previous responses:", err);
            } finally {
                setFetchingHistory(false);
            }
        };

        fetchPreviousResponses();
    }, []);

    const handleSubmit = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setStreaming(true);
        setError("");
        setResponse(""); // Clear previous response

        try {
            // For streaming, we'll use the Fetch API directly instead of axios
            const response = await fetch("http://localhost:8000/api/generate/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt, stream: true }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            // Handle the event stream
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Failed to get response reader");
            }

            // Process the streaming response
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode the chunk and add to buffer
                buffer += decoder.decode(value, { stream: true });

                // Process any complete SSE messages in the buffer
                let boundary = buffer.indexOf("\n\n");
                while (boundary > -1) {
                    const line = buffer.substring(0, boundary);
                    buffer = buffer.substring(boundary + 2);

                    if (line.startsWith("data: ")) {
                        try {
                            const eventData = JSON.parse(line.substring(6));
                            if (eventData.chunk) {
                                setResponse((prev) => prev + eventData.chunk);
                            }
                            if (eventData.done) {
                                setStreaming(false);
                                // Refresh history after completion
                                const historyRes = await axios.get("http://localhost:8000/api/responses/");
                                setPreviousResponses(historyRes.data);
                                break;
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data:", e);
                        }
                    }

                    boundary = buffer.indexOf("\n\n");
                }
            }
        } catch (err) {
            console.error("Error:", err);
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    setError(`Server error: ${err.response.data.error || err.message}`);
                } else if (err.request) {
                    setError("No response from server. Is the backend running?");
                } else {
                    setError(`Error: ${err.message}`);
                }
            } else {
                setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
            }
        } finally {
            setLoading(false);
            setStreaming(false);
        }
    };

    // Function to load a previous conversation
    const loadPreviousResponse = (responseData: ResponseData) => {
        setPrompt(responseData.prompt);
        setResponse(responseData.response);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar for previous responses */}
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto max-h-screen">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-800">Previous Responses</h2>
                </div>
                <div className="overflow-y-auto">
                    {fetchingHistory ? (
                        <div className="p-4 text-center text-gray-500">Loading history...</div>
                    ) : previousResponses.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No previous responses</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {previousResponses.map((item) => (
                                <li key={item.id} className="hover:bg-gray-50 cursor-pointer">
                                    <button onClick={() => loadPreviousResponse(item)} className="p-4 w-full text-left">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {item.prompt.length > 30
                                                ? item.prompt.substring(0, 30) + "..."
                                                : item.prompt}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(item.created_at).toLocaleString()}
                                        </p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Wingman AI Assistant</h1>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                                Ask anything:
                            </label>
                            <textarea
                                id="prompt"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your question here..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !prompt.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Generating..." : "Generate Response"}
                        </button>

                        {error && (
                            <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>
                        )}

                        {(response || streaming) && (
                            <div className="mt-6">
                                <h2 className="text-lg font-medium text-gray-800 mb-2">Response:</h2>
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
                                    {response}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
