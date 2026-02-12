'use client';

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatusBar from "./StatusBar";
import { ThemeProvider } from "./ThemeProvider";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useSidebar();
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <body className={`${inter.className} bg-slate-900 flex items-center justify-center h-screen`}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </body>;
    }

    if (!user) {
        return (
            <body className={`${inter.className} bg-background min-h-screen overflow-auto`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        );
    }

    return (
        <body className={`${inter.className} flex bg-background h-screen overflow-hidden transition-all duration-300`}>
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
            >
                <Sidebar />
                <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
                    <Header />
                    <main className="flex-1 overflow-y-auto w-full custom-scrollbar bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)]">
                        <div className="p-8 max-w-[1600px] mx-auto min-h-full">
                            {children}
                        </div>
                    </main>
                    <StatusBar />
                </div>
            </ThemeProvider>
        </body>
    );
}
