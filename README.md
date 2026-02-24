# TarsChat 💬

A real-time full-stack live chat application built with **Next.js 16**, **Convex**, **Clerk**, and **TypeScript** — submitted as the Tars Full Stack Engineer Internship Coding Challenge 2026.

🌐 **Live App:** [tarschat-peach.vercel.app](https://tarschat-peach.vercel.app/)  
📁 **GitHub:** [github.com/skjaiswal88/tars_chat](https://github.com/skjaiswal88/tars_chat)

---

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | User authentication (Clerk) | ✅ |
| 2 | Search users by name | ✅ |
| 3 | Direct messaging (real-time) | ✅ |
| 4 | Group chat creation | ✅ |
| 5 | Online presence indicator | ✅ |
| 6 | Typing indicators (3s server timeout) | ✅ |
| 7 | Unread message count badge | ✅ |
| 8 | Timestamps (time / date+time / year) | ✅ |
| 9 | Empty states (no convs / no msgs / no search) | ✅ |
| 10 | Emoji reactions (toggle + count) | ✅ |
| 11 | Soft-delete own messages | ✅ |
| 12 | Auto-scroll + "↓ N new messages" button | ✅ |
| 13 | Skeleton loaders | ✅ |
| 14 | Dark / Light theme toggle (persisted) | ✅ |
| — | Responsive layout (mobile + desktop) | ✅ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS Custom Properties |
| Real-time Backend | Convex |
| Authentication | Clerk |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/               # Sign-in / Sign-up pages
│   └── (root)/
│       ├── layout.tsx        # Online presence + sidebar/chat layout
│       ├── page.tsx          # Home (desktop: welcome screen)
│       └── conversations/
│           ├── [conversationId]/page.tsx   # Chat page (messages, reactions, scroll)
│           └── new-group/page.tsx          # Group creation
├── components/
│   ├── Sidebar.tsx           # Navigation + user profile + theme toggle
│   ├── ConversationList.tsx  # Conversation list with unread badges
│   └── UserSearchPanel.tsx   # Real-time user search
├── hooks/
│   └── useTheme.ts           # Dark/light theme (localStorage persisted)
└── providers/
    └── ConvexClientProvider.tsx

convex/
├── schema.ts           # 5 Convex tables
├── users.ts            # User sync, presence, search
├── conversations.ts    # DM + group creation, unread counts
├── messages.ts         # Send, delete, react
└── typing.ts           # Typing indicators with server-side timeout
```

---

## Convex Schema Design

```ts
users              — clerkId, name, email, imageUrl, isOnline
conversations      — isGroup, groupName, groupImage
conversationMembers — conversationId, userId, lastSeenMessageId  ← unread count source
messages           — conversationId, senderId, content, messageType, isDeleted, reactions[]
typingIndicators   — conversationId, userId, lastTypedAt
```

**Key design decisions:**
- **Unread counts** are computed dynamically from `lastSeenMessageId` — no stale counter to maintain
- **Typing cleanup** is query-based (filter `lastTypedAt > now - 3s`) — no cron job needed
- **DM deduplication** — `getOrCreate` checks for an existing 1:1 conversation before creating

---

## Local Setup

### Prerequisites
- Node.js 18+
- A [Clerk](https://clerk.com) account
- A [Convex](https://convex.dev) account

### 1. Clone & install
```bash
git clone https://github.com/skjaiswal88/tars_chat.git
cd tars_chat
npm install
```

### 2. Set up Convex
```bash
npx convex dev
```
This creates your Convex project and generates `convex/_generated/`.

### 3. Set up Clerk
- Create an app at [clerk.com](https://clerk.com)
- Copy your keys

### 4. Environment variables
Create `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

Also add the Clerk issuer URL in `convex/auth.config.ts`:
```ts
applicationID: "your-clerk-frontend-api-domain"
```

### 5. Run
```bash
# Terminal 1
npm run dev

# Terminal 2
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` to Vercel
4. Deploy — Vercel auto-detects Next.js

> ⚠️ The Convex project continues to run on Convex's cloud — only the Next.js frontend is deployed to Vercel.

---

## Built by

**Sumit Kumar Jaiswal** — [LinkedIn](https://linkedin.com/in/your-profile) · [GitHub](https://github.com/skjaiswal88)  
B.Tech Computer Science, IIIT Ranchi (2022–2026)
