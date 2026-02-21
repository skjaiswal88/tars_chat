import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a12]">
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold text-white">TarsChat</span>
                </div>
                <p className="text-zinc-400 text-sm">Real-time messaging, beautifully simple</p>
            </div>
            <SignUp />
        </div>
    );
}
