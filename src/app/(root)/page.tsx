import { MessageSquare } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center text-center px-8 h-full" style={{ background: "var(--bg1)" }}>
            <div className="mb-6 p-6 rounded-2xl" style={{ background: "var(--bgh)", border: "1px solid var(--bd)" }}>
                <MessageSquare className="w-16 h-16 text-violet-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--t1)" }}>Welcome to TarsChat</h2>
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--t2)" }}>
                Select a conversation from the sidebar or find a user to start chatting in real time.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-xs" style={{ color: "var(--t3)" }}>
                <span>💬 Real-time messaging</span>
                <span>👥 Create group chats</span>
                <span>😊 React with emojis</span>
            </div>
        </div>
    );
}
