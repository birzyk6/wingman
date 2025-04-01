"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("wingmanUserId");
        // Clear cookie
        document.cookie = "wingmanUserId=; path=/; max-age=0";

        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="flex p-2 dark:hover:bg-zinc-900 hover:bg-white cursor-pointer rounded-lg items-center justify-between flex-row w-full"
        >
            <span className="text-sm">Logout</span>
            <LogOut className="w-4 h-4" />
        </button>
    );
}
