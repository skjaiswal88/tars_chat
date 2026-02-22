"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSignedIn } = useAuth();
    const pathname = usePathname();
    const store = useMutation(api.users.store);
    const setOnline = useMutation(api.users.setOnlineStatus);

    // On mobile: hide sidebar when viewing a conversation, show chat full-screen
    const isChatPage = pathname.startsWith("/conversations/");

    useEffect(() => {
        if (!isSignedIn) return;

        store().catch(console.error);
        setOnline({ isOnline: true }).catch(console.error);

        const handleVisibilityChange = () => {
            setOnline({ isOnline: !document.hidden }).catch(console.error);
        };
        const handleBeforeUnload = () => {
            setOnline({ isOnline: false }).catch(console.error);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            setOnline({ isOnline: false }).catch(console.error);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isSignedIn, store, setOnline]);

    return (
        <div className="flex h-screen overflow-hidden bg-[#0a0a12]">
            {/* Sidebar: always visible on desktop; hidden on mobile when in a chat */}
            <div className={`${isChatPage ? "hidden md:block" : "block"} w-full md:w-80 flex-shrink-0`}>
                <Sidebar />
            </div>

            {/* Main content: hidden on mobile on home page (sidebar shown instead) */}
            <main
                className={`${!isChatPage ? "hidden md:flex" : "flex"} flex-1 flex-col overflow-hidden`}
            >
                {children}
            </main>
        </div>
    );
}
