"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("wingmanUserId");
        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
            Logout
        </button>
    );
}
