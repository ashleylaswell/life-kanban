# Life Kanban

A small full-stack internal tool for organizing personal tasks using a simple Kanban workflow:

Inbox → Today → Waiting → Done

Built to demonstrate practical, junior-level full-stack development with real-world patterns.

## What It Does

- Authenticated user accounts
- Create, move, and delete task cards
- Fixed Kanban columns to reduce complexity
- Persistent storage with a relational database

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: SQLite with Prisma
- Auth: JWT stored in HTTP-only cookies

## Why This Project

This project was intentionally scoped as an internal dashboard, similar to tools used for admin panels or ops workflows.
The focus is on clarity, correctness, and maintainability rather than UI polish.

## Key Decisions

- Buttons instead of drag-and-drop for reliability and speed
- Fixed workflow states to avoid over-engineering
- SQLite for fast local development

## Running Locally

Server:
cd server
npm install
npx prisma migrate dev
npm run dev

Client (new terminal tab):
cd client
npm install
npm run dev
