"use client";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function SettingsButton() {
    return (
        <Link href="/settings">
            <button className="flex items-center w-full p-2 rounded-md btn group cursor-pointer">
                <Settings className="h-4 w-4 mr-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">Settings</span>
            </button>
        </Link>
    );
}
