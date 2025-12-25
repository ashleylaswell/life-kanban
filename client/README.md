# Life Kanban

A personal life-organization tool that captures tasks and moves them through a simple Kanban flow:

Inbox → Today → Waiting → Done

Built as a small internal dashboard to reduce mental clutter and make next actions obvious.

## Features (v1)

- Email/password authentication (session via HTTP-only cookie)
- Kanban board with four fixed columns: Inbox, Today, Waiting, Done
- Create cards (default to Inbox)
- Move cards between columns
- Delete cards
- Data persists in SQLite

## Tech Stack

- Client: React + Vite + TypeScript
- Server: Node.js + Express + TypeScript
- Database: SQLite + Prisma
- Auth: JWT stored in an HTTP-only cookie

## Project Structure

- client/ - React app (Vite)
- server/ - Express API + Prisma schema/migrations

## Getting Started (Local)

### Prerequisites
- Node.js (LTS recommended)
- npm

### Server
cd server
npm install
npx prisma migrate dev
npm run dev

Server runs on http://localhost:4000

### Client (new terminal tab)
cd client
npm install
npm run dev

Client runs on http://localhost:5173

## API Endpoints (v1)

Auth:
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /me

Cards:
- GET /cards
- POST /cards
- PATCH /cards/:id
- DELETE /cards/:id

## Key Decisions & Tradeoffs

- Buttons over drag-and-drop (v1): faster to ship and less fragile
- Fixed columns: reduces decision fatigue
- SQLite for local dev: minimal setup and fast iteration

## Next Improvements (Optional)

- Inline edit for card title/notes
- Tags + filters
- Drag-and-drop between columns
- Deployment

