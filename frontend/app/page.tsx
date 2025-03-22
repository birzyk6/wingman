"use client";

import { Sidebar } from "@/components/sidebar";
import { PromptForm } from "@/components/prompt-input-form";
import { ResponseDisplay } from "@/components/response-display";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
    const {
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
    } = useAIAssistant();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
            {/* Sidebar for previous responses */}
            <Sidebar
                previousResponses={previousResponses}
                fetchingHistory={fetchingHistory}
                onSelectResponse={loadPreviousResponse}
            />

            {/* Main content area */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Wingman AI Assistant</h1>
                        <ThemeToggle />
                    </div>

                    <PromptForm prompt={prompt} loading={loading} onPromptChange={setPrompt} onSubmit={handleSubmit} />

                    <ResponseDisplay response={response} streaming={streaming} error={error} />
                </div>
            </div>
        </div>
    );
}
