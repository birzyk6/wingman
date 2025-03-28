import { ResponseData } from "@/services/api";

interface SidebarProps {
    previousResponses: ResponseData[];
    fetchingHistory: boolean;
    onSelectResponse: (response: ResponseData) => void;
}

export function Sidebar({ previousResponses, fetchingHistory, onSelectResponse }: SidebarProps) {
    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto max-h-screen">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Previous Responses</h2>
            </div>
            <div className="overflow-y-auto">
                {fetchingHistory ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading history...</div>
                ) : previousResponses.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">No previous responses</div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {previousResponses.map((item) => (
                            <li key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                <button onClick={() => onSelectResponse(item)} className="p-4 w-full text-left">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {item.prompt.length > 30 ? item.prompt.substring(0, 30) + "..." : item.prompt}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(item.created_at).toLocaleString()}
                                    </p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
