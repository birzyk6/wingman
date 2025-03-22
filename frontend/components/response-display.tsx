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
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Response:</h2>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border border-gray-200 dark:border-gray-700 whitespace-pre-wrap dark:text-gray-200">
                        {response}
                    </div>
                </div>
            )}
        </>
    );
}
