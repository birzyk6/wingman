"use client";

import { useState } from "react";
import { createUser } from "@/services/api";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight } from "lucide-react";

export default function UserRegistration({ onRegistered }: { onRegistered: (userId: string) => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        sex: "male",
        age: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.sex) newErrors.sex = "Sex is required";

        if (!formData.age) {
            newErrors.age = "Age is required";
        } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
            newErrors.age = "Age must be between 18 and 100";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const userData = await createUser({
                name: formData.name,
                email: formData.email,
                sex: formData.sex,
                age: formData.age,
                password: formData.password,
            });

            // Check if we got valid user data
            if (!userData || !userData.id) {
                throw new Error("Invalid user data received from server");
            }

            // Store user ID in localStorage - Make sure it's a string
            const userId = userData.id.toString();
            localStorage.setItem("wingmanUserId", userId);

            console.log("Registration successful. User ID:", userId);

            // Callback to parent component with the user ID
            if (onRegistered) {
                onRegistered(userId);
            }
        } catch (error: any) {
            let errorMsg = "Registration failed. Please try again.";

            // Handle specific error cases
            if (error?.response?.data?.error) {
                errorMsg = error.response.data.error;
            } else if (error?.message) {
                errorMsg = error.message;
            }

            setErrors({ submit: errorMsg });
            console.error("Registration error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-md"
            >
                <h2 className="text-2xl font-bold text-center mb-6 text-zinc-800 dark:text-zinc-100">
                    Create Your Wingman Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                        >
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full pl-10 p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                                    errors.name ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                }`}
                                placeholder="Your name"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

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
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                                    errors.email ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                }`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="sex"
                                className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                            >
                                Sex
                            </label>
                            <select
                                id="sex"
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                                    errors.sex ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                }`}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.sex && <p className="text-red-500 text-xs mt-1">{errors.sex}</p>}
                        </div>

                        <div>
                            <label
                                htmlFor="age"
                                className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                            >
                                Age
                            </label>
                            <input
                                id="age"
                                name="age"
                                type="number"
                                min="18"
                                max="100"
                                value={formData.age}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                                    errors.age ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                }`}
                                placeholder="Your age"
                            />
                            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                                    errors.password ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                }`}
                                placeholder="Create a password"
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                                    errors.confirmPassword ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                }`}
                                placeholder="Confirm your password"
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {errors.submit && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                            <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center p-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create Account <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
