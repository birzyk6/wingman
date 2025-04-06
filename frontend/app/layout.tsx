import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

// Export the metadata correctly for Next.js App Router
export const metadata: Metadata = {
    title: "Wingman - AI-Powered Dating Assistant",
    description: "Wingman is an AI-powered assistant that helps you navigate the world of dating and relationships.",
    keywords: "AI, dating assistant, dating advice, relationships, Tinder, profile optimization",
    authors: [{ name: "Wingman Team", url: "https://wingman.ai" }],
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): React.ReactElement {
    return (
        <html lang="en" suppressHydrationWarning className="h-full">
            <body className={`${inter.className} h-full bg-white dark:bg-gray-900 transition-colors duration-200`}>
                <ThemeProvider attribute="class" defaultTheme="light" enableColorScheme>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
