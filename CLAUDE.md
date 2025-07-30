# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lost Ark raid schedule management application built with Next.js, featuring real-time collaboration similar to Google Sheets. The system manages player schedules, raid participation, and reward tracking.

## Tech Stack

- **Frontend**: Next.js 15.4, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Real-time**: Socket.io for WebSocket connections
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Caching**: Redis/ioredis
- **Excel Support**: xlsx library for import/export

## Project Structure

```
lostark-raid-schedule/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/                # API routes
│   │   └── (dashboard)/        # Dashboard pages
│   ├── components/             # React components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utility functions
│   │   ├── excel/              # Excel import/export
│   │   └── utils.ts            # Common utilities
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
├── original-files/
│   └── 出團表單.xlsx           # Original Excel data
└── public/                     # Static assets
```

## Common Commands

```bash
# Development
npm run dev          # Start development server with Turbopack

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma migrate dev --name <migration-name>  # Create migration
npx prisma studio    # Open Prisma Studio GUI

# Build & Production
npm run build        # Build for production
npm start            # Start production server
```

## Database Schema

Key models:
- **User**: Authentication and user profiles
- **Character**: Player characters with item levels
- **Schedule**: Player availability by day/time
- **Raid**: Raid instances with type, schedule, and status
- **RaidParticipant**: Links characters to raids
- **Reward**: Raid rewards and distribution tracking

Raid types: CELESTIAL (天界), DREAM (夢幻), IVORY_TOWER (象牙塔), PLAGUE (瘟疫)

## Excel Data Structure

The original Excel file (出團表單.xlsx) contains:
- **暱稱**: Player nicknames and weekly schedules
- **裝等表**: Character item levels
- **天界/夢幻/象牙塔/瘟疫**: Raid participation sheets
- **收益金**: Revenue tracking
- **副本獎勵表**: Reward tables

## Development Setup

1. Install PostgreSQL and Redis locally
2. Copy `.env.example` to `.env` and update database credentials
3. Run `npm install` to install dependencies
4. Run `npx prisma db push` to create database tables
5. Run `npm run dev` to start development server

## Real-time Features

- WebSocket connections via Socket.io
- Presence indicators for active users
- Conflict resolution for concurrent edits
- Automatic data synchronization across clients

## Notes

- Character encoding: UTF-8 support for Chinese characters
- Time format: "HH:MM" for schedules
- Day of week: 0=Sunday, 1=Monday, etc.