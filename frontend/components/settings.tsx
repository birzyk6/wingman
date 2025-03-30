"use client";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

export default function SettingsButton() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/settings");
    };

    return (
        <button
            onClick={handleClick}
            className="flex p-2 dark:hover:bg-zinc-900 hover:bg-white cursor-pointer rounded-lg items-center justify-between flex-row w-full"
        >
            <span className="text-sm">Settings</span>
            <Settings className="w-4 h-4" />
        </button>
    );
}
