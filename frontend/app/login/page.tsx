"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    // Check if already logged in
    useEffect(() => {
        const userId = localStorage.getItem("wingmanUserId");
        if (userId) {
            router.push("/");
        }
    }, [router]);

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/login_user/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) throw new Error("Invalid credentials");
            const data = await response.json();

            // Store user info (id, etc.) in local storage or context
            localStorage.setItem("wingmanUserId", data.id);

            // Also set a cookie for middleware to use
            document.cookie = `wingmanUserId=${data.id}; path=/; max-age=86400`;

            // Redirect to home page (or anywhere) after successful login
            router.push("/");
        } catch (err) {
            alert((err as Error).message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Login to Wingman</h1>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full p-3 mb-6 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
                    >
                        Login
                    </button>
                    <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
