# Life Kanban

A full-stack web application for organizing tasks using a simple Kanban-style workflow:

Inbox → Today → Waiting → Done

The application supports authenticated users and persistent task management across sessions.

## Features

- User authentication
- Create, update, move, and delete task cards
- Fixed Kanban columns for task state
- Persistent storage backed by a relational database

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: SQLite with Prisma
- Authentication: JWT stored in HTTP-only cookies

## Local Development

Server:
cd server
npm install
npx prisma migrate dev
npm run dev

Client (new terminal tab):
cd client
npm install
npm run dev
