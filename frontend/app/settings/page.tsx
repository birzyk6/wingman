"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserSettings from "@/components/user-settings";
import { Settings, ChevronLeft, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        const userId = localStorage.getItem("wingmanUserId");
        setIsAuthenticated(!!userId);

        if (!userId) {
            // Redirect to home page if not logged in
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

    // Show not authorized message if not authenticated
    if (isAuthenticated === false) {
        return (
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Not Authorized</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        You need to be logged in to access this page.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950"
        >
            <header className="bg-white dark:bg-zinc-800 shadow-sm p-4 mb-6 border-b border-zinc-200 dark:border-zinc-700">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push("/")}
                            className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 flex items-center group cursor-pointer"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="ml-1 font-medium">Back</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <div className="flex items-center justify-center mb-8">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                            <Settings className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                        </div>
                        <h1 className="ml-4 text-3xl font-bold text-zinc-800 dark:text-zinc-100">Account Settings</h1>
                    </div>
                    <UserSettings />
                </motion.div>
            </main>

            <footer className="mt-12 py-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="max-w-7xl mx-auto px-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                    <p>Wingman © {new Date().getFullYear()} · Your AI Dating Assistant</p>
                </div>
            </footer>
        </motion.div>
    );
}
