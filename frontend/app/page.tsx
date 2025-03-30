"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { PromptForm } from "@/components/prompt-input-form";
import { ResponseDisplay } from "@/components/response-display";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import LoveCalculator from "@/components/love-calculator";
import ReplyHelp from "@/components/reply-help";

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

    // Add state to track the selected option
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Function to render the appropriate component based on selection
    const renderSelectedComponent = () => {
        switch (selectedOption) {
            case "love-calculator":
                return <LoveCalculator />;
            case "reply-help":
                return (
                    <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden p-6">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Wingman: Reply Help</h1>
                        </div>
                        <ReplyHelp />
                    </div>
                );
            // case "describe-yourself":
            //     return <DescribeYourself />;
            // case "dating-help":
            //     return <DatingHelp />;
            default:
                return (
                    <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden p-6">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                                Wingman AI Assistant
                            </h1>
                        </div>
                        <PromptForm
                            prompt={prompt}
                            loading={loading}
                            onPromptChange={setPrompt}
                            onSubmit={handleSubmit}
                        />
                        <ResponseDisplay response={response} streaming={streaming} error={error} />
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex">
            {/* Sidebar with option selection capability */}
            <Sidebar
                previousResponses={previousResponses}
                fetchingHistory={fetchingHistory}
                onSelectResponse={loadPreviousResponse}
                onOptionSelect={setSelectedOption}
                selectedOption={selectedOption}
            />

            {/* Main content area that changes based on selection */}
            <div className="flex-1 overflow-y-auto">{renderSelectedComponent()}</div>
        </div>
    );
}
