"use client";

import { useState, useEffect, useRef } from "react";
import { User, ChevronDown, LogOut } from "lucide-react";
import { UserData, getUserData } from "@/services/api";
import LogoutButton from "./logout";
import SettingsButton from "./settings";

const UserAvatar = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getUserData();
                setUserData(data);
            } catch (err) {
                setError("Failed to fetch user data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Safe version of useEffect for document events
    useEffect(() => {
        // Only add event listeners on client side
        if (typeof window !== "undefined") {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsDropdownOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Safe logout function
    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("user_id");
            window.location.href = "/login";
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button className="flex btn items-center space-x-2 px-2 h-10" onClick={toggleDropdown}>
                <User className="h-5 w-5 text-zinc-800 dark:text-zinc-100" />
                {loading ? (
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                ) : error ? (
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Guest</span>
                ) : (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {userData?.name || "Guest"}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </div>
                )}
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-md pb-1 bg-zinc-100 ring-1 dark:ring-0 ring-zinc-200 dark:ring-zinc-500 shadow-lg dark:bg-zinc-800 z-50">
                    <div className="grid grid-cols-1 gap-2 p-2">
                        <div className="text-sm p-2 text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-700">
                            Hello <span className="font-bold">{userData?.name}</span>!
                        </div>
                        <div className="text-sm p-2 font-bold">How's your dating life going?</div>
                        <div className="border-t border-zinc-300 dark:border-zinc-600 mx-1"></div>
                        <SettingsButton />
                        <LogoutButton />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
