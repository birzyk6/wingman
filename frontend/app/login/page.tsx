"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        setIsLoading(true);

        try {
            const userData = await loginUser(email, password);

            // Make sure userId is a string and stored properly
            if (!userData || !userData.id) {
                throw new Error("Invalid user data received");
            }

            const userId = userData.id.toString();
            console.log("Login successful. User ID before storage:", userId);

            // Force localStorage clear and reset
            localStorage.clear();
            localStorage.setItem("wingmanUserId", userId);

            // Set cookie for middleware (30 days expiry)
            document.cookie = `wingmanUserId=${userId}; path=/; max-age=2592000`;

            // Double check storage
            const storedId = localStorage.getItem("wingmanUserId");
            console.log("Verified stored userId:", storedId);

            // Set authentication state
            setIsAuthenticated(true);

            // Add a small delay before navigation to ensure localStorage is updated
            setTimeout(() => {
                // Redirect to home page
                router.push("/");
            }, 100);
        } catch (error: any) {
            const errorMsg = error?.response?.data?.error || "Login failed. Please check your credentials.";
            setError(errorMsg);
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-2 flex items-center justify-center">
                        <LogIn className="h-8 w-8 mr-2" />
                        Log In to Wingman
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">Continue your dating journey</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-md"
                >
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 p-3 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                                >
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 p-3 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                                    placeholder="Your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center p-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Log In <LogIn className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                <div className="mt-6 text-center">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-center mt-2"
                        >
                            <UserPlus className="h-4 w-4 mr-1" /> Register Now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
