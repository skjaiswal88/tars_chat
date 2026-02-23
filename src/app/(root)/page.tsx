import { MessageSquare } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center text-center px-8 bg-[var(--bg-app)] h-full">
            <div className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                <MessageSquare className="w-16 h-16 text-violet-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Welcome to TarsChat</h2>
            <p className="text-zinc-400 max-w-sm text-sm leading-relaxed">
                Select a conversation from the sidebar or find a user to start chatting in real time.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-xs text-zinc-600">
                <span>💬 Real-time messaging</span>
                <span>👥 Create group chats</span>
                <span>😊 React with emojis</span>
            </div>
        </div>
    );
}
