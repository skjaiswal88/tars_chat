"use client";

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: "#7c3aed",
                    colorBackground: "#0f0f15",
                    colorInputBackground: "#1a1a2e",
                    colorText: "#e4e4f0",
                    colorTextSecondary: "#a1a1b5",
                    colorNeutral: "#ffffff",
                    colorShimmer: "#1a1a2e",
                },
                elements: {
                    card: "bg-[#0f0f15] shadow-2xl border border-white/10",
                    headerTitle: "text-white",
                    headerSubtitle: "text-zinc-400",
                    socialButtonsBlockButton:
                        "border-white/10 text-white hover:bg-white/10",
                    dividerLine: "bg-white/10",
                    dividerText: "text-zinc-500",
                    formFieldInput:
                        "bg-[#1a1a2e] border-white/10 text-white placeholder:text-zinc-500",
                    formFieldLabel: "text-zinc-300",
                    footerActionLink: "text-violet-400 hover:text-violet-300",
                    identityPreviewText: "text-white",
                    identityPreviewEditButton: "text-violet-400",
                    // UserButton popup
                    userButtonPopoverCard: "bg-[#1a1a2e] border border-white/10 shadow-2xl",
                    userButtonPopoverActions: "bg-[#1a1a2e]",
                    userButtonPopoverActionButton:
                        "text-zinc-200 hover:bg-white/10 hover:text-white",
                    userButtonPopoverActionButtonIcon: "text-zinc-400",
                    userButtonPopoverFooter: "bg-[#1a1a2e] border-t border-white/10",
                    userPreviewMainIdentifier: "text-white font-semibold",
                    userPreviewSecondaryIdentifier: "text-zinc-400",
                    avatarBox: "ring-2 ring-violet-500/40",
                },
            }}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
