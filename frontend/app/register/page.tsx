"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserRegistration from "@/components/user-registration";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if user is already logged in
        const userId = localStorage.getItem("wingmanUserId");
        setIsAuthenticated(!!userId);

        if (userId) {
            // Redirect to home page if already logged in
            router.push("/");
        }
    }, [router]);

    // Show loading state while checking authentication
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const handleRegistration = (userId: string) => {
        // Check if userId is valid
        if (!userId || userId === "undefined" || userId === "null") {
            console.error("Registration handler received invalid userId:", userId);
            return;
        }

        // Log success message
        console.log("Registration successful, redirecting to home page with user ID:", userId);

        // Force localStorage clear and reset
        localStorage.clear();
        localStorage.setItem("wingmanUserId", userId);

        // Double check storage
        const storedId = localStorage.getItem("wingmanUserId");
        console.log("Verified stored userId:", storedId);

        // Longer delay to ensure localStorage is updated before navigation
        setTimeout(() => {
            // Redirect to home page after successful registration
            router.push("/");
        }, 200);
    };

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-2 flex items-center justify-center">
                        <UserPlus className="h-8 w-8 mr-2" />
                        Create an Account
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Join Wingman and start improving your dating game
                    </p>
                </div>

                <UserRegistration onRegistered={handleRegistration} />

                <div className="mt-6 text-center">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-center mt-2"
                        >
                            <LogIn className="h-4 w-4 mr-1" /> Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
