"use client";

import { useState, useRef, useEffect } from "react";
import { generateTinderDescription, updateTinderDescription } from "@/services/api";
import { ArrowRight, RefreshCw, Copy, Save, Check, Edit, MessageSquareQuote } from "lucide-react";

interface DescriptionOption {
    id: string;
    label: string;
    options: { value: string; label: string }[];
}

export default function TinderDescriptionGenerator() {
    const [userBasics, setUserBasics] = useState({
        age: "",
        occupation: "",
        interests: "",
    });

    const [selectedOptions, setSelectedOptions] = useState({
        tone: "friendly",
        length: "medium",
        focus: "personality",
        humor: "moderate",
    });

    const [description, setDescription] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState("");

    // New state for user adjustments
    const [adjustmentMode, setAdjustmentMode] = useState(false);
    const [userAdjustments, setUserAdjustments] = useState("");

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const adjustmentTextAreaRef = useRef<HTMLTextAreaElement>(null);

    const descriptionOptions: DescriptionOption[] = [
        {
            id: "tone",
            label: "Tone",
            options: [
                { value: "friendly", label: "Friendly & Approachable" },
                { value: "confident", label: "Confident & Bold" },
                { value: "mysterious", label: "Mysterious & Intriguing" },
                { value: "professional", label: "Professional & Polished" },
                { value: "casual", label: "Casual & Relaxed" },
            ],
        },
        {
            id: "length",
            label: "Length",
            options: [
                { value: "short", label: "Short (50-75 words)" },
                { value: "medium", label: "Medium (75-150 words)" },
                { value: "long", label: "Long (150-200 words)" },
            ],
        },
        {
            id: "focus",
            label: "Focus On",
            options: [
                { value: "personality", label: "Personality & Character" },
                { value: "interests", label: "Hobbies & Interests" },
                { value: "goals", label: "Goals & Ambitions" },
                { value: "balanced", label: "Balanced Approach" },
            ],
        },
        {
            id: "humor",
            label: "Humor Level",
            options: [
                { value: "minimal", label: "Minimal" },
                { value: "moderate", label: "Moderate" },
                { value: "high", label: "Lots of Humor" },
            ],
        },
    ];

    const handleOptionChange = (optionId: string, value: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [optionId]: value,
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserBasics((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userBasics.age || !userBasics.occupation) {
            alert("Please fill in at least your age and occupation.");
            return;
        }

        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) {
            alert("You need to log in first!");
            return;
        }

        setIsGenerating(true);

        try {
            const result = await generateTinderDescription(parseInt(userId), userBasics, selectedOptions);

            setDescription(result.description);
            setEditedDescription(result.description);
            setIsEditing(false);

            // Clear any previous adjustments when generating a new description
            setUserAdjustments("");
            setAdjustmentMode(false);
        } catch (error) {
            console.error("Error generating description:", error);
            alert("Failed to generate description. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpdateDescription = async () => {
        if (!editedDescription.trim()) return;

        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) return;

        setIsGenerating(true);

        try {
            const result = await updateTinderDescription(
                parseInt(userId),
                editedDescription,
                userBasics,
                selectedOptions,
                userAdjustments // Pass the adjustments to the API
            );

            setDescription(result.description);
            setEditedDescription(result.description);
            setIsEditing(false);

            // Clear adjustments after they've been applied
            setUserAdjustments("");
            setAdjustmentMode(false);
        } catch (error) {
            console.error("Error updating description:", error);
            alert("Failed to update description. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(description);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const toggleEdit = () => {
        if (isEditing && editedDescription !== description) {
            if (window.confirm("Do you want to save your changes?")) {
                handleUpdateDescription();
                return;
            }
        }

        setIsEditing(!isEditing);
        setEditedDescription(description);

        // Focus the textarea when editing starts
        if (!isEditing && textAreaRef.current) {
            setTimeout(() => {
                textAreaRef.current?.focus();
            }, 100);
        }
    };

    // Toggle adjustment mode
    const toggleAdjustmentMode = () => {
        setAdjustmentMode(!adjustmentMode);

        // Focus the adjustments textarea when opened
        if (!adjustmentMode && adjustmentTextAreaRef.current) {
            setTimeout(() => {
                adjustmentTextAreaRef.current?.focus();
            }, 100);
        }
    };

    // Handle regeneration with adjustments
    const handleRegenerateWithAdjustments = async () => {
        if (!description || !userAdjustments.trim()) return;

        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) return;

        setIsGenerating(true);

        try {
            const result = await updateTinderDescription(
                parseInt(userId),
                description, // Use the current description as base
                userBasics,
                selectedOptions,
                userAdjustments // Pass the user's adjustment instructions
            );

            setDescription(result.description);
            setEditedDescription(result.description);

            // Keep adjustment mode open in case user wants to make further adjustments
        } catch (error) {
            console.error("Error regenerating with adjustments:", error);
            alert("Failed to regenerate description. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                <h1 className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">
                    Tinder Profile Description Generator
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Craft the perfect Tinder bio to showcase your personality and attract better matches.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
                    <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                        Tell us about yourself
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="age"
                                    className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                                >
                                    Age
                                </label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={userBasics.age}
                                    onChange={handleInputChange}
                                    placeholder="Your age"
                                    className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                    disabled={isGenerating}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="occupation"
                                    className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                                >
                                    Occupation
                                </label>
                                <input
                                    type="text"
                                    id="occupation"
                                    name="occupation"
                                    value={userBasics.occupation}
                                    onChange={handleInputChange}
                                    placeholder="Your job or studies"
                                    className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                    disabled={isGenerating}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="interests"
                                className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                            >
                                Interests & Hobbies
                            </label>
                            <textarea
                                id="interests"
                                name="interests"
                                value={userBasics.interests}
                                onChange={handleInputChange}
                                placeholder="Sports, books, travel, cooking, etc."
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[80px]"
                                disabled={isGenerating}
                            />
                        </div>

                        <h3 className="text-md font-medium mt-4 text-zinc-800 dark:text-zinc-200">
                            Customize Your Description
                        </h3>

                        {descriptionOptions.map((optionGroup) => (
                            <div key={optionGroup.id} className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                                    {optionGroup.label}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {optionGroup.options.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleOptionChange(optionGroup.id, option.value)}
                                            className={`px-3 py-1 text-sm rounded-full cursor-pointer ${
                                                selectedOptions[optionGroup.id as keyof typeof selectedOptions] ===
                                                option.value
                                                    ? "bg-green-500 text-white"
                                                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                                            }`}
                                            disabled={isGenerating}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isGenerating}
                                className={`px-4 py-2 w-full justify-center rounded-md text-white flex items-center cursor-pointer ${
                                    isGenerating ? "bg-green-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                                }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        Create Description
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {description && (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                                Your Tinder Description
                            </h2>
                            <div className="flex space-x-2">
                                {/* Add adjustment button */}
                                <button
                                    onClick={toggleAdjustmentMode}
                                    className={`p-2 px-4 cursor-pointer items-center flex flex-row space-x-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg ${
                                        adjustmentMode
                                            ? "text-green-500 dark:text-green-400"
                                            : "text-zinc-600 hover:text-green-500 dark:text-zinc-400 dark:hover:text-green-400"
                                    }`}
                                    title="Make adjustments"
                                    disabled={isGenerating}
                                >
                                    <p>Make adjustments</p>
                                    <MessageSquareQuote className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={toggleEdit}
                                    className="p-2 cursor-pointer text-zinc-600 hover:text-green-500 dark:text-zinc-400 dark:hover:text-green-400"
                                    title={isEditing ? "Save changes" : "Edit description"}
                                    disabled={isGenerating}
                                >
                                    {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                                </button>

                                <button
                                    onClick={handleCopy}
                                    className="p- cursor-pointer text-zinc-600 hover:text-green-500 dark:text-zinc-400 dark:hover:text-green-400"
                                    title="Copy to clipboard"
                                    disabled={isGenerating}
                                >
                                    {isCopied ? (
                                        <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Adjustment section */}
                        {adjustmentMode && (
                            <div className="mb-4 bg-zinc-50 dark:bg-zinc-900 rounded-md p-4 border border-green-200 dark:border-green-700">
                                <label
                                    htmlFor="adjustments"
                                    className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300"
                                >
                                    What adjustments would you like to make?
                                </label>
                                <textarea
                                    ref={adjustmentTextAreaRef}
                                    id="adjustments"
                                    value={userAdjustments}
                                    onChange={(e) => setUserAdjustments(e.target.value)}
                                    placeholder="Describe the changes you want, for example: 'Make it more humorous' or 'Include more about my love for hiking' or 'Remove the part about movies'"
                                    className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
                                    disabled={isGenerating}
                                />
                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={handleRegenerateWithAdjustments}
                                        disabled={isGenerating || !userAdjustments.trim()}
                                        className={`px-4 py-2 cursor-pointer rounded-md text-white flex items-center ${
                                            isGenerating || !userAdjustments.trim()
                                                ? "bg-green-400 cursor-not-allowed"
                                                : "bg-green-500 hover:bg-green-600"
                                        }`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                Applying...
                                            </>
                                        ) : (
                                            <>Apply Adjustments</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-4 border border-zinc-200 dark:border-zinc-700">
                            {isEditing ? (
                                <div className="relative">
                                    <textarea
                                        ref={textAreaRef}
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        className="w-full p-0 bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-800 dark:text-zinc-200 min-h-[200px] resize-none"
                                    />
                                    <div className="absolute bottom-2 right-2">
                                        <button
                                            onClick={handleUpdateDescription}
                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="whitespace-pre-line text-zinc-800 dark:text-zinc-200">
                                    {description}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                            <p>
                                You can make adjustments, edit manually, or generate a new description with different
                                options.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
