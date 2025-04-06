"use client";

import { useState, useEffect } from "react";
import { Heart, MessageSquare, User, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeScreen() {
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

    // List of features with their icons, titles, and descriptions
    const features = [
        {
            icon: <Heart className="h-10 w-10 text-pink-500" />,
            title: "Love Calculator",
            description:
                "Check your compatibility with someone special. Our state-of-the-art algorithm calculates your love score and provides personalized insights.",
            color: "bg-pink-100 dark:bg-pink-900/20",
            textColor: "text-pink-700 dark:text-pink-300",
            borderColor: "border-pink-200 dark:border-pink-800",
        },
        {
            icon: <Users className="h-10 w-10 text-purple-500" />,
            title: "Help with Tinder Replies",
            description:
                "Stuck on how to respond to a match? Generate multiple witty and engaging reply options based on your intentions and preferred style.",
            color: "bg-purple-100 dark:bg-purple-900/20",
            textColor: "text-purple-700 dark:text-purple-300",
            borderColor: "border-purple-200 dark:border-purple-800",
        },
        {
            icon: <MessageSquare className="h-10 w-10 text-blue-500" />,
            title: "Dating Advice Chat",
            description:
                "Get personalized dating advice through an interactive chat. Ask questions about dating etiquette, relationship dynamics, and more.",
            color: "bg-blue-100 dark:bg-blue-900/20",
            textColor: "text-blue-700 dark:text-blue-300",
            borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
            icon: <User className="h-10 w-10 text-green-500" />,
            title: "Tinder Bio Creator",
            description:
                "Create a compelling Tinder profile description that showcases your personality and attracts better matches.",
            color: "bg-green-100 dark:bg-green-900/20",
            textColor: "text-green-700 dark:text-green-300",
            borderColor: "border-green-200 dark:border-green-800",
        },
    ];

    // Auto-rotate features every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [features.length]);

    return (
        <div className="h-full bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center">
            {/* Hero section */}
            <div className="w-full max-w-4xl p-8 pt-12 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
                        Welcome to <span className="text-blue-600 dark:text-blue-400">Wingman</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-xl">
                        Your AI dating assistant, helping you navigate modern romance with confidence.
                    </p>
                </motion.div>

                <motion.div
                    className="w-full md:w-3/4 h-[1px] bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mt-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                />
            </div>

            {/* Feature cards */}
            <motion.div
                className="w-full max-w-4xl px-6 pb-12 grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        className={`p-6 rounded-xl border ${feature.borderColor} ${feature.color} relative overflow-hidden`}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="absolute top-0 right-0 h-16 w-16 -mt-6 -mr-6 bg-white/20 dark:bg-zinc-800/20 rounded-full blur-2xl" />
                        <div className="flex flex-col items-start">
                            <div className="p-3 rounded-lg bg-white dark:bg-zinc-800 shadow-sm mb-4">
                                {feature.icon}
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${feature.textColor}`}>{feature.title}</h3>
                            <p className="text-zinc-700 dark:text-zinc-300">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Animated feature showcase */}
            <div className="w-full max-w-4xl px-6 pb-12">
                <motion.div
                    className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                >
                    <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200 flex items-center">
                        <span>Feature Spotlight</span>
                        <div className="ml-auto flex space-x-2">
                            {features.map((_, index) => (
                                <motion.button
                                    key={index}
                                    className={`w-2 h-2 rounded-full cursor-pointer ${
                                        index === currentFeatureIndex ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-600"
                                    }`}
                                    onClick={() => setCurrentFeatureIndex(index)}
                                    animate={{
                                        scale: index === currentFeatureIndex ? 1.2 : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                            ))}
                        </div>
                    </h3>

                    <div className="relative h-48 overflow-hidden">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="absolute inset-0 flex items-center"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{
                                    opacity: index === currentFeatureIndex ? 1 : 0,
                                    x: index === currentFeatureIndex ? 0 : 10,
                                    zIndex: index === currentFeatureIndex ? 10 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className={`p-6 rounded-lg ${feature.color} w-full`}>
                                    <div className="flex items-start">
                                        <div className="mr-4">{feature.icon}</div>
                                        <div>
                                            <h4 className={`text-xl font-bold mb-2 ${feature.textColor}`}>
                                                {feature.title}
                                            </h4>
                                            <p className="text-zinc-700 dark:text-zinc-300">{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Getting started */}
            <motion.div
                className="w-full max-w-4xl px-6 pb-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
            >
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-6">Getting Started</h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                    Select any feature from the sidebar on the left to start using Wingman. Your dating journey is about
                    to get a lot more interesting!
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                    <div className="flex items-center text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2">
                            1
                        </span>
                        Choose a feature
                    </div>
                    <div className="flex items-center text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2">
                            2
                        </span>
                        Enter your information
                    </div>
                    <div className="flex items-center text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2">
                            3
                        </span>
                        Get AI-powered results
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
