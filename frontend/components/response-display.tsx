interface ResponseDisplayProps {
    response: string;
    streaming: boolean;
    error: string;
}

export function ResponseDisplay({ response, streaming, error }: ResponseDisplayProps) {
    return (
        <>
            {error && (
                <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            {(response || streaming) && (
                <div className="mt-6">
                    <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-2">Response:</h2>
                    <div className="bg-zinc-50 dark:bg-zinc-700/50 p-4 rounded-md border border-zinc-200 dark:border-zinc-700 whitespace-pre-wrap dark:text-zinc-200">
                        {response}
                    </div>
                </div>
            )}
        </>
    );
}
