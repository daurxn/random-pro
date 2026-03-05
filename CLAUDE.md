# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Reset database
npm run db:reset

# Regenerate Prisma client after schema changes
npx prisma generate

# Run migrations
npx prisma migrate dev
```

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat interface; Claude generates and iterates on them in a virtual file system with a live preview.

### Key Data Flow

1. **Chat → API**: `ChatContext` (`src/lib/contexts/chat-context.tsx`) uses Vercel AI SDK's `useChat`, sending messages + the serialized virtual file system to `POST /api/chat`.

2. **API → LLM + Tools**: `src/app/api/chat/route.ts` reconstructs the `VirtualFileSystem`, streams responses using `streamText`, and exposes two tools:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create/view/edit files via string replacement or line insertion
   - `file_manager` (`src/lib/tools/file-manager.ts`) — rename/delete files

3. **Tool Calls → Client File System**: Tool calls stream back to the client. `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) handles `onToolCall` events, mutating the in-memory `VirtualFileSystem` and triggering React re-renders via `refreshTrigger`.

4. **Preview**: `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) watches `refreshTrigger`, calls `createImportMap` + `createPreviewHTML` from `src/lib/transform/jsx-transformer.ts`, and injects the result into a sandboxed `<iframe>` via `srcdoc`. JSX/TSX is transpiled in-browser using `@babel/standalone`; third-party npm packages are resolved via `esm.sh`.

5. **Persistence**: On stream completion, if a `projectId` is provided and the user is authenticated, the route handler saves all messages + serialized file system to the `Project` record (stored as JSON strings in SQLite).

### Virtual File System

`VirtualFileSystem` (`src/lib/file-system.ts`) is an in-memory tree of `FileNode` objects. It lives in React state (via `FileSystemContext`) on the client and is reconstructed from serialized data on the server for each request. The `serialize()` method converts it to a plain `Record<string, FileNode>` for JSON transport; `deserializeFromNodes()` rebuilds the tree.

### Authentication

JWT-based auth (`src/lib/auth.ts`) using `jose`. Sessions are stored as `httpOnly` cookies (`auth-token`). Server-only — imported with `"server-only"`. Projects can belong to an authenticated user (`userId`) or be anonymous (`userId: null`). The `src/middleware.ts` file handles route protection.

### LLM Provider

`src/lib/provider.ts` exports `getLanguageModel()`. If `ANTHROPIC_API_KEY` is not set, it returns a `MockLanguageModel` that generates static counter/form/card components — useful for development without API access. The real model is `claude-haiku-4-5`.

### Prisma / Database

Schema at `prisma/schema.prisma`. Two models: `User` (email + bcrypt password) and `Project` (stores `messages` and `data` as JSON strings). Client is generated to `src/generated/prisma`. Singleton client at `src/lib/prisma.ts`.

> The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

### Testing

Tests use Vitest + jsdom + React Testing Library. Test files are colocated under `__tests__/` directories next to source files.
