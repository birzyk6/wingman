import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Wingman AI Assistant",
    description: "Dating's never been easier!",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
