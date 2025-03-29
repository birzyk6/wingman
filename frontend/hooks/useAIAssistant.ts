import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ResponseData, fetchResponses, streamGenerateResponse } from "@/services/api";

export function useAIAssistant() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [previousResponses, setPreviousResponses] = useState<ResponseData[]>([]);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [streaming, setStreaming] = useState(false);

    // Load previous responses
    const loadResponses = useCallback(async () => {
        setFetchingHistory(true);
        try {
            const data = await fetchResponses();
            setPreviousResponses(data);
            return data;
        } catch (err) {
            console.error("Failed to fetch previous responses:", err);
            return [];
        } finally {
            setFetchingHistory(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadResponses();
    }, [loadResponses]);

    // Handle form submission
    const handleSubmit = async () => {
        if (!prompt.trim()) return;

        // get userId from local storage
        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) {
            setError("User ID not found. Please log in.");
            return;
        }
        const parsedUserId = parseInt(userId, 10);

        setLoading(true);
        setStreaming(true);
        setError("");
        setResponse(""); // Clear previous response

        try {
            await streamGenerateResponse(
                prompt,
                parsedUserId,
                (chunk) => setResponse((prev) => prev + chunk),
                async () => {
                    setStreaming(false);
                    // Refresh history after completion
                    await loadResponses();
                }
            );
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

    // Load a previous conversation
    const loadPreviousResponse = (responseData: ResponseData) => {
        setPrompt(responseData.prompt);
        setResponse(responseData.response);
    };

    return {
        prompt,
        setPrompt,
        response,
        loading,
        error,
        streaming,
        previousResponses,
        fetchingHistory,
        handleSubmit,
        loadPreviousResponse,
    };
}
