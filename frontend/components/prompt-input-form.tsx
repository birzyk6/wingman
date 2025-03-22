interface PromptFormProps {
    prompt: string;
    loading: boolean;
    onPromptChange: (value: string) => void;
    onSubmit: () => void;
}

export function PromptForm({ prompt, loading, onPromptChange, onSubmit }: PromptFormProps) {
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ask anything:
                </label>
                <textarea
                    id="prompt"
                    rows={4}
                    className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    placeholder="Enter your question here..."
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                />
            </div>

            <button
                onClick={onSubmit}
                disabled={loading || !prompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
            >
                {loading ? "Generating..." : "Generate Response"}
            </button>
        </div>
    );
}
