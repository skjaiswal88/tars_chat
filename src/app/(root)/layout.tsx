"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const store = useMutation(api.users.store);
    const setOnline = useMutation(api.users.setOnlineStatus);

    useEffect(() => {
        // Sync user to Convex on mount
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
    }, [store, setOnline]);

    return (
        <div className="flex h-screen overflow-hidden bg-[#0a0a12]">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        </div>
    );
}
