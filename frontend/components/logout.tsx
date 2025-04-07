"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem("wingmanUserId");

        // Add a console log for debugging
        console.log("User logged out, wingmanUserId removed from localStorage");

        // Redirect to the login page
        router.push("/login");
    };

    return (
        <button onClick={handleLogout} className="flex items-center w-full p-2 btn ">
            <LogOut className="h-4 w-4 mr-2" />
            <span>Log Out</span>
        </button>
    );
}
