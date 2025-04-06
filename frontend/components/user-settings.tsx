"use client";

import { useState, useEffect } from "react";
import { getUserData, updateUserSettings } from "@/services/api";
import { motion } from "framer-motion";
import { Save, User, Mail, Globe, CheckCircle, AlertCircle, Lock, CalendarDays } from "lucide-react";

export default function UserSettings() {
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        sex: "male",
        age: "",
        orientation: "hetero",
    });

    const [originalUserData, setOriginalUserData] = useState({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem("wingmanUserId");
            if (!userId) return;

            setIsLoading(true);
            try {
                const data = await getUserData();
                if (data) {
                    const formattedData = {
                        name: data.name || "",
                        email: data.email || "",
                        sex: data.sex || "male",
                        age: data.age ? data.age.toString() : "",
                        orientation: data.orientation || "hetero",
                    };
                    setUserData(formattedData);
                    setOriginalUserData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setErrors({ general: "Failed to load user data." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!userData.name.trim()) newErrors.name = "Name is required";

        if (!userData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!userData.sex) newErrors.sex = "Sex is required";

        if (!userData.age) {
            newErrors.age = "Age is required";
        } else if (parseInt(userData.age) < 18 || parseInt(userData.age) > 100) {
            newErrors.age = "Age must be between 18 and 100";
        }

        if (!userData.orientation) newErrors.orientation = "Orientation is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const userId = localStorage.getItem("wingmanUserId");
        if (!userId) {
            setErrors({ general: "User not logged in." });
            return;
        }

        setIsSaving(true);

        try {
            await updateUserSettings({
                user_id: parseInt(userId),
                ...userData,
                age: parseInt(userData.age),
            });

            setOriginalUserData(userData);
            setIsSuccess(true);

            // Reset success message after 3 seconds
            setTimeout(() => {
                setIsSuccess(false);
            }, 3000);
        } catch (error: any) {
            const errorMsg = error?.response?.data?.error || "Failed to save settings. Please try again.";
            setErrors({ submit: errorMsg });
            console.error("Settings update error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = JSON.stringify(userData) !== JSON.stringify(originalUserData);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-lg border border-zinc-200 dark:border-zinc-700"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Personal Information</h2>
                    {isSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-md text-sm flex items-center"
                        >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Settings saved successfully!
                        </motion.div>
                    )}
                </div>

                {errors.general && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-center"
                    >
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-red-600 dark:text-red-400">{errors.general}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 p-1">
                        <div className="space-y-1">
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
                                    value={userData.name}
                                    onChange={handleChange}
                                    className={`w-full pl-10 p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all ${
                                        errors.name ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                    }`}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-1">
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
                                    value={userData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all ${
                                        errors.email ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                    }`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="pt-5 border-t border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-4">Profile Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label
                                    htmlFor="sex"
                                    className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                                >
                                    Sex
                                </label>
                                <select
                                    id="sex"
                                    name="sex"
                                    value={userData.sex}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all ${
                                        errors.sex ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                    }`}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.sex && <p className="text-red-500 text-xs mt-1">{errors.sex}</p>}
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="age"
                                    className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                                >
                                    Age
                                </label>
                                <div className="relative">
                                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                    <input
                                        id="age"
                                        name="age"
                                        type="number"
                                        min="18"
                                        max="100"
                                        value={userData.age}
                                        onChange={handleChange}
                                        className={`w-full pl-10 p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all ${
                                            errors.age ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                        }`}
                                    />
                                </div>
                                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="orientation"
                                    className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300"
                                >
                                    Orientation
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                    <select
                                        id="orientation"
                                        name="orientation"
                                        value={userData.orientation}
                                        onChange={handleChange}
                                        className={`w-full pl-10 p-3 border rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all ${
                                            errors.orientation
                                                ? "border-red-500"
                                                : "border-zinc-300 dark:border-zinc-700"
                                        }`}
                                    >
                                        <option value="hetero">Heterosexual</option>
                                        <option value="homo">Homosexual</option>
                                        <option value="bi">Bisexual</option>
                                        <option value="pan">Pansexual</option>
                                        <option value="aseks">Asexual</option>
                                    </select>
                                </div>
                                {errors.orientation && (
                                    <p className="text-red-500 text-xs mt-1">{errors.orientation}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: errors.submit ? 1 : 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3"
                    >
                        <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
                    </motion.div>

                    <div className="pt-5 flex justify-end">
                        <motion.button
                            type="submit"
                            disabled={!hasChanges || isSaving}
                            whileHover={{ scale: hasChanges ? 1.02 : 1 }}
                            whileTap={{ scale: hasChanges ? 0.98 : 1 }}
                            className={`flex items-center justify-center px-6 py-2 rounded-md cursor-pointer ${
                                !hasChanges
                                    ? "bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                            } transition-all duration-200`}
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-5 w-5" />
                                    Save Changes
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-lg border border-zinc-200 dark:border-zinc-700"
            >
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-zinc-600 dark:text-zinc-400" />
                    Security
                </h2>

                <div className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-md">
                    <div>
                        <h3 className="font-medium text-zinc-800 dark:text-zinc-200">Change Password</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Update your password for enhanced security
                        </p>
                    </div>
                    <button className="px-4 py-2 text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-md transition-colors cursor-pointer">
                        Update Password
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
